import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.api.deps import get_current_admin
from app.core.database import get_db
from app.models.group import TournamentGroup
from app.models.match import Match, MatchStatus
from app.models.team import Team
from app.models.tournament import Tournament
from app.schemas.match import MatchCreate, MatchRead, MatchResultUpdate, MatchUpdate

router = APIRouter(prefix="/matches", tags=["matches"])


def _match_options(query):
    return query.options(
        selectinload(Match.team1),
        selectinload(Match.team2),
        selectinload(Match.winner),
    )


def _get_match_or_404(match_id: uuid.UUID, db: Session) -> Match:
    match = db.get(Match, match_id)
    if match is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Match not found")
    return match


@router.get("/recent", response_model=list[MatchRead])
def list_recent_matches(limit: int = Query(default=5, ge=1, le=50), db: Session = Depends(get_db)):
    query = _match_options(select(Match).where(Match.status == MatchStatus.FINISHED))
    query = query.order_by(Match.scheduled_at.desc()).limit(limit)
    return db.scalars(query).all()


@router.get("/upcoming", response_model=list[MatchRead])
def list_upcoming_matches(limit: int = Query(default=5, ge=1, le=50), db: Session = Depends(get_db)):
    query = _match_options(select(Match).where(Match.status.in_([MatchStatus.SCHEDULED, MatchStatus.LIVE])))
    query = query.order_by(Match.scheduled_at.asc()).limit(limit)
    return db.scalars(query).all()


@router.get("", response_model=list[MatchRead])
def list_matches(
    status_filter: MatchStatus | None = None,
    team_id: uuid.UUID | None = None,
    tournament_id: uuid.UUID | None = None,
    db: Session = Depends(get_db),
):
    query = _match_options(select(Match))
    if status_filter is not None:
        query = query.where(Match.status == status_filter)
    if team_id is not None:
        query = query.where((Match.team1_id == team_id) | (Match.team2_id == team_id))
    if tournament_id is not None:
        query = query.where(Match.tournament_id == tournament_id)
    query = query.order_by(Match.scheduled_at.asc())
    return db.scalars(query).all()


@router.post("", response_model=MatchRead, status_code=status.HTTP_201_CREATED)
def create_match(payload: MatchCreate, db: Session = Depends(get_db), _admin=Depends(get_current_admin)):
    if db.get(Team, payload.team1_id) is None or db.get(Team, payload.team2_id) is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Team not found")

    if payload.tournament_id is not None and db.get(Tournament, payload.tournament_id) is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Tournament not found")

    if payload.group_id is not None and db.get(TournamentGroup, payload.group_id) is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Group not found")

    match = Match(**payload.model_dump())
    db.add(match)
    db.commit()
    db.refresh(match)
    return match


@router.get("/{match_id}", response_model=MatchRead)
def get_match(match_id: uuid.UUID, db: Session = Depends(get_db)):
    return _get_match_or_404(match_id, db)


@router.put("/{match_id}", response_model=MatchRead)
def update_match(
    match_id: uuid.UUID, payload: MatchUpdate, db: Session = Depends(get_db), _admin=Depends(get_current_admin)
):
    match = _get_match_or_404(match_id, db)
    data = payload.model_dump(exclude_unset=True)

    for team_field in ("team1_id", "team2_id"):
        if team_field in data and data[team_field] is not None and db.get(Team, data[team_field]) is None:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Team not found")

    if "tournament_id" in data and data["tournament_id"] is not None and db.get(Tournament, data["tournament_id"]) is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Tournament not found")

    if "group_id" in data and data["group_id"] is not None and db.get(TournamentGroup, data["group_id"]) is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Group not found")

    resulting_team1 = data.get("team1_id", match.team1_id)
    resulting_team2 = data.get("team2_id", match.team2_id)
    if resulting_team1 is not None and resulting_team1 == resulting_team2:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="team1_id and team2_id must be different")

    for field, value in data.items():
        setattr(match, field, value)

    db.commit()
    db.refresh(match)
    return match


@router.patch("/{match_id}/result", response_model=MatchRead)
def update_match_result(
    match_id: uuid.UUID,
    payload: MatchResultUpdate,
    db: Session = Depends(get_db),
    _admin=Depends(get_current_admin),
):
    match = _get_match_or_404(match_id, db)
    if match.team1_id is None or match.team2_id is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Both teams must be set before reporting a result")

    match.team1_score = payload.team1_score
    match.team2_score = payload.team2_score
    match.winner_id = match.team1_id if payload.team1_score > payload.team2_score else match.team2_id
    match.status = MatchStatus.FINISHED

    db.commit()
    db.refresh(match)
    return match


@router.delete("/{match_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_match(match_id: uuid.UUID, db: Session = Depends(get_db), _admin=Depends(get_current_admin)):
    match = _get_match_or_404(match_id, db)
    db.delete(match)
    db.commit()
