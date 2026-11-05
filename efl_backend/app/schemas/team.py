import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.models.team import TeamTier


class TeamCreate(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    tag: str | None = Field(default=None, max_length=10)
    logo_url: str | None = None
    tier: TeamTier = TeamTier.TIER_3
    efl_rating: float = 1000.0


class TeamUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=2, max_length=100)
    tag: str | None = Field(default=None, max_length=10)
    logo_url: str | None = None
    tier: TeamTier | None = None


class TeamRatingUpdate(BaseModel):
    efl_rating: float


class TeamBrief(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    name: str
    tag: str | None
    logo_url: str | None
    tier: TeamTier


class TeamRead(TeamBrief):
    efl_rating: float
    created_at: datetime
