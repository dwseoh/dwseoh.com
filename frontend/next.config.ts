import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin('./i18n/request.ts')

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/resume',
        destination: '/static/resume.pdf',
        permanent: false,
      },
      // The v1 site kept static assets under /assets/static/. The Next.js app
      // serves them straight from /static/ (public/static/**). Google still has
      // the old paths indexed (Search Console → Not found 404), so map the whole
      // prefix across in one hop. Confirmed indexed today:
      //   /assets/static/resume.pdf, /assets/static/literary_factors_analysis.pdf
      {
        source: '/assets/static/:path*',
        destination: '/static/:path*',
        permanent: true,
      },
    ]
  },
}

export default withNextIntl(nextConfig)
