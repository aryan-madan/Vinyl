import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import type { Tune } from '../lib/data'

type Props = {
  word: string
  setword: (word: string) => void
  find: (word: string) => void
  expanded: boolean
  hits: Tune[]
  finding: boolean
  status: string
  pick: (tune: Tune) => void
}

export function Head({ word, setword, find, expanded, hits, finding, status, pick }: Props) {
  const field = useRef<HTMLLabelElement>(null)
  const [stars, setstars] = useState('…')
  const shown = finding || !!status || hits.length > 0

  useEffect(() => {
    let live = true
    fetch('https://api.github.com/repos/aryan-madan/vinyl', { headers: { Accept: 'application/vnd.github+json' } })
      .then((response) => {
        if (!response.ok) throw new Error('unavailable')
        return response.json() as Promise<{ stargazers_count: number }>
      })
      .then((data) => { if (live) setstars(data.stargazers_count.toLocaleString('en-US')) })
      .catch(() => { if (live) setstars('—') })
    return () => { live = false }
  }, [])

  useEffect(() => {
    if (!field.current) return
    const tween = gsap.to(field.current, { width: expanded ? '100%' : '58%', duration: 0.7, ease: 'power3.out', overwrite: true })
    return () => { tween.kill() }
  }, [expanded])

  return (
    <header className="head">
      <a className="brand" href="#">VINYL</a>
      <div className="find">
        <label className="search" ref={field}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.8" cy="10.8" r="6.7" /><path d="m16 16 5 5" /></svg>
          <input value={word} onChange={(event) => setword(event.target.value.toUpperCase())} onKeyDown={(event) => { if (event.key === 'Enter') find(word.toUpperCase()) }} placeholder="SEARCH FOR A SONG" aria-label="Search for a song" />
        </label>
        {shown && <div className="results">
          {finding && <p className="result resultnote">SEARCHING…</p>}
          {!finding && status && <p className="result resultnote">{status.toUpperCase()}</p>}
          {!finding && !status && <div className="resultlist">
          {hits.map((hit) => (
            <button className="result resultpick" key={hit.id} onClick={() => pick(hit)}>
              <img src={hit.thumb} alt="" />
              <span className="resulttext"><b>{hit.song.toUpperCase()}</b><small>{hit.artist.toUpperCase()} · {hit.album.toUpperCase()}</small></span>
            </button>
          ))}
          </div>}
        </div>}
      </div>
      <a className="buy" href="https://github.com/aryan-madan/vinyl" target="_blank" rel="noreferrer"><span>STAR</span><span>{stars}</span></a>
    </header>
  )
}
