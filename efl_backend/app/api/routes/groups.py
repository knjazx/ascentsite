import random
import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import delete, select
from sqlalchemy.orm import Session, selectinload

from app.api.deps import get_current_admin
from app.core.database import get_db
from app.models.group import TournamentGroup, TournamentGroupTeam
from app.models.team import Team
from app.models.tournament import Tournament, TournamentTeam
from app.schemas.group import (
    GroupCreate,
    GroupGenerateRequest,
    GroupRead,
    GroupTeamAdd,
    GroupTeamStatsUpdate,
    GroupUpdate,
)

router = APIRouter(tags=["groups"])


def _get_tournament_or_404(tournament_id: uuid.UUID, db: Session) -> Tournament:
    tournament = db.get(Tournament, tournament_id)
    if tournament is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tournament not found")
    return tournament


def _get_group_or_404(group_id: uuid.UUID, db: Session) -> TournamentGroup:
    group = db.get(TournamentGroup, group_id)
    if group is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Group not found")
    return group


def _group_with_teams_query(tournament_id: uuid.UUID):
    return (
        select(TournamentGroup)
        .where(TournamentGroup.tournament_id == tournament_id)
        .options(selectinload(TournamentGroup.teams).selectinload(TournamentGroupTeam.team))
        .order_by(TournamentGroup.name)
    )


@router.get("/tournaments/{tournament_id}/groups", response_model=list[GroupRead])
def list_groups(tournament_id: uuid.UUID, db: Session = Depends(get_db)):
    _get_tournament_or_404(tournament_id, db)
    return db.scalars(_group_with_teams_query(tournament_id)).all()


@router.post("/tournaments/{tournament_id}/groups", response_model=GroupRead, status_code=status.HTTP_201_CREATED)
def create_group(
    tournament_id: uuid.UUID, payload: GroupCreate, db: Session = Depends(get_db), _admin=Depends(get_current_admin)
):
    _get_tournament_or_404(tournament_id, db)
    group = TournamentGroup(tournament_id=tournament_id, name=payload.name)
    db.add(group)
    db.commit()
    db.refresh(group)
    return group


@router.post("/tournaments/{tournament_id}/groups/generate", response_model=list[GroupRead])
def generate_groups(
    tournament_id: uuid.UUID,
    payload: GroupGenerateRequest,
    db: Session = Depends(get_db),
    _admin=Depends(get_current_admin),
):
    _get_tournament_or_404(tournament_id, db)

    participants = db.scalars(select(TournamentTeam).where(TournamentTeam.tournament_id == tournament_id)).all()
    if len(participants) < payload.group_count:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Not enough teams in the tournament to fill this many groups",
        )

    db.execute(delete(TournamentGroup).where(TournamentGroup.tournament_id == tournament_id))
    db.flush()

    team_ids = [participant.team_id for participant in participants]
    random.shuffle(team_ids)

    group_names = [chr(ord("A") + i) for i in range(payload.group_count)]
    groups = [TournamentGroup(tournament_id=tournament_id, name=f"Group {name}") for name in group_names]
    db.add_all(groups)
    db.flush()

    for index, team_id in enumerate(team_ids):
        group = groups[index % payload.group_count]
        db.add(TournamentGroupTeam(group_id=group.id, team_id=team_id))

    db.commit()

    return db.scalars(_group_with_teams_query(tournament_id)).all()


@router.put("/groups/{group_id}", response_model=GroupRead)
def update_group(
    group_id: uuid.UUID, payload: GroupUpdate, db: Session = Depends(get_db), _admin=Depends(get_current_admin)
):
    group = _get_group_or_404(group_id, db)
    group.name = payload.name
    db.commit()
    db.refresh(group)
    return group


@router.delete("/groups/{group_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_group(group_id: uuid.UUID, db: Session = Depends(get_db), _admin=Depends(get_current_admin)):
    group = _get_group_or_404(group_id, db)
    db.delete(group)
    db.commit()


@router.post("/groups/{group_id}/teams", response_model=GroupRead, status_code=status.HTTP_201_CREATED)
def add_team_to_group(
    group_id: uuid.UUID, payload: GroupTeamAdd, db: Session = Depends(get_db), _admin=Depends(get_current_admin)
):
    group = _get_group_or_404(group_id, db)

    if db.get(Team, payload.team_id) is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Team not found")

    existing = db.scalar(
        select(TournamentGroupTeam).where(
            TournamentGroupTeam.group_id == group_id, TournamentGroupTeam.team_id == payload.team_id
        )
    )
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Team already in this group")

    db.add(TournamentGroupTeam(group_id=group_id, team_id=payload.team_id))
    db.commit()
    db.refresh(group)
    return group


@router.put("/groups/{group_id}/teams/{team_id}", response_model=GroupRead)
def update_group_team_stats(
    group_id: uuid.UUID,
    team_id: uuid.UUID,
    payload: GroupTeamStatsUpdate,
    db: Session = Depends(get_db),
    _admin=Depends(get_current_admin),
):
    group = _get_group_or_404(group_id, db)

    membership = db.scalar(
        select(TournamentGroupTeam).where(
            TournamentGroupTeam.group_id == group_id, TournamentGroupTeam.team_id == team_id
        )
    )
    if membership is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Team is not part of this group")

    membership.wins = payload.wins
    membership.losses = payload.losses
    membership.points = payload.points
    db.commit()
    db.refresh(group)
    return group


@router.delete("/groups/{group_id}/teams/{team_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_team_from_group(
    group_id: uuid.UUID, team_id: uuid.UUID, db: Session = Depends(get_db), _admin=Depends(get_current_admin)
):
    membership = db.scalar(
        select(TournamentGroupTeam).where(
            TournamentGroupTeam.group_id == group_id, TournamentGroupTeam.team_id == team_id
        )
    )
    if membership is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Team is not part of this group")

    db.delete(membership)
    db.commit()
