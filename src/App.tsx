import { useHashTab } from './hooks/useHashTab'
import { useNews } from './hooks/useNews'
import { TabBar } from './components/shell/TabBar'
import { Starfield } from './components/shell/Starfield'
import { SolarTab } from './components/solar/SolarTab'
import { TelescopesTab } from './components/telescopes/TelescopesTab'
import { NeighborhoodTab } from './components/neighborhood/NeighborhoodTab'

export default function App() {
  const [tab, navigate] = useHashTab()
  const news = useNews()

  return (
    <div className="app">
      <Starfield />
      <header className="app-header">
        <img src={`${import.meta.env.BASE_URL}icon.svg`} alt="" />
        <h1>Universo</h1>
        <span className="subtitle">solar system · telescopes · neighborhood</span>
      </header>
      <main className="tab-content">
        {tab === 'solar' && <SolarTab news={news} />}
        {tab === 'telescopes' && <TelescopesTab news={news} />}
        {tab === 'neighborhood' && <NeighborhoodTab news={news} />}
      </main>
      <TabBar active={tab} onNavigate={navigate} />
    </div>
  )
}
