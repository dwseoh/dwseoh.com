// A clean alphanumeric set (no jagged symbols) keeps the scramble smooth.
const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

// How many Latin letters a "wide" (Hangul/CJK) character is worth. 1.5 means a
// 4-character Korean name churns through ~6 letters while it resolves, keeping
// the width close without looking sparse.
export const WIDE_RATIO = 1.5

export function randomGlyph(): string {
  return GLYPHS[Math.floor(Math.random() * GLYPHS.length)]
}

function isWide(ch: string): boolean {
  const c = ch.codePointAt(0) ?? 0
  return (
    (c >= 0x1100 && c <= 0x11ff) || // Hangul Jamo
    (c >= 0x3000 && c <= 0x9fff) || // CJK symbols + ideographs
    (c >= 0xac00 && c <= 0xd7a3) || // Hangul syllables
    (c >= 0xf900 && c <= 0xfaff) // CJK compatibility
  )
}

/** Number of scramble letters to show per character (wide chars get more). */
export function scrambleCounts(text: string): number[] {
  const counts: number[] = []
  let cum = 0
  let prev = 0
  for (const ch of text) {
    if (ch === ' ') {
      counts.push(1)
      continue
    }
    cum += isWide(ch) ? WIDE_RATIO : 1
    const f = Math.round(cum)
    counts.push(Math.max(1, f - prev))
    prev = f
  }
  return counts
}

/** Fully scrambled version of `text` (spaces preserved). */
export function scrambleAll(text: string): string {
  let out = ''
  const counts = scrambleCounts(text)
  let i = 0
  for (const ch of text) {
    if (ch === ' ') out += ' '
    else for (let k = 0; k < counts[i]; k++) out += randomGlyph()
    i++
  }
  return out
}
