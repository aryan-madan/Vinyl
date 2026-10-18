import { useRef, useState } from 'react'
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
  finish: string
  setfinish: (finish: string) => void
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
const finishes = [
  { key: 'color', name: 'COLOR' },
  { key: 'translucent', name: 'TRANSLUCENT' },
  { key: 'black', name: 'BLACK' },
]
const mobileTabs = [
  { key: 'layout', label: 'VIEW' },
  { key: 'frame', label: 'FRAME' },
  { key: 'background', label: 'BACK' },
  { key: 'finish', label: 'FINISH' },
  { key: 'text', label: 'TEXT' },
  { key: 'loop', label: 'LOOP' },
  { key: 'more', label: 'MORE' },
  { key: 'export', label: 'EXPORT' },
]

export function Side({ tune, busy, note, view, setview, back, setback, finish, setfinish, frame, setframe, spin, setspin, songon, setsongon, artiston, setartiston, loop, setloop, progress, run }: Props) {
  const [mobileTab, setmobileTab] = useState('layout')
  const tabs = useRef<HTMLElement>(null)

  function tabKeydown(event: React.KeyboardEvent<HTMLElement>) {
    const tablist = tabs.current
    if (!tablist) return
    const index = mobileTabs.findIndex((tab) => tab.key === mobileTab)
    let next = index
    if (event.key === 'ArrowRight') next = (index + 1) % mobileTabs.length
    else if (event.key === 'ArrowLeft') next = (index - 1 + mobileTabs.length) % mobileTabs.length
    else if (event.key === 'Home') next = 0
    else if (event.key === 'End') next = mobileTabs.length - 1
    else return
    event.preventDefault()
    setmobileTab(mobileTabs[next].key)
    tablist.querySelectorAll<HTMLButtonElement>('[role="tab"]')[next]?.focus()
  }
  return (
    <aside className="side">
      <nav className="mobile-tabs" ref={tabs} role="tablist" aria-label="Artwork settings" onKeyDown={tabKeydown}>
        {mobileTabs.map((tab) => <button className={`mobile-tab ${mobileTab === tab.key ? 'active' : ''}`} id={`mobile-tab-${tab.key}`} key={tab.key} type="button" role="tab" tabIndex={mobileTab === tab.key ? 0 : -1} aria-selected={mobileTab === tab.key} aria-controls={`mobile-panel-${tab.key}`} onClick={() => setmobileTab(tab.key)}>{tab.label}</button>)}
      </nav>
      <section className={`group mobile-panel ${mobileTab === 'layout' ? 'mobile-active' : ''}`} data-panel="layout" id="mobile-panel-layout" role="tabpanel" aria-labelledby="mobile-tab-layout">
        <h2>LAYOUT</h2>
        {views.map((item, idx) => <button className={`listrow ${view === idx ? 'active' : ''}`} key={item.key} onClick={() => setview(idx)}><span>{item.name.toUpperCase()}</span></button>)}
      </section>
      <section className={`group mobile-panel ${mobileTab === 'frame' ? 'mobile-active' : ''}`} data-panel="frame" id="mobile-panel-frame" role="tabpanel" aria-labelledby="mobile-tab-frame">
        <h2>FRAME</h2>
        {ratios.map((item, idx) => <button className={`listrow ${frame === idx ? 'active' : ''}`} key={item.key} onClick={() => setframe(idx)}><span>{item.name.toUpperCase()}</span><span className="rowvalue">{item.label}</span></button>)}
      </section>
      <section className={`group mobile-panel ${mobileTab === 'background' ? 'mobile-active' : ''}`} data-panel="background" id="mobile-panel-background" role="tabpanel" aria-labelledby="mobile-tab-background">
        <h2>BACKGROUND</h2>
        {backs.map((item, idx) => <button className={`listrow ${back === idx ? 'active' : ''}`} key={item.key} onClick={() => setback(idx)}><span>{item.name.toUpperCase()}</span></button>)}
      </section>
      <section className={`group mobile-panel ${mobileTab === 'finish' ? 'mobile-active' : ''}`} data-panel="finish" id="mobile-panel-finish" role="tabpanel" aria-labelledby="mobile-tab-finish">
        <h2>VINYL FINISH</h2>
        {finishes.map((item) => <button className={`listrow ${finish === item.key ? 'active' : ''}`} key={item.key} onClick={() => setfinish(item.key)}><span>{item.name}</span></button>)}
      </section>
      <section className={`group mobile-panel ${mobileTab === 'text' ? 'mobile-active' : ''}`} data-panel="text" id="mobile-panel-text" role="tabpanel" aria-labelledby="mobile-tab-text">
        <h2>TEXT</h2>
        <button className={`listrow ${songon ? 'active' : ''}`} onClick={() => setsongon(!songon)}><span>SONG NAME</span><span className="rowvalue">{songon ? 'ON' : 'OFF'}</span></button>
        <button className={`listrow ${artiston ? 'active' : ''}`} onClick={() => setartiston(!artiston)}><span>ARTIST</span><span className="rowvalue">{artiston ? 'ON' : 'OFF'}</span></button>
      </section>
      <section className={`group mobile-panel ${mobileTab === 'loop' ? 'mobile-active' : ''}`} data-panel="loop" id="mobile-panel-loop" role="tabpanel" aria-labelledby="mobile-tab-loop">
        <h2>VIDEO LOOP</h2>
        {loops.map((item) => <button className={`listrow ${loop === item ? 'active' : ''}`} key={item} onClick={() => setloop(item)}><span>{item * 4} SECOND LOOP</span><span className="rowvalue">{item} {item === 1 ? 'TURN' : 'TURNS'}</span></button>)}
      </section>
      <section className={`group mobile-panel ${mobileTab === 'export' ? 'mobile-active' : ''}`} data-panel="export" id="mobile-panel-export" role="tabpanel" aria-labelledby="mobile-tab-export">
        <h2>EXPORT</h2>
        <button className="listrow exportrow" disabled={!tune || !!busy} onClick={() => run('image')}><span>{busy === 'image' ? 'SAVING PNG…' : 'SAVE PNG'}</span></button>
        <button className="listrow exportrow" disabled={!tune || !!busy} onClick={() => run('video')}>
          <i style={{ transform: `scaleX(${busy === 'video' ? progress : 0})` }} />
          <span>{busy === 'video' ? `RECORDING ${Math.round(progress * 100)}%` : 'SAVE VIDEO'}</span>
        </button>
        {note && <p className="exporterror">{note}</p>}
      </section>
      <section className={`group mobile-panel ${mobileTab === 'more' ? 'mobile-active' : ''}`} data-panel="more" id="mobile-panel-more" role="tabpanel" aria-labelledby="mobile-tab-more">
        <h2>CONTROLS</h2>
        <button className={`listrow ${spin ? 'active' : ''}`} onClick={() => setspin(!spin)}><span>ROTATE VINYL</span><span className="rowvalue">{spin ? 'ON' : 'OFF'}</span></button>
        <p className="listrow helprow">DRAG TO ROTATE</p>
        <p className="listrow helprow">SCROLL TO ZOOM</p>
        <p className="listrow helprow">DOUBLE CLICK TO RESET</p>
      </section>
    </aside>
  )
}
