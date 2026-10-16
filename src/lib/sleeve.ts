import { BoxGeometry, Color, Mesh, MeshStandardMaterial, Texture } from 'three'

export class Sleeve extends Mesh {
  private cover = new MeshStandardMaterial({ roughness: 0.6 })
  private side = new MeshStandardMaterial({ roughness: 0.8 })
  private rear = new MeshStandardMaterial({ roughness: 0.8 })

  constructor() {
    super(new BoxGeometry(2.06, 2.06, 0.03))
    this.material = [this.side, this.side, this.side, this.side, this.cover, this.rear]
  }

  paint(art: Texture, color: number) {
    const tone = new Color(color)
    this.cover.map = art
    this.cover.needsUpdate = true
    this.side.color.copy(tone).multiplyScalar(0.55)
    this.rear.color.copy(tone).multiplyScalar(0.3)
  }

  dispose() {
    this.geometry.dispose()
    this.cover.dispose()
    this.side.dispose()
    this.rear.dispose()
  }
}
