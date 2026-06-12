export interface Photo {
  src: string
  alt: string
  caption?: string
  /** Optional override; otherwise inferred from the file extension. */
  type?: 'image' | 'video'
  /** Poster image shown for videos before they load. */
  poster?: string
  /** CSS object-position for the cropped strip tile, e.g. "center", "top",
   *  "50% 20%". Handy for vertical images so the subject isn't cut off. */
  position?: string
}

/** GIF/PNG/JPG/WebP render as <img>; MP4/WebM/MOV/OGG render as <video>. */
export function isVideo(photo: Photo): boolean {
  if (photo.type) return photo.type === 'video'
  return /\.(mp4|webm|mov|ogg)(\?.*)?$/i.test(photo.src)
}
