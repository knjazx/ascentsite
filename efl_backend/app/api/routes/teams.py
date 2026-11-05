import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_current_admin
from app.core.database import get_db
from app.models.player import Player
from app.models.team import Team, TeamTier
from app.schemas.player import PlayerRead
from app.schemas.team import TeamCreate, TeamRatingUpdate, TeamRead, TeamUpdate

router = APIRouter(prefix="/teams", tags=["teams"])


@router.get("", response_model=list[TeamRead])
def list_teams(tier: TeamTier | None = None, db: Session = Depends(get_db)):
    query = select(Team)
    if tier is not None:
        query = query.where(Team.tier == tier)
    query = query.order_by(Team.efl_rating.desc())
    return db.scalars(query).all()


@router.post("", response_model=TeamRead, status_code=status.HTTP_201_CREATED)
def create_team(payload: TeamCreate, db: Session = Depends(get_db), _admin=Depends(get_current_admin)):
    existing = db.scalar(select(Team).where(Team.name == payload.name))
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Team with this name already exists")

    team = Team(**payload.model_dump())
    db.add(team)
    db.commit()
    db.refresh(team)
    return team


@router.get("/{team_id}", response_model=TeamRead)
def get_team(team_id: uuid.UUID, db: Session = Depends(get_db)):
    team = db.get(Team, team_id)
    if team is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Team not found")
    return team


@router.put("/{team_id}", response_model=TeamRead)
def update_team(
    team_id: uuid.UUID, payload: TeamUpdate, db: Session = Depends(get_db), _admin=Depends(get_current_admin)
):
    team = db.get(Team, team_id)
    if team is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Team not found")

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(team, field, value)

    db.commit()
    db.refresh(team)
    return team


@router.patch("/{team_id}/rating", response_model=TeamRead)
def update_team_rating(
    team_id: uuid.UUID,
    payload: TeamRatingUpdate,
    db: Session = Depends(get_db),
    _admin=Depends(get_current_admin),
):
    team = db.get(Team, team_id)
    if team is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Team not found")

    team.efl_rating = payload.efl_rating
    db.commit()
    db.refresh(team)
    return team


@router.delete("/{team_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_team(team_id: uuid.UUID, db: Session = Depends(get_db), _admin=Depends(get_current_admin)):
    team = db.get(Team, team_id)
    if team is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Team not found")

    db.delete(team)
    db.commit()


@router.get("/{team_id}/roster", response_model=list[PlayerRead])
def get_team_roster(team_id: uuid.UUID, db: Session = Depends(get_db)):
    team = db.get(Team, team_id)
    if team is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Team not found")

    return db.scalars(select(Player).where(Player.team_id == team_id)).all()
