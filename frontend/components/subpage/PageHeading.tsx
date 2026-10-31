/** Counts render as two digits ("02", "14"), like a catalogue number. */
export const pad = (n: number) => String(n).padStart(2, '0')

/**
 * The shared sub-page heading: a small uppercase eyebrow, the light display
 * title with a muted superscript count, then a one-line intro. `size="post"`
 * is the smaller display step used for article titles.
 *
 * It renders only the text block; the page lays it out inside `.page-head`
 * (opposite its tabs/controls, if any). Styles live in app/globals.css.
 */
export default function PageHeading({
  eyebrow,
  title,
  count,
  intro,
  size = 'index',
}: {
  eyebrow?: React.ReactNode
  title: React.ReactNode
  count?: number
  intro?: React.ReactNode
  size?: 'index' | 'post'
}) {
  return (
    <div className="page-heading">
      {eyebrow && <p className="eyebrow page-eyebrow">{eyebrow}</p>}
      <h1 className={`display display-${size}`}>
        {title}
        {count != null && <sup className="display-count">{pad(count)}</sup>}
      </h1>
      {intro && <p className="page-intro">{intro}</p>}
    </div>
  )
}
