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

  constructor() {
    super()
    this.bump = grooves()
    this.shine = sheen()
    this.face = new MeshPhysicalMaterial({ color: 0x0a0a0a, roughness: 0.75, roughnessMap: this.bump, bumpMap: this.bump, bumpScale: 1.2, anisotropy: 1, anisotropyMap: this.shine, clearcoat: 0.25, clearcoatRoughness: 0.15 })
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
    const tone = new Color(color)
    this.label.map = art
    this.label.needsUpdate = true
    this.edge.color.copy(tone)
    this.face.color.set(0x0a0a0a).lerp(tone, 0.2)
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
