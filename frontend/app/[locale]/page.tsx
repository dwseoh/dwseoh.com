import { getTranslations, getLocale } from 'next-intl/server'
import InlineLink from '@/components/InlineLink'
import RotatingText from '@/components/RotatingText'
import ScrambleText from '@/components/ScrambleText'
import LinkRow from '@/components/LinkRow'
import HoverPreview from '@/components/HoverPreview'
import ProjectCarousel, { type Project } from '@/components/ProjectCarousel'
import HobbyCards, { type CarouselItem } from '@/components/HobbyCards'
import PhotoStrip, { type Photo } from '@/components/PhotoStrip'
import WebringCarousel, { type Webring } from '@/components/WebringCarousel'
import SocialPill from '@/components/SocialPill'
import LangSwitcher from '@/components/LangSwitcher'
import Experience from '@/components/Experience'

interface SimpleLink {
  label: string
  href: string
  desc?: string
  icon: string
}

const favicon = (url: string) => {
  try {
    return `https://www.google.com/s2/favicons?domain=${new URL(url).hostname}&sz=64`
  } catch {
    return undefined
  }
}

const headingStyle: React.CSSProperties = {
  fontSize: '0.75rem',
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  color: 'var(--n-secondary)',
  margin: '2.5rem 0 0.875rem',
}

const sectionHeading = (text: string) => <h2 style={headingStyle}>{text}</h2>

function OpenInNewIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 4h6v6M20 4 11 13M18 13v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h5" />
    </svg>
  )
}
export default async function HomePage() {
  const t = await getTranslations()
  const locale = await getLocale()

  const roles            = t.raw('roles') as string[]
  const portfolioLinks   = t.raw('portfolioLinks') as SimpleLink[]
  const hobbyCategories  = t.raw('hobbyCategories') as CarouselItem[]
  const contactLinks     = t.raw('contactLinks') as SimpleLink[]
  const photos           = t.raw('photos') as Photo[]
  const webrings         = t.raw('webrings') as Webring[]
  const projects         = t.raw('projects') as Project[]

  return (
    <>
      <LangSwitcher />

      <main style={{ maxWidth: 'var(--n-width)', margin: '0 auto', padding: '4rem 2rem 6rem' }}>
        <h1
          style={{
            fontSize: '2.5rem',
            fontWeight: 700,
            letterSpacing: '-0.02em',
            margin: '0 0 1.75rem',
            lineHeight: 1.2,
          }}
        >
          {locale === 'ko' ? (
            <>
              <ScrambleText key="name" text={t('name')} /> <span key="greeting">{t('greeting')}</span> {t('wave')}
            </>
          ) : (
            <>
              <span key="greeting">{t('greeting')}</span> <ScrambleText key="name" text={t('name')} /> {t('wave')}
            </>
          )}
        </h1>

        <p style={{ lineHeight: 1.9, marginBottom: '1.5rem' }}>
          {t.rich('bio1', {
            uw: (chunks) => (
              <HoverPreview label="University of Waterloo" href="https://uwaterloo.ca" desc={t('previews.uw')} iconUrl={favicon('https://uwaterloo.ca')}>
                <InlineLink href="https://uwaterloo.ca">{chunks}</InlineLink>
              </HoverPreview>
            ),
            cerebras: (chunks) => (
              <HoverPreview label="Cerebras Systems" href="https://cerebras.ai" desc={t('previews.cerebras')} iconUrl={favicon('https://cerebras.ai')}>
                <InlineLink href="https://cerebras.ai">{chunks}</InlineLink>
              </HoverPreview>
            ),
          })}
        </p>

        <p style={{ lineHeight: 1.9, marginBottom: '1.25rem' }}>
          {t.rich('bioMusic', {
            roles: () => <RotatingText words={roles} />,
          })}
        </p>

        <p style={{ lineHeight: 1.9, marginBottom: '0.5rem' }}>
          {t.rich('bioCommunity', {
            htn: (chunks) => (
              <HoverPreview label="Hack the North" href="https://hackthenorth.com" desc={t('previews.htn')} iconUrl={favicon('https://hackthenorth.com')}>
                <InlineLink href="https://hackthenorth.com">{chunks}</InlineLink>
              </HoverPreview>
            ),
          })}
        </p>

        <PhotoStrip photos={photos} />

        {sectionHeading(t('sections.portfolio'))}
        <div className="portfolio-grid">
          {portfolioLinks.map((link) => (
            <HoverPreview key={link.label} block label={link.label} href={link.href} desc={link.desc} icon={link.icon}>
              <LinkRow label={link.label} href={link.href} icon={link.icon} />
            </HoverPreview>
          ))}
        </div>

        {Array.isArray(projects) && projects.length > 0 && (
          <>
            <h2 style={{ ...headingStyle, display: 'flex', alignItems: 'center', gap: '7px' }}>
              <span className="inprogress" data-tip="coming soon" aria-label="Projects page — coming soon" role="img">
                <OpenInNewIcon />
              </span>
              {t('sections.projects')}
            </h2>
            <ProjectCarousel items={projects} />
          </>
        )}

        {sectionHeading(t('sections.experiences'))}
        <Experience />

        {sectionHeading(t('sections.hobbies'))}
        <HobbyCards items={hobbyCategories} />

        {sectionHeading(t('sections.contact'))}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '2.5rem' }}>
          {contactLinks.map((link) => (
            <HoverPreview key={link.label} label={link.label} href={link.href} desc={link.desc} icon={link.icon}>
              <SocialPill label={link.label} href={link.href} icon={link.icon} />
            </HoverPreview>
          ))}
        </div>

        <hr style={{ border: 'none', borderTop: '1px solid var(--n-border)', margin: '0.5rem 0 1.25rem' }} />

        <div className="site-footer">
          <p style={{ color: 'var(--n-light)', fontSize: '0.75rem', margin: 0 }}>
            {t('copyright')}
          </p>
          <WebringCarousel webrings={webrings} />
        </div>
      </main>
    </>
  )
}
