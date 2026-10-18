import type { Stage } from './stage'

const TYPES = ['video/mp4;codecs=avc1', 'video/webm;codecs=vp9', 'video/webm']

function drawBrand(ctx: CanvasRenderingContext2D, width: number, height: number) {
  const unit = Math.min(width, height)
  const size = unit * 0.02
  const margin = unit * 0.035
  ctx.save()
  ctx.fillStyle = '#fff'
  ctx.shadowColor = 'rgba(0, 0, 0, .55)'
  ctx.shadowBlur = unit * 0.008
  ctx.shadowOffsetY = unit * 0.002
  ctx.font = `600 ${size * 0.82}px Arial, sans-serif`
  ctx.textBaseline = 'middle'
  const word = 'VINYL'
  const wordWidth = ctx.measureText(word).width
  const middle = margin + size / 2
  ctx.fillText(word, width - margin - wordWidth, middle)
  ctx.restore()
}

export async function image(stage: Stage, width: number, height: number): Promise<Blob> {
  stage.size(width, height)
  stage.draw()
  try {
    const output = document.createElement('canvas')
    output.width = width
    output.height = height
    const ctx = output.getContext('2d')
    if (!ctx) throw new Error('canvas unavailable')
    ctx.drawImage(stage.canvas, 0, 0, width, height)
    drawBrand(ctx, width, height)
    return await new Promise((done, fail) => {
      output.toBlob((blob) => blob ? done(blob) : fail(new Error('empty')), 'image/png')
    })
  } finally {
    stage.restore()
  }
}

export async function video(stage: Stage, width: number, height: number, loops: number, progress: (value: number) => void) {
  if (typeof MediaRecorder === 'undefined') throw new Error('unsupported')
  const type = TYPES.find((item) => MediaRecorder.isTypeSupported(item))
  if (!type) throw new Error('unsupported')
  stage.size(width, height)
  stage.rewind()
  const limit = Math.PI * 2 * loops
  stage.cap = limit
  const bits: Blob[] = []
  const output = document.createElement('canvas')
  output.width = width
  output.height = height
  const ctx = output.getContext('2d')
  if (!ctx) {
    stage.restore()
    throw new Error('canvas unavailable')
  }
  const render = () => {
    ctx.drawImage(stage.canvas, 0, 0, width, height)
    drawBrand(ctx, width, height)
  }
  render()
  let rec: MediaRecorder
  try {
    rec = new MediaRecorder(output.captureStream(60), { mimeType: type, videoBitsPerSecond: 24_000_000 })
  } catch (err) {
    stage.restore()
    throw err
  }
  rec.ondataavailable = (event) => { if (event.data.size) bits.push(event.data) }
  return new Promise<Blob>((done, fail) => {
    let frame = 0
    rec.onerror = () => { cancelAnimationFrame(frame); stage.restore(); fail(new Error('recording failed')) }
    rec.onstop = () => {
      cancelAnimationFrame(frame)
      stage.restore()
      done(new Blob(bits, { type }))
    }
    rec.start()
    const poll = () => {
      render()
      const value = Math.min(stage.turned() / limit, 1)
      progress(value)
      if (value >= 1) rec.stop()
      else frame = requestAnimationFrame(poll)
    }
    frame = requestAnimationFrame(poll)
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
