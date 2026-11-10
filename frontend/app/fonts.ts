import { Inter, Gowun_Dodum, Instrument_Serif } from 'next/font/google'

export const inter = Inter({ subsets: ['latin'] })
export const gowunDodum = Gowun_Dodum({ weight: '400', subsets: ['latin'] })

// Display serif for /music (piece titles).
export const instrumentSerif = Instrument_Serif({
  weight: '400',
  style: ['normal', 'italic'],
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
})
