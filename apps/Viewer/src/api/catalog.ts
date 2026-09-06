export interface CatalogueArtwork {
  poster?: string
  banner?: string
  thumbnail?: string
}

export interface CatalogueShow {
  id: number
  title: string
  description: string | null
  category: string | null
  artworks?: CatalogueArtwork
  seasons?: CatalogueSeason[]
}

export interface CatalogueSeason {
  season_number: number
  episodes?: CatalogueEpisode[]
}

export interface CatalogueEpisode {
  id: number
  title: string
  description?: string | null
  duration_seconds?: number | null
  artworks?: CatalogueArtwork
}

interface CatalogueResponse {
  sections?: Record<string, { shows?: CatalogueShow[] }>
}

function assetUrl(path?: string) {
  if (!path) return undefined
  if (path.startsWith('/catalog/assets/')) return `/api/public/catalog/catalog/assets/${path.slice('/catalog/assets/'.length)}`
  return path
}

export async function fetchCatalogueShows(): Promise<CatalogueShow[]> {
  const response = await fetch('/api/public/catalog/catalog')
  if (!response.ok) throw new Error('Unable to load catalogue')
  const catalogue = await response.json() as CatalogueResponse
  return Object.values(catalogue.sections ?? {}).flatMap(section => section.shows ?? []).map(show => ({
    ...show,
    artworks: show.artworks ? {
      ...show.artworks,
      poster: assetUrl(show.artworks.poster),
      banner: assetUrl(show.artworks.banner),
      thumbnail: assetUrl(show.artworks.thumbnail),
    } : undefined,
  }))
}

export async function fetchCatalogueEpisodes(): Promise<Array<CatalogueEpisode & { show: string; artworkUrl?: string }>> {
  const response = await fetch('/api/public/catalog/catalog')
  if (!response.ok) throw new Error('Unable to load catalogue')
  const catalogue = await response.json() as CatalogueResponse
  return Object.values(catalogue.sections ?? {}).flatMap(section => section.shows ?? []).flatMap(show =>
    (show.seasons ?? []).flatMap(season => (season.episodes ?? []).map(episode => ({
      ...episode,
      show: show.title,
      artworkUrl: assetUrl(episode.artworks?.thumbnail),
    }))),
  )
}
