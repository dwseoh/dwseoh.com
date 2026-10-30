import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'

export default createMiddleware(routing)

export const config = {
  // `blog` and `photos` are excluded: both are English-only and live outside the
  // [locale] segment (app/blog, app/photos), so next-intl must not rewrite them.
  matcher: ['/((?!_next|_vercel|blog|photos|.*\\..*).*)'],
}
