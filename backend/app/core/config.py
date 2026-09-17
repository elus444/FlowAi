from pydantic_settings import BaseSettings
from pydantic import field_validator
from typing import List, Union


class Settings(BaseSettings):
    # API
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "FlowAI"

    # Database
    DATABASE_URL: str

    # Redis
    REDIS_URL: str

    # Security
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # CORS
    CORS_ORIGINS: Union[List[str], str] = "http://localhost:3000"

    # LLM API Keys
    OPENAI_API_KEY: str = ""
    ANTHROPIC_API_KEY: str = ""
    GOOGLE_API_KEY: str = ""

    # E2B Code Interpreter
    E2B_API_KEY: str = ""
    E2B_TEMPLATE_ID: str = ""  # Optional: Custom template ID for faster execution

    # MCP (Model Context Protocol) node default request timeout, in
    # seconds. Each MCP node carries its own server URL/auth token
    # (there's no single global MCP server), so this is the only
    # instance-wide MCP setting there is -- it just sets how long a
    # compiled MCP node's httpx client waits before timing out.
    MCP_TIMEOUT: int = 30

    # Railway specific
    RAILWAY_ENVIRONMENT: str = ""  # Set by Railway automatically

    # Environment
    ENVIRONMENT: str = "development"

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def parse_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str):
            return [origin.strip() for origin in v.split(",")]
        return v

    class Config:
        env_file = ".env"
        case_sensitive = True
        # Render (or any host) may still have env vars set for fields a
        # later change removed from this class (e.g. the old single-
        # global-server MCP_ENABLED/MCP_SERVER_URL/MCP_API_KEY, replaced
        # by per-node MCP config) -- pydantic-settings' default is to
        # hard-fail startup on any unrecognized env var, which would take
        # the whole backend down on deploy rather than just dropping the
        # stale setting. Ignoring unknown vars is the safer default for
        # a service whose env is configured outside this repo.
        extra = "ignore"


settings = Settings()
