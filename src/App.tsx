import { lazy, Suspense } from 'react'
import { useHashTab } from './hooks/useHashTab'
import { useNews } from './hooks/useNews'
import { TabBar } from './components/shell/TabBar'
import { Starfield } from './components/shell/Starfield'
import { SolarTab } from './components/solar/SolarTab'
import { PositionsTab } from './components/positions/PositionsTab'
import { TelescopesTab } from './components/telescopes/TelescopesTab'
import { NeighborhoodTab } from './components/neighborhood/NeighborhoodTab'

// The missions dataset is sizeable and only one tab needs it, so it loads on demand.
const MissionsTab = lazy(() =>
  import('./components/missions/MissionsTab').then((m) => ({ default: m.MissionsTab })),
)

export default function App() {
  const [tab, navigate] = useHashTab()
  const news = useNews()

  return (
    <div className="app">
      <Starfield />
      <header className="app-header">
        <img src={`${import.meta.env.BASE_URL}icon.svg`} alt="" />
        <h1>Universo</h1>
        <span className="subtitle">solar system · positions · missions · telescopes · neighborhood</span>
      </header>
      <main className="tab-content">
        {tab === 'solar' && <SolarTab news={news} />}
        {tab === 'positions' && <PositionsTab news={news} />}
        {tab === 'missions' && (
          <Suspense fallback={null}>
            <MissionsTab news={news} />
          </Suspense>
        )}
        {tab === 'telescopes' && <TelescopesTab news={news} />}
        {tab === 'neighborhood' && <NeighborhoodTab news={news} />}
      </main>
      <TabBar active={tab} onNavigate={navigate} />
    </div>
  )
}
