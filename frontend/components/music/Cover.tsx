import type { Collection } from '@/app/music/data'

/**
 * Generated album art: the collection's gradient under grain and a few staff
 * lines, titled in the display serif. An `image` on the collection replaces it.
 */
export default function Cover({
  collection,
  index,
  large,
  small,
}: {
  collection: Collection
  index: number
  large?: boolean
  small?: boolean
}) {
  const { cover, title } = collection
  const size = large ? ' is-large' : small ? ' is-small' : ''
  return (
    <div
      className={`mus-cover${size}`}
      style={{
        background: cover.image
          ? `center / cover no-repeat url("${cover.image}")`
          : `linear-gradient(135deg, ${cover.from}, ${cover.to})`,
      }}
      aria-hidden="true"
    >
      {!cover.image && !small && (
        <>
          <span className="mus-cover-staff" />
          <span className="mus-cover-vol">Vol. {String(index + 1).padStart(2, '0')}</span>
          <span className="mus-cover-title">{title}</span>
        </>
      )}
    </div>
  )
}
