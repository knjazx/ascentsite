import uuid

from pydantic import BaseModel, ConfigDict, Field

from app.schemas.team import TeamBrief


class PlayoffGenerateRequest(BaseModel):
    team_ids: list[uuid.UUID] = Field(min_length=2)


class PlayoffMatchCreate(BaseModel):
    round: int = Field(ge=1)
    slot: int = Field(ge=0)
    team1_id: uuid.UUID | None = None
    team2_id: uuid.UUID | None = None
    next_match_id: uuid.UUID | None = None
    next_match_slot: int | None = Field(default=None, ge=0, le=1)


class PlayoffMatchUpdate(BaseModel):
    team1_id: uuid.UUID | None = None
    team2_id: uuid.UUID | None = None
    team1_score: int | None = Field(default=None, ge=0)
    team2_score: int | None = Field(default=None, ge=0)
    winner_id: uuid.UUID | None = None


class PlayoffMatchRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    tournament_id: uuid.UUID
    round: int
    slot: int
    team1: TeamBrief | None
    team2: TeamBrief | None
    team1_score: int | None
    team2_score: int | None
    winner: TeamBrief | None
    next_match_id: uuid.UUID | None
    next_match_slot: int | None
