/**
 * Everything on /music is driven from this file. The page is a list of
 * sections (Compositions, Arrangements, …), each holding album-style
 * collections of tracks. Add a section by appending to `sections`.
 *
 * Audio: drop MP3s into public/audio/ named after each track's slug
 * (e.g. public/audio/ponyo.mp3). A track can point elsewhere with `audio`.
 * Tracks whose file is missing still render — the player just marks them
 * "audio coming soon" when someone tries to play them.
 */

/** Background photo behind the whole page. Swap this path to change it. */
export const BACKGROUND_IMAGE = '/videos/orchestra-conducting-poster.jpg'

export const intro = {
  eyebrow: 'Compositions & arrangements',
  title: 'Music',
  body:
    'Music I have written and arranged — for school ensembles, friends, holiday concerts, and the occasional late night. Most of it started as “what if this were a clarinet quartet?”',
}

export interface TrackLink {
  label: string
  href: string
}

export interface Track {
  slug: string
  title: string
  /** Instrumentation, e.g. "Wind Quintet". */
  ensemble: string
  year?: number
  /** Display length, e.g. "3:42". Shown in the track list. */
  duration?: string
  /** Overrides the default /audio/<slug>.mp3 */
  audio?: string
  /** A few words about the piece — shown when the track is expanded. */
  note?: string
  links?: TrackLink[]
}

export interface Collection {
  slug: string
  title: string
  /** Label above the title, like Spotify's "Album" / "EP". */
  kind: string
  years: string
  /** The paragraph that opens the collection. */
  blurb: string
  /** Generated cover art: a two-stop gradient, or an image path. */
  cover: { from: string; to: string; image?: string }
  tracks: Track[]
}

export interface Section {
  /** Also the #anchor the top-bar link jumps to. */
  id: string
  title: string
  /** A sentence or two introducing the section. */
  blurb: string
  collections: Collection[]
}

const originals: Collection[] = [
  {
    slug: 'originals',
    title: 'Originals',
    kind: 'Collection',
    years: '2023',
    blurb:
      'Music that started from a blank page rather than someone else’s melody. Small, personal pieces — mostly written for friends to play together.',
    cover: { from: '#1f1c2c', to: '#928dab' },
    tracks: [
      { slug: 'lifelight', title: 'Lifelight', ensemble: 'Trio', year: 2023 },
      {
        slug: 'well-be-alright',
        title: "We'll Be Alright",
        ensemble: 'Quintet',
        year: 2023,
        links: [{ label: 'Project page', href: "https://projects.dwseoh.com/we'll-be-alright" }],
      },
      { slug: 'daisy-circuit', title: 'Daisy Circuit', ensemble: 'Original' },
    ],
  },
]

const arrangements: Collection[] = [
  {
    slug: 'screen-and-game',
    title: 'Screen & Game',
    kind: 'Collection',
    years: '2022 – 2024',
    blurb:
      'Soundtracks I grew up with, rewritten for the people sitting next to me in band. Studio Ghibli, Nintendo, Disney — music that already tells a story, which makes it a joy to retell with fewer instruments.',
    cover: { from: '#2b5876', to: '#4e4376' },
    tracks: [
      { slug: 'ponyo', title: 'Ponyo on the Cliff by the Sea', ensemble: 'Arrangement' },
      { slug: 'totoro', title: 'My Neighbor Totoro', ensemble: 'Arrangement' },
      { slug: 'a-town-with-an-ocean-view', title: 'A Town with an Ocean View', ensemble: 'Arrangement' },
      {
        slug: 'how-to-train-your-dragon-duet',
        title: 'How to Train Your Dragon',
        ensemble: 'Duet',
        year: 2023,
        links: [{ label: 'Project page', href: 'https://projects.dwseoh.com/how-to-train-your-dragon-duet' }],
      },
      {
        slug: 'ocarina-of-time-medley',
        title: 'The Legend of Zelda: Ocarina of Time Medley',
        ensemble: 'Ensemble',
        note: 'A walk through Hyrule in a few minutes — Kakariko, Lost Woods, and the main theme stitched into one piece.',
      },
      { slug: 'rainbow-road', title: 'Rainbow Road', ensemble: 'Arrangement' },
      { slug: 'steam-gardens', title: 'Steam Gardens', ensemble: 'Arrangement' },
      { slug: 'comet-observatory', title: 'Comet Observatory', ensemble: 'Arrangement' },
      {
        slug: 'beauty-and-the-beast',
        title: 'Beauty and the Beast',
        ensemble: 'Quartet',
        year: 2023,
        links: [{ label: 'Project page', href: 'https://projects.dwseoh.com/beauty-and-the-beast/' }],
      },
      {
        slug: 'pink-panther',
        title: 'The Pink Panther',
        ensemble: 'Quartet',
        year: 2023,
        links: [{ label: 'Project page', href: 'https://projects.dwseoh.com/pink-panther/' }],
      },
      { slug: 'youve-got-a-friend-in-me', title: "You've Got a Friend in Me", ensemble: 'Arrangement' },
    ],
  },
  {
    slug: 'winter-light',
    title: 'Winter Light',
    kind: 'Collection',
    years: '2023 – 2024',
    blurb:
      'Every December the clarinet section needs something new to play. These are the holiday charts — warm, a little silly, and written to be sight-read the week before the concert.',
    cover: { from: '#c94b4b', to: '#2c1a3a' },
    tracks: [
      {
        slug: 'chrislarinet-medley',
        title: 'Chrislarinet Medley',
        ensemble: 'Clarinet Choir',
        year: 2023,
        note: 'A medley of carols written for the clarinet section — the pun came first, the music second.',
        links: [{ label: 'Project page', href: 'https://projects.dwseoh.com/chrislarinet-medley' }],
      },
      { slug: 'sleigh-ride', title: 'Sleigh Ride', ensemble: 'Clarinet Choir', year: 2024 },
      { slug: 'rockin-around-the-christmas-tree', title: "Rockin' Around the Christmas Tree", ensemble: 'Arrangement' },
      { slug: 'sugar-plum-fairy', title: 'Dance of the Sugar Plum Fairy', ensemble: 'Arrangement' },
      { slug: 'beginning-to-look-like-christmas', title: "It's Beginning to Look a Lot Like Christmas", ensemble: 'Arrangement' },
      { slug: 'angels-we-have-heard-on-high', title: 'Angels We Have Heard on High', ensemble: 'Arrangement' },
      { slug: 'frosty-the-snowman', title: 'Frosty the Snowman', ensemble: 'Wind Quintet' },
    ],
  },
  {
    slug: 'covers-and-standards',
    title: 'Covers & Standards',
    kind: 'Collection',
    years: '2022 – 2024',
    blurb:
      'Pop songs and old favourites, reimagined for winds. The challenge here is always the same: keep what makes the song itself, and find what only these instruments can add.',
    cover: { from: '#f7b733', to: '#fc4a1a' },
    tracks: [
      { slug: 'mr-blue-sky', title: 'Mr. Blue Sky', ensemble: 'Ensemble' },
      { slug: 'dont-stop-believin', title: "Don't Stop Believin'", ensemble: 'Arrangement' },
      { slug: 'uptown-girl', title: 'Uptown Girl', ensemble: 'Arrangement' },
      { slug: 'god-only-knows', title: 'God Only Knows', ensemble: 'Arrangement' },
      { slug: 'eleanor-rigby', title: 'Eleanor Rigby', ensemble: 'Ensemble' },
      { slug: 'stop', title: 'Stop', ensemble: 'Wind Ensemble' },
      { slug: 'edelweiss', title: 'Edelweiss', ensemble: 'Recorder' },
    ],
  },
  {
    slug: 'small-rooms',
    title: 'Small Rooms',
    kind: 'Chamber',
    years: '2023',
    blurb:
      'Pieces for three, four, five players — the kind of music you can rehearse around a kitchen table. Fewer parts means nowhere to hide, which is exactly why I love writing it.',
    cover: { from: '#134e5e', to: '#71b280' },
    tracks: [
      { slug: 'canon-in-c', title: 'Canon in C', ensemble: 'Trio', year: 2023 },
      { slug: 'sound-of-silence', title: 'The Sound of Silence', ensemble: 'Clarinet Quartet' },
      { slug: 'sous-le-ciel-de-paris', title: 'Sous le ciel de Paris', ensemble: 'Wind Quintet' },
      { slug: 'bad-piggies', title: 'Bad Piggies', ensemble: 'Brass Quartet' },
    ],
  },
]

export const sections: Section[] = [
  {
    id: 'compositions',
    title: 'Compositions',
    blurb: 'Original pieces — written from scratch.',
    collections: originals,
  },
  {
    id: 'arrangements',
    title: 'Arrangements',
    blurb: 'Other people’s music, retold for the ensembles around me.',
    collections: arrangements,
  },
]

export function audioSrc(track: Track) {
  return track.audio ?? `/audio/${track.slug}.mp3`
}
