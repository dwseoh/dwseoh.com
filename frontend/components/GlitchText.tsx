/**
 * Pure-CSS glitch text (no JS). Renders the text three times via data-text
 * and ::before/::after layers animated in globals.css (.glitch).
 */
export default function GlitchText({ children }: { children: string }) {
  return (
    <span className="glitch" data-text={children}>
      {children}
    </span>
  )
}
