from fastapi import APIRouter, Depends, Query
from sqlalchemy import case, select
from sqlalchemy.orm import Session, selectinload

from app.core.database import get_db
from app.models.match import Match, MatchStatus
from app.models.news import News
from app.models.player import Player
from app.models.team import Team
from app.models.tournament import Tournament, TournamentStatus
from app.schemas.home import HomeRead

router = APIRouter(prefix="/home", tags=["home"])


def _match_options(query):
    return query.options(
        selectinload(Match.team1),
        selectinload(Match.team2),
        selectinload(Match.winner),
    )


@router.get("", response_model=HomeRead)
def get_home(
    news_limit: int = Query(default=5, ge=1, le=20),
    teams_limit: int = Query(default=5, ge=1, le=20),
    players_limit: int = Query(default=5, ge=1, le=20),
    tournaments_limit: int = Query(default=3, ge=1, le=20),
    matches_limit: int = Query(default=5, ge=1, le=20),
    db: Session = Depends(get_db),
):
    featured_news = db.scalar(select(News).where(News.is_featured.is_(True)))

    latest_news_query = select(News).order_by(News.published_at.desc())
    if featured_news is not None:
        latest_news_query = latest_news_query.where(News.id != featured_news.id)
    latest_news = db.scalars(latest_news_query.limit(news_limit)).all()

    top_teams = db.scalars(select(Team).order_by(Team.efl_rating.desc()).limit(teams_limit)).all()

    top_players_query = (
        select(Player)
        .options(selectinload(Player.team))
        .order_by(Player.kd_diff.desc())
        .limit(players_limit)
    )
    top_players = db.scalars(top_players_query).all()

    tournaments_query = (
        select(Tournament)
        .where(Tournament.status.in_([TournamentStatus.ONGOING, TournamentStatus.UPCOMING]))
        .order_by(
            case((Tournament.status == TournamentStatus.ONGOING, 0), else_=1),
            Tournament.start_date.asc().nullslast(),
        )
        .limit(tournaments_limit)
    )
    tournaments = db.scalars(tournaments_query).all()

    recent_matches_query = _match_options(select(Match).where(Match.status == MatchStatus.FINISHED))
    recent_matches = db.scalars(
        recent_matches_query.order_by(Match.scheduled_at.desc()).limit(matches_limit)
    ).all()

    upcoming_matches_query = _match_options(
        select(Match).where(Match.status.in_([MatchStatus.SCHEDULED, MatchStatus.LIVE]))
    )
    upcoming_matches = db.scalars(
        upcoming_matches_query.order_by(Match.scheduled_at.asc()).limit(matches_limit)
    ).all()

    return {
        "featured_news": featured_news,
        "latest_news": latest_news,
        "top_teams": top_teams,
        "top_players": top_players,
        "tournaments": tournaments,
        "recent_matches": recent_matches,
        "upcoming_matches": upcoming_matches,
    }
