import uuid

from pydantic import BaseModel, ConfigDict, Field

from app.schemas.team import TeamBrief


class GroupCreate(BaseModel):
    name: str = Field(min_length=1, max_length=50)


class GroupUpdate(BaseModel):
    name: str = Field(min_length=1, max_length=50)


class GroupGenerateRequest(BaseModel):
    group_count: int = Field(ge=2, le=16)


class GroupTeamAdd(BaseModel):
    team_id: uuid.UUID


class GroupTeamStatsUpdate(BaseModel):
    wins: int = Field(ge=0)
    losses: int = Field(ge=0)
    points: int = Field(ge=0)


class GroupTeamRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    team: TeamBrief
    wins: int
    losses: int
    points: int


class GroupRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    tournament_id: uuid.UUID
    name: str
    teams: list[GroupTeamRead] = []
