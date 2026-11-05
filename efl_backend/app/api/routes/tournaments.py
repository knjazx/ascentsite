import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.api.deps import get_current_admin
from app.core.database import get_db
from app.models.team import Team
from app.models.tournament import Tournament, TournamentStatus, TournamentTeam
from app.schemas.tournament import (
    TournamentCreate,
    TournamentParticipantAdd,
    TournamentParticipantRead,
    TournamentRead,
    TournamentUpdate,
)

router = APIRouter(prefix="/tournaments", tags=["tournaments"])


@router.get("", response_model=list[TournamentRead])
def list_tournaments(status_filter: TournamentStatus | None = None, db: Session = Depends(get_db)):
    query = select(Tournament)
    if status_filter is not None:
        query = query.where(Tournament.status == status_filter)
    query = query.order_by(Tournament.start_date.desc().nullslast(), Tournament.created_at.desc())
    return db.scalars(query).all()


@router.post("", response_model=TournamentRead, status_code=status.HTTP_201_CREATED)
def create_tournament(payload: TournamentCreate, db: Session = Depends(get_db), _admin=Depends(get_current_admin)):
    existing = db.scalar(select(Tournament).where(Tournament.name == payload.name))
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Tournament with this name already exists")

    tournament = Tournament(**payload.model_dump())
    db.add(tournament)
    db.commit()
    db.refresh(tournament)
    return tournament


@router.get("/{tournament_id}", response_model=TournamentRead)
def get_tournament(tournament_id: uuid.UUID, db: Session = Depends(get_db)):
    tournament = db.get(Tournament, tournament_id)
    if tournament is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tournament not found")
    return tournament


@router.put("/{tournament_id}", response_model=TournamentRead)
def update_tournament(
    tournament_id: uuid.UUID,
    payload: TournamentUpdate,
    db: Session = Depends(get_db),
    _admin=Depends(get_current_admin),
):
    tournament = db.get(Tournament, tournament_id)
    if tournament is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tournament not found")

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(tournament, field, value)

    db.commit()
    db.refresh(tournament)
    return tournament


@router.delete("/{tournament_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_tournament(tournament_id: uuid.UUID, db: Session = Depends(get_db), _admin=Depends(get_current_admin)):
    tournament = db.get(Tournament, tournament_id)
    if tournament is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tournament not found")

    db.delete(tournament)
    db.commit()


@router.get("/{tournament_id}/teams", response_model=list[TournamentParticipantRead])
def list_tournament_teams(tournament_id: uuid.UUID, db: Session = Depends(get_db)):
    tournament = db.get(Tournament, tournament_id)
    if tournament is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tournament not found")

    query = (
        select(TournamentTeam)
        .where(TournamentTeam.tournament_id == tournament_id)
        .options(selectinload(TournamentTeam.team))
        .order_by(TournamentTeam.seed.asc().nullslast())
    )
    return db.scalars(query).all()


@router.post("/{tournament_id}/teams", response_model=TournamentParticipantRead, status_code=status.HTTP_201_CREATED)
def add_tournament_team(
    tournament_id: uuid.UUID,
    payload: TournamentParticipantAdd,
    db: Session = Depends(get_db),
    _admin=Depends(get_current_admin),
):
    tournament = db.get(Tournament, tournament_id)
    if tournament is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tournament not found")

    if db.get(Team, payload.team_id) is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Team not found")

    existing = db.scalar(
        select(TournamentTeam).where(
            TournamentTeam.tournament_id == tournament_id, TournamentTeam.team_id == payload.team_id
        )
    )
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Team already added to this tournament")

    participant = TournamentTeam(tournament_id=tournament_id, team_id=payload.team_id, seed=payload.seed)
    db.add(participant)
    db.commit()
    db.refresh(participant)
    return participant


@router.delete("/{tournament_id}/teams/{team_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_tournament_team(
    tournament_id: uuid.UUID, team_id: uuid.UUID, db: Session = Depends(get_db), _admin=Depends(get_current_admin)
):
    participant = db.scalar(
        select(TournamentTeam).where(
            TournamentTeam.tournament_id == tournament_id, TournamentTeam.team_id == team_id
        )
    )
    if participant is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Team is not part of this tournament")

    db.delete(participant)
    db.commit()
