'use client'

import { useEffect, useState } from 'react'
import { fetchLike, toggleLike, statsEnabled, formatCount } from '@/lib/stats'
import { HeartIcon } from './Icons'

/**
 * End-of-post like button. Reads this visitor's like state on mount, then
 * toggles optimistically on click (the server is the source of truth and
 * reconciles the count when it responds). Hidden entirely when the stats API
 * is not configured.
 */
export default function LikeButton({
  slug,
  prompt,
  likedLabel,
}: {
  slug: string
  prompt: string
  likedLabel: string
}) {
  const [likes, setLikes] = useState<number | null>(null)
  const [liked, setLiked] = useState(false)
  const [busy, setBusy] = useState(false)
  const [pop, setPop] = useState(false)

  useEffect(() => {
    if (!statsEnabled) return
    let live = true
    fetchLike(slug).then((s) => {
      if (live && s) {
        setLikes(s.likes)
        setLiked(s.liked)
      }
    })
    return () => {
      live = false
    }
  }, [slug])

  if (!statsEnabled) return null

  async function onClick() {
    if (busy) return
    setBusy(true)

    // optimistic flip
    const nextLiked = !liked
    setLiked(nextLiked)
    setLikes((n) => Math.max(0, (n ?? 0) + (nextLiked ? 1 : -1)))
    if (nextLiked) {
      setPop(true)
      setTimeout(() => setPop(false), 450)
    }

    const res = await toggleLike(slug)
    if (res) {
      setLikes(res.likes)
      setLiked(res.liked)
    }
    setBusy(false)
  }

  return (
    <div className="blog-like">
      <span className="blog-like-prompt">{liked ? likedLabel : prompt}</span>
      <button
        type="button"
        onClick={onClick}
        aria-pressed={liked}
        className={`blog-like-btn${liked ? ' is-liked' : ''}${pop ? ' is-pop' : ''}`}
      >
        <HeartIcon size={18} filled={liked} />
        {likes !== null && <span className="blog-like-count">{formatCount(likes)}</span>}
      </button>
    </div>
  )
}
