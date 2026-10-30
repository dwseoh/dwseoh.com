/**
 * `photos optimize [--blog] [--dry-run]` — bring existing files up to spec.
 *
 * Idempotent: derivatives are only regenerated when missing or older than their
 * source, and a full image is only rewritten when that saves >= 10% (or it must
 * shrink/rotate), so repeated runs don't stack JPEG loss. Every file is copied
 * to .photos-backup/ before its first rewrite.
 */

import fs from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'
import {
  BLOG_DIR, BLOG_IMAGES_DIR, FULL_MAX, JPEG, PHOTOS_DIR, REENCODE_BYTES, THUMB_JPEG, THUMB_MAX,
  backup, blurOf, dimsOf, encodeJpeg, encodeSameFormat, encodeWebp, exists, fileOf, fmtBytes,
  isFresh, isRotated, longestEdge, readManifest, rel, sizeOf, stripJpegMetadata, thumbOf,
  urlOf, walk, withExt, writeManifest,
} from './lib.mjs'

// A re-encode must save at least this much, or it's just generational loss.
const MIN_SAVING = 0.9

export async function optimize({ blog = false, dryRun = false }) {
  const say = (msg) => console.log(dryRun ? `[dry-run] ${msg}` : msg)
  const manifest = readManifest()
  let changed = false

  await scrubMetadata(say, dryRun)

  for (const entry of manifest.photos) {
    const src = fileOf(entry.src)
    if (!exists(src)) {
      console.warn(`! ${entry.id}: ${entry.src} is missing; skipped (see \`photos check\`).`)
      continue
    }
    const updates = entry.type === 'video'
      ? await optimizeVideo(entry, say)
      : await optimizeImage(entry, src, say, dryRun)
    for (const [key, value] of Object.entries(updates)) {
      if (entry[key] === value) continue
      if (key === 'width' || key === 'height') say(`  ${entry.id}: ${key} ${entry[key]} -> ${value}`)
      entry[key] = value
      changed = true
    }
  }

  if (changed && !dryRun) writeManifest(manifest)
  say(changed ? `manifest ${dryRun ? 'would be ' : ''}updated.` : 'manifest already up to date.')

  if (blog) await optimizeBlog(manifest, say, dryRun)
}

async function optimizeImage(entry, src, say, dryRun) {
  const updates = {}
  let srcChanged = false

  // 1. Full image: shrink oversized/rotated files in place, with a backup.
  const dims = await dimsOf(src)
  const before = sizeOf(src)
  const mustEncode = longestEdge(dims) > FULL_MAX || (await isRotated(src))
  if (mustEncode || before > REENCODE_BYTES) {
    const out = await encodeJpeg(src, FULL_MAX, JPEG)
    if (mustEncode || out.data.length < before * MIN_SAVING) {
      say(`~ ${rel(src)}  ${dims.width}x${dims.height} ${fmtBytes(before)} -> ${out.info.width}x${out.info.height} ${fmtBytes(out.data.length)}`)
      if (!dryRun) {
        backup(src)
        fs.writeFileSync(src, out.data)
      }
      srcChanged = true
      updates.width = out.info.width
      updates.height = out.info.height
    }
  }
  if (!srcChanged) Object.assign(updates, dims)

  // 2. Derivatives, each regenerated only when missing or stale. In a dry run
  //    a pending re-encode makes them all stale.
  const thumbUrl = entry.thumb ?? thumbOf(entry.src)
  const targets = [
    ['thumb', thumbUrl, (s) => encodeJpeg(s, THUMB_MAX, THUMB_JPEG)],
    ['srcWebp', withExt(entry.src, '.webp'), (s) => encodeWebp(s, FULL_MAX)],
    ['thumbWebp', withExt(thumbUrl, '.webp'), (s) => encodeWebp(s, THUMB_MAX)],
  ]
  let thumbChanged = false
  for (const [key, url, encode] of targets) {
    const file = fileOf(url)
    if (srcChanged || !isFresh(file, src)) {
      const { data } = await encode(src)
      say(`+ ${rel(file)}  ${fmtBytes(data.length)}`)
      if (!dryRun) fs.writeFileSync(file, data)
      if (key === 'thumb') thumbChanged = true
    }
    updates[key] = url
  }

  // 3. Blur placeholder, from the thumbnail so it matches what loads in.
  if (!entry.blur || thumbChanged) {
    updates.blur = dryRun && !exists(fileOf(thumbUrl)) ? entry.blur : await blurOf(fileOf(thumbUrl))
    if (!entry.blur) say(`+ ${entry.id}: blur`)
  }
  return updates
}

async function optimizeVideo(entry, say) {
  // Videos are encoded once by `add`; here we only backfill poster-derived fields.
  if (!entry.poster || !exists(fileOf(entry.poster))) return {}
  const poster = fileOf(entry.poster)
  const updates = await dimsOf(poster)
  if (!entry.blur) {
    updates.blur = await blurOf(poster)
    say(`+ ${entry.id}: blur`)
  }
  return updates
}

// ---------------------------------------------------------------- metadata

/**
 * Phone photos carry GPS in their EXIF. Strip it losslessly from every JPEG we
 * serve (pixels untouched, so the file keeps its mtime and derivatives stay
 * fresh). Rotated files are skipped here: the re-encode below bakes the
 * rotation in, which drops the metadata too.
 */
async function scrubMetadata(say, dryRun) {
  for (const file of [...walk(PHOTOS_DIR), ...walk(BLOG_IMAGES_DIR)]) {
    if (!/\.jpe?g$/i.test(file) || (await isRotated(file))) continue
    const stripped = stripJpegMetadata(fs.readFileSync(file))
    if (!stripped) continue
    say(`- ${rel(file)}  metadata stripped (lossless)`)
    if (dryRun) continue
    const { atime, mtime } = fs.statSync(file)
    backup(file)
    fs.writeFileSync(file, stripped)
    fs.utimesSync(file, atime, mtime)
  }
}

// ---------------------------------------------------------------- --blog

/** Every "/images/..." path in a blog post, frontmatter included. */
const REF = /\/images\/[^\s)"'`\]]+\.(?:jpe?g|png|webp)/gi

async function optimizeBlog(manifest, say, dryRun) {
  const posts = walk(BLOG_DIR).filter((f) => f.endsWith('.md'))
  const refs = new Map() // url -> posts referencing it
  for (const post of posts) {
    for (const url of fs.readFileSync(post, 'utf8').match(REF) ?? []) {
      refs.set(url, [...new Set([...(refs.get(url) ?? []), post])])
    }
  }

  // Manifest files are handled above; skip them here.
  const owned = new Set(manifest.photos.flatMap((p) => [p.src, p.thumb, p.srcWebp, p.thumbWebp, p.poster]))
  const urls = new Set([...refs.keys(), ...walk(BLOG_IMAGES_DIR).map(urlOf)])

  console.log('\nblog images:')
  let touched = 0
  for (const url of [...urls].sort()) {
    if (owned.has(url)) continue
    const file = fileOf(url)
    if (!exists(file)) {
      console.warn(`! ${url} is referenced by ${refs.get(url).map(rel).join(', ')} but missing.`)
      continue
    }
    if (!/\.(jpe?g|png|webp)$/i.test(file)) continue
    if (!file.startsWith(PHOTOS_DIR) && !file.startsWith(BLOG_IMAGES_DIR)) continue

    const dims = await dimsOf(file)
    const before = sizeOf(file)
    const mustEncode = longestEdge(dims) > FULL_MAX || (await isRotated(file))
    if (!mustEncode && before <= REENCODE_BYTES) continue

    // Opaque PNGs (screenshots, film stills) become JPEG, but only when a post
    // references them so the link can be rewritten in the same run.
    const isPng = /\.png$/i.test(file)
    const jpgUrl = withExt(url, '.jpg')
    const toJpeg = isPng && refs.has(url) && !exists(fileOf(jpgUrl)) && (await sharp(file).stats()).isOpaque

    const out = toJpeg ? await encodeJpeg(file, FULL_MAX, JPEG) : await encodeSameFormat(file, FULL_MAX)
    if (!mustEncode && out.data.length >= before * MIN_SAVING) continue

    const target = toJpeg ? fileOf(jpgUrl) : file
    const sizes = `${dims.width}x${dims.height} ${fmtBytes(before)} -> ${out.info.width}x${out.info.height} ${fmtBytes(out.data.length)}`
    say(`~ ${rel(file)}${toJpeg ? ` -> ${path.basename(target)}` : ''}  ${sizes}`)
    touched++
    if (dryRun) {
      if (toJpeg) for (const post of refs.get(url)) say(`  ${rel(post)}: ${url} -> ${jpgUrl}`)
      continue
    }

    fs.writeFileSync(target + '.tmp', out.data)
    backup(file, { move: toJpeg }) // the PNG original lives on in .photos-backup/
    fs.renameSync(target + '.tmp', target)
    if (toJpeg) {
      for (const post of refs.get(url)) {
        fs.writeFileSync(post, fs.readFileSync(post, 'utf8').replaceAll(url, jpgUrl))
        say(`  ${rel(post)}: ${url} -> ${jpgUrl}`)
      }
    }
  }
  if (touched === 0) say('  nothing to do.')
}
