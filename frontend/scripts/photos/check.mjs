/**
 * `photos check` — lint the manifest and public/images/photos.
 * Errors break the site (missing files, bad data) and exit 1; warnings are
 * things worth fixing (size, missing Korean, orphans) and don't fail.
 */

import fs from 'node:fs'
import path from 'node:path'
import {
  BLOG_IMAGES_DIR, CATEGORIES, PHOTOS_DIR, ROOT, VIDEOS_DIR, WARN_BYTES, WARN_VIDEO_BYTES,
  dimsOf, exists, fileOf, fmtBytes, hasMetadata, readManifest, sizeOf, urlOf, walk,
} from './lib.mjs'

// Source that can reference image files directly (e.g. the headshot, blog posts).
const SOURCE_DIRS = ['app', 'components', 'lib', 'messages', 'content', 'i18n']
const SOURCE_EXT = /\.(tsx?|mjs|jsx?|json|md|css)$/

export async function check() {
  const errors = []
  const warnings = []
  const { photos } = readManifest()

  const seen = new Set()
  const referenced = new Set()
  for (const p of photos) {
    const at = p.id ?? '(no id)'
    if (seen.has(p.id)) errors.push(`${at}: duplicate id`)
    seen.add(p.id)

    if (!CATEGORIES.includes(p.category)) errors.push(`${at}: invalid category "${p.category}"`)
    if (!p.caption?.en) errors.push(`${at}: missing caption.en`)
    if (!p.alt?.en) errors.push(`${at}: missing alt.en`)
    if (p.carousel && !p.caption?.ko) warnings.push(`${at}: carousel entry has no caption.ko (falls back to English)`)
    if (p.date && !/^\d{4}(-\d{2})?$/.test(p.date)) warnings.push(`${at}: date "${p.date}" isn't YYYY or YYYY-MM`)

    for (const key of ['src', 'thumb', 'srcWebp', 'thumbWebp', 'poster']) {
      if (!p[key]) continue
      referenced.add(p[key])
      if (!exists(fileOf(p[key]))) errors.push(`${at}: ${key} ${p[key]} is missing`)
    }
    if (p.type === 'video' && !p.poster) warnings.push(`${at}: video has no poster`)
    if (p.type === 'image' && (!p.srcWebp || !p.thumbWebp)) warnings.push(`${at}: no webp twin (run \`photos optimize\`)`)
    if (!p.blur) warnings.push(`${at}: no blur placeholder (run \`photos optimize\`)`)

    // Stale dimensions cause layout shift on the /photos grid.
    const dimsFrom = p.type === 'video' ? p.poster : p.src
    if (dimsFrom && exists(fileOf(dimsFrom))) {
      const { width, height } = await dimsOf(fileOf(dimsFrom))
      if (width !== p.width || height !== p.height)
        warnings.push(`${at}: manifest says ${p.width}x${p.height}, file is ${width}x${height}`)
    }
  }

  // Oversized files, anywhere we serve photos/videos from.
  for (const file of [...walk(PHOTOS_DIR), ...walk(BLOG_IMAGES_DIR), ...walk(VIDEOS_DIR)]) {
    const limit = /\.(mp4|mov|webm)$/i.test(file) ? WARN_VIDEO_BYTES : WARN_BYTES
    if (sizeOf(file) > limit) warnings.push(`${urlOf(file)} is ${fmtBytes(sizeOf(file))} (> ${fmtBytes(limit)})`)
    if (/\.(jpe?g|png|webp)$/i.test(file) && (await hasMetadata(file)))
      warnings.push(`${urlOf(file)} still has EXIF/XMP metadata, possibly GPS (run \`photos optimize\`)`)
  }

  // Orphans: files in images/photos nothing points at.
  const text = SOURCE_DIRS.flatMap((d) => walk(path.join(ROOT, d)))
    .filter((f) => SOURCE_EXT.test(f) && !f.endsWith(path.join('content', 'photos.json')))
    .map((f) => fs.readFileSync(f, 'utf8'))
    .join('\n')
  for (const file of walk(PHOTOS_DIR)) {
    const url = urlOf(file)
    if (!referenced.has(url) && !text.includes(url)) warnings.push(`${url} is not referenced by anything`)
  }

  for (const w of warnings) console.log(`warn   ${w}`)
  for (const e of errors) console.log(`error  ${e}`)
  console.log(
    `\n${photos.length} entries · ${errors.length} error${errors.length === 1 ? '' : 's'} · ` +
      `${warnings.length} warning${warnings.length === 1 ? '' : 's'}`,
  )
  if (errors.length) process.exitCode = 1
}
