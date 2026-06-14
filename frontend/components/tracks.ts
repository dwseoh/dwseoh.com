// Shared "track" taxonomy for the Experience section — each experience belongs
// to a track, which drives the color used in both the git-graph and subway
// visualizations. Keep these in sync with the `track` values in messages/*.json.
export const TRACK_COLORS: Record<string, string> = {
  engineering: '#2383e2', // accent blue
  community:   '#8B5CF6', // violet
  leadership:  '#0EA5E9', // cyan
}

export const TRACK_LABELS: Record<string, string> = {
  engineering: 'Engineering',
  community:   'Community',
  leadership:  'Leadership',
}

export const trackColor = (track?: string) =>
  (track && TRACK_COLORS[track]) || 'var(--n-secondary)'

export interface Experience {
  role: string
  org: string
  period: string
  desc?: string
  track?: string
  href?: string
}
