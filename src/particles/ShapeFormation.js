import { PARTICLES } from '../utils/constants.js'

export class ShapeFormation {
  static async loadRabbitPoints() {
    try {
      const res = await fetch(PARTICLES.RABBIT_POINTS_PATH)
      if (!res.ok) throw new Error('not found')
      const data = await res.json()
      return data.points
    } catch {
      return ShapeFormation._generateRabbitFallback()
    }
  }

  static async loadBirthdayPoints() {
    try {
      const res = await fetch(PARTICLES.BIRTHDAY_POINTS_PATH)
      if (!res.ok) throw new Error('not found')
      const data = await res.json()
      return data.points
    } catch {
      return ShapeFormation._generateTextFallback()
    }
  }

  // Procedural rabbit silhouette: body (ellipse) + head (circle) + ears (two tall ellipses)
  static _generateRabbitFallback(count = 350) {
    const pts = []
    const cx = 0.5, cy = 0.55

    const sample = (shapeFn, n) => {
      for (let i = 0; i < n; i++) shapeFn(i, n)
    }

    // Body
    sample((i, n) => {
      const angle = (i / n) * Math.PI * 2
      const rx = 0.08 + Math.random() * 0.03
      const ry = 0.12 + Math.random() * 0.03
      pts.push({ x: cx + Math.cos(angle) * rx, y: cy + Math.sin(angle) * ry })
    }, 120)

    // Head
    sample((i, n) => {
      const angle = (i / n) * Math.PI * 2
      const r = 0.055 + Math.random() * 0.015
      pts.push({ x: cx + Math.cos(angle) * r, y: (cy - 0.18) + Math.sin(angle) * r })
    }, 80)

    // Left ear
    sample((i, n) => {
      const angle = (i / n) * Math.PI * 2
      pts.push({
        x: (cx - 0.04) + Math.cos(angle) * 0.025,
        y: (cy - 0.3) + Math.sin(angle) * 0.06,
      })
    }, 60)

    // Right ear
    sample((i, n) => {
      const angle = (i / n) * Math.PI * 2
      pts.push({
        x: (cx + 0.04) + Math.cos(angle) * 0.025,
        y: (cy - 0.3) + Math.sin(angle) * 0.06,
      })
    }, 60)

    // Tail
    sample((i, n) => {
      const angle = (i / n) * Math.PI * 2
      const r = 0.025 + Math.random() * 0.01
      pts.push({ x: (cx + 0.1) + Math.cos(angle) * r, y: (cy + 0.08) + Math.sin(angle) * r })
    }, 30)

    return pts.slice(0, count)
  }

  // Procedural "生日快乐" — 4 columns of clustered particles
  static _generateTextFallback(count = 350) {
    const pts = []
    const chars = 4
    const perChar = Math.ceil(count / chars)
    const cy = 0.5

    for (let c = 0; c < chars; c++) {
      const cx = 0.14 + c * 0.24
      for (let i = 0; i < perChar; i++) {
        pts.push({
          x: cx + (Math.random() - 0.5) * 0.18,
          y: cy + (Math.random() - 0.5) * 0.28,
        })
      }
    }
    return pts.slice(0, count)
  }

  // Utility: sample points from a rendered canvas element
  // Run in browser console: ShapeFormation.sampleFromCanvas(canvas, 350)
  static sampleFromCanvas(canvas, count = 350) {
    const ctx = canvas.getContext('2d')
    const { width, height } = canvas
    const imageData = ctx.getImageData(0, 0, width, height)
    const pixels = []

    for (let y = 0; y < height; y += 3) {
      for (let x = 0; x < width; x += 3) {
        const i = (y * width + x) * 4
        if (imageData.data[i + 3] > 128) {
          pixels.push({ x: x / width, y: y / height })
        }
      }
    }

    // Subsample to desired count
    const step = Math.max(1, Math.floor(pixels.length / count))
    const sampled = pixels.filter((_, i) => i % step === 0).slice(0, count)
    console.log(JSON.stringify({ points: sampled }))
    return sampled
  }
}
