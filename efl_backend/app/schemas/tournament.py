import uuid
from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, Field

from app.models.tournament import TournamentStatus
from app.schemas.team import TeamBrief


class TournamentCreate(BaseModel):
    name: str = Field(min_length=2, max_length=150)
    description: str | None = None
    format: str | None = Field(default=None, max_length=255)
    prize_pool: str | None = Field(default=None, max_length=100)
    status: TournamentStatus = TournamentStatus.UPCOMING
    start_date: date | None = None
    end_date: date | None = None
    logo_url: str | None = None
    banner_url: str | None = None


class TournamentUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=2, max_length=150)
    description: str | None = None
    format: str | None = Field(default=None, max_length=255)
    prize_pool: str | None = Field(default=None, max_length=100)
    status: TournamentStatus | None = None
    start_date: date | None = None
    end_date: date | None = None
    logo_url: str | None = None
    banner_url: str | None = None


class TournamentRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    name: str
    description: str | None
    format: str | None
    prize_pool: str | None
    status: TournamentStatus
    start_date: date | None
    end_date: date | None
    logo_url: str | None
    banner_url: str | None
    created_at: datetime


class TournamentParticipantAdd(BaseModel):
    team_id: uuid.UUID
    seed: int | None = None


class TournamentParticipantRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    team: TeamBrief
    seed: int | None
