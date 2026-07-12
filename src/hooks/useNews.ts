import { useEffect, useState } from 'react'
import type { NewsFeed, NewsItem, NewsTheme } from '../types'

const STALE_AFTER_DAYS = 10

export interface NewsState {
  status: 'loading' | 'ready' | 'error'
  items: NewsItem[]
  generatedAt: string | null
  isStale: boolean
}

export function useNews(): NewsState {
  const [state, setState] = useState<NewsState>({
    status: 'loading',
    items: [],
    generatedAt: null,
    isStale: false,
  })

  useEffect(() => {
    let cancelled = false
    fetch(`${import.meta.env.BASE_URL}news.json`, { cache: 'no-cache' })
      .then((res) => {
        if (!res.ok) throw new Error(`news.json ${res.status}`)
        return res.json() as Promise<NewsFeed>
      })
      .then((feed) => {
        if (cancelled) return
        const ageDays =
          (Date.now() - new Date(feed.generatedAt).getTime()) / 86_400_000
        setState({
          status: 'ready',
          items: feed.items,
          generatedAt: feed.generatedAt,
          isStale: ageDays > STALE_AFTER_DAYS,
        })
      })
      .catch(() => {
        if (!cancelled) {
          setState({ status: 'error', items: [], generatedAt: null, isStale: false })
        }
      })
    return () => {
      cancelled = true
    }
  }, [])

  return state
}

export function filterByTheme(items: NewsItem[], theme: NewsTheme, max = 8): NewsItem[] {
  return items.filter((item) => item.themes.includes(theme)).slice(0, max)
}
