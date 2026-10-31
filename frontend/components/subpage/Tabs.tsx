import { pad } from './PageHeading'

export interface TabItem<K extends string> {
  key: K
  label: string
  count: number
  href: string
}

/**
 * Filter tabs with superscript counts and an underline on the active one.
 * Each tab is a real link (so it works without JS and opens in a new tab on
 * modified clicks); `onSelect` lets the page swap the view in place instead.
 */
export default function Tabs<K extends string>({
  items,
  active,
  label,
  onSelect,
}: {
  items: TabItem<K>[]
  active: K
  /** Accessible name of the nav. */
  label: string
  onSelect?: (e: React.MouseEvent, key: K) => void
}) {
  return (
    <nav className="tabs" aria-label={label}>
      {items.map((t) => (
        <a
          key={t.key}
          href={t.href}
          className={t.key === active ? 'is-on' : undefined}
          aria-current={t.key === active ? 'page' : undefined}
          onClick={onSelect ? (e) => onSelect(e, t.key) : undefined}
        >
          {t.label}
          <sup>{pad(t.count)}</sup>
        </a>
      ))}
    </nav>
  )
}
