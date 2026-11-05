import enum
import uuid
from datetime import datetime, timezone

from sqlalchemy import DateTime, Enum, Float, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class TeamTier(str, enum.Enum):
    TIER_1 = "Tier 1"
    TIER_2 = "Tier 2"
    TIER_3 = "Tier 3"


class Team(Base):
    __tablename__ = "teams"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(100), unique=True, index=True, nullable=False)
    tag: Mapped[str | None] = mapped_column(String(10), nullable=True)
    logo_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    tier: Mapped[TeamTier] = mapped_column(
        Enum(TeamTier, name="tier", values_callable=lambda enum_cls: [e.value for e in enum_cls]),
        default=TeamTier.TIER_3,
        nullable=False,
    )
    efl_rating: Mapped[float] = mapped_column(Float, default=1000.0, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    players: Mapped[list["Player"]] = relationship("Player", back_populates="team")
