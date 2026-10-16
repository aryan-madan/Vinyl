import { CanvasTexture, SRGBColorSpace, Texture } from 'three'

export function load(src: string): Promise<HTMLImageElement> {
  return new Promise((done, fail) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => done(img)
    img.onerror = fail
    img.src = src
  })
}

export function dominant(img: HTMLImageElement): number {
  const size = 48
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d', { willReadFrequently: true })!
  ctx.drawImage(img, 0, 0, size, size)
  const { data } = ctx.getImageData(0, 0, size, size)
  const buckets = new Map<number, number[]>()
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]
    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    if (max < 40 || min > 225) continue
    const sat = (max - min) / max
    const weight = 0.2 + sat * sat
    const key = ((r >> 5) << 6) | ((g >> 5) << 3) | (b >> 5)
    const bin = buckets.get(key) ?? [0, 0, 0, 0]
    bin[0] += r * weight
    bin[1] += g * weight
    bin[2] += b * weight
    bin[3] += weight
    buckets.set(key, bin)
  }
  let best: number[] | undefined
  for (const bin of buckets.values()) if (!best || bin[3] > best[3]) best = bin
  if (!best) return 0x222222
  const r = Math.round(best[0] / best[3])
  const g = Math.round(best[1] / best[3])
  const b = Math.round(best[2] / best[3])
  return (r << 16) | (g << 8) | b
}

function shade(ctx: CanvasRenderingContext2D, size: number, dark: number) {
  ctx.fillStyle = `rgba(0, 0, 0, ${dark})`
  ctx.fillRect(0, 0, size, size)
  const glow = ctx.createRadialGradient(size / 2, size / 2, size * 0.1, size / 2, size / 2, size * 0.75)
  glow.addColorStop(0, 'rgba(0, 0, 0, 0)')
  glow.addColorStop(1, 'rgba(0, 0, 0, 0.6)')
  ctx.fillStyle = glow
  ctx.fillRect(0, 0, size, size)
}

function sweep(from: Uint8ClampedArray, to: Uint8ClampedArray, size: number, radius: number, across: boolean) {
  const span = radius * 2 + 1
  for (let line = 0; line < size; line += 1) {
    for (let c = 0; c < 3; c += 1) {
      const at = (i: number) => {
        const j = Math.min(size - 1, Math.max(0, i))
        return (across ? line * size + j : j * size + line) * 4 + c
      }
      let sum = 0
      for (let i = -radius; i <= radius; i += 1) sum += from[at(i)]
      for (let i = 0; i < size; i += 1) {
        to[at(i)] = sum / span
        sum += from[at(i + radius + 1)] - from[at(i - radius)]
      }
    }
  }
}

function smooth(ctx: CanvasRenderingContext2D, size: number, radius: number, passes: number) {
  const pixels = ctx.getImageData(0, 0, size, size)
  const temp = new Uint8ClampedArray(pixels.data.length)
  for (let p = 0; p < passes; p += 1) {
    sweep(pixels.data, temp, size, radius, true)
    sweep(temp, pixels.data, size, radius, false)
  }
  ctx.putImageData(pixels, 0, 0)
}

export function plain(img: HTMLImageElement) {
  const size = 512
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(img, 0, 0, size, size)
  shade(ctx, size, 0.35)
  return canvas
}

export function soft(img: HTMLImageElement) {
  const tiny = 64
  const small = document.createElement('canvas')
  small.width = tiny
  small.height = tiny
  const sctx = small.getContext('2d', { willReadFrequently: true })!
  sctx.imageSmoothingQuality = 'high'
  sctx.drawImage(img, 0, 0, tiny, tiny)
  smooth(sctx, tiny, 5, 3)
  const size = 512
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(small, 0, 0, size, size)
  shade(ctx, size, 0.3)
  return canvas
}

function tone(color: number, k: number) {
  const r = Math.min(255, Math.round(((color >> 16) & 255) * k))
  const g = Math.min(255, Math.round(((color >> 8) & 255) * k))
  const b = Math.min(255, Math.round((color & 255) * k))
  return `rgb(${r}, ${g}, ${b})`
}

export function wash(color: number) {
  const size = 512
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!
  const field = ctx.createRadialGradient(size / 2, size * 0.4, 10, size / 2, size / 2, size * 0.8)
  field.addColorStop(0, tone(color, 1.05))
  field.addColorStop(0.55, tone(color, 0.62))
  field.addColorStop(1, tone(color, 0.28))
  ctx.fillStyle = field
  ctx.fillRect(0, 0, size, size)
  return canvas
}

export function plate(canvas: HTMLCanvasElement) {
  const tex = new CanvasTexture(canvas)
  tex.colorSpace = SRGBColorSpace
  return tex
}

export function image(img: HTMLImageElement) {
  const tex = new Texture(img)
  tex.colorSpace = SRGBColorSpace
  tex.anisotropy = 8
  tex.needsUpdate = true
  return tex
}
