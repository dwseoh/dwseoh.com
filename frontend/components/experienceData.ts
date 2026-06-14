/* experienceData.ts — professional experience, most-recent first.
   Logos live in /public/images/logos; Pinpoint has no retrievable mark, so it
   renders the built-in pin monogram (logo: null). */

export interface Experience {
  id: string
  role: string
  org: string
  /** Path under /public, or null to render the pin monogram fallback. */
  logo: string | null
  period: string
  duration: string
  location: string
  type: string
  blurb: string
  skills: string[]
  href?: string
  present?: boolean
}

export const EXPERIENCES: Experience[] = [
  {
    id: 'cerebras',
    role: 'AI Software Engineer Intern',
    org: 'Cerebras Systems',
    logo: '/images/logos/cerebras.png',
    period: 'May 2026 — Present',
    duration: '2 mos',
    location: 'Toronto, ON · Hybrid',
    type: 'Internship',
    blurb:
      "Building low level C++ infrastructure and inference debugging tools for Cerebras' wafer-scale AI systems (the world's largest and fastest chip).",
    skills: ['AI Systems', 'Python', 'Performance'],
    href: 'https://cerebras.ai',
    present: true,
  },
  {
    id: 'watonomous',
    role: 'Autonomy Developer',
    org: 'WATonomous',
    logo: '/images/logos/watonomous.jpg',
    period: 'Feb 2026 — Apr 2026',
    duration: '3 mos',
    location: 'Waterloo, ON · Hybrid',
    type: 'Design team',
    blurb:
      "Autonomy software on the Eve team for Waterloo's self-driving vehicle and autonomous racing project.",
    skills: ['C++', 'Autonomy', 'Robotics'],
    href: 'https://watonomous.ca',
  },
  {
    id: 'orbital',
    role: 'Software Engineer',
    org: 'UW Orbital',
    logo: '/images/logos/orbital.png',
    period: 'Oct 2025 — Apr 2026',
    duration: '7 mos',
    location: 'Waterloo, ON · Hybrid',
    type: 'Design team',
    blurb:
      'Built Mission Control interfaces for satellite operations on the Ground Station team — React & TypeScript front of a FastAPI backend.',
    skills: ['React', 'TypeScript', 'FastAPI', 'Python'],
    href: 'https://www.uworbital.com',
  },
  {
    id: 'solvexchange',
    role: 'Frontend Developer',
    org: 'SolveXchange',
    logo: '/images/logos/solvexchange.png',
    period: 'Mar 2024 — Jul 2025',
    duration: '1 yr 5 mos',
    location: 'Remote',
    type: 'Contract · Part-time',
    blurb:
      'Engineered full-stack web features that grew the platform to 50+ active users.',
    skills: ['JavaScript', 'Flask', 'SQLAlchemy', 'CSS'],
    href: 'https://solvexchange.ca',
  },
  {
    id: 'pinpoint',
    role: 'Web Development Intern',
    org: 'PNPT (핀포인트)',
    logo: '/images/logos/pinpoint_logo.png',
    period: 'Jun 2023 — Aug 2023',
    duration: '3 mos',
    location: 'Seoul, South Korea',
    type: 'Internship',
    blurb:
      'Prototyped responsive UI in Figma & React to support front-end development.',
    skills: ['Figma', 'React', 'UI Design'],
    href: "https://www.pnpt.kr/"
  },
]
