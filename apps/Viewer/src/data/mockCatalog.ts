export type ArtworkKind = 'banner' | 'poster' | 'thumbnail'

export type Show = {
  title: string
  description: string
  category: string
  artwork: string
  tone: string
}

export type Episode = {
  title: string
  show: string
  description: string
  duration: string
  progress?: number
  artwork: string
}

export const shows: Show[] = [
  { title: "Pablo's World", description: 'Fun adventures', category: 'Adventure', artwork: 'pablo', tone: 'violet' },
  { title: 'Animal Friends', description: 'Discover nature', category: 'Nature', artwork: 'animals', tone: 'mint' },
  { title: 'Count with Pablo', description: 'Learn numbers', category: 'Learning', artwork: 'numbers', tone: 'blue' },
  { title: 'ABC Fun', description: 'Phonics & letters', category: 'Learning', artwork: 'abc', tone: 'pink' },
  { title: 'Nature Explorers', description: 'Big world, little steps', category: 'Nature', artwork: 'nature', tone: 'yellow' },
]

export const episodes: Episode[] = [
  { title: 'The Brave Little Whale', show: "Pablo's World", description: 'A story about kindness, friendship and courage.', duration: '08:24', progress: 62, artwork: 'whale' },
  { title: 'A Day at the Park', show: 'Animal Friends', description: 'Come play, share and discover.', duration: '11:08', progress: 28, artwork: 'park' },
  { title: 'Momo the Curious Monkey', show: 'Nature Explorers', description: 'Every question starts an adventure.', duration: '09:42', progress: 84, artwork: 'jungle' },
]

export const learningCategories = [
  { title: 'Creativity', subtitle: 'Art & crafts', icon: '✦', tone: 'pink' },
  { title: 'Nature', subtitle: 'Animals & environment', icon: '❧', tone: 'mint' },
  { title: 'Life Skills', subtitle: 'Good habits', icon: '☼', tone: 'yellow' },
  { title: 'Our World', subtitle: 'Cultures & people', icon: '◎', tone: 'lavender' },
]
