import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.models.team import TeamTier
from app.schemas.team import TeamBrief


class PlayerCreate(BaseModel):
    nickname: str = Field(min_length=2, max_length=50)
    real_name: str | None = Field(default=None, max_length=100)
    avatar_url: str | None = None
    team_id: uuid.UUID | None = None
    tier: TeamTier = TeamTier.TIER_3
    kills: int = Field(default=0, ge=0)
    deaths: int = Field(default=0, ge=0)


class PlayerUpdate(BaseModel):
    nickname: str | None = Field(default=None, min_length=2, max_length=50)
    real_name: str | None = Field(default=None, max_length=100)
    avatar_url: str | None = None
    team_id: uuid.UUID | None = None
    tier: TeamTier | None = None


class PlayerStatsUpdate(BaseModel):
    kills: int = Field(ge=0)
    deaths: int = Field(ge=0)


class PlayerRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    nickname: str
    real_name: str | None
    avatar_url: str | None
    team: TeamBrief | None
    tier: TeamTier
    kills: int
    deaths: int
    kd: float
    kd_diff: int
    created_at: datetime
