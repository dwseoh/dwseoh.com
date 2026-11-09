import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'

export default createMiddleware(routing)

export const config = {
  // These English-only pages live outside [locale], so exclude them from rewrites.
  matcher: ['/((?!_next|_vercel|blog|photos|music|.*\\..*).*)'],
}
