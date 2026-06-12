/**
 * Compositions catalogue (English-only by design — these are program notes, not
 * UI strings, so they live here rather than in `messages/*.json`).
 *
 * Adding a piece is a pure data change: drop the assets under
 * `public/compositions/<slug>/` and append an entry below. No code changes.
 */
export interface Composition {
  slug: string
  title: string
  year: number
  /** Instrumentation, e.g. "string quartet". */
  ensemble: string
  /** Program note. Split into paragraphs on blank lines (`\n\n`) when rendered. */
  note: string
  /** Cover art, e.g. /compositions/<slug>/cover.jpg */
  cover: string
  /** MusicXML score used for the synced player, e.g. /compositions/<slug>/score.musicxml */
  musicXml: string
  /** Optional real recording — played as a parallel, non-highlighted listen. */
  audio?: string
  /** Optional performance video: a YouTube URL or a local /compositions/<slug>/performance.mp4 */
  video?: string
  /** Display-only duration, e.g. "4:12". */
  duration?: string
}

export const compositions: Composition[] = [
  {
    slug: 'twinkle-first-light',
    title: 'First Light',
    year: 2024,
    ensemble: 'solo piano',
    note:
      'Placeholder seed entry — swap the assets under ' +
      '`public/compositions/twinkle-first-light/` for a real piece.\n\n' +
      'The score below is a short public-domain melody used only to demonstrate the ' +
      'note-level synced player end to end: press play and the note heads light up in ' +
      'time with the MIDI playback. Replace `score.musicxml`, `cover.jpg`, and (optionally) ' +
      'add a `recording.mp3` to feature an actual composition.',
    cover: '/compositions/twinkle-first-light/cover.svg',
    musicXml: '/compositions/twinkle-first-light/score.musicxml',
    duration: '0:16',
  },
]

export const getComposition = (slug: string) =>
  compositions.find((c) => c.slug === slug)
