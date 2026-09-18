"""Benchmark: the N+1 query fix on GET /executions/workflow/{workflow_id}.

Reproduces the exact before/after code path from the "Fix N+1 query in
execution history" commit against the real SQLAlchemy models, so the
latency win is a measured number instead of a guess:

  BEFORE -- list_workflow_executions used ExecutionResponse (has `logs`,
  a lazy-loaded relationship). Pydantic's from_attributes touches every
  declared field, so serializing N executions fired 1 query for the list
  + N queries (one per execution) to lazy-load its logs = N+1 queries.

  AFTER -- the endpoint uses ExecutionSummaryResponse (no `logs` field),
  so listing N executions is exactly 1 query, same as any other list
  endpoint, and logs load once per record only when a user actually
  opens that execution's detail view (GET /executions/{id}).

Uses a real SQLite database with the app's actual models (not mocks) so
the query pattern is genuine, not simulated. A fresh Session is created
per trial (mirroring FastAPI's per-request `Depends(get_db)` session) so
lazy loads are never served from a warm identity-map cache the way a
real second HTTP request never is either.

Run: python scripts/benchmark_execution_history.py
"""

import os
import statistics
import time
import uuid
from datetime import UTC, datetime

os.environ.setdefault("DATABASE_URL", "sqlite:///./bench_execution_history.db")
os.environ.setdefault("REDIS_URL", "redis://localhost:6379/0")
os.environ.setdefault("SECRET_KEY", "benchmark-only-not-a-real-secret")

from sqlalchemy import create_engine, event  # noqa: E402
from sqlalchemy.orm import sessionmaker  # noqa: E402

from app.core.database import Base  # noqa: E402
from app.models.user import User  # noqa: E402
from app.models.workflow import Workflow  # noqa: E402
from app.models.execution import Execution, ExecutionLog, ExecutionStatus, LogLevel  # noqa: E402
from app.models.dataset import Dataset  # noqa: E402,F401 (registers the relationship target)
from app.schemas.execution import ExecutionResponse, ExecutionSummaryResponse  # noqa: E402

DB_PATH = "bench_execution_history.db"
N_EXECUTIONS = 30   # a workflow with a few months of run history
M_LOGS_EACH = 40    # ~20 nodes x (NODE_START + NODE_COMPLETE), a mid-size graph
TRIALS = 25


def seed(engine):
    if os.path.exists(DB_PATH):
        os.remove(DB_PATH)
    Base.metadata.create_all(engine)
    Session = sessionmaker(bind=engine)
    db = Session()

    user = User(id=uuid.uuid4(), email="bench@example.com", username="bench",
                hashed_password="x", full_name="Bench User")
    db.add(user)
    db.flush()

    workflow = Workflow(id=uuid.uuid4(), user_id=user.id, name="Benchmark Workflow",
                         graph_data={"nodes": [], "edges": []})
    db.add(workflow)
    db.flush()

    for _ in range(N_EXECUTIONS):
        execution = Execution(
            id=uuid.uuid4(),
            workflow_id=workflow.id,
            user_id=user.id,
            status=ExecutionStatus.COMPLETED,
            input_data={"topic": "benchmark"},
            output_data={"result": "ok"},
            started_at=datetime.now(UTC),
            completed_at=datetime.now(UTC),
            created_at=datetime.now(UTC),
        )
        db.add(execution)
        db.flush()
        for i in range(M_LOGS_EACH):
            db.add(ExecutionLog(
                id=uuid.uuid4(),
                execution_id=execution.id,
                node_id=f"node_{i}",
                level=LogLevel.INFO,
                message=f"log line {i}",
                timestamp=datetime.now(UTC),
            ))
    db.commit()
    user_id, workflow_id = user.id, workflow.id
    db.close()
    return user_id, workflow_id


def count_queries(engine):
    """Returns a mutable counter incremented on every statement executed."""
    counter = {"n": 0}

    @event.listens_for(engine, "before_cursor_execute")
    def _count(*args, **kwargs):
        counter["n"] += 1

    return counter


def run_before(engine, user_id, workflow_id) -> tuple[float, int]:
    """Old code path: list endpoint response_model was ExecutionResponse
    (includes `logs`) -- this is exactly what FastAPI/Pydantic did under
    the hood for every request before the fix."""
    Session = sessionmaker(bind=engine)
    db = Session()
    counter = count_queries(engine)

    start = time.perf_counter()
    executions = (
        db.query(Execution)
        .filter(Execution.workflow_id == workflow_id, Execution.user_id == user_id)
        .order_by(Execution.created_at.desc())
        .limit(50)
        .all()
    )
    _ = [ExecutionResponse.model_validate(e) for e in executions]
    elapsed = time.perf_counter() - start

    db.close()
    return elapsed, counter["n"]


def run_after(engine, user_id, workflow_id) -> tuple[float, int]:
    """New code path: response_model is ExecutionSummaryResponse (no
    `logs` field), so `.logs` is never touched and never lazy-loaded."""
    Session = sessionmaker(bind=engine)
    db = Session()
    counter = count_queries(engine)

    start = time.perf_counter()
    executions = (
        db.query(Execution)
        .filter(Execution.workflow_id == workflow_id, Execution.user_id == user_id)
        .order_by(Execution.created_at.desc())
        .limit(50)
        .all()
    )
    _ = [ExecutionSummaryResponse.model_validate(e) for e in executions]
    elapsed = time.perf_counter() - start

    db.close()
    return elapsed, counter["n"]


def main():
    engine = create_engine(f"sqlite:///{DB_PATH}")
    user_id, workflow_id = seed(engine)

    before_times, after_times = [], []
    before_queries = after_queries = None

    for _ in range(TRIALS):
        t, q = run_before(engine, user_id, workflow_id)
        before_times.append(t)
        before_queries = q

    for _ in range(TRIALS):
        t, q = run_after(engine, user_id, workflow_id)
        after_times.append(t)
        after_queries = q

    before_median = statistics.median(before_times) * 1000
    after_median = statistics.median(after_times) * 1000
    reduction = (1 - after_median / before_median) * 100

    print(f"Dataset: {N_EXECUTIONS} executions x {M_LOGS_EACH} logs each")
    print(f"Trials per variant: {TRIALS}")
    print()
    print(f"BEFORE (ExecutionResponse, N+1):    {before_queries} SQL statements, "
          f"median {before_median:.2f} ms")
    print(f"AFTER  (ExecutionSummaryResponse):  {after_queries} SQL statements, "
          f"median {after_median:.2f} ms")
    print()
    print(f"Query count: {before_queries} -> {after_queries} "
          f"({(1 - after_queries / before_queries) * 100:.0f}% fewer queries)")
    print(f"Latency:     {before_median:.2f}ms -> {after_median:.2f}ms "
          f"({reduction:.0f}% reduction)")

    engine.dispose()
    os.remove(DB_PATH)


if __name__ == "__main__":
    main()
