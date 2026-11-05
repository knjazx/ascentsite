import math
import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import delete, select
from sqlalchemy.orm import Session, selectinload

from app.api.deps import get_current_admin
from app.core.database import get_db
from app.models.playoff import PlayoffMatch
from app.models.team import Team
from app.models.tournament import Tournament
from app.schemas.playoff import PlayoffGenerateRequest, PlayoffMatchCreate, PlayoffMatchRead, PlayoffMatchUpdate

router = APIRouter(tags=["playoff"])


def _get_tournament_or_404(tournament_id: uuid.UUID, db: Session) -> Tournament:
    tournament = db.get(Tournament, tournament_id)
    if tournament is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tournament not found")
    return tournament


def _get_match_or_404(match_id: uuid.UUID, db: Session) -> PlayoffMatch:
    match = db.get(PlayoffMatch, match_id)
    if match is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Playoff match not found")
    return match


def _matches_query(tournament_id: uuid.UUID):
    return (
        select(PlayoffMatch)
        .where(PlayoffMatch.tournament_id == tournament_id)
        .options(
            selectinload(PlayoffMatch.team1),
            selectinload(PlayoffMatch.team2),
            selectinload(PlayoffMatch.winner),
        )
        .order_by(PlayoffMatch.round, PlayoffMatch.slot)
    )


@router.get("/tournaments/{tournament_id}/playoff", response_model=list[PlayoffMatchRead])
def list_playoff_matches(tournament_id: uuid.UUID, db: Session = Depends(get_db)):
    _get_tournament_or_404(tournament_id, db)
    return db.scalars(_matches_query(tournament_id)).all()


@router.post("/tournaments/{tournament_id}/playoff/generate", response_model=list[PlayoffMatchRead])
def generate_playoff(
    tournament_id: uuid.UUID,
    payload: PlayoffGenerateRequest,
    db: Session = Depends(get_db),
    _admin=Depends(get_current_admin),
):
    _get_tournament_or_404(tournament_id, db)

    for team_id in payload.team_ids:
        if db.get(Team, team_id) is None:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Team {team_id} not found")

    db.execute(delete(PlayoffMatch).where(PlayoffMatch.tournament_id == tournament_id))
    db.flush()

    team_ids = list(payload.team_ids)
    bracket_size = 2 ** math.ceil(math.log2(len(team_ids)))
    seeded = team_ids + [None] * (bracket_size - len(team_ids))

    first_round = []
    for slot in range(bracket_size // 2):
        match = PlayoffMatch(
            tournament_id=tournament_id,
            round=1,
            slot=slot,
            team1_id=seeded[slot * 2],
            team2_id=seeded[slot * 2 + 1],
        )
        db.add(match)
        first_round.append(match)
    db.flush()

    previous_round = first_round
    round_number = 2
    while len(previous_round) > 1:
        current_round = []
        for slot in range(len(previous_round) // 2):
            match = PlayoffMatch(tournament_id=tournament_id, round=round_number, slot=slot)
            db.add(match)
            current_round.append(match)
        db.flush()

        for index, previous_match in enumerate(previous_round):
            previous_match.next_match_id = current_round[index // 2].id
            previous_match.next_match_slot = index % 2

        previous_round = current_round
        round_number += 1

    db.commit()

    return db.scalars(_matches_query(tournament_id)).all()


@router.post(
    "/tournaments/{tournament_id}/playoff/matches",
    response_model=PlayoffMatchRead,
    status_code=status.HTTP_201_CREATED,
)
def create_playoff_match(
    tournament_id: uuid.UUID,
    payload: PlayoffMatchCreate,
    db: Session = Depends(get_db),
    _admin=Depends(get_current_admin),
):
    _get_tournament_or_404(tournament_id, db)

    for team_id in (payload.team1_id, payload.team2_id):
        if team_id is not None and db.get(Team, team_id) is None:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Team not found")

    match = PlayoffMatch(tournament_id=tournament_id, **payload.model_dump())
    db.add(match)
    db.commit()
    db.refresh(match)
    return match


@router.put("/playoff/matches/{match_id}", response_model=PlayoffMatchRead)
def update_playoff_match(
    match_id: uuid.UUID,
    payload: PlayoffMatchUpdate,
    db: Session = Depends(get_db),
    _admin=Depends(get_current_admin),
):
    match = _get_match_or_404(match_id, db)
    data = payload.model_dump(exclude_unset=True)

    for team_field in ("team1_id", "team2_id", "winner_id"):
        if team_field in data and data[team_field] is not None and db.get(Team, data[team_field]) is None:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Team not found")

    resulting_team1 = data.get("team1_id", match.team1_id)
    resulting_team2 = data.get("team2_id", match.team2_id)
    resulting_winner = data.get("winner_id", match.winner_id)
    if resulting_winner is not None and resulting_winner not in (resulting_team1, resulting_team2):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Winner must be one of the two teams")

    for field, value in data.items():
        setattr(match, field, value)

    if "winner_id" in data and match.winner_id is not None and match.next_match_id is not None:
        next_match = db.get(PlayoffMatch, match.next_match_id)
        if next_match is not None:
            if match.next_match_slot == 0:
                next_match.team1_id = match.winner_id
            else:
                next_match.team2_id = match.winner_id

    db.commit()
    db.refresh(match)
    return match


@router.delete("/playoff/matches/{match_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_playoff_match(match_id: uuid.UUID, db: Session = Depends(get_db), _admin=Depends(get_current_admin)):
    match = _get_match_or_404(match_id, db)
    db.delete(match)
    db.commit()
