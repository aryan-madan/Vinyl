import { useEffect, useRef, useState } from 'react'
import type { CSSProperties, RefObject } from 'react'
import type { Tune } from '../lib/data'
import type { Stage } from '../lib/stage'

type Props = {
  stage: RefObject<Stage | null>
  tune: Tune | null
  view: string
  back: string
  frame: { width: number; height: number }
  spin: boolean
  songon: boolean
  artiston: boolean
}

export function View({ stage, tune, view, back, frame, spin, songon, artiston }: Props) {
  const holder = useRef<HTMLDivElement>(null)
  const [ready, setready] = useState(false)
  const [note, setnote] = useState('')

  useEffect(() => {
    if (!holder.current) return
    let live = true
    let room: Stage | null = null
    import('../lib/stage').then(({ Stage: Model }) => {
      if (!live || !holder.current) return
      holder.current.replaceChildren()
      room = new Model(holder.current)
      stage.current = room
      setready(true)
    }).catch(() => {
      if (live) setnote('3D PREVIEW UNAVAILABLE')
    })
    return () => {
      live = false
      if (room) {
        room.destroy()
        if (stage.current === room) stage.current = null
      }
    }
  }, [stage])

  useEffect(() => {
    if (!ready || !tune || !stage.current) return
    let live = true
    import('../lib/palette').then(({ load, dominant }) => load(tune.art).then((img) => {
      if (!live || !stage.current) return
      stage.current.load(img, dominant(img))
      setnote('')
    })).catch(() => {
      if (live) setnote('ARTWORK COULD NOT LOAD')
    })
    return () => { live = false }
  }, [ready, stage, tune])

  useEffect(() => { if (ready) stage.current?.view(view) }, [ready, stage, view])
  useEffect(() => { if (ready) stage.current?.format(frame.width, frame.height) }, [ready, stage, frame])
  useEffect(() => { if (ready) stage.current?.backdrop(back) }, [ready, stage, back])
  useEffect(() => { if (ready) stage.current?.play(spin) }, [ready, stage, spin])
  useEffect(() => { if (ready) stage.current?.caption(tune?.song ?? 'Pick a song', tune?.artist ?? 'Aryan Madan', songon, artiston) }, [ready, stage, tune, songon, artiston])

  return (
    <div className="arena">
      <div className="frame" style={{ '--w': frame.width, '--h': frame.height, '--ratio': frame.width / frame.height } as CSSProperties}>
        <div className="canvas" ref={holder} />
        {note && <span className="viewerror">{note}</span>}
      </div>
    </div>
  )
}
