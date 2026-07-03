import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin('./i18n/request.ts')

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // Legacy v1 static-site URLs still indexed by Google. The old site served
      // raw files (resume/index.html, index.html); the Next.js app has no such
      // routes, so these 404. Redirect them permanently (308) to consolidate.
      {
        source: '/resume',
        destination: '/static/resume.pdf',
        permanent: true,
      },
      {
        source: '/resume/index.html',
        destination: '/static/resume.pdf',
        permanent: true,
      },
      {
        source: '/index.html',
        destination: '/',
        permanent: true,
      },
    ]
  },
}

export default withNextIntl(nextConfig)
