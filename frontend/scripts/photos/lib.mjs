/**
 * Shared bits for `npm run photos`: paths, size limits, the manifest reader/
 * writer, and the sharp/sips/ffmpeg encoders that add + optimize both use.
 *
 * Everything is written to public/ ahead of time and served statically — there
 * is no runtime image optimization on the site.
 */

import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

// Files get rewritten in place, so sharp's file cache would hand back stale reads.
sharp.cache(false)

export const ROOT = path.resolve(fileURLToPath(new URL('../..', import.meta.url))) // frontend/
export const PUBLIC = path.join(ROOT, 'public')
export const PHOTOS_DIR = path.join(PUBLIC, 'images', 'photos')
export const VIDEOS_DIR = path.join(PUBLIC, 'videos')
export const BLOG_IMAGES_DIR = path.join(PUBLIC, 'images', 'blog')
export const BLOG_DIR = path.join(ROOT, 'content', 'blog')
export const MANIFEST = path.join(ROOT, 'content', 'photos.json')
export const BACKUP_DIR = path.join(ROOT, '.photos-backup') // gitignored

export const CATEGORIES = ['photography', 'events']

export const FULL_MAX = 2000 // px, longest edge of the full image
// Thumbnails feed square, cropped grid tiles: a /photos 3-column tile is ~340
// CSS px, so ~680 device px on a 2x screen. Sizing by the SHORT edge keeps the
// crop sharp for any aspect ratio (a 4:3 photo -> 960x720, a 16:9 -> 1280x720);
// the long-edge cap only stops extreme panoramas from ballooning.
export const THUMB_EDGE = 720 // px, short edge
export const THUMB_LONG_MAX = 1600 // px, long-edge cap
export const BLUR_WIDTH = 16 // px, the placeholder is stretched + blurred by CSS
export const REENCODE_BYTES = 600 * 1024 // optimize re-encodes full images above this
export const WARN_BYTES = 800 * 1024 // check warns about images above this
export const WARN_VIDEO_BYTES = 5 * 1024 * 1024

export const JPEG = { quality: 82, mozjpeg: true }
export const THUMB_JPEG = { quality: 85, mozjpeg: true }
export const WEBP = { quality: 80 }
export const THUMB_WEBP = { quality: 82 }

export const IMAGE_EXT = /\.(jpe?g|png|webp)$/i
export const HEIC_EXT = /\.(heic|heif)$/i
export const VIDEO_EXT = /\.(mp4|mov)$/i

// ---------------------------------------------------------------- manifest

// Same key order as PhotoEntry in lib/photos.ts, so diffs stay tidy.
const KEY_ORDER = [
  'id', 'type', 'src', 'thumb', 'srcWebp', 'thumbWebp', 'poster', 'width', 'height',
  'blur', 'position', 'category', 'date', 'caption', 'alt', 'carousel',
]

export function readManifest() {
  return JSON.parse(fs.readFileSync(MANIFEST, 'utf8'))
}

/** Pretty-printed, 2 spaces, trailing newline; Korean stays unescaped. */
export function writeManifest(manifest) {
  const photos = manifest.photos.map((entry) => {
    const ordered = {}
    for (const key of KEY_ORDER) if (entry[key] !== undefined) ordered[key] = entry[key]
    for (const key of Object.keys(entry)) if (!(key in ordered)) ordered[key] = entry[key]
    return ordered
  })
  fs.writeFileSync(MANIFEST, JSON.stringify({ ...manifest, photos }, null, 2) + '\n')
}

// ---------------------------------------------------------------- paths + files

/** "/images/photos/foo.jpg" -> absolute path under public/. */
export const fileOf = (url) => path.join(PUBLIC, decodeURI(url))
/** Absolute path under public/ -> "/images/photos/foo.jpg". */
export const urlOf = (file) => '/' + path.relative(PUBLIC, file).split(path.sep).join('/')

/** Same convention as PhotoStrip's thumbOf(): foo.jpg -> foo-thumb.jpg. */
export const thumbOf = (src) => src.replace(/(\.[^./]+)$/, '-thumb$1')
export const withExt = (src, ext) => src.replace(/\.[^./]+$/, ext)

export const exists = (file) => fs.existsSync(file)
export const sizeOf = (file) => fs.statSync(file).size

/**
 * An output is fresh when it isn't older than its source. The 2s slack keeps a
 * fresh git checkout (which stamps files in arbitrary order) from triggering a
 * full regeneration.
 */
export function isFresh(output, source) {
  if (!exists(output)) return false
  return fs.statSync(output).mtimeMs >= fs.statSync(source).mtimeMs - 2000
}

/** Copies `file` into .photos-backup/ (mirroring its path) unless already there. */
export function backup(file, { move = false } = {}) {
  const dest = path.join(BACKUP_DIR, path.relative(ROOT, file))
  if (!exists(dest)) {
    fs.mkdirSync(path.dirname(dest), { recursive: true })
    fs.copyFileSync(file, dest)
  }
  if (move) fs.rmSync(file)
  return dest
}


export function slugify(name) {
  return name
    .replace(/\.[^.]+$/, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/** 1536000 -> "1.5 MB", 82000 -> "80 KB". */
export function fmtBytes(n) {
  if (n >= 1024 * 1024) return `${(n / 1024 / 1024).toFixed(1)} MB`
  return `${Math.round(n / 1024)} KB`
}

export const rel = (file) => path.relative(ROOT, file)

/** Recursively lists files under `dir` (empty if it doesn't exist). */
export function walk(dir) {
  if (!exists(dir)) return []
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((d) => {
    const full = path.join(dir, d.name)
    return d.isDirectory() ? walk(full) : d.name === '.DS_Store' ? [] : [full]
  })
}

// ---------------------------------------------------------------- external tools

export function requireTool(name) {
  const found = spawnSync('which', [name], { encoding: 'utf8' }).status === 0
  if (!found) {
    const hint = name === 'sips' ? 'sips ships with macOS' : `install it, e.g. \`brew install ${name}\``
    throw new Error(`\`${name}\` not found on PATH (${hint}).`)
  }
}

export function run(cmd, args, opts = {}) {
  const res = spawnSync(cmd, args, { maxBuffer: 256 * 1024 * 1024, ...opts })
  if (res.status !== 0) {
    const err = (res.stderr ?? '').toString().trim().split('\n').slice(-5).join('\n')
    throw new Error(`${cmd} failed:\n${err}`)
  }
  return res.stdout
}

/** sharp's prebuilt libvips can't decode HEIC, so convert with sips first. */
export function heicToJpeg(file) {
  requireTool('sips')
  const tmp = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'photos-')), 'in.jpg')
  run('sips', ['-s', 'format', 'jpeg', '-s', 'formatOptions', '100', file, '--out', tmp])
  return tmp
}

// ---------------------------------------------------------------- encoders

/**
 * Auto-rotated (EXIF), downscaled-only, metadata-stripped pipeline. sharp drops
 * all metadata (incl. GPS) unless asked to keep it, and converts to sRGB.
 */
const pipeline = (input, max) =>
  sharp(input).rotate().resize({ width: max, height: max, fit: 'inside', withoutEnlargement: true })

export async function encodeJpeg(input, max, opts = JPEG) {
  return pipeline(input, max)
    .flatten({ background: '#ffffff' }) // PNG transparency -> white, not black
    .jpeg(opts)
    .toBuffer({ resolveWithObject: true })
}

export async function encodeWebp(input, max) {
  return pipeline(input, max).webp(WEBP).toBuffer({ resolveWithObject: true })
}

/** Thumbnail size for a source of display size `dims` (never enlarges). */
export function thumbSize({ width, height }) {
  const scale = Math.min(1, THUMB_EDGE / Math.min(width, height), THUMB_LONG_MAX / Math.max(width, height))
  return { width: Math.round(width * scale), height: Math.round(height * scale) }
}

/** Thumbnail JPEG / WebP, sized by thumbSize(). */
export async function encodeThumbJpeg(input) {
  const { width } = thumbSize(await dimsOf(input))
  return sharp(input).rotate().resize({ width }).flatten({ background: '#ffffff' }).jpeg(THUMB_JPEG)
    .toBuffer({ resolveWithObject: true })
}
export async function encodeThumbWebp(input) {
  const { width } = thumbSize(await dimsOf(input))
  return sharp(input).rotate().resize({ width }).webp(THUMB_WEBP).toBuffer({ resolveWithObject: true })
}

/**
 * Best source for derivatives: the untouched original in .photos-backup/ when
 * there is one (so thumbs aren't cut from an already re-encoded file), else the
 * served file. A backup whose aspect ratio no longer matches is ignored — the
 * served file was replaced since.
 */
export async function pristineOf(file) {
  const saved = path.join(BACKUP_DIR, path.relative(ROOT, file))
  if (!exists(saved)) return file
  const [a, b] = [await dimsOf(saved), await dimsOf(file)]
  return Math.abs(a.width / a.height - b.width / b.height) < 0.01 ? saved : file
}

/** Re-encode keeping the source's own format (used for blog images). */
export async function encodeSameFormat(input, max) {
  const { format } = await sharp(input).metadata()
  const p = pipeline(input, max)
  if (format === 'png') return p.png({ compressionLevel: 9, adaptiveFiltering: true }).toBuffer({ resolveWithObject: true })
  if (format === 'webp') return p.webp(WEBP).toBuffer({ resolveWithObject: true })
  return p.flatten({ background: '#ffffff' }).jpeg(JPEG).toBuffer({ resolveWithObject: true })
}

/** ~16px-wide webp as a base64 data URI, for the loading placeholder. */
export async function blurOf(input) {
  const buf = await sharp(input).rotate().resize({ width: BLUR_WIDTH }).webp({ quality: 40 }).toBuffer()
  return `data:image/webp;base64,${buf.toString('base64')}`
}

/**
 * Lossless metadata strip for files that are already web-sized: drops the JPEG
 * segments that hold EXIF/XMP (APP1, incl. GPS), IPTC (APP13) and comments,
 * leaving the compressed pixels and the ICC profile untouched. Returns null if
 * there was nothing to drop. Don't use it on rotated files (orientation > 1) —
 * the rotation lives in the EXIF being removed.
 */
export function stripJpegMetadata(buf) {
  if (buf[0] !== 0xff || buf[1] !== 0xd8) return null
  const keep = [buf.subarray(0, 2)]
  let dropped = false
  let i = 2
  while (i < buf.length) {
    if (buf[i] !== 0xff) return null // not a marker: bail rather than guess
    const marker = buf[i + 1]
    if (marker === 0xff) { i++; continue } // fill byte
    if (marker === 0xda) { keep.push(buf.subarray(i)); break } // start of scan: image data follows
    const end = i + 2 + buf.readUInt16BE(i + 2)
    if (marker === 0xe1 || marker === 0xed || marker === 0xfe) dropped = true
    else keep.push(buf.subarray(i, end))
    i = end
  }
  return dropped ? Buffer.concat(keep) : null
}

/** True when the file carries EXIF/XMP/IPTC (which may include GPS). */
export async function hasMetadata(input) {
  const { exif, xmp, iptc } = await sharp(input).metadata()
  return Boolean(exif || xmp || iptc)
}

export const isRotated = async (input) => ((await sharp(input).metadata()).orientation ?? 1) > 1

/** Display size, i.e. after EXIF rotation. */
export async function dimsOf(input) {
  const { width, height, orientation } = await sharp(input).metadata()
  return orientation >= 5 ? { width: height, height: width } : { width, height }
}

export const longestEdge = ({ width, height }) => Math.max(width, height)
