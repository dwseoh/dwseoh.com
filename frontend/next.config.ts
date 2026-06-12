import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin('./i18n/request.ts')

const nextConfig: NextConfig = {
  // `@magenta/music` (pulled in by html-midi-player, used in ScorePlayer) does
  // `import * as Tone from 'tone'`, but tone@14's `browser` field points at a UMD
  // bundle with no ES exports. Alias `tone` to its ESM entry so the named imports
  // resolve in the client bundle.
  turbopack: {
    resolveAlias: {
      tone: 'tone/build/esm/index.js',
    },
  },
  async redirects() {
    return [
      {
        source: '/resume',
        destination: '/static/resume.pdf',
        permanent: false,
      },
    ]
  },
}

export default withNextIntl(nextConfig)
