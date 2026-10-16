import type { Tune } from '../lib/data'

type Props = {
  tune: Tune | null
  playing: boolean
  time: number
  duration: number
  toggle: () => void
  reset: () => void
}

function stamp(value: number) {
  const mins = Math.floor(value / 60)
  const secs = Math.floor(value % 60).toString().padStart(2, '0')
  return `${mins}:${secs}`
}

export function Foot({ tune, playing, time, duration, toggle, reset }: Props) {
  const ready = !!tune?.preview
  return (
    <footer className="foot">
      <div className="player">
        <span className="now">{tune ? `${tune.song} — ${tune.artist}`.toUpperCase() : 'MADE BY ARYAN MADAN'}</span>
        <button className="playbtn" disabled={!ready} onClick={toggle}>{playing ? 'PAUSE' : 'PLAY'}</button>
        <button className="playbtn" disabled={!ready} onClick={reset}>RESTART</button>
        <span className="clock">{stamp(time)} / {stamp(duration)}</span>
      </div>
      <a href="https://instagram.com/aryanaintreal" target="_blank" rel="noreferrer">INSTAGRAM</a>
      <a href="https://aryan.am" target="_blank" rel="noreferrer">PORTFOLIO</a>
    </footer>
  )
}
