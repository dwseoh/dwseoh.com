import { getTranslations } from 'next-intl/server'
import InlineLink from '@/components/InlineLink'
import RotatingText from '@/components/RotatingText'
import GlitchText from '@/components/GlitchText'
import Callout from '@/components/Callout'
import LinkCarousel, { type CarouselLink } from '@/components/LinkCarousel'
import WebringCarousel, { type Webring } from '@/components/WebringCarousel'
import SocialPill from '@/components/SocialPill'
import LangSwitcher from '@/components/LangSwitcher'

const sectionHeading = (text: string) => (
  <h2
    style={{
      fontSize: '0.75rem',
      fontWeight: 600,
      textTransform: 'uppercase',
      letterSpacing: '0.06em',
      color: 'var(--n-secondary)',
      margin: '2.25rem 0 0.75rem',
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

      <main style={{ maxWidth: 'var(--n-width)', margin: '0 auto', padding: '2.5rem 2rem 6rem' }}>
        <h1
          style={{
            fontSize: '2.5rem',
            fontWeight: 700,
            letterSpacing: '-0.02em',
            margin: '2rem 0 1rem',
            lineHeight: 1.2,
          }}
        >
          {t('greeting')} <GlitchText>{t('name')}</GlitchText> {t('wave')}
        </h1>

        <p style={{ lineHeight: 1.7, marginBottom: '0.875rem' }}>
          {t.rich('bio1', {
            uw: (chunks) => <InlineLink href="https://uwaterloo.ca">{chunks}</InlineLink>,
            cerebras: (chunks) => <InlineLink href="https://cerebras.ai">{chunks}</InlineLink>,
          })}
        </p>

        <p style={{ lineHeight: 1.7, marginBottom: '0.5rem' }}>
          {t.rich('bioMusic', {
            roles: () => <RotatingText words={roles} />,
            htn: (chunks) => <InlineLink href="https://hackthenorth.com">{chunks}</InlineLink>,
          })}
        </p>

        {sectionHeading(t('sections.portfolio'))}
        <LinkCarousel links={portfolioLinks} />

        {sectionHeading(t('sections.hobbies'))}
        <LinkCarousel links={hobbyLinks} />

        {sectionHeading(t('sections.contact'))}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '2.25rem' }}>
          {contactLinks.map((link) => (
            <SocialPill key={link.label} label={link.label} href={link.href} icon={link.icon} />
          ))}
        </div>

        <WebringCarousel webrings={webrings} />

        <hr style={{ border: 'none', borderTop: '1px solid var(--n-border)', margin: '1.5rem 0 1rem' }} />

        <Callout emoji="🚧">{t('footer')}</Callout>

        <p style={{ color: 'var(--n-light)', fontSize: '0.8125rem', marginTop: '1.5rem' }}>
          {t('copyright')}
        </p>
      </main>
    </>
  )
}
