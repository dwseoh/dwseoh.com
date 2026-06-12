// A clean alphanumeric set (no jagged symbols) keeps the scramble smooth.
const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

function rand(): string {
  return GLYPHS[Math.floor(Math.random() * GLYPHS.length)]
}

// "Wide" scripts (Hangul/CJK) are about twice the width of a Latin letter, so
// each wide character scrambles into 2 letters — e.g. a 4-character Korean name
// churns through ~8 letters, keeping the width close while it resolves.
function isWide(ch: string): boolean {
  const c = ch.codePointAt(0) ?? 0
  return (
    (c >= 0x1100 && c <= 0x11ff) || // Hangul Jamo
    (c >= 0x3000 && c <= 0x9fff) || // CJK symbols + ideographs
    (c >= 0xac00 && c <= 0xd7a3) || // Hangul syllables
    (c >= 0xf900 && c <= 0xfaff) // CJK compatibility
  )
}

export function randomGlyph(target?: string): string {
  return target && isWide(target) ? rand() + rand() : rand()
}

/** Fully scrambled version of `text` (spaces preserved). */
export function scrambleAll(text: string): string {
  let out = ''
  for (const ch of text) out += ch === ' ' ? ' ' : randomGlyph(ch)
  return out
}
