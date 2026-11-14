/**
 * Everything on the Music Work page (/music) comes from this file.
 *
 * The compositions are real. Performances and arrangements are still
 * placeholders (arrangement titles from the old /music prototype; every year,
 * running time, line-up, description and media link made up) and hidden for
 * now: see `pieces` at the bottom.
 *
 * - `categories`: which sections list it. A piece can be in several — e.g. a
 *   composition I also performed is ['composition', 'performance'].
 * - `featured`: pins the piece to the top of its section.
 * - `description`: a blank line starts a new paragraph; [text](url) is a link.
 * - `audio`: an MP3 in public/audio/ (e.g. '/audio/ponyo.mp3'). Without it the
 *   play button shows "Recording coming soon".
 * - `video`: a YouTube URL/id (`t=` and `end=` times, in seconds, are kept), or a self-hosted
 *   '/videos/x.mp4'. Anything else (e.g. an Instagram reel) goes in `links`.
 * - `score`: a MuseScore (or any) URL for the full score.
 * - `cover`: an image in public/images/music/. Pieces use their collection's
 *   cover unless they have their own; with neither, one is generated.
 */

export type Category = 'composition' | 'performance' | 'arrangement'

export interface Credit {
  /** A noun, shown as a small label: "Composer", "Conductor", "Clarinet". */
  role: string
  name: string
}

export interface Collection {
  id: string
  title: string
  /** Two colours for the generated covers and the page's ambient light. */
  palette: [string, string]
  /** Default genre for its pieces. */
  genre: string
  /** Album art for its pieces, e.g. '/images/music/sketches-1-0.jpg'. */
  cover?: string
}

export interface Piece {
  slug: string
  title: string
  categories: Category[]
  collection: string
  year: number
  /** Running time, "m:ss". Shown until the recording loads. */
  duration?: string
  /** Ensemble type ("Wind Quintet"). Shown as the instrumentation if none is given. */
  ensemble: string
  /** Overrides the collection's genre. */
  genre?: string
  /** Original composer. Compositions are credited to ME automatically. */
  composer?: string
  /** Where the music comes from: a film, game, album or show. */
  source?: string
  /** Arrangements default to ME. */
  arranger?: string
  /** Performances: what I did ("Conductor", "Clarinet"). */
  role?: string
  /** Performances: who played ("IRHS Wind Ensemble"). */
  performers?: string
  venue?: string
  key?: string
  /** Plain text, e.g. 'Flute, Clarinet in B♭, Piano'. Falls back to `ensemble`. */
  instrumentation?: string
  /** Overrides the credits worked out from `composer`; `arranger` is still added. */
  credits?: Credit[]
  description: string
  /** For medleys: the pieces inside, in order. */
  contents?: string[]
  premiere?: string
  featured?: boolean
  audio?: string
  video?: string
  score?: string
  cover?: string
  links?: { label: string; href: string }[]
}

export const ME = 'Jamie Seoh'

export type SectionKey = 'all' | Category

/**
 * The page's tabs; the first is where it opens. For now only compositions are
 * shown (see `pieces` below). To bring the rest back, restore these lines.
 */
export const sections: { key: SectionKey; label: string }[] = [
  // { key: 'all', label: 'All' },
  { key: 'composition', label: 'Compositions' },
  // { key: 'performance', label: 'Performances' },
  // { key: 'arrangement', label: 'Arrangements' },
]

/** The page's name. 'Music Work' once performances and arrangements are back. */
export const PAGE_TITLE = 'Composition Work'

export const categoryLabel: Record<Category, string> = {
  composition: 'Composition',
  performance: 'Performance',
  arrangement: 'Arrangement',
}

// Placeholders: a synthesized demo clip and the site's conducting video.
/** Trial: the /music prototype's photo, blurred and darkened behind the page. Set to undefined to drop it. */
export const BACKGROUND_IMAGE: string | undefined = '/videos/orchestra-conducting-poster.jpg'

const DEMO_AUDIO = '/audio/placeholder.mp3'
const DEMO_VIDEO = '/videos/orchestra-conducting.mp4'
const DEMO_SCORE = 'https://musescore.com/'

export const collections: Collection[] = [
  {
    id: 'sketches-1-0',
    title: 'Sketches 1.0',
    palette: ['#24211e', '#c4b8a6'],
    genre: 'Chamber',
    cover: '/images/music/sketches-1-0.jpg',
  },
  {
    id: 'hot-summer-night',
    title: 'Hot Summer Night',
    palette: ['#321a13', '#d6a07c'],
    genre: 'Piano',
    cover: '/images/music/hot-summer-night.jpg',
  },
  {
    id: 'hack-the-north',
    title: 'Hack the North',
    palette: ['#1b1f29', '#a3b1c6'],
    genre: 'Jazz',
    cover: '/images/music/hack-the-north.png',
  },
  { id: 'season-23-24', title: '2023–24 Season', palette: ['#1a2030', '#94a4c0'], genre: 'Classical' },
  { id: 'season-24-25', title: '2024–25 Season', palette: ['#2a1c22', '#bf9ca6'], genre: 'Classical' },
  { id: 'screen-and-game', title: 'Screen & Game', palette: ['#1e2229', '#a9b2bf'], genre: 'Film & game' },
  { id: 'winter-light', title: 'Winter Light', palette: ['#33161a', '#d4a66c'], genre: 'Holiday' },
  {
    id: 'covers-and-standards',
    title: 'Covers & Standards',
    palette: ['#36200f', '#d9a476'],
    genre: 'Pop & standards',
  },
  { id: 'small-rooms', title: 'Small Rooms', palette: ['#2a2118', '#c2a582'], genre: 'Chamber' },
]

/** Every piece, including the ones not shown yet. */
export const catalogue: Piece[] = [
  // ── Compositions ─────────────────────────────────────────────────────────────
  {
    slug: 'the-first-train-ride',
    title: 'The First Train Ride',
    categories: ['composition'],
    collection: 'hot-summer-night',
    year: 2026,
    duration: '1:31',
    ensemble: 'Piano Duet',
    genre: 'Piano Duet',
    key: 'A major',
    instrumentation: 'Grand Piano, Upright Piano',
    description: [
      'The First Train Ride captures the excitement, curiosity, and youthful wonder of experiencing a train ride for the first time. The piece opens with the sound of a railway crossing bell, transcribed from an actual crossing in Kamakura, Japan. This familiar sound evokes a nostalgic childhood memory, transporting the listener to a train journey through a snowy landscape.',
      'The music unfolds with a cheerful, playful energy, imagining a child sitting beside their mother, gazing out the window as the scenery rushes past. The recurring rhythmic patterns reflect the steady motion of the train, while lively melodies and syncopated rhythms convey the child’s curiosity and excitement.',
      'The piece explores harmony primarily through quintal chords and their inversions, which form the foundation of both the accompaniment and harmonic movement. A recurring pattern (which is also built with intervals of fifths) establishes a sense of continuity, while gradually introduced melodic and textural layers bring variation and growing energy to the music. The interplay between the two pianos creates contrasting textures and syncopated rhythmic movement, before the piece settles into a light, consonant ending, bringing the journey to a gentle close.',
    ].join('\n\n'),
    featured: true,
    audio: '/audio/the-first-train-ride.mp3',
    score: 'https://musescore.com/user/41985992/scores/39928604',
  },
  {
    slug: 'black-keys',
    title: 'Black Keys',
    categories: ['composition'],
    collection: 'sketches-1-0',
    year: 2026,
    duration: '1:37',
    ensemble: 'Piano Solo',
    genre: 'Piano',
    key: 'G♭ major',
    instrumentation: 'Piano',
    description:
      'Black Keys was inspired by the G♭ pentatonic scale being composed of the black keys on a piano (G♭, A♭, B♭, D♭, E♭). From that foundation, I built out the piece’s melody only using those notes. I intended the piece to be a moderately paced, playful piano piece with a steady alternating bass-and-chord accompaniment. Throughout the piece, the music shifts between G♭ major pentatonic and F major pentatonic (F, G, A, C, D), which uses only white keys. These contrasting passages suggest a friendly rivalry between the black and white keys, each bringing the other’s distinctive character into sharper focus. At the end, a playful passage in 6/4 followed by 3/4 introduces an unexpected interruption of G♭ major pentatonic by C major pentatonic, adding a final touch of rhythmic and tonal surprise.',
    audio: '/audio/black-keys.mp3',
    score: 'https://musescore.com/user/41985992/scores/39264824',
  },
  {
    slug: 'museum-theme',
    title: 'Museum Theme',
    categories: ['composition'],
    collection: 'hack-the-north',
    year: 2026,
    duration: '1:28',
    ensemble: 'Quartet',
    source: 'Hack the North',
    genre: 'Jazz',
    key: 'B♭ major',
    instrumentation: 'Upright Piano, Upright Piano, Contrabass, Drum Set',
    description:
      'Written for [Hack the North’s Museum](https://museum.hackthenorth.com/) website, which showcases past hackathon finalists. The piece gave me an opportunity to experiment with instrumentation and mastering, shaping a sound that would accompany visitors as they explore the projects and stories on display.',
    audio: '/audio/museum-theme.mp3',
    score: 'https://musescore.com/user/41985992/scores/35035736',
    links: [
      { label: 'Video', href: 'https://www.instagram.com/reel/DZygKFutnWG/' },
      { label: 'Hack the North Museum', href: 'https://museum.hackthenorth.com/' },
    ],
  },
  {
    slug: 'beyond-the-memories',
    title: 'Beyond the Memories (추억 너머)',
    categories: ['composition'],
    collection: 'hot-summer-night',
    year: 2026,
    duration: '3:07',
    ensemble: 'Piano Solo',
    genre: 'Piano',
    key: 'E♭ major',
    instrumentation: 'Piano',
    description:
      'My second piece composed directly at the piano, inspired by a personal story. Beyond the Memories reflects on people, moments, and experiences that were once part of everyday life but now live in memory; the things that were but that can no longer be. It explores the bittersweet feeling of looking back, and the changes that come with moving forward.',
    audio: '/audio/beyond-the-memories.mp3',
    links: [{ label: 'Performance', href: 'https://www.instagram.com/reel/DXiDt7hjVR8/' }],
  },
  {
    slug: 'on-a-clear-day-chamber',
    title: 'On a Clear Day',
    categories: ['composition'],
    collection: 'hot-summer-night',
    year: 2026,
    duration: '2:17',
    ensemble: 'Chamber Ensemble',
    genre: 'Chamber',
    key: 'D major',
    instrumentation: 'Flute, Oboe, Clarinet in B♭, Violoncello, Piano',
    description:
      'A shortened chamber arrangement of On a Clear Day, bringing new instrumental colours to the original piano piece. Flute, oboe, and clarinet share the melodies, supported by cello and piano, offering a different perspective on its gentle, hopeful character.',
    featured: true,
    audio: '/audio/on-a-clear-day-chamber.mp3',
    score: 'https://musescore.com/user/41985992/scores/38912399',
  },
  {
    slug: 'on-a-clear-day-piano',
    title: 'On a Clear Day',
    categories: ['composition'],
    collection: 'hot-summer-night',
    year: 2026,
    duration: '3:34',
    ensemble: 'Piano Solo',
    genre: 'Piano',
    key: 'D major',
    instrumentation: 'Piano',
    description:
      'The first composition I wrote directly on piano (imprinted onto my muscle memory!) after starting piano in 2025. The chord progressions were inspired by Summer, composed by Joe Hisaishi, who is one of my most prominent role models. Some peers who listened to the track described it as sounding Ghibli and anime-like, which tends to be a consequence of this. Overall, the piece is a very tonal and diatonic one, and it invites you to imagine a slow walk on a clear day: birds chirping, an unhurried pace, and a moment to appreciate the small things, whatever else life may bring.',
    audio: '/audio/on-a-clear-day-piano.mp3',
    links: [{ label: 'Performance', href: 'https://www.instagram.com/reel/DU_N9KwkdxZ/' }],
  },
  {
    slug: 'into-the-wild-piano',
    title: 'Into the Wild',
    categories: ['composition'],
    collection: 'sketches-1-0',
    year: 2026,
    duration: '3:01',
    ensemble: 'Piano Solo',
    genre: 'Piano',
    key: 'E♭ major',
    instrumentation: 'Piano',
    credits: [
      { role: 'Composer', name: ME },
      { role: 'Composer', name: 'Michael Li' },
    ],
    arranger: ME,
    description:
      'A solo piano arrangement of Into the Wild, originally co-composed with Michael Li for our Grade 12 instrumental music class. This version reimagines the orchestral piece through the expressive possibilities of a single piano.',
    audio: '/audio/into-the-wild-piano.mp3',
    score: 'https://musescore.com/user/41985992/scores/34190972',
  },
  {
    slug: 'into-the-wild',
    title: 'Into the Wild - Orchestral Version',
    categories: ['composition'],
    collection: 'sketches-1-0',
    year: 2024,
    duration: '4:23',
    ensemble: 'Chamber Orchestra',
    genre: 'Orchestral',
    key: 'E♭ major',
    instrumentation: 'Flute, Oboe, Clarinet in B♭, Bass Clarinet, Alto Saxophone, Bassoon, Strings',
    credits: [
      { role: 'Composer', name: ME },
      { role: 'Composer', name: 'Michael Li' },
    ],
    arranger: ME,
    description:
      'Co-composed with my classmate Michael Li for our Grade 12 instrumental music class, Into the Wild was written as a closing number for a school musical. Through varied orchestral textures, the piece aims to leave the audience with a sense of wonder as the curtain falls.',
    audio: '/audio/into-the-wild.mp3',
    score: 'https://musescore.com/user/41985992/scores/23163892',
  },
  {
    slug: 'video-game-composition',
    title: 'Video Game Composition',
    categories: ['composition'],
    collection: 'sketches-1-0',
    year: 2024,
    ensemble: 'Orchestra',
    genre: 'Video Game',
    source: 'The Legend of Zelda: Link’s Awakening',
    instrumentation: 'Orchestra',
    description:
      'A collaborative composition created to accompany gameplay from The Legend of Zelda: Link’s Awakening. We explored different instrumental colours and melodic ideas to reflect the game’s environments and bring its world to life through music.',
    video: 'https://youtu.be/ABjysVTke9Y?t=494&end=618', // 8:14–10:18
  },
  {
    slug: 'optimism-of-tomorrow',
    title: 'Optimism of Tomorrow',
    categories: ['composition'],
    collection: 'sketches-1-0',
    year: 2023,
    duration: '1:09',
    ensemble: 'Quartet',
    genre: 'Chamber',
    key: 'E major',
    instrumentation: 'Violin, Oboe, Clarinet in B♭, Bassoon',
    description:
      'My first semi-proper composition! This piece was written for the final project in my Grade 11 instrumental music class. It captures the hope and excitement of looking toward tomorrow: the future may be uncertain, but there’s something to look forward to in that mystery.',
    audio: '/audio/optimism-of-tomorrow.mp3',
    score: 'https://musescore.com/user/41985992/scores/33886829',
  },

  // ── Performances ──────────────────────────────────────────────────────────
  {
    slug: 'spirited-away-highlights',
    genre: 'Film score',
    title: 'Highlights from Spirited Away',
    categories: ['performance'],
    collection: 'season-24-25',
    year: 2024,
    duration: '6:20',
    ensemble: 'Wind Ensemble',
    composer: 'Joe Hisaishi',
    source: 'Spirited Away',
    role: 'Conductor',
    performers: 'IRHS Wind Ensemble',
    venue: 'Winter Concert, Oakville',
    description:
      'Placeholder. My first time conducting a full concert piece: three weeks of sectionals, one very nervous downbeat, and a hall that went completely quiet for the reprise.',
    featured: true,
    video: DEMO_VIDEO,
  },
  {
    slug: 'mozart-k622-adagio',
    title: 'Clarinet Concerto in A, K. 622: II. Adagio',
    categories: ['performance'],
    collection: 'season-24-25',
    year: 2025,
    duration: '7:30',
    ensemble: 'Clarinet & Piano',
    composer: 'Wolfgang Amadeus Mozart',
    role: 'Clarinet',
    performers: 'with piano accompaniment',
    venue: 'Solo recital',
    key: 'D major',
    instrumentation: 'Clarinet in A, Piano',
    description: 'Placeholder. The slow movement every clarinetist eventually has to make peace with.',
    audio: DEMO_AUDIO,
  },
  {
    slug: 'hall-of-the-mountain-king',
    title: 'In the Hall of the Mountain King',
    categories: ['performance'],
    collection: 'season-23-24',
    year: 2024,
    duration: '2:48',
    ensemble: 'Wind Ensemble',
    composer: 'Edvard Grieg',
    source: 'Peer Gynt',
    role: 'Conductor',
    performers: 'IRHS Symphonic Band',
    venue: 'Spring Concert',
    description: 'Placeholder. A slow tiptoe that turns into a stampede. The hard part is not speeding up too early.',
    video: DEMO_VIDEO,
  },
  {
    slug: 'on-a-clear-day',
    genre: 'Film score',
    title: 'On a Clear Day',
    categories: ['performance'],
    collection: 'season-24-25',
    year: 2025,
    duration: '2:18',
    ensemble: 'Woodwind Ensemble',
    composer: 'Joe Hisaishi',
    source: 'Kiki’s Delivery Service',
    role: 'Director',
    performers: 'Community woodwind ensemble',
    venue: 'Community concert',
    instrumentation: 'Soprano Recorder, Flute ×2, Oboe, Clarinet in B♭ ×2, Violoncello, Accordion',
    description: 'Placeholder. Directed from the clarinet chair, with an accordion we borrowed the week before.',
    audio: DEMO_AUDIO,
  },
  {
    slug: 'carmen-intermezzo',
    genre: 'Opera',
    title: 'Carmen Suite No. 1: Intermezzo',
    categories: ['performance'],
    collection: 'season-23-24',
    year: 2024,
    duration: '2:23',
    ensemble: 'Woodwind Quartet',
    composer: 'Georges Bizet',
    source: 'Carmen',
    role: 'Clarinet',
    performers: 'Woodwind quartet',
    venue: 'Chamber night',
    description: 'Placeholder. A quiet interlude between the opera’s acts, played as a four-person conversation.',
  },

  // ── Arrangements ──────────────────────────────────────────────────────────
  {
    slug: 'well-be-alright',
    title: "We'll Be Alright",
    categories: ['arrangement'],
    collection: 'screen-and-game',
    year: 2023,
    duration: '3:40',
    ensemble: 'Clarinet Quintet',
    composer: 'RADWIMPS',
    source: 'Weathering With You',
    description:
      'A song from Weathering With You that really caught my ear. I recorded the quintet myself, one clarinet part at a time, and stitched the takes together. It isn’t perfect, but I enjoyed every hour of it.',
    audio: DEMO_AUDIO,
    score: DEMO_SCORE,
    links: [{ label: 'Original project page', href: "https://projects.dwseoh.com/we'll-be-alright" }],
  },
  {
    slug: 'ponyo',
    title: 'Ponyo on the Cliff by the Sea',
    categories: ['arrangement'],
    collection: 'screen-and-game',
    year: 2022,
    duration: '2:05',
    ensemble: 'Clarinet Quartet',
    composer: 'Joe Hisaishi',
    source: 'Ponyo',
    description:
      'The cheerful title song, rescored so the melody runs between all four players like a wave moving down a beach.',
  },
  {
    slug: 'totoro',
    title: 'My Neighbor Totoro',
    categories: ['arrangement'],
    collection: 'screen-and-game',
    year: 2022,
    duration: '2:58',
    ensemble: 'Wind Quintet',
    composer: 'Joe Hisaishi',
    source: 'My Neighbor Totoro',
    description:
      'The main theme, with the horn and bassoon playing the part of the big, sleepy forest spirit underneath a bouncing flute.',
    audio: DEMO_AUDIO,
  },
  {
    slug: 'a-town-with-an-ocean-view',
    title: 'A Town with an Ocean View',
    categories: ['arrangement', 'performance'],
    role: 'Director',
    performers: 'Community woodwind ensemble',
    collection: 'screen-and-game',
    year: 2024,
    duration: '3:51',
    ensemble: 'Woodwind Quintet',
    composer: 'Joe Hisaishi',
    source: 'Kiki’s Delivery Service',
    key: 'G major',
    description:
      'Kiki flies into a new city for the first time. The arrangement keeps the waltz light on its feet, with the cello standing in for the accordion of the original.',
    featured: true,
    audio: DEMO_AUDIO,
    video: DEMO_VIDEO,
    score: DEMO_SCORE,
  },
  {
    slug: 'how-to-train-your-dragon',
    title: 'How to Train Your Dragon',
    categories: ['arrangement'],
    collection: 'screen-and-game',
    year: 2023,
    duration: '2:40',
    ensemble: 'Duet',
    composer: 'John Powell',
    source: 'How to Train Your Dragon',
    instrumentation: 'Flute, Clarinet in B♭',
    description:
      'Made with my friend Cathy, who plays the flute. Not the best sound quality, but recording it together was the most fun part.',
    audio: DEMO_AUDIO,
    links: [{ label: 'Original project page', href: 'https://projects.dwseoh.com/how-to-train-your-dragon-duet' }],
  },
  {
    slug: 'ocarina-of-time-medley',
    title: 'Ocarina of Time Medley',
    categories: ['arrangement'],
    collection: 'screen-and-game',
    year: 2023,
    duration: '3:33',
    ensemble: 'Woodwind Quartet',
    composer: 'Koji Kondo',
    source: 'The Legend of Zelda: Ocarina of Time',
    description:
      'A walk through Hyrule in a few minutes: Kakariko, the Lost Woods and the main theme stitched into one piece.',
    contents: ['Main Theme', 'Kakariko Village', 'Lost Woods', 'Zelda’s Lullaby'],
    score: DEMO_SCORE,
  },
  {
    slug: 'rainbow-road',
    title: 'Rainbow Road',
    categories: ['arrangement'],
    collection: 'screen-and-game',
    year: 2024,
    duration: '2:20',
    ensemble: 'Clarinet Choir',
    source: 'Mario Kart',
    description: 'Fast, bright and a little dangerous, like the track itself. Twelve clarinets trying not to fall off.',
  },
  {
    slug: 'steam-gardens',
    title: 'Steam Gardens',
    categories: ['arrangement'],
    collection: 'screen-and-game',
    year: 2024,
    duration: '2:31',
    ensemble: 'Wind Quintet',
    source: 'Super Mario Odyssey',
    description: 'Gentle machinery and overgrown gardens. The bassoon gets the tune for once.',
  },
  {
    slug: 'comet-observatory',
    title: 'Comet Observatory',
    categories: ['arrangement'],
    collection: 'screen-and-game',
    year: 2024,
    duration: '1:52',
    ensemble: 'Clarinet Quintet',
    composer: 'Mahito Yokota',
    source: 'Super Mario Galaxy',
    key: 'E♭ major',
    description:
      'A slow waltz among the stars. The upper clarinets stay soft and high so the bass clarinet can carry the sky.',
    audio: DEMO_AUDIO,
  },
  {
    slug: 'beauty-and-the-beast',
    title: 'Beauty and the Beast',
    categories: ['arrangement', 'performance'],
    role: 'Clarinet',
    performers: 'Clarinet quartet',
    collection: 'screen-and-game',
    year: 2023,
    duration: '3:05',
    ensemble: 'Clarinet Quartet',
    composer: 'Alan Menken',
    source: 'Beauty and the Beast',
    description:
      'Written during the 2022–23 school year when I was bored. My friends and I played it in a small ensemble for fun, and I wanted to hear how it sounds recorded on my own.',
    premiere: 'Chamber night, 2023',
    audio: DEMO_AUDIO,
    links: [{ label: 'Original project page', href: 'https://projects.dwseoh.com/beauty-and-the-beast/' }],
  },
  {
    slug: 'pink-panther',
    title: 'The Pink Panther',
    categories: ['arrangement'],
    collection: 'screen-and-game',
    year: 2023,
    duration: '2:36',
    ensemble: 'Clarinet Quartet',
    composer: 'Henry Mancini',
    source: 'The Pink Panther',
    description:
      'A friend was a huge Pink Panther fan, so I tried writing this one for them. Sneaky, swung, and very hard to keep in sync.',
    audio: DEMO_AUDIO,
    links: [{ label: 'Original project page', href: 'https://projects.dwseoh.com/pink-panther/' }],
  },
  {
    slug: 'youve-got-a-friend-in-me',
    title: "You've Got a Friend in Me",
    categories: ['arrangement'],
    collection: 'screen-and-game',
    year: 2024,
    duration: '2:12',
    ensemble: 'Clarinet Quartet',
    composer: 'Randy Newman',
    source: 'Toy Story',
    description: 'Ragtime piano, rewritten for four clarinets. The bass clarinet does its best stride-piano left hand.',
  },
  {
    slug: 'chrislarinet-medley',
    title: 'Chrislarinet Medley',
    categories: ['arrangement', 'performance'],
    role: 'Conductor',
    performers: 'IRHS Clarinet Choir',
    collection: 'winter-light',
    year: 2023,
    duration: '7:45',
    ensemble: 'Clarinet Choir',
    composer: 'Various',
    description:
      'A medley of carols for the clarinet section, built up one song at a time so it could play through December like a soundtrack. The pun came first, the music second.',
    contents: [
      'Have Yourself a Merry Little Christmas',
      'We Wish You a Merry Christmas',
      'Rudolph the Red-Nosed Reindeer',
      'Frosty the Snowman',
      'Joy to the World',
      'Carol of the Bells',
      'Silent Night',
      'It’s Beginning to Look a Lot Like Christmas',
    ],
    premiere: 'Winter concert, December 2023',
    featured: true,
    audio: DEMO_AUDIO,
    video: DEMO_VIDEO,
    score: DEMO_SCORE,
    links: [{ label: 'Original project page', href: 'https://projects.dwseoh.com/chrislarinet-medley' }],
  },
  {
    slug: 'sleigh-ride',
    title: 'Sleigh Ride',
    categories: ['arrangement'],
    collection: 'winter-light',
    year: 2024,
    duration: '2:42',
    ensemble: 'Clarinet Choir',
    composer: 'Leroy Anderson',
    description: 'The horse whinny at the end is played on an E♭ clarinet. It took eleven tries.',
    audio: DEMO_AUDIO,
  },
  {
    slug: 'rockin-around-the-christmas-tree',
    title: "Rockin' Around the Christmas Tree",
    categories: ['arrangement'],
    collection: 'winter-light',
    year: 2023,
    duration: '2:05',
    ensemble: 'Clarinet Quartet',
    composer: 'Johnny Marks',
    description: 'Short, swung and written to be sight-read the week before the concert.',
  },
  {
    slug: 'sugar-plum-fairy',
    title: 'Dance of the Sugar Plum Fairy',
    categories: ['arrangement'],
    collection: 'winter-light',
    year: 2023,
    duration: '1:58',
    ensemble: 'Clarinet Quartet',
    composer: 'Pyotr Ilyich Tchaikovsky',
    source: 'The Nutcracker',
    description: 'The celesta line moves to staccato clarinets, and the bass clarinet tiptoes underneath.',
    score: DEMO_SCORE,
  },
  {
    slug: 'beginning-to-look-like-christmas',
    title: "It's Beginning to Look a Lot Like Christmas",
    categories: ['arrangement'],
    collection: 'winter-light',
    year: 2023,
    duration: '2:20',
    ensemble: 'Woodwind Quintet',
    composer: 'Meredith Willson',
    description: 'The last song added to the holiday set that year. Warm, a little jazzy, and over before you notice.',
    audio: DEMO_AUDIO,
  },
  {
    slug: 'angels-we-have-heard-on-high',
    title: 'Angels We Have Heard on High',
    categories: ['arrangement'],
    collection: 'winter-light',
    year: 2024,
    duration: '2:30',
    ensemble: 'Clarinet Choir',
    composer: 'Traditional',
    description:
      'The long “Gloria” line passed around the whole choir, so everyone has to breathe at a different time.',
  },
  {
    slug: 'frosty-the-snowman',
    title: 'Frosty the Snowman',
    categories: ['arrangement'],
    collection: 'winter-light',
    year: 2023,
    duration: '1:47',
    ensemble: 'Wind Quintet',
    composer: 'Steve Nelson & Jack Rollins',
    instrumentation: 'Flute, Oboe, Clarinet in B♭ ×2, Bassoon',
    description: 'A bouncy, bassoon-led take with a key change in exactly the place you expect.',
    audio: DEMO_AUDIO,
  },
  {
    slug: 'mr-blue-sky',
    title: 'Mr. Blue Sky',
    categories: ['arrangement'],
    collection: 'covers-and-standards',
    year: 2023,
    duration: '3:40',
    ensemble: 'Woodwind Quartet',
    composer: 'Jeff Lynne',
    source: 'Electric Light Orchestra',
    description: 'All the strings and vocoder of the original, squeezed into four woodwinds and a lot of enthusiasm.',
    audio: DEMO_AUDIO,
    video: DEMO_VIDEO,
  },
  {
    slug: 'dont-stop-believin',
    title: "Don't Stop Believin'",
    categories: ['arrangement'],
    collection: 'covers-and-standards',
    year: 2024,
    duration: '3:20',
    ensemble: 'Wind Ensemble',
    composer: 'Journey',
    description: 'The piano riff goes to the clarinets; the chorus goes to everyone at once.',
  },
  {
    slug: 'uptown-girl',
    title: 'Uptown Girl',
    categories: ['arrangement'],
    collection: 'covers-and-standards',
    year: 2024,
    duration: '2:50',
    ensemble: 'Clarinet Quartet',
    composer: 'Billy Joel',
    description: 'Doo-wop backing vocals turned into four-part clarinet harmony.',
  },
  {
    slug: 'god-only-knows',
    title: 'God Only Knows',
    categories: ['arrangement'],
    collection: 'covers-and-standards',
    year: 2024,
    duration: '2:45',
    ensemble: 'Woodwind Quintet',
    composer: 'Brian Wilson & Tony Asher',
    source: 'Pet Sounds',
    description:
      'The closing round, where every voice sings a different line at once, was the reason to arrange this at all.',
    score: DEMO_SCORE,
  },
  {
    slug: 'eleanor-rigby',
    title: 'Eleanor Rigby',
    categories: ['arrangement'],
    collection: 'covers-and-standards',
    year: 2023,
    duration: '2:07',
    ensemble: 'Woodwind Quintet',
    composer: 'Lennon–McCartney',
    source: 'Revolver',
    key: 'E minor',
    instrumentation: 'Flute ×2, Oboe, Clarinet in B♭, Violoncello',
    description: 'The original is all string octet. Here the cello keeps its job and the woodwinds take over the rest.',
    audio: DEMO_AUDIO,
  },
  {
    slug: 'edelweiss',
    title: 'Edelweiss',
    categories: ['arrangement'],
    collection: 'covers-and-standards',
    year: 2022,
    duration: '1:40',
    ensemble: 'Recorder Ensemble',
    composer: 'Rodgers & Hammerstein',
    source: 'The Sound of Music',
    description: 'One of the first things I ever arranged: four recorders, three chords, and a lot of care.',
  },
  {
    slug: 'canon-in-c',
    title: 'Canon in C',
    categories: ['arrangement'],
    collection: 'small-rooms',
    year: 2023,
    duration: '3:30',
    ensemble: 'Trio',
    composer: 'Johann Pachelbel',
    instrumentation: 'Flute, Clarinet in B♭, Bassoon',
    description:
      'The famous canon moved down a step so a beginner trio could play it, with the bassoon walking the ground bass.',
  },
  {
    slug: 'sound-of-silence',
    title: 'The Sound of Silence',
    categories: ['arrangement'],
    collection: 'small-rooms',
    year: 2024,
    duration: '4:03',
    ensemble: 'Clarinet Quartet',
    composer: 'Paul Simon',
    description:
      'Slow and very quiet. Fewer parts means nowhere to hide, which is exactly why I love writing for four.',
    audio: DEMO_AUDIO,
    score: DEMO_SCORE,
  },
  {
    slug: 'sous-le-ciel-de-paris',
    title: 'Sous le ciel de Paris',
    categories: ['arrangement'],
    collection: 'small-rooms',
    year: 2024,
    duration: '2:49',
    ensemble: 'Wind Quintet',
    composer: 'Hubert Giraud',
    description: 'A café waltz. The oboe sings the tune and the horn plays the accordion.',
  },
  {
    slug: 'bad-piggies',
    title: 'Bad Piggies',
    categories: ['arrangement'],
    collection: 'small-rooms',
    year: 2023,
    duration: '1:35',
    ensemble: 'Brass Quartet',
    composer: 'Ilmari Hakkola',
    source: 'Bad Piggies',
    description: 'A goofy, oompah-flavoured theme that turned out to be a serious workout for the trombone.',
  },
]

/**
 * What the page lists. For now, compositions only; performances and
 * arrangements stay in `catalogue` until they're ready. To show everything,
 * make this `catalogue` again and restore the tabs in `sections`.
 */
const albumCover = new Map(collections.map((c) => [c.id, c.cover]))

export const pieces = catalogue
  .filter((p) => p.categories.includes('composition'))
  .map((p) => ({ ...p, cover: p.cover ?? albumCover.get(p.collection) }))

export const inSection = (piece: Piece, key: SectionKey) => key === 'all' || piece.categories.includes(key)

/** Written by me. */
export function isMine(piece: Piece) {
  return piece.categories.includes('composition') || piece.composer === ME
}

/** Who wrote it and who arranged it. (What I did in a performance is a detail, not a credit.) */
export function creditsOf(piece: Piece): Credit[] {
  const has = (c: Category) => piece.categories.includes(c)
  const out: Credit[] = piece.credits
    ? [...piece.credits]
    : [{ role: 'Composer', name: has('composition') ? ME : (piece.composer ?? 'Unknown') }]
  const arranger = piece.arranger ?? (!piece.credits && has('arrangement') ? ME : undefined)
  if (arranger && !out.some((c) => c.role === 'Arranger')) out.push({ role: 'Arranger', name: arranger })
  return out
}

export const genreOf = (piece: Piece, collection: Collection) => piece.genre ?? collection.genre
