'use client'

import { useState } from 'react'
import { useLocale } from 'next-intl'
import { usePathname, useRouter } from '@/i18n/routing'

const FLAGS: Record<string, string> = {
  en: '/images/england.png',
  ko: '/images/korea.png',
}
const LABELS: Record<string, string> = {
  en: 'English',
  ko: '한국어',
}

export default function LangSwitcher() {
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  function switchLocale(next: string) {
    router.replace(pathname, { locale: next as 'en' | 'ko' })
    setOpen(false)
  }

  return (
    <div style={{ position: 'fixed', top: '1rem', right: '1.25rem', zIndex: 1000 }}>
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '6px 10px',
          background: 'var(--n-bg)',
          border: '1px solid var(--n-border)',
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '13px',
          color: 'var(--n-secondary)',
          fontFamily: 'inherit',
        }}
      >
        <img src={FLAGS[locale]} alt={locale} width={18} style={{ borderRadius: '2px' }} />
        <span>{LABELS[locale]}</span>
        <span style={{ fontSize: '10px', marginLeft: '1px' }}>{open ? '▴' : '▾'}</span>
      </button>

      {open && (
        <>
          {/* click-outside backdrop */}
          <div
            style={{ position: 'fixed', inset: 0, zIndex: -1 }}
            onClick={() => setOpen(false)}
          />
          <div
            style={{
              position: 'absolute',
              top: 'calc(100% + 4px)',
              right: 0,
              minWidth: '130px',
              background: 'var(--n-bg)',
              border: '1px solid var(--n-border)',
              borderRadius: '8px',
              boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
              overflow: 'hidden',
            }}
          >
            {(['en', 'ko'] as const).map((loc) => (
              <button
                key={loc}
                onClick={() => switchLocale(loc)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  width: '100%',
                  padding: '9px 12px',
                  border: 'none',
                  background: loc === locale ? 'rgba(35,131,226,0.08)' : 'transparent',
                  color: loc === locale ? 'var(--n-accent)' : 'var(--n-text)',
                  fontSize: '13px',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  textAlign: 'left',
                }}
              >
                <img src={FLAGS[loc]} alt={loc} width={18} style={{ borderRadius: '2px' }} />
                {LABELS[loc]}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
