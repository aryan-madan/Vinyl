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
  const entry = useRef<HTMLInputElement>(null)
  const [open, setopen] = useState(false)
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
    const mobile = window.matchMedia('(max-width: 760px)').matches
    const width = mobile ? open ? '100%' : '44px' : expanded ? '100%' : '58%'
    const tween = gsap.to(field.current, { width, duration: mobile ? 0.45 : 0.7, ease: 'power3.out', overwrite: true })
    return () => { tween.kill() }
  }, [expanded, open])

  function click() {
    if (window.matchMedia('(max-width: 760px)').matches) {
      const next = !open
      setopen(next)
      if (next) requestAnimationFrame(() => entry.current?.focus())
    } else entry.current?.focus()
  }

  return (
    <header className={`head ${open ? 'mobileopen' : ''}`}>
      <a className="brand" href="#">VINYL</a>
      <div className="find">
        <label className="search" ref={field}>
          <button className="searchicon" type="button" onClick={click} aria-label="Search"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.8" cy="10.8" r="6.7" /><path d="m16 16 5 5" /></svg></button>
          <input ref={entry} value={word} onChange={(event) => setword(event.target.value.toUpperCase())} onKeyDown={(event) => { if (event.key === 'Enter') find(word.toUpperCase()); if (event.key === 'Escape' && open) { setopen(false); entry.current?.blur() } }} placeholder="SEARCH FOR A SONG" aria-label="Search for a song" />
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
