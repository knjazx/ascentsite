import uuid

from starlette.concurrency import run_in_threadpool
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request

from app.core.database import SessionLocal
from app.core.security import decode_access_token
from app.models.audit_log import AuditLog
from app.models.user import User, UserRole

MUTATING_METHODS = {"POST", "PUT", "PATCH", "DELETE"}
EXCLUDED_PATHS = {"/api/v1/auth/register", "/api/v1/auth/login"}


def _log_if_admin(admin_id: uuid.UUID, method: str, path: str, status_code: int) -> None:
    db = SessionLocal()
    try:
        user = db.get(User, admin_id)
        if user is None or user.role != UserRole.ADMIN:
            return

        db.add(
            AuditLog(
                admin_id=user.id,
                admin_username=user.username,
                method=method,
                path=path,
                status_code=status_code,
            )
        )
        db.commit()
    finally:
        db.close()


class AuditLogMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)

        if request.method not in MUTATING_METHODS or request.url.path in EXCLUDED_PATHS:
            return response

        auth_header = request.headers.get("authorization")
        if not auth_header or not auth_header.lower().startswith("bearer "):
            return response

        token = auth_header.split(" ", 1)[1]
        subject = decode_access_token(token)
        if subject is None:
            return response

        try:
            admin_id = uuid.UUID(subject)
        except ValueError:
            return response

        await run_in_threadpool(_log_if_admin, admin_id, request.method, request.url.path, response.status_code)
        return response
