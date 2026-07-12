import type { NewsTheme } from '../../types'
import type { NewsState } from '../../hooks/useNews'
import { filterByTheme } from '../../hooks/useNews'
import { formatDate } from '../../lib/format'

const UT_HOME = 'https://www.universetoday.com/'

export function NewsSection({ news, theme }: { news: NewsState; theme: NewsTheme }) {
  const items = filterByTheme(news.items, theme)

  return (
    <section className="section">
      <h2>Latest News — Universe Today</h2>
      {news.isStale && news.generatedAt && (
        <p className="news-stale">Feed last updated {formatDate(news.generatedAt)}.</p>
      )}
      {news.status === 'loading' && <p className="hint">Loading news…</p>}
      {(news.status === 'error' || (news.status === 'ready' && items.length === 0)) && (
        <a className="news-item" href={UT_HOME} target="_blank" rel="noopener noreferrer">
          <div className="news-title">News unavailable right now</div>
          <div className="news-summary">Visit Universe Today for the latest space news →</div>
        </a>
      )}
      <div className="news-list">
        {items.map((item) => (
          <a
            key={item.id}
            className="news-item"
            href={item.link}
            target="_blank"
            rel="noopener noreferrer"
          >
            <div className="news-date">{formatDate(item.date)}</div>
            <div className="news-title">{item.title}</div>
            <div className="news-summary">{item.summary}</div>
          </a>
        ))}
      </div>
    </section>
  )
}
