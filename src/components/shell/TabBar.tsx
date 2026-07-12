import type { TabId } from '../../hooks/useHashTab'

const TABS: { id: TabId; label: string; icon: string }[] = [
  { id: 'solar', label: 'Solar System', icon: '🪐' },
  { id: 'telescopes', label: 'Telescopes', icon: '🔭' },
  { id: 'neighborhood', label: 'Neighborhood', icon: '✨' },
]

export function TabBar({ active, onNavigate }: { active: TabId; onNavigate: (tab: TabId) => void }) {
  return (
    <nav className="tab-bar">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          className={tab.id === active ? 'active' : ''}
          onClick={() => onNavigate(tab.id)}
        >
          <span className="tab-icon">{tab.icon}</span>
          {tab.label}
        </button>
      ))}
    </nav>
  )
}
