/**
 * `photos add <file...>` — import photos/videos into public/ and the manifest.
 *
 * Images -> public/images/photos/<id>.jpg (+ -thumb.jpg, + .webp twins).
 * Videos -> public/videos/<id>.mp4 (+ -poster.jpg).
 * Originals are only read, never modified or deleted.
 */

import fs from 'node:fs'
import path from 'node:path'
import { createInterface } from 'node:readline/promises'
import {
  CATEGORIES, FULL_MAX, HEIC_EXT, IMAGE_EXT, JPEG, PHOTOS_DIR, encodeThumbJpeg, encodeThumbWebp,
  VIDEOS_DIR, VIDEO_EXT, blurOf, dimsOf, encodeJpeg, encodeWebp, exists, fmtBytes,
  heicToJpeg, readManifest, rel, requireTool, run, sizeOf, slugify, urlOf, writeManifest,
} from './lib.mjs'

const DATE = /^\d{4}(-(0[1-9]|1[0-2]))?$/

export async function add(files, flags) {
  if (files.length === 0) throw new Error('add: give at least one file.')
  if (flags.id && files.length > 1) throw new Error('add: --id only works with a single file.')

  const manifest = readManifest()
  const taken = new Set(manifest.photos.map((p) => p.id))

  // Validate everything up front so a bad file doesn't leave a half-done batch.
  const jobs = files.map((input) => {
    const file = path.resolve(input)
    if (!exists(file)) throw new Error(`add: no such file: ${input}`)
    const kind = VIDEO_EXT.test(file) ? 'video' : IMAGE_EXT.test(file) || HEIC_EXT.test(file) ? 'image' : null
    if (!kind) throw new Error(`add: unsupported file type: ${input} (JPG/PNG/HEIC/HEIF/WebP/MP4/MOV)`)

    const id = flags.id ?? slugify(path.basename(file))
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(id)) throw new Error(`add: invalid id "${id}" (use lowercase-kebab-case).`)
    if (taken.has(id)) throw new Error(`add: id "${id}" is already in the manifest; pass --id.`)
    taken.add(id)

    const outs = kind === 'image' ? imageOutputs(id) : videoOutputs(id)
    const clash = Object.values(outs).find(exists)
    if (clash) throw new Error(`add: ${rel(clash)} already exists; pass a different --id.`)
    return { file, kind, id, outs }
  })

  if (jobs.some((j) => HEIC_EXT.test(j.file))) requireTool('sips')
  if (jobs.some((j) => j.kind === 'video')) requireTool('ffmpeg')

  if (flags.category && !CATEGORIES.includes(flags.category))
    throw new Error(`add: --category must be one of: ${CATEGORIES.join(', ')}`)
  if (flags.date && !DATE.test(flags.date)) throw new Error('add: --date must be YYYY or YYYY-MM.')

  // Fill in the required caption/category: prompt in a terminal, fail otherwise.
  const meta = await resolveMeta(jobs, flags)

  for (const [i, job] of jobs.entries()) {
    const before = sizeOf(job.file)
    const media = job.kind === 'image' ? await addImage(job) : await addVideo(job, flags)
    const { caption, category } = meta[i]
    const entry = {
      id: job.id,
      type: job.kind,
      ...media,
      position: flags.position,
      category,
      date: flags.date,
      caption: { en: caption, ko: flags['caption-ko'] },
      alt: { en: flags.alt ?? caption, ko: flags['alt-ko'] ?? flags['caption-ko'] },
    }

    // Newest first: the batch goes to the front in its given order; --last appends.
    if (flags.last) manifest.photos.push(entry)
    else manifest.photos.splice(i, 0, entry)
    writeManifest(manifest) // per item, so files on disk and manifest never drift

    const after = Object.values(job.outs).map((f) => `${path.basename(f)} ${fmtBytes(sizeOf(f))}`)
    console.log(`+ ${job.id}  ${path.basename(job.file)} ${fmtBytes(before)} -> ${after.join(', ')}`)
  }
  console.log(`\n${jobs.length} added to content/photos.json. Run \`npm run photos check\` to verify.`)
}

const imageOutputs = (id) => ({
  src: path.join(PHOTOS_DIR, `${id}.jpg`),
  thumb: path.join(PHOTOS_DIR, `${id}-thumb.jpg`),
  srcWebp: path.join(PHOTOS_DIR, `${id}.webp`),
  thumbWebp: path.join(PHOTOS_DIR, `${id}-thumb.webp`),
})

const videoOutputs = (id) => ({
  src: path.join(VIDEOS_DIR, `${id}.mp4`),
  poster: path.join(VIDEOS_DIR, `${id}-poster.jpg`),
})

async function addImage({ file, outs }) {
  const input = HEIC_EXT.test(file) ? heicToJpeg(file) : file
  try {
    fs.mkdirSync(PHOTOS_DIR, { recursive: true })
    const full = await encodeJpeg(input, FULL_MAX, JPEG)
    fs.writeFileSync(outs.src, full.data)
    fs.writeFileSync(outs.thumb, (await encodeThumbJpeg(input)).data)
    fs.writeFileSync(outs.srcWebp, (await encodeWebp(input, FULL_MAX)).data)
    fs.writeFileSync(outs.thumbWebp, (await encodeThumbWebp(input)).data)
    return {
      src: urlOf(outs.src),
      thumb: urlOf(outs.thumb),
      srcWebp: urlOf(outs.srcWebp),
      thumbWebp: urlOf(outs.thumbWebp),
      width: full.info.width,
      height: full.info.height,
      blur: await blurOf(outs.thumb),
    }
  } finally {
    if (input !== file) fs.rmSync(path.dirname(input), { recursive: true, force: true })
  }
}

async function addVideo({ file, outs }, flags) {
  fs.mkdirSync(VIDEOS_DIR, { recursive: true })
  // Shorter edge <= 720 (even dims for x264); ffmpeg auto-rotates phone footage.
  const scale =
    "scale='if(gte(iw,ih),-2,trunc(min(720,iw)/2)*2)':'if(gte(iw,ih),trunc(min(720,ih)/2)*2,-2)'"
  const audio = flags['keep-audio'] ? ['-map', '0:a:0?', '-c:a', 'aac', '-b:a', '128k'] : ['-an']
  run('ffmpeg', [
    '-hide_banner', '-loglevel', 'error', '-y', '-i', file,
    '-map', '0:v:0', ...audio, '-vf', scale,
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '23', '-pix_fmt', 'yuv420p',
    '-map_metadata', '-1', // drops GPS/location atoms
    '-movflags', '+faststart', outs.src,
  ])
  // Poster = first frame, piped through sharp like any other image.
  const frame = run('ffmpeg', [
    '-hide_banner', '-loglevel', 'error', '-i', outs.src, '-frames:v', '1', '-f', 'image2pipe', '-c:v', 'png', '-',
  ])
  fs.writeFileSync(outs.poster, (await encodeJpeg(frame, FULL_MAX, JPEG)).data)
  const { width, height } = await dimsOf(outs.poster)
  return { src: urlOf(outs.src), poster: urlOf(outs.poster), width, height, blur: await blurOf(outs.poster) }
}

async function resolveMeta(jobs, flags) {
  const interactive = process.stdin.isTTY && process.stdout.isTTY
  const missing = [!flags.caption && '--caption', !flags.category && '--category'].filter(Boolean)
  if (missing.length && !interactive) throw new Error(`add: missing ${missing.join(' and ')} (not a terminal, so can't prompt).`)

  const rl = missing.length ? createInterface({ input: process.stdin, output: process.stdout }) : null
  try {
    const meta = []
    for (const job of jobs) {
      let caption = flags.caption
      let category = flags.category
      while (!caption) caption = (await rl.question(`Caption for ${path.basename(job.file)}: `)).trim()
      while (!CATEGORIES.includes(category))
        category = (await rl.question(`Category (${CATEGORIES.join('/')}): `)).trim().toLowerCase()
      meta.push({ caption, category })
    }
    return meta
  } finally {
    rl?.close()
  }
}
