import { Color, CylinderGeometry, DoubleSide, Group, Mesh, MeshPhysicalMaterial, MeshStandardMaterial, RingGeometry, Texture } from 'three'
import { HOLE, LABEL, grooves, sheen } from './grooves'

const THICK = 0.014
const SEGS = 192

export class Disc extends Group {
  private face: MeshPhysicalMaterial
  private edge: MeshStandardMaterial
  private label: MeshStandardMaterial
  private bump: ReturnType<typeof grooves>
  private shine: ReturnType<typeof sheen>
  private tone = new Color(0x222222)
  private style = 'black'

  constructor() {
    super()
    this.bump = grooves()
    this.shine = sheen()
    this.face = new MeshPhysicalMaterial({ color: 0x0a0a0a, roughness: 0.75, roughnessMap: this.bump, bumpMap: this.bump, bumpScale: 1.2, anisotropy: 1, anisotropyMap: this.shine, clearcoat: 0.7, clearcoatRoughness: 0.09 })
    this.edge = new MeshStandardMaterial({ color: 0x111111, roughness: 0.35, side: DoubleSide })
    this.label = new MeshStandardMaterial({ roughness: 0.55, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 })
    const plate = new RingGeometry(HOLE, 1, SEGS, 1)
    const top = new Mesh(plate, this.face)
    top.position.z = THICK / 2
    const bottom = new Mesh(plate, this.face)
    bottom.rotation.y = Math.PI
    bottom.position.z = -THICK / 2
    const disk = new RingGeometry(HOLE, LABEL, 96, 1)
    const front = new Mesh(disk, this.label)
    front.position.z = THICK / 2 + 0.0004
    const back = new Mesh(disk, this.label)
    back.rotation.y = Math.PI
    back.position.z = -THICK / 2 - 0.0004
    const rim = new CylinderGeometry(1, 1, THICK, SEGS, 1, true)
    rim.rotateX(Math.PI / 2)
    const bore = new CylinderGeometry(HOLE, HOLE, THICK, 48, 1, true)
    bore.rotateX(Math.PI / 2)
    this.add(top, bottom, front, back, new Mesh(rim, this.edge), new Mesh(bore, this.edge))
  }

  paint(art: Texture, color: number) {
    this.tone.set(color)
    this.label.map = art
    this.label.needsUpdate = true
    this.finish(this.style)
  }

  finish(style: string) {
    this.style = style
    this.face.map = null
    this.face.transparent = style === 'translucent'
    this.face.opacity = style === 'translucent' ? 0.76 : 1
    this.face.transmission = style === 'translucent' ? 0.32 : 0
    this.face.thickness = style === 'translucent' ? 0.08 : 0
    this.face.roughness = style === 'translucent' ? 0.22 : 0.75
    if (style === 'black') this.edge.color.set(0x050505)
    else this.edge.color.copy(this.tone).multiplyScalar(0.55)
    this.face.color.set(0x0a0a0a)
    if (style === 'color' || style === 'translucent') this.face.color.copy(this.tone).multiplyScalar(style === 'color' ? 0.62 : 0.72)
    this.face.needsUpdate = true
  }

  dispose() {
    for (const item of this.children) if (item instanceof Mesh) item.geometry.dispose()
    this.face.dispose()
    this.edge.dispose()
    this.label.dispose()
    this.bump.dispose()
    this.shine.dispose()
  }
}
