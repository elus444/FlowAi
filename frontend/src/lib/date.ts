/**
 * Parse a timestamp from the backend as UTC.
 *
 * The backend serializes every timestamp (Execution/ExecutionLog/Workflow/
 * User created_at, updated_at, started_at, completed_at, ...) from naive
 * Python `datetime.utcnow()` values -- the JSON has no "Z" or "+00:00"
 * suffix, e.g. "2026-09-07T03:01:01.060584". `new Date(...)` on a string
 * like that is parsed as *local* time per the ES spec, not UTC, so every
 * displayed timestamp (and any duration computed from two of them) would
 * be silently wrong by the viewer's UTC offset. Route backend timestamps
 * through this instead of calling `new Date()` on them directly.
 */
export function parseApiDate(value: string): Date {
  const hasTimezone = /[zZ]|[+-]\d{2}:?\d{2}$/.test(value)
  return new Date(hasTimezone ? value : `${value}Z`)
}
