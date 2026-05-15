import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import './App.css'
import { AppShell } from './components/layout/AppShell'
import {
  dashboardData,
  episodeDetailRoutes,
  getGlobalsDetail,
  getSettingsDoc,
  projectMeta,
} from './mock/data'
import { DashboardPage } from './pages/DashboardPage'
import { EpisodeDetailPage } from './pages/EpisodeDetailPage'
import { FinalEpisodePage } from './pages/FinalEpisodePage'
import { GlobalsPage } from './pages/GlobalsPage'
import { SettingsDocPage } from './pages/SettingsDocPage'
import { EpisodePage } from './pages/EpisodePage'

function GlobalsRoute() {
  const location = useLocation()
  return <GlobalsPage detail={getGlobalsDetail(location.pathname)} />
}

function SettingsRoute() {
  const location = useLocation()
  const name = decodeURIComponent(location.pathname.split('/').pop() || '')
  return <SettingsDocPage doc={getSettingsDoc(name)} />
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<AppShell brandText="Agent 负责流程推进，网页负责项目可视化与人工修订。" projectName={projectMeta.name} />}>
        <Route index element={<DashboardPage projectMeta={projectMeta} data={dashboardData} />} />

        {/* Draft + final routes */}
        {episodeDetailRoutes.map((route) =>
          route.type === 'final' ? (
            <Route key={route.path} path={route.path} element={<FinalEpisodePage data={route.data} />} />
          ) : (
            <Route
              key={route.path}
              path={route.path}
              element={
                <EpisodeDetailPage
                  data={route.data}
                  statusTone={route.statusTone}
                  helperTone={route.helperTone}
                  secondaryAction={route.secondaryAction}
                />
              }
            />
          ),
        )}

        {/* Unified EP document browser — splat catch-all for episodes/ep{N} */}
        <Route path="episodes/*" element={<EpisodePage />} />

        {/* Settings docs — 写作纲领 / 剧情方向 */}
        <Route path="settings/:name" element={<SettingsRoute />} />

        <Route path="globals" element={<GlobalsRoute />} />
        <Route path="globals/:section" element={<GlobalsRoute />} />
        <Route path="globals/:section/:entry" element={<GlobalsRoute />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}

export default App
