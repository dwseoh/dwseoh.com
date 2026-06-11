import { getTranslations } from 'next-intl/server'
import InlineLink from '@/components/InlineLink'
import RotatingText from '@/components/RotatingText'
import ScrambleText from '@/components/ScrambleText'
import LinkRow from '@/components/LinkRow'
import HoverPreview from '@/components/HoverPreview'
import LinkCarousel, { type CarouselLink } from '@/components/LinkCarousel'
import WebringCarousel, { type Webring } from '@/components/WebringCarousel'
import SocialPill from '@/components/SocialPill'
import LangSwitcher from '@/components/LangSwitcher'

const favicon = (url: string) => {
  try {
    return `https://www.google.com/s2/favicons?domain=${new URL(url).hostname}&sz=64`
  } catch {
    return undefined
  }
}

const sectionHeading = (text: string) => (
  <h2
    style={{
      fontSize: '0.75rem',
      fontWeight: 600,
      textTransform: 'uppercase',
      letterSpacing: '0.06em',
      color: 'var(--n-secondary)',
      margin: '2.5rem 0 0.875rem',
    }}
  >
    {text}
  </h2>
)

export default async function HomePage() {
  const t = await getTranslations()

  const roles          = t.raw('roles') as string[]
  const portfolioLinks = t.raw('portfolioLinks') as CarouselLink[]
  const hobbyLinks     = t.raw('hobbyLinks') as CarouselLink[]
  const contactLinks   = t.raw('contactLinks') as CarouselLink[]
  const webrings       = t.raw('webrings') as Webring[]

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
          {t('greeting')} <ScrambleText text={t('name')} /> {t('wave')}
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

        {sectionHeading(t('sections.portfolio'))}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px' }}>
          {portfolioLinks.map((link) => (
            <HoverPreview key={link.label} block label={link.label} href={link.href} desc={link.desc} icon={link.icon}>
              <LinkRow label={link.label} href={link.href} icon={link.icon} />
            </HoverPreview>
          ))}
        </div>

        {sectionHeading(t('sections.hobbies'))}
        <LinkCarousel links={hobbyLinks} />

        {sectionHeading(t('sections.contact'))}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '2.5rem' }}>
          {contactLinks.map((link) => (
            <HoverPreview key={link.label} label={link.label} href={link.href} desc={link.desc} icon={link.icon}>
              <SocialPill label={link.label} href={link.href} icon={link.icon} />
            </HoverPreview>
          ))}
        </div>

        <hr style={{ border: 'none', borderTop: '1px solid var(--n-border)', margin: '0.5rem 0 1.25rem' }} />

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.75rem 1.25rem',
            flexWrap: 'wrap',
          }}
        >
          <p style={{ color: 'var(--n-light)', fontSize: '0.75rem', margin: 0 }}>
            {t('copyright')}
          </p>
          <WebringCarousel webrings={webrings} />
        </div>
      </main>
    </>
  )
}
