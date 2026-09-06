import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AdminOnlyRoute } from './components/auth/AdminOnlyRoute'
import { ProtectedRoute } from './components/auth/ProtectedRoute'
import { AdminLayout } from './layout/AdminLayout'
import { DashboardPage } from './pages/dashboard/DashboardPage'
import { EpisodeCreatePage } from './pages/episodes/EpisodeCreatePage'
import { EpisodeEditPage } from './pages/episodes/EpisodeEditPage'
import { EpisodesPage } from './pages/episodes/EpisodesPage'
import { LoginPage } from './pages/login/LoginPage'
import { PublishPage } from './pages/publish/PublishPage'
import { SeedPreflightPage } from './pages/publish/SeedPreflightPage'
import { ShowCreatePage } from './pages/shows/ShowCreatePage'
import { SeasonEpisodesPage } from './pages/episodes/SeasonEpisodesPage'
import { ShowManagementPage } from './pages/shows/ShowManagementPage'
import { ShowEditPage } from './pages/shows/ShowEditPage'
import { ShowsPage } from './pages/shows/ShowsPage'

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/admin/login" element={<LoginPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="shows" element={<ShowsPage />} />
            <Route path="shows/new" element={<ShowCreatePage />} />
            <Route path="shows/:showId" element={<ShowManagementPage />} />
            <Route path="seasons/:seasonId/episodes" element={<SeasonEpisodesPage />} />
            <Route path="shows/:showId/edit" element={<ShowEditPage />} />
            <Route path="episodes" element={<EpisodesPage />} />
            <Route path="episodes/new" element={<EpisodeCreatePage />} />
            <Route path="episodes/:episodeId/edit" element={<EpisodeEditPage />} />
            <Route element={<AdminOnlyRoute />}>
              <Route path="publish" element={<PublishPage />} />
            </Route>
            <Route path="seed-preflight" element={<SeedPreflightPage />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/admin/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
