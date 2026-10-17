import { Color, ExtrudeGeometry, Group, Mesh, MeshStandardMaterial, Shape, ShapeGeometry, Texture } from 'three'

const SIZE = 2.06
const DEPTH = 0.038
const EDGE = 0.045

function shape() {
  const half = SIZE / 2
  const path = new Shape()
  path.moveTo(-half + EDGE, -half)
  path.lineTo(half - EDGE, -half)
  path.absarc(half - EDGE, -half + EDGE, EDGE, -Math.PI / 2, 0)
  path.lineTo(half, half - EDGE)
  path.absarc(half - EDGE, half - EDGE, EDGE, 0, Math.PI / 2)
  path.lineTo(-half + EDGE, half)
  path.absarc(-half + EDGE, half - EDGE, EDGE, Math.PI / 2, Math.PI)
  path.lineTo(-half, -half + EDGE)
  path.absarc(-half + EDGE, -half + EDGE, EDGE, Math.PI, Math.PI * 1.5)
  return path
}

export class Sleeve extends Group {
  private cover = new MeshStandardMaterial({ roughness: 0.72 })
  private side = new MeshStandardMaterial({ roughness: 0.84 })
  private rear = new MeshStandardMaterial({ roughness: 0.88 })
  private body: Mesh
  private print: Mesh

  constructor() {
    super()
    const bevel = 0.006
    const body = new ExtrudeGeometry(shape(), { depth: DEPTH, bevelEnabled: true, bevelSegments: 3, steps: 1, bevelSize: 0.012, bevelThickness: bevel, curveSegments: 8 })
    body.translate(0, 0, -DEPTH / 2)
    this.body = new Mesh(body, [this.side, this.rear])
    const print = new ShapeGeometry(shape(), 8)
    const pos = print.getAttribute('position')
    const uv = print.getAttribute('uv')
    for (let i = 0; i < pos.count; i++) uv.setXY(i, (pos.getX(i) + SIZE / 2) / SIZE, (pos.getY(i) + SIZE / 2) / SIZE)
    uv.needsUpdate = true
    this.print = new Mesh(print, this.cover)
    this.print.position.z = DEPTH / 2 + bevel + 0.002
    this.add(this.body, this.print)
  }

  paint(art: Texture, color: number) {
    const tone = new Color(color)
    this.cover.map = art
    this.cover.needsUpdate = true
    this.side.color.copy(tone).multiplyScalar(0.55)
    this.rear.color.copy(tone).multiplyScalar(0.3)
  }

  dispose() {
    this.body.geometry.dispose()
    this.print.geometry.dispose()
    this.cover.dispose()
    this.side.dispose()
    this.rear.dispose()
  }
}
