import type { Stage } from './stage'

const TYPES = ['video/mp4;codecs=avc1', 'video/webm;codecs=vp9', 'video/webm']

export function image(stage: Stage, width: number, height: number): Promise<Blob> {
  stage.size(width, height)
  stage.draw()
  return new Promise((done, fail) => {
    stage.canvas.toBlob((blob) => {
      stage.restore()
      if (blob) done(blob)
      else fail(new Error('empty'))
    }, 'image/png')
  })
}

export function video(stage: Stage, width: number, height: number, loops: number, progress: (value: number) => void) {
  if (typeof MediaRecorder === 'undefined') return Promise.reject(new Error('unsupported'))
  const type = TYPES.find((item) => MediaRecorder.isTypeSupported(item))
  if (!type) return Promise.reject(new Error('unsupported'))
  stage.size(width, height)
  stage.rewind()
  const limit = Math.PI * 2 * loops
  stage.cap = limit
  const bits: Blob[] = []
  let rec: MediaRecorder
  try {
    rec = new MediaRecorder(stage.canvas.captureStream(60), { mimeType: type, videoBitsPerSecond: 24_000_000 })
  } catch (err) {
    stage.restore()
    return Promise.reject(err)
  }
  rec.ondataavailable = (event) => { if (event.data.size) bits.push(event.data) }
  return new Promise<Blob>((done, fail) => {
    rec.onerror = () => { stage.restore(); fail(new Error('recording failed')) }
    rec.onstop = () => {
      stage.restore()
      done(new Blob(bits, { type }))
    }
    rec.start()
    const poll = () => {
      const value = Math.min(stage.turned() / limit, 1)
      progress(value)
      if (value >= 1) rec.stop()
      else requestAnimationFrame(poll)
    }
    requestAnimationFrame(poll)
  })
}

export function save(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = name
  link.click()
  window.setTimeout(() => URL.revokeObjectURL(url), 4000)
}
