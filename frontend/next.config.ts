import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin('./i18n/request.ts')

const nextConfig: NextConfig = {
  // The blog reads Markdown from content/blog/ via fs at request time. That
  // dynamic read can't be traced automatically, so include the files explicitly
  // to guarantee they ship with the serverless bundle.
  outputFileTracingIncludes: {
    '/*': ['./content/blog/**/*'],
  },
  async redirects() {
    return [
      // The blog used to live under the [locale] segment, so `/ko/blog` was a
      // real URL. It's English-only now and lives at `/blog`; send the old
      // Korean URLs there rather than 404ing.
      {
        source: '/ko/blog',
        destination: '/blog',
        permanent: true,
      },
      {
        source: '/ko/blog/:path*',
        destination: '/blog/:path*',
        permanent: true,
      },
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
