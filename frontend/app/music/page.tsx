import MusicView from '@/components/music/MusicView'
import { BACKGROUND_IMAGE, collections, pieces } from './data'

export default function MusicPage() {
  return (
    <>
      {/* Without JS the drum never lays out; fall back to a plain scrolling list. */}
      <noscript>
        <style>
          {
            '.cw-drum{overflow:auto;-webkit-mask-image:none;mask-image:none}.cw-row{position:relative;inset:auto;margin:0;opacity:1}.cw-lens{display:none}'
          }
        </style>
      </noscript>
      <MusicView pieces={pieces} collections={collections} background={BACKGROUND_IMAGE} />
    </>
  )
}
