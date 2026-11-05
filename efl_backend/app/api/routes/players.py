import uuid
from typing import Literal

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import asc, desc, select
from sqlalchemy.orm import Session

from app.api.deps import get_current_admin
from app.core.database import get_db
from app.models.player import Player
from app.models.team import Team, TeamTier
from app.schemas.player import PlayerCreate, PlayerRead, PlayerStatsUpdate, PlayerUpdate

router = APIRouter(prefix="/players", tags=["players"])

SORTABLE_FIELDS = {
    "nickname": Player.nickname,
    "kills": Player.kills,
    "deaths": Player.deaths,
    "kd": Player.kd,
    "kd_diff": Player.kd_diff,
}


@router.get("", response_model=list[PlayerRead])
def list_players(
    team_id: uuid.UUID | None = None,
    tier: TeamTier | None = None,
    sort_by: Literal["nickname", "kills", "deaths", "kd", "kd_diff"] = "kd_diff",
    order: Literal["asc", "desc"] = "desc",
    db: Session = Depends(get_db),
):
    query = select(Player)
    if team_id is not None:
        query = query.where(Player.team_id == team_id)
    if tier is not None:
        query = query.where(Player.tier == tier)

    column = SORTABLE_FIELDS[sort_by]
    query = query.order_by(asc(column) if order == "asc" else desc(column))
    return db.scalars(query).all()


@router.post("", response_model=PlayerRead, status_code=status.HTTP_201_CREATED)
def create_player(payload: PlayerCreate, db: Session = Depends(get_db), _admin=Depends(get_current_admin)):
    existing = db.scalar(select(Player).where(Player.nickname == payload.nickname))
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Player with this nickname already exists")

    if payload.team_id is not None and db.get(Team, payload.team_id) is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Team not found")

    player = Player(**payload.model_dump())
    db.add(player)
    db.commit()
    db.refresh(player)
    return player


@router.get("/{player_id}", response_model=PlayerRead)
def get_player(player_id: uuid.UUID, db: Session = Depends(get_db)):
    player = db.get(Player, player_id)
    if player is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Player not found")
    return player


@router.put("/{player_id}", response_model=PlayerRead)
def update_player(
    player_id: uuid.UUID, payload: PlayerUpdate, db: Session = Depends(get_db), _admin=Depends(get_current_admin)
):
    player = db.get(Player, player_id)
    if player is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Player not found")

    data = payload.model_dump(exclude_unset=True)
    if "team_id" in data and data["team_id"] is not None and db.get(Team, data["team_id"]) is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Team not found")

    for field, value in data.items():
        setattr(player, field, value)

    db.commit()
    db.refresh(player)
    return player


@router.patch("/{player_id}/stats", response_model=PlayerRead)
def update_player_stats(
    player_id: uuid.UUID,
    payload: PlayerStatsUpdate,
    db: Session = Depends(get_db),
    _admin=Depends(get_current_admin),
):
    player = db.get(Player, player_id)
    if player is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Player not found")

    player.kills = payload.kills
    player.deaths = payload.deaths
    db.commit()
    db.refresh(player)
    return player


@router.delete("/{player_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_player(player_id: uuid.UUID, db: Session = Depends(get_db), _admin=Depends(get_current_admin)):
    player = db.get(Player, player_id)
    if player is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Player not found")

    db.delete(player)
    db.commit()
