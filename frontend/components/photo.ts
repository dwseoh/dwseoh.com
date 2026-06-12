export interface Photo {
  src: string
  alt: string
  caption?: string
  /** Optional override; otherwise inferred from the file extension. */
  type?: 'image' | 'video'
}

/** GIF/PNG/JPG/WebP render as <img>; MP4/WebM/MOV/OGG render as <video>. */
export function isVideo(photo: Photo): boolean {
  if (photo.type) return photo.type === 'video'
  return /\.(mp4|webm|mov|ogg)(\?.*)?$/i.test(photo.src)
}
