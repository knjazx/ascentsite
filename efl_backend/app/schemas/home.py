from pydantic import BaseModel

from app.schemas.match import MatchRead
from app.schemas.news import NewsListItem, NewsRead
from app.schemas.player import PlayerRead
from app.schemas.team import TeamRead
from app.schemas.tournament import TournamentRead


class HomeRead(BaseModel):
    featured_news: NewsRead | None
    latest_news: list[NewsListItem]
    top_teams: list[TeamRead]
    top_players: list[PlayerRead]
    tournaments: list[TournamentRead]
    recent_matches: list[MatchRead]
    upcoming_matches: list[MatchRead]
