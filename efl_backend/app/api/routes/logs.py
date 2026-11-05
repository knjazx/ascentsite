import uuid

from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_current_admin
from app.core.database import get_db
from app.models.audit_log import AuditLog
from app.schemas.audit_log import AuditLogRead

router = APIRouter(prefix="/logs", tags=["logs"])


@router.get("", response_model=list[AuditLogRead])
def list_logs(
    admin_id: uuid.UUID | None = None,
    limit: int = Query(default=50, ge=1, le=200),
    offset: int = Query(default=0, ge=0),
    db: Session = Depends(get_db),
    _admin=Depends(get_current_admin),
):
    query = select(AuditLog)
    if admin_id is not None:
        query = query.where(AuditLog.admin_id == admin_id)
    query = query.order_by(AuditLog.created_at.desc()).offset(offset).limit(limit)
    return db.scalars(query).all()
