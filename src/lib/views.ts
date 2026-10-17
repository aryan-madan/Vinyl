export type Layout = { dx: number; dy: number; sx: number; sy: number; show: number; wide: number; high: number }

export const layouts: Record<string, Layout> = {
  out: { dx: 0.74, dy: 0, sx: -0.72, sy: 0, show: 1, wide: 3.7, high: 2.4 },
  solo: { dx: 0, dy: 0, sx: -2.6, sy: 0, show: 0, wide: 2.3, high: 2.3 },
  peek: { dx: 0, dy: 0.49, sx: 0, sy: -0.46, show: 1, wide: 2.3, high: 3.1 },
}

export type View = { key: string; name: string; layout: string; yaw: number; pitch: number; roll: number; zoom: number; ox: number; oy: number }

export const views: View[] = [
  { key: 'showcase', name: 'Showcase', layout: 'out', yaw: 0, pitch: 0, roll: 0, zoom: 1, ox: 0, oy: 0 },
  { key: 'front', name: 'Front', layout: 'solo', yaw: 0, pitch: 0, roll: 0, zoom: 1, ox: 0, oy: 0 },
  { key: 'tilt', name: 'Tilt', layout: 'solo', yaw: -0.55, pitch: 0.3, roll: -0.08, zoom: 1, ox: 0, oy: 0 },
  { key: 'flat', name: 'Flat', layout: 'solo', yaw: 0, pitch: -1.1, roll: 0, zoom: 1.2, ox: 0, oy: 0 },
  { key: 'peek', name: 'Peek', layout: 'peek', yaw: 0.3, pitch: 0.08, roll: 0.04, zoom: 1, ox: 0, oy: 0 },
  { key: 'close', name: 'Close', layout: 'solo', yaw: 0.25, pitch: 0.12, roll: 0, zoom: 1.9, ox: -0.55, oy: 0 },
]

export const backs = [
  { key: 'art', name: 'Normal' },
  { key: 'blur', name: 'Blur' },
  { key: 'color', name: 'Color' },
]

export const ratios = [
  { key: 'story', name: 'Story', label: '9:16', width: 1080, height: 1920 },
  { key: 'portrait', name: 'Portrait', label: '4:5', width: 2160, height: 2700 },
  { key: 'square', name: 'Square', label: '1:1', width: 2160, height: 2160 },
]
