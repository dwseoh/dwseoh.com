#!/usr/bin/env node
/**
 * `npm run photos -- <command>` — takes any photo to site-ready.
 * Fully flag-driven so it can run non-interactively; see README.md.
 */

import { parseArgs } from 'node:util'
import { add } from './add.mjs'
import { check } from './check.mjs'
import { optimize } from './optimize.mjs'

const USAGE = `usage: npm run photos -- <command> [flags]

  add <file...>   import JPG/PNG/HEIC/HEIF/WebP or MP4/MOV
      --id <slug>  --category photography|events|hobbies  --date YYYY[-MM]
      --caption <en>  --caption-ko <ko>  --alt <en>  --alt-ko <ko>
      --position "50% 25%"  --last  --keep-audio
  optimize        backfill webp twins, thumbs, blur, dimensions; shrink big files
      --blog  --dry-run  --thumbs (regenerate every thumbnail)
  check           report problems (exit 1 on errors)

Note the \`--\` after \`npm run photos\`: without it npm eats the flags.`

const options = {
  id: { type: 'string' },
  category: { type: 'string' },
  date: { type: 'string' },
  caption: { type: 'string' },
  'caption-ko': { type: 'string' },
  alt: { type: 'string' },
  'alt-ko': { type: 'string' },
  position: { type: 'string' },
  last: { type: 'boolean' },
  'keep-audio': { type: 'boolean' },
  blog: { type: 'boolean' },
  'dry-run': { type: 'boolean' },
  thumbs: { type: 'boolean' },
  help: { type: 'boolean', short: 'h' },
}

/**
 * `npm run photos add x --id y` (no `--`) makes npm swallow the flags into
 * npm_config_* env vars and pass "y" on as a file. Catch that instead of
 * importing a file called "y".
 */
function npmAteFlags(values) {
  return Object.keys(options).filter((name) => {
    const env = `npm_config_${name.replaceAll('-', '_')}`
    return env in process.env && values[name] === undefined
  })
}

async function main() {
  const { values, positionals } = parseArgs({ options, allowPositionals: true })
  const [command, ...rest] = positionals

  const eaten = npmAteFlags(values)
  if (eaten.length) {
    throw new Error(
      `npm swallowed ${eaten.map((n) => `--${n}`).join(', ')}. Put \`--\` before the command: npm run photos -- ${command ?? '<command>'} ...`,
    )
  }

  if (values.help || !command) return console.log(USAGE)
  if (command === 'add') return add(rest, values)
  if (command === 'optimize') return optimize({ blog: values.blog, dryRun: values['dry-run'], thumbs: values.thumbs })
  if (command === 'check') return check()
  throw new Error(`unknown command "${command}"\n\n${USAGE}`)
}

main().catch((err) => {
  console.error(`photos: ${err.message}`)
  process.exit(1)
})
