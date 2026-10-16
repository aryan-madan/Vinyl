import { useRef, useState } from 'react'
import { Head } from './components/Head'
import { Side } from './components/Side'
import { Foot } from './components/Foot'
import { View } from './components/View'
import { image, save, video } from './lib/export'
import { search, type Tune } from './lib/data'
import { backs, ratios, views } from './lib/views'
import type { Stage } from './lib/stage'
import './App.css'

function App() {
  const [word, setword] = useState('')
  const [hits, sethits] = useState<Tune[]>([])
  const [tune, settune] = useState<Tune | null>(null)
  const [view, setview] = useState(0)
  const [back, setback] = useState(0)
  const [frame, setframe] = useState(0)
  const [spin, setspin] = useState(true)
  const [songon, setsongon] = useState(true)
  const [artiston, setartiston] = useState(true)
  const [loop, setloop] = useState(2)
  const [busy, setbusy] = useState('')
  const [progress, setprogress] = useState(0)
  const [note, setnote] = useState('')
  const [status, setstatus] = useState('')
  const [expanded, setexpanded] = useState(false)
  const [playing, setplaying] = useState(false)
  const [time, settime] = useState(0)
  const [duration, setduration] = useState(0)
  const audio = useRef<HTMLAudioElement>(null)
  const stage = useRef<Stage | null>(null)
  const size = ratios[frame]

  async function find(term: string) {
    setword(term)
    setexpanded(Boolean(term.trim()))
    setstatus('')
    if (!term.trim()) {
      sethits([])
      setbusy('')
      return
    }
    sethits([])
    setbusy('search')
    setnote('')
    try {
      const rows = await search(term)
      sethits(rows)
      if (!rows.length) setstatus('NO SONGS FOUND')
    } catch {
      setstatus('SEARCH FAILED — TRY AGAIN')
    } finally {
      setbusy('')
    }
  }

  function pick(item: Tune) {
    settune(item)
    sethits([])
    setword(item.song.toUpperCase())
    setstatus('')
    setnote('')
    const track = audio.current
    if (track) {
      track.pause()
      track.currentTime = 0
      setplaying(false)
      settime(0)
      setduration(0)
      if (item.preview) {
        track.src = item.preview
        track.load()
        void track.play().catch(() => setplaying(false))
      } else {
        track.removeAttribute('src')
        track.load()
      }
    }
  }

  function toggle() {
    const track = audio.current
    if (!track || !tune?.preview) return
    if (track.paused) void track.play().catch(() => setplaying(false))
    else track.pause()
  }

  function reset() {
    const track = audio.current
    if (!track) return
    track.pause()
    track.currentTime = 0
    setplaying(false)
    settime(0)
  }

  async function run(kind: 'image' | 'video') {
    const target = stage.current
    if (!target || !tune) return
    setbusy(kind)
    setprogress(0)
    setnote('')
    try {
      const blob = kind === 'image'
        ? await image(target, size.width, size.height)
        : await video(target, size.width, size.height, loop, setprogress)
      const ext = kind === 'image' ? 'png' : blob.type.includes('mp4') ? 'mp4' : 'webm'
      const name = `${tune.artist} - ${tune.song}`.replace(/[\\/:*?"<>|]+/g, '')
      save(blob, `${name}.${ext}`)
    } catch {
      setnote(kind === 'video' ? 'VIDEO EXPORT FAILED' : 'IMAGE EXPORT FAILED')
    } finally {
      setbusy('')
      setprogress(0)
    }
  }

  return (
    <main className="page">
      <Head word={word} setword={setword} find={find} expanded={expanded} hits={hits} finding={busy === 'search'} status={status} pick={pick} />
      <Side tune={tune} busy={busy} note={note} view={view} setview={setview} back={back} setback={setback} frame={frame} setframe={setframe} spin={spin} setspin={setspin} songon={songon} setsongon={setsongon} artiston={artiston} setartiston={setartiston} loop={loop} setloop={setloop} progress={progress} run={run} />
      <section className="space" aria-label="Vinyl and cover preview">
        <View stage={stage} tune={tune} view={views[view].key} back={backs[back].key} frame={size} spin={spin} songon={songon} artiston={artiston} />
      </section>
      <audio ref={audio} onPlay={() => setplaying(true)} onPause={() => setplaying(false)} onTimeUpdate={(event) => settime(event.currentTarget.currentTime)} onLoadedMetadata={(event) => setduration(event.currentTarget.duration || 0)} onEnded={() => setplaying(false)} />
      <Foot tune={tune} playing={playing} time={time} duration={duration} toggle={toggle} reset={reset} />
    </main>
  )
}

export default App
