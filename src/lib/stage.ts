import { CanvasTexture, Clock, Color, DirectionalLight, DoubleSide, Group, Mesh, MeshBasicMaterial, NeutralToneMapping, PMREMGenerator, PerspectiveCamera, PlaneGeometry, Scene, Texture, WebGLRenderer } from 'three'
import { Disc } from './record'
import { Sleeve } from './sleeve'
import { image, plain, plate, soft, wash } from './palette'
import { layouts, views } from './views'
import type { View } from './views'

const SPEED = Math.PI / 2
const spots = [
  { max: 0.7, song: 0.77, artist: 0.805, solo: 0.787 },
  { max: 0.9, song: 0.79, artist: 0.825, solo: 0.807 },
  { max: Infinity, song: 0.82, artist: 0.855, solo: 0.837 },
]

type Pose = { yaw: number; pitch: number; roll: number; zoom: number; ox: number; oy: number; dx: number; dy: number; sx: number; sy: number; show: number; wide: number; high: number }

const clamp = (value: number, low: number, high: number) => Math.min(Math.max(value, low), high)

function target(view: View): Pose {
  return { yaw: view.yaw, pitch: view.pitch, roll: view.roll, zoom: view.zoom, ox: view.ox, oy: view.oy, ...layouts[view.layout] }
}

const KEYS = Object.keys(target(views[0])) as (keyof Pose)[]

function studio() {
  const room = new Scene()
  room.background = new Color(0x08080a)
  const panel = (w: number, h: number, x: number, y: number, z: number, power: number) => {
    const mat = new MeshBasicMaterial({ color: new Color().setScalar(power), side: DoubleSide })
    const mesh = new Mesh(new PlaneGeometry(w, h), mat)
    mesh.position.set(x, y, z)
    mesh.lookAt(0, 0, 0)
    room.add(mesh)
  }
  panel(10, 5, 0, 9, 1, 5)
  panel(1.6, 10, -8, 1, 4, 9)
  panel(1.6, 10, 8, 1, 2, 4)
  panel(12, 2.5, 0, -4, 8, 1.4)
  panel(7, 7, 0, 2, -9, 2.5)
  return room
}

export class Stage {
  readonly canvas: HTMLCanvasElement
  cap = Infinity
  private renderer: WebGLRenderer
  private scene = new Scene()
  private rig = new Group()
  private camera = new PerspectiveCamera(30, 1, 0.1, 60)
  private labelcanvas!: HTMLCanvasElement
  private labelmap!: CanvasTexture
  private label!: Mesh
  private labelsize = 1600
  private ratio = 0
  private song = ''
  private artist = ''
  private songon = true
  private artiston = true
  private disc = new Disc()
  private sleeve = new Sleeve()
  private clock = new Clock()
  private watcher: ResizeObserver
  private holder: HTMLElement
  private art: Texture | null = null
  private plates: Record<string, CanvasTexture> = {}
  private mode = 'art'
  private now: Pose
  private goal: Pose
  private base: View = views[0]
  private drag: { x: number; y: number } | null = null
  private angle = 0
  private spinning = true
  private prior = true
  private busy = false

  constructor(holder: HTMLElement) {
    this.holder = holder
    this.now = target(views[0])
    this.goal = { ...this.now }
    this.labelcanvas = document.createElement('canvas')
    this.labelcanvas.width = 1024
    this.labelcanvas.height = 1600
    this.labelmap = new CanvasTexture(this.labelcanvas)
    const labelmat = new MeshBasicMaterial({ map: this.labelmap, transparent: true, depthTest: false, depthWrite: false, side: DoubleSide, toneMapped: false })
    this.label = new Mesh(new PlaneGeometry(1, 1), labelmat)
    this.label.renderOrder = 10
    this.label.visible = false
    this.renderer = new WebGLRenderer({ antialias: true, preserveDrawingBuffer: true })
    this.renderer.toneMapping = NeutralToneMapping
    this.canvas = this.renderer.domElement
    holder.appendChild(this.canvas)
    const env = studio()
    const pmrem = new PMREMGenerator(this.renderer)
    this.scene.environment = pmrem.fromScene(env, 0.03).texture
    pmrem.dispose()
    env.traverse((item) => {
      if (!(item instanceof Mesh)) return
      item.geometry.dispose()
      const mats = Array.isArray(item.material) ? item.material : [item.material]
      mats.forEach((mat) => mat.dispose())
    })
    this.scene.environmentIntensity = 1.1
    this.scene.background = new Color(0x858585)
    const key = new DirectionalLight(0xffffff, 0.9)
    key.position.set(-2, 3, 5)
    const fill = new DirectionalLight(0xbfd4ff, 0.25)
    fill.position.set(3, -1, 3)
    this.rig.rotation.order = 'YXZ'
    this.rig.add(this.sleeve, this.disc)
    this.camera.add(this.label)
    this.scene.add(key, fill, this.rig, this.camera)
    this.canvas.addEventListener('pointerdown', this.down)
    this.canvas.addEventListener('pointermove', this.move)
    this.canvas.addEventListener('pointerup', this.up)
    this.canvas.addEventListener('pointercancel', this.up)
    this.canvas.addEventListener('wheel', this.wheel, { passive: false })
    this.canvas.addEventListener('dblclick', this.reset)
    this.watcher = new ResizeObserver(this.resize)
    this.watcher.observe(holder)
    this.resize()
    this.renderer.setAnimationLoop(this.tick)
  }

  load(img: HTMLImageElement, color: number) {
    const art = image(img)
    this.disc.paint(art, color)
    this.sleeve.paint(art, color)
    this.art?.dispose()
    this.art = art
    for (const back of Object.values(this.plates)) back.dispose()
    this.plates = { art: plate(plain(img)), blur: plate(soft(img)), color: plate(wash(color)) }
    this.backdrop(this.mode)
  }

  backdrop(mode: string) {
    this.mode = mode
    const back = this.plates[mode]
    if (back) this.scene.background = back
  }

  view(key: string) {
    const found = views.find((item) => item.key === key)
    if (!found) return
    this.base = found
    this.goal = target(found)
  }

  play(on: boolean) {
    this.spinning = on
  }

  format(width: number, height: number) {
    this.ratio = width / height
    this.resize()
    this.write()
    this.draw()
  }

  caption(song: string, artist: string, songon: boolean, artiston: boolean) {
    this.song = song
    this.artist = artist
    this.songon = songon
    this.artiston = artiston
    this.write()
  }

  size(width: number, height: number) {
    this.busy = true
    this.drag = null
    this.prior = this.spinning
    Object.assign(this.now, this.goal)
    this.renderer.setPixelRatio(1)
    this.renderer.setSize(width, height, false)
    this.camera.aspect = width / height
    this.camera.updateProjectionMatrix()
    this.labelsize = height
    this.ratio = this.camera.aspect
    this.write()
  }

  restore() {
    this.busy = false
    this.cap = Infinity
    this.spinning = this.prior
    this.resize()
    this.labelsize = 1600
    this.ratio = this.camera.aspect
    this.write()
  }

  rewind() {
    this.angle = 0
    this.spinning = true
    this.clock.getDelta()
  }

  turned() {
    return this.angle
  }

  draw() {
    this.apply()
    this.renderer.render(this.scene, this.camera)
  }

  destroy() {
    this.renderer.setAnimationLoop(null)
    this.watcher.disconnect()
    this.canvas.removeEventListener('pointerdown', this.down)
    this.canvas.removeEventListener('pointermove', this.move)
    this.canvas.removeEventListener('pointerup', this.up)
    this.canvas.removeEventListener('pointercancel', this.up)
    this.canvas.removeEventListener('wheel', this.wheel)
    this.canvas.removeEventListener('dblclick', this.reset)
    this.renderer.dispose()
    this.label.geometry.dispose()
    const labelmats = Array.isArray(this.label.material) ? this.label.material : [this.label.material]
    labelmats.forEach((mat) => mat.dispose())
    this.labelmap.dispose()
    this.disc.dispose()
    this.sleeve.dispose()
    this.art?.dispose()
    this.scene.environment?.dispose()
    Object.values(this.plates).forEach((back) => back.dispose())
    this.canvas.remove()
  }

  private dist() {
    const tan = Math.tan((this.camera.fov * Math.PI) / 360)
    const { wide, high, zoom } = this.now
    return Math.max(high / 2 / tan, wide / 2 / (tan * this.camera.aspect)) / zoom
  }

  private apply() {
    const pose = this.now
    this.rig.rotation.set(pose.pitch, pose.yaw, pose.roll)
    this.rig.position.set(pose.ox, pose.oy, 0)
    this.disc.position.set(pose.dx, pose.dy, 0)
    this.disc.visible = true
    this.sleeve.position.set(pose.sx, pose.sy, 0)
    this.sleeve.scale.setScalar(Math.max(pose.show, 0.001))
    this.sleeve.visible = pose.show > 0.01
    this.camera.position.set(0, 0, this.dist())
    const height = 2 * Math.tan((this.camera.fov * Math.PI) / 360)
    this.label.position.set(0, 0, -1)
    this.label.scale.set(height * this.camera.aspect, height, 1)
    if (this.ratio !== this.camera.aspect) {
      this.ratio = this.camera.aspect
      this.write()
    }
    const back = this.scene.background
    if (back instanceof Texture) {
      const ratio = this.camera.aspect
      back.repeat.set(ratio < 1 ? ratio : 1, ratio > 1 ? 1 / ratio : 1)
      back.offset.set((1 - back.repeat.x) / 2, (1 - back.repeat.y) / 2)
    }
  }

  private write() {
    const height = this.labelsize
    const ratio = this.ratio || this.camera.aspect
    const width = Math.max(512, Math.round(height * ratio))
    const spot = spots.find((item) => ratio <= item.max) ?? spots[2]
    if (this.labelcanvas.width !== width || this.labelcanvas.height !== height) {
      this.labelcanvas.width = width
      this.labelcanvas.height = height
    }
    const ctx = this.labelcanvas.getContext('2d')
    if (!ctx) return
    ctx.clearRect(0, 0, width, height)
    const rows = [this.songon && this.song, this.artiston && this.artist].filter(Boolean)
    this.label.visible = Boolean(rows.length || this.song || this.artist)
    if (!this.label.visible) {
      this.labelmap.needsUpdate = true
      return
    }
    const shade = ctx.createLinearGradient(0, height * 0.52, 0, height)
    shade.addColorStop(0, 'rgba(0,0,0,0)')
    shade.addColorStop(1, 'rgba(0,0,0,0.62)')
    ctx.fillStyle = shade
    ctx.fillRect(0, height * 0.52, width, height * 0.48)
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillStyle = '#fff'
    ctx.shadowColor = 'rgba(0,0,0,0.55)'
    ctx.shadowBlur = 12
    ctx.textAlign = 'center'
    const max = width * 0.82
    const fit = (text: string, weight: number, start: number) => {
      let size = start
      ctx.font = `${weight} ${size}px system-ui, -apple-system, BlinkMacSystemFont, sans-serif`
      while (size > 24 && ctx.measureText(text).width > max) {
        size -= 2
        ctx.font = `${weight} ${size}px system-ui, -apple-system, BlinkMacSystemFont, sans-serif`
      }
      return size
    }
    if (rows.length === 2) {
      ctx.font = `600 ${fit(this.song, 600, height * 0.04)}px system-ui, -apple-system, BlinkMacSystemFont, sans-serif`
      ctx.fillText(this.song, width / 2, height * spot.song)
      ctx.font = `400 ${fit(this.artist, 400, height * 0.022)}px system-ui, -apple-system, BlinkMacSystemFont, sans-serif`
      ctx.fillText(this.artist, width / 2, height * spot.artist)
    } else if (rows.length && this.songon && this.song) {
      ctx.font = `600 ${fit(this.song, 600, height * 0.04)}px system-ui, -apple-system, BlinkMacSystemFont, sans-serif`
      ctx.fillText(this.song, width / 2, height * spot.solo)
    } else if (rows.length) {
      ctx.font = `400 ${fit(this.artist, 400, height * 0.022)}px system-ui, -apple-system, BlinkMacSystemFont, sans-serif`
      ctx.fillText(this.artist, width / 2, height * spot.solo)
    }
    ctx.shadowBlur = 0
    ctx.textAlign = 'center'
    ctx.font = `700 ${height * 0.022}px 'Clash Display', sans-serif`
    ctx.fillStyle = 'rgba(255,255,255,0.8)'
    ctx.fillText('VINYL', width / 2, height * 0.12)
    ctx.textAlign = 'center'
    ctx.font = `400 ${height * 0.018}px system-ui, -apple-system, BlinkMacSystemFont, sans-serif`
    ctx.fillStyle = 'rgba(255,255,255,0.58)'
    ctx.fillText('vinyl.aryan.am', width / 2, height * 0.94)
    this.labelmap.needsUpdate = true
  }

  private down = (event: PointerEvent) => {
    if (this.busy) return
    this.drag = { x: event.clientX, y: event.clientY }
    this.canvas.setPointerCapture(event.pointerId)
  }

  private move = (event: PointerEvent) => {
    if (!this.drag || this.busy) return
    this.goal.yaw = clamp(this.goal.yaw + (event.clientX - this.drag.x) * 0.006, -1.4, 1.4)
    this.goal.pitch = clamp(this.goal.pitch + (event.clientY - this.drag.y) * 0.006, -1.5, 1.2)
    this.drag = { x: event.clientX, y: event.clientY }
  }

  private up = () => { this.drag = null }

  private wheel = (event: WheelEvent) => {
    event.preventDefault()
    if (this.busy) return
    this.goal.zoom = clamp(this.goal.zoom * Math.exp(-event.deltaY * 0.0012), 0.6, 3.5)
  }

  private reset = () => {
    if (!this.busy) this.goal = target(this.base)
  }

  private resize = () => {
    if (this.busy) return
    const width = this.holder.clientWidth
    const height = this.holder.clientHeight
    if (!width || !height) return
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    this.renderer.setSize(width, height, false)
    this.camera.aspect = width / height
    this.camera.updateProjectionMatrix()
  }

  private tick = () => {
    const dt = Math.min(this.clock.getDelta(), 0.05)
    if (this.spinning) this.angle = Math.min(this.angle + dt * SPEED, this.cap)
    const ease = 1 - Math.exp(-dt * 6)
    for (const key of KEYS) this.now[key] += (this.goal[key] - this.now[key]) * ease
    this.disc.rotation.z = -this.angle
    this.draw()
  }
}
