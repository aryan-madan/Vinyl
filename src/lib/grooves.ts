import { CanvasTexture } from 'three'

export const HOLE = 0.024
export const LABEL = 0.34

const SIZE = 2048
const GAPS = [0.5, 0.61, 0.7, 0.79, 0.88]

export function grooves() {
  const canvas = document.createElement('canvas')
  canvas.width = SIZE
  canvas.height = SIZE
  const ctx = canvas.getContext('2d')!
  const mid = SIZE / 2
  ctx.fillStyle = 'rgb(110,110,110)'
  ctx.fillRect(0, 0, SIZE, SIZE)
  ctx.lineWidth = 1.4
  const start = mid * (LABEL + 0.03)
  const pitch = 3.2
  const turns = Math.floor((mid * 0.972 - start) / pitch)
  for (let turn = 0; turn < turns; turn += 1) {
    const val = 65 + Math.random() * 135
    ctx.strokeStyle = `rgb(${val},${val},${val})`
    ctx.beginPath()
    for (let step = 0; step <= 72; step += 1) {
      const part = step / 72
      const angle = (turn + part) * Math.PI * 2
      const rad = start + (turn + part) * pitch
      const x = mid + Math.cos(angle) * rad
      const y = mid + Math.sin(angle) * rad
      if (step === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    }
    ctx.stroke()
  }
  ctx.lineWidth = 7
  ctx.strokeStyle = 'rgb(110,110,110)'
  for (const gap of GAPS) {
    ctx.beginPath()
    ctx.arc(mid, mid, mid * gap, 0, Math.PI * 2)
    ctx.stroke()
  }
  const tex = new CanvasTexture(canvas)
  tex.anisotropy = 16
  return tex
}

export function sheen() {
  const size = 1024
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!
  const pix = ctx.createImageData(size, size)
  const half = size / 2
  for (let py = 0; py < size; py += 1) {
    for (let px = 0; px < size; px += 1) {
      const x = (px + 0.5 - half) / half
      const y = (half - py - 0.5) / half
      const rad = Math.hypot(x, y) || 1
      const idx = (py * size + px) * 4
      pix.data[idx] = (-y / rad) * 127.5 + 127.5
      pix.data[idx + 1] = (x / rad) * 127.5 + 127.5
      pix.data[idx + 2] = 255
      pix.data[idx + 3] = 255
    }
  }
  ctx.putImageData(pix, 0, 0)
  const tex = new CanvasTexture(canvas)
  tex.anisotropy = 16
  return tex
}
