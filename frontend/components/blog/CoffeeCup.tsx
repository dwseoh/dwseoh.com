/**
 * A small hand-drawn coffee cup with gently rising steam, sized in `em` so it
 * scales with whatever text it sits beside. Pure CSS animation (see
 * `.blog-coffee*` in globals.css); decorative, so it's hidden from a11y trees.
 */
export default function CoffeeCup() {
  return (
    <span className="blog-coffee" aria-hidden="true">
      <span className="blog-coffee-steam">
        <span />
        <span />
        <span />
      </span>
      <svg
        className="blog-coffee-cup"
        viewBox="0 0 32 32"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* cup */}
        <path d="M7 13h14v6a6 6 0 0 1-6 6h-2a6 6 0 0 1-6-6z" />
        {/* handle */}
        <path d="M21 15h3.2a3.4 3.4 0 0 1 0 6.8H21" />
        {/* saucer */}
        <path d="M5.5 29h18" />
      </svg>
    </span>
  )
}
