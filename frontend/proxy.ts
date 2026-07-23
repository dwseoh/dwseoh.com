import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'

export default createMiddleware(routing)

export const config = {
  // `blog` is excluded: the blog is English-only and lives outside the [locale]
  // segment (app/blog), so it must not be rewritten to /en/blog by next-intl.
  matcher: ['/((?!_next|_vercel|blog|.*\\..*).*)'],
}
