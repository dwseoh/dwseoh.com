import Link from 'next/link'

/**
 * The sticky breadcrumb bar shared by every sub-page (/blog, /blog/<slug>,
 * /photos): `Jamie's Website / <Section> / <current>`, with a hairline under it.
 * Page-specific actions (the blog's search) go in `children`, on the right.
 *
 * `width` lines the crumbs up with the page's own container: the blog's reading
 * column ("read") or the wide gallery container ("page"). Styles: `.subbar` in
 * app/globals.css.
 */
export default function SubpageBar({
  home = "Jamie's Website",
  section,
  current,
  width = 'page',
  children,
}: {
  /** Label of the first crumb, which links to the portfolio at `/`. */
  home?: string
  /** The section crumb. `short` is what phones show when a `current` crumb follows. */
  section: { label: string; href: string; short?: string }
  /** Trailing crumb for a page inside the section (e.g. a post title). */
  current?: string
  width?: 'page' | 'read'
  children?: React.ReactNode
}) {
  return (
    <header className="subbar" data-width={width}>
      <div className="subbar-inner">
        <nav className={`subbar-crumbs${current ? ' has-tail' : ''}`} aria-label="Breadcrumb">
          {/* Logo + name are a single crumb back to the portfolio. */}
          <Link href="/" className="subbar-crumb subbar-crumb-home">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/favicon.png" alt="" className="subbar-logo" width={18} height={18} />
            {home}
          </Link>
          <span className="subbar-sep" aria-hidden="true">/</span>
          <Link
            href={section.href}
            className="subbar-crumb subbar-crumb-section"
            aria-current={current ? undefined : 'page'}
            aria-label={section.label}
          >
            {/* With a trailing crumb, phones collapse this one (e.g. to "..") so
                the current title still fits. Both labels ship; CSS picks one. */}
            <span className="subbar-label">{section.label}</span>
            {section.short && (
              <span className="subbar-label-short" aria-hidden="true">
                {section.short}
              </span>
            )}
          </Link>
          {current && (
            <span className="subbar-tail">
              <span className="subbar-sep" aria-hidden="true">/</span>
              <span className="subbar-current" aria-current="page">
                {current}
              </span>
            </span>
          )}
        </nav>

        {children && <div className="subbar-actions">{children}</div>}
      </div>
    </header>
  )
}
