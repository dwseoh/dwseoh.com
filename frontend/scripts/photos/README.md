# `npm run photos`

One command takes a photo or video to site-ready: it resizes the file, strips
metadata (GPS included), writes the thumbnail, webp twins and blur placeholder,
and adds the entry to `content/photos.json`. That manifest feeds the home
carousel and `/photos`, so you never edit `messages/*.json` for photos.

Run from `frontend/`. **Put `--` after `npm run photos`**, otherwise npm eats
the flags. `node scripts/photos/index.mjs …` works too.

Needs macOS `sips` (for HEIC) and `ffmpeg` (for video). `sharp` is a devDependency.

## add

```sh
npm run photos -- add ~/Downloads/IMG_1234.HEIC \
  --id hack-the-north-25 --category events --date 2025-09 \
  --caption "Winning Hack the North" --caption-ko "핵 더 노스 우승"
```

- Takes JPG/PNG/HEIC/HEIF/WebP and MP4/MOV, one or more files.
- Images go to `public/images/photos/<id>.jpg` (≤2000px, JPEG q82), plus
  `-thumb.jpg` and `.webp` twins of both.
- Thumbnails are sized by their **short edge: 720px** (long edge capped at 1600px,
  never enlarged), JPEG q85 / WebP q82. /photos crops them into square tiles of
  ~340 CSS px, so 720px keeps every crop sharp on a 2× screen whatever the
  aspect ratio (4:3 → 960×720, 16:9 → 1280×720). Tune `THUMB_EDGE`,
  `THUMB_JPEG` and `THUMB_WEBP` in `lib.mjs`.
- Videos go to `public/videos/<id>.mp4` (H.264, ≤720p, no audio), plus `-poster.jpg`.
- `--id` defaults to a slug of the filename. `--alt` defaults to the caption.
- More flags: `--alt-ko`, `--position "50% 25%"` (crop focus), `--no-carousel`
  (only on `/photos`), `--first` (put at the front), and `--keep-audio`.
- Missing `--caption` or `--category` prompts in a terminal and errors otherwise.
- Your originals are never touched.

## optimize

```sh
npm run photos -- optimize --dry-run   # show what would change
npm run photos -- optimize             # manifest photos
npm run photos -- optimize --blog      # + images used by content/blog/*.md
npm run photos -- optimize --thumbs    # regenerate every thumbnail (after a quality change)
```

- Fills in missing webp twins, thumbs, blur placeholders and dimensions.
- Regenerates thumbs whose size no longer matches `THUMB_EDGE` (so raising it is
  just a re-run), or all of them with `--thumbs`. Thumbs are cut from the
  untouched original in `.photos-backup/` when there is one, so they never
  stack a second round of JPEG loss.
- Strips EXIF/GPS from every served JPEG losslessly, so the pixels don't change.
- Shrinks full images that are over 2000px or 600 KB, or carry an EXIF rotation.
- `--blog` does the same for blog images under their existing names. An opaque
  PNG becomes a `.jpg`, and the post's link is rewritten in the same run.
- Each file is copied to `.photos-backup/` (gitignored) before it is first
  rewritten. Re-running does nothing if nothing changed.

## check

```sh
npm run photos -- check
```

- Exits 1 on **errors**: a missing file, a duplicate id, a bad category, or a
  missing English caption/alt.
- Also **warns** about:
  - a missing Korean caption on a carousel entry
  - files over 800 KB
  - leftover metadata
  - missing webp/blur
  - stale dimensions
  - images in `public/images/photos` that nothing references
