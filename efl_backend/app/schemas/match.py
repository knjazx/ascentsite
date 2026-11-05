import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, model_validator

from app.models.match import MatchStatus
from app.schemas.team import TeamBrief


class MatchCreate(BaseModel):
    team1_id: uuid.UUID
    team2_id: uuid.UUID
    scheduled_at: datetime
    tournament_id: uuid.UUID | None = None
    group_id: uuid.UUID | None = None
    best_of: int | None = Field(default=None, ge=1, le=9)

    @model_validator(mode="after")
    def check_different_teams(self):
        if self.team1_id == self.team2_id:
            raise ValueError("team1_id and team2_id must be different")
        return self


class MatchUpdate(BaseModel):
    team1_id: uuid.UUID | None = None
    team2_id: uuid.UUID | None = None
    scheduled_at: datetime | None = None
    tournament_id: uuid.UUID | None = None
    group_id: uuid.UUID | None = None
    best_of: int | None = Field(default=None, ge=1, le=9)


class MatchResultUpdate(BaseModel):
    team1_score: int = Field(ge=0)
    team2_score: int = Field(ge=0)

    @model_validator(mode="after")
    def check_no_draw(self):
        if self.team1_score == self.team2_score:
            raise ValueError("team1_score and team2_score cannot be equal, a match must have a winner")
        return self


class MatchRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    tournament_id: uuid.UUID | None
    group_id: uuid.UUID | None
    team1: TeamBrief | None
    team2: TeamBrief | None
    team1_score: int | None
    team2_score: int | None
    winner: TeamBrief | None
    best_of: int | None
    status: MatchStatus
    scheduled_at: datetime
    created_at: datetime
