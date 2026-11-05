import uuid
from datetime import datetime, timezone

from sqlalchemy import DateTime, Enum, ForeignKey, Integer, String, case
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.ext.hybrid import hybrid_property
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.team import TeamTier


class Player(Base):
    __tablename__ = "players"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    nickname: Mapped[str] = mapped_column(String(50), unique=True, index=True, nullable=False)
    real_name: Mapped[str | None] = mapped_column(String(100), nullable=True)
    avatar_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    team_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("teams.id", ondelete="SET NULL"), nullable=True
    )
    tier: Mapped[TeamTier] = mapped_column(
        Enum(TeamTier, name="tier", values_callable=lambda enum_cls: [e.value for e in enum_cls]),
        default=TeamTier.TIER_3,
        nullable=False,
    )
    kills: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    deaths: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    team: Mapped["Team"] = relationship("Team", back_populates="players")

    @hybrid_property
    def kd_diff(self) -> int:
        return self.kills - self.deaths

    @kd_diff.expression
    def kd_diff(cls):
        return cls.kills - cls.deaths

    @hybrid_property
    def kd(self) -> float:
        if self.deaths == 0:
            return float(self.kills)
        return round(self.kills / self.deaths, 2)

    @kd.expression
    def kd(cls):
        return case(
            (cls.deaths == 0, cls.kills * 1.0),
            else_=cls.kills * 1.0 / cls.deaths,
        )
