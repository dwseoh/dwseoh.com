/**
 * UI copy for the blog.
 *
 * The blog is intentionally English-only: it lives OUTSIDE the `[locale]`
 * segment, so it never goes through next-intl (no provider, no message files,
 * no `/ko/blog`). The portfolio at `/` stays bilingual — this only covers the
 * blog's own chrome. Edit strings here.
 *
 * Individual posts can still be written in any language via the `lang`
 * frontmatter field, which drives the article's font + `lang` attribute.
 */
export const copy = {
  title: "Jamie's Blog",
  intro: 'Hear me yap -- it might come in handy someday!',
  seo: {
    title: 'Jamie\'s Blog',
    description:
      'Hear a Software Engineering student yap about tech, music, photography, community, and more.',
  },
  backToList: 'All posts',
  minRead: 'min read',
  minReadShort: 'min',   // phones drop "read" — the clock icon already says it
  views: 'views',
  likes: 'likes',
  empty: 'No posts yet — check back soon.',
  likePrompt: 'Enjoyed this post?',
  likedLabel: 'Thanks for the love!',
  brand: 'Jamie Seoh',
  substack: 'Read on Substack if you want',
  author: 'Jamie Seoh',
  by: 'Words by',
  chrome: {
    home: "Jamie's Website",
    blogHome: 'Blog Home',
    search: 'Search',
    searchPlaceholder: 'Search posts…',
    searchEmpty: 'Nothing matches that search yet.',
    theme: 'Toggle theme',
  },
  postNav: {
    newer: 'Newer',
    older: 'Older',
  },
} as const
