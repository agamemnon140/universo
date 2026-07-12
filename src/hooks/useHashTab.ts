import { useCallback, useEffect, useState } from 'react'

export type TabId = 'solar' | 'telescopes' | 'neighborhood'

const TABS: TabId[] = ['solar', 'telescopes', 'neighborhood']

function tabFromHash(): TabId {
  const raw = window.location.hash.replace(/^#\/?/, '')
  return (TABS as string[]).includes(raw) ? (raw as TabId) : 'solar'
}

export function useHashTab(): [TabId, (tab: TabId) => void] {
  const [tab, setTab] = useState<TabId>(tabFromHash)

  useEffect(() => {
    const onHashChange = () => setTab(tabFromHash())
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  const navigate = useCallback((next: TabId) => {
    window.location.hash = `/${next}`
  }, [])

  return [tab, navigate]
}
