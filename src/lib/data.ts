export type Tune = { id: number; song: string; artist: string; album: string; art: string; thumb: string; preview: string; date: string }

export const cats = [
  ['ALL', '712'], ['ESSENTIAL', '186'], ['ANALYTICS', '24'], ['ARROW', '87'],
  ['BOOKMARK', '08'], ['CODE', '21'], ['COMMUNICATION', '80'], ['DATABASE & SERVER', '30'],
  ['DATE & TIME', '38'], ['DEVICE', '19'], ['DOCUMENT & FOLDER', '41'], ['FINANCE', '63'],
  ['HOME', '11'], ['LOCATION', '07'], ['MEDIA', '96'], ['NOTIFICATION', '06'],
]

export async function search(term: string): Promise<Tune[]> {
  type Item = Record<string, string | number>
  const bag = window as unknown as Record<string, unknown>
  const key = `cb${Date.now()}`
  const tag = document.createElement('script')
  const data = await new Promise<Item[]>((done, fail) => {
    let timer = 0
    const clean = () => {
      window.clearTimeout(timer)
      delete bag[key]
      tag.remove()
    }
    bag[key] = (res: { results?: Item[] }) => {
      clean()
      done(res.results || [])
    }
    tag.onerror = () => { clean(); fail(new Error('Search failed')) }
    tag.src = `https://itunes.apple.com/search?term=${encodeURIComponent(term)}&entity=song&limit=20&callback=${key}`
    timer = window.setTimeout(() => { clean(); fail(new Error('Search timed out')) }, 12000)
    document.body.appendChild(tag)
  })
  return data.map((item) => ({
    id: Number(item['trackId']),
    song: String(item['trackName'] || ''),
    artist: String(item['artistName'] || ''),
    album: String(item['collectionName'] || ''),
    art: String(item['artworkUrl100'] || '').replace('100x100bb', '1000x1000bb'),
    thumb: String(item['artworkUrl100'] || ''),
    preview: String(item['previewUrl'] || ''),
    date: String(item['releaseDate'] || ''),
  }))
}
