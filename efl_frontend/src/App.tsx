import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from "react-router-dom";

import Layout from "./components/Layout/Layout";

import Home from "./pages/Home/Home";
import AuthPage from "./pages/Auth/AuthPage";
import TeamRegistrationPage from "./pages/TeamRegistration/TeamRegistrationPage";
import TournamentsListPage from "./pages/Tournaments/TournamentsListPage";
import TournamentDetailPage from "./pages/Tournaments/TournamentDetailPage";
import StatsPage from "./pages/Stats/StatsPage";
import PlayerProfilePage from "./pages/Players/PlayerProfilePage";
import TeamProfilePage from "./pages/Teams/TeamProfilePage";
import NewsDetailPage from "./pages/News/NewsDetailPage";
import NewsListPage from "./pages/News/NewsListPage";
import RulesPage from "./pages/Rules/RulesPage";
import MatchesPage from "./pages/Matches/MatchesPage";
import MarketPage from "./pages/Market/MarketPage";
import PlayerDashboardPage from "./pages/Dashboard/PlayerDashboardPage";
import NotFoundPage from "./pages/NotFound/NotFoundPage";
import { DataProvider } from "./context/DataContext";
import { ToastProvider } from "./context/ToastContext";
import AdminGate from "./pages/Admin/AdminGate";

const AdminLayout = lazy(() => import('./pages/Admin/AdminLayout'));
const AdminDashboard = lazy(() => import('./pages/Admin/pages/AdminDashboard'));
const AdminTournaments = lazy(() => import('./pages/Admin/pages/AdminTournaments'));
const AdminTournamentEdit = lazy(() => import('./pages/Admin/pages/AdminTournamentEdit'));
const AdminNews = lazy(() => import('./pages/Admin/pages/AdminNews'));
const AdminNewsEdit = lazy(() => import('./pages/Admin/pages/AdminNewsEdit'));
const AdminMatches = lazy(() => import('./pages/Admin/pages/AdminMatches'));
const AdminTeams = lazy(() => import('./pages/Admin/pages/AdminTeams'));
const AdminPlayers = lazy(() => import('./pages/Admin/pages/AdminPlayers'));
const AdminSeasons = lazy(() => import('./pages/Admin/pages/AdminSeasons'));
const AdminRules = lazy(() => import('./pages/Admin/pages/AdminRules'));
const AdminApprovals = lazy(() => import('./pages/Admin/pages/AdminApprovals'));
const AdminSettings = lazy(() => import('./pages/Admin/pages/AdminSettings'));
const AdminMarket = lazy(() => import('./pages/Admin/pages/AdminMarket'));

function App() {
  return (
    <DataProvider>
      <ToastProvider>
        <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<AuthPage />} />
          <Route path="/signup" element={<AuthPage defaultTab="signup" />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/profile" element={<PlayerDashboardPage />} />
          <Route path="/dashboard" element={<PlayerDashboardPage />} />
          <Route path="/register" element={<TeamRegistrationPage />} />
          <Route path="/stats" element={<StatsPage />} />
          <Route path="/teams" element={<Navigate to="/stats?tab=teams" replace />} />
          <Route path="/teams/:slug" element={<TeamProfilePage />} />
          <Route path="/players" element={<Navigate to="/stats?tab=players" replace />} />
          <Route path="/players/:slug" element={<PlayerProfilePage />} />
          <Route path="/tournaments" element={<TournamentsListPage />} />
          <Route path="/tournaments/:slug" element={<TournamentDetailPage />} />
          <Route path="/news" element={<NewsListPage />} />
          <Route path="/news/:slug" element={<NewsDetailPage />} />
          <Route path="/rules" element={<RulesPage />} />
          <Route path="/matches" element={<MatchesPage />} />
          <Route path="/market" element={<MarketPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>

        <Route path="/admin" element={<AdminGate />}>
          <Route element={
            <Suspense fallback={<div style={{ padding: '2rem', textAlign: 'center' }}>Loading Admin...</div>}>
              <AdminLayout />
            </Suspense>
          }>
            <Route index element={<AdminDashboard />} />
            <Route path="market" element={<AdminMarket />} />
            <Route path="tournaments" element={<AdminTournaments />} />
            <Route path="tournaments/:slug" element={<AdminTournamentEdit />} />
            <Route path="news" element={<AdminNews />} />
            <Route path="news/:slug" element={<AdminNewsEdit />} />
            <Route path="matches" element={<AdminMatches />} />
            <Route path="teams" element={<AdminTeams />} />
            <Route path="players" element={<AdminPlayers />} />
            <Route path="seasons" element={<AdminSeasons />} />
            <Route path="rules" element={<AdminRules />} />
            <Route path="approvals" element={<AdminApprovals />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>
        </Route>
      </Routes>
      </ToastProvider>
    </DataProvider>
  );
}

export default App;