import type { Metadata } from 'next'
import MusicView from '@/components/music/MusicView'
import { BACKGROUND_IMAGE, intro, sections } from './data'

const title = 'Music — Jamie Seoh'
const description =
  'Original compositions and arrangements by Jamie Seoh — film and game soundtracks, holiday charts, covers, and chamber pieces.'

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: '/music' },
  openGraph: { title, description, url: '/music', type: 'website' },
}

export default function MusicPage() {
  return <MusicView sections={sections} intro={intro} background={BACKGROUND_IMAGE} />
}
