import type { Tune } from '../lib/data'
import { backs, ratios, views } from '../lib/views'

type Props = {
  tune: Tune | null
  busy: string
  note: string
  view: number
  setview: (view: number) => void
  back: number
  setback: (back: number) => void
  frame: number
  setframe: (frame: number) => void
  spin: boolean
  setspin: (spin: boolean) => void
  songon: boolean
  setsongon: (on: boolean) => void
  artiston: boolean
  setartiston: (on: boolean) => void
  loop: number
  setloop: (loop: number) => void
  progress: number
  run: (kind: 'image' | 'video') => void
}

const loops = [1, 2, 3]

export function Side({ tune, busy, note, view, setview, back, setback, frame, setframe, spin, setspin, songon, setsongon, artiston, setartiston, loop, setloop, progress, run }: Props) {
  return (
    <aside className="side">
      <section className="group">
        <h2>LAYOUT</h2>
        {views.map((item, idx) => <button className={`listrow ${view === idx ? 'active' : ''}`} key={item.key} onClick={() => setview(idx)}><span>{item.name.toUpperCase()}</span></button>)}
      </section>
      <section className="group">
        <h2>FRAME</h2>
        {ratios.map((item, idx) => <button className={`listrow ${frame === idx ? 'active' : ''}`} key={item.key} onClick={() => setframe(idx)}><span>{item.name.toUpperCase()}</span><span className="rowvalue">{item.label}</span></button>)}
      </section>
      <section className="group">
        <h2>BACKGROUND</h2>
        {backs.map((item, idx) => <button className={`listrow ${back === idx ? 'active' : ''}`} key={item.key} onClick={() => setback(idx)}><span>{item.name.toUpperCase()}</span></button>)}
      </section>
      <section className="group">
        <h2>TEXT</h2>
        <button className={`listrow ${songon ? 'active' : ''}`} onClick={() => setsongon(!songon)}><span>SONG NAME</span><span className="rowvalue">{songon ? 'ON' : 'OFF'}</span></button>
        <button className={`listrow ${artiston ? 'active' : ''}`} onClick={() => setartiston(!artiston)}><span>ARTIST</span><span className="rowvalue">{artiston ? 'ON' : 'OFF'}</span></button>
      </section>
      <button className={`listrow ${spin ? 'active' : ''}`} onClick={() => setspin(!spin)}><span>ROTATE VINYL</span><span className="rowvalue">{spin ? 'ON' : 'OFF'}</span></button>
      <section className="group">
        <h2>VIDEO LOOP</h2>
        {loops.map((item) => <button className={`listrow ${loop === item ? 'active' : ''}`} key={item} onClick={() => setloop(item)}><span>{item * 4} SECOND LOOP</span><span className="rowvalue">{item} {item === 1 ? 'TURN' : 'TURNS'}</span></button>)}
      </section>
      <section className="group exportgroup">
        <h2>EXPORT</h2>
        <button className="listrow exportrow" disabled={!tune || !!busy} onClick={() => run('image')}><span>{busy === 'image' ? 'SAVING PNG…' : 'SAVE PNG'}</span></button>
        <button className="listrow exportrow" disabled={!tune || !!busy} onClick={() => run('video')}>
          <i style={{ transform: `scaleX(${busy === 'video' ? progress : 0})` }} />
          <span>{busy === 'video' ? `RECORDING ${Math.round(progress * 100)}%` : 'SAVE VIDEO'}</span>
        </button>
        {note && <p className="exporterror">{note}</p>}
      </section>
      <section className="group">
        <h2>CONTROLS</h2>
        <p className="listrow helprow">DRAG TO ROTATE</p>
        <p className="listrow helprow">SCROLL TO ZOOM</p>
        <p className="listrow helprow">DOUBLE CLICK TO RESET</p>
      </section>
    </aside>
  )
}
