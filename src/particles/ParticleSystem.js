import { Container, ParticleContainer, Sprite, Assets, Graphics } from 'pixi.js'
import { COLORS, PARTICLES, ASSETS } from '../utils/constants.js'

const MODE = {
  FLOAT:     0,
  FORMING:   1,
  EXPLODING: 2,
  FORMED:    3,
}

export class ParticleSystem {
  constructor(pixi) {
    this.pixi = pixi
    this.container = new Container()

    this._pinkLayer = null
    this._goldLayer = null
    this._particles = []
    this._mode = MODE.FLOAT
    this._formProgress = 0
    this._formDuration = 0
    this._onFormComplete = null
    this._explodeProgress = 0
  }

  async init() {
    let tex
    try {
      tex = await Assets.load(ASSETS.PARTICLE_TEX)
    } catch {
      tex = this._makeCircleTex(PARTICLES.PARTICLE_RADIUS)
    }

    // PixiJS v8 ParticleContainer
    this._pinkLayer = new ParticleContainer({
      maxSize: PARTICLES.PINK_COUNT + PARTICLES.SHAPE_COUNT,
      dynamicProperties: { position: true, scale: true, alpha: true, tint: true },
    })
    this._goldLayer = new ParticleContainer({
      maxSize: PARTICLES.GOLD_COUNT,
      dynamicProperties: { position: true, alpha: true },
    })
    this.container.addChild(this._goldLayer, this._pinkLayer)

    // Pink float particles
    for (let i = 0; i < PARTICLES.PINK_COUNT; i++) {
      const sp = new Sprite(tex)
      sp.anchor.set(0.5)
      sp.tint = COLORS.particlePink
      sp.scale.set(0.7 + Math.random() * 0.7)
      sp.alpha = 0.35 + Math.random() * 0.5
      this._pinkLayer.addChild(sp)
      this._particles.push(this._makeParticle(sp, 'pink'))
    }

    // Gold background particles
    for (let i = 0; i < PARTICLES.GOLD_COUNT; i++) {
      const sp = new Sprite(tex)
      sp.anchor.set(0.5)
      sp.tint = COLORS.particleGold
      sp.scale.set(0.3 + Math.random() * 0.35)
      sp.alpha = 0.15 + Math.random() * 0.25
      this._goldLayer.addChild(sp)
      this._particles.push(this._makeParticle(sp, 'gold'))
    }
  }

  _makeParticle(sprite, layer) {
    return {
      sprite,
      layer,
      x:        Math.random() * 1280,
      y:        Math.random() * 720,
      vx:       (Math.random() - 0.5) * PARTICLES.FLOAT_SPEED * 2,
      vy:       -Math.random() * PARTICLES.FLOAT_SPEED - 0.08,
      phase:    Math.random() * Math.PI * 2,
      targetX:  0,
      targetY:  0,
      originX:  0,
      originY:  0,
    }
  }

  _makeCircleTex(r) {
    const g = new Graphics().circle(0, 0, r).fill(0xFFFFFF)
    return this.pixi.renderer.generateTexture(g)
  }

  update(deltaMS) {
    const dt = deltaMS / 16.67
    const t = performance.now() / 1000

    if (this._mode === MODE.FLOAT || this._mode === MODE.FORMED) {
      for (const p of this._particles) {
        if (this._mode === MODE.FLOAT) {
          p.x += p.vx * dt
          p.y += (p.vy + Math.sin(t * 0.8 + p.phase) * 0.15) * dt
          if (p.x < -12) p.x = 1292
          if (p.x > 1292) p.x = -12
          if (p.y < -12) p.y = 732
          if (p.y > 732) p.y = -12
        }
        p.sprite.x = p.x
        p.sprite.y = p.y
      }
    }

    if (this._mode === MODE.FORMING) {
      this._formProgress = Math.min(
        this._formProgress + deltaMS / this._formDuration,
        1,
      )
      const ease = this._easeOutCubic(this._formProgress)

      for (const p of this._particles) {
        p.x = p.originX + (p.targetX - p.originX) * ease
        p.y = p.originY + (p.targetY - p.originY) * ease
        p.sprite.x = p.x
        p.sprite.y = p.y
      }

      if (this._formProgress >= 1) {
        this._mode = MODE.FORMED
        const cb = this._onFormComplete
        this._onFormComplete = null
        cb?.()
      }
    }

    if (this._mode === MODE.EXPLODING) {
      this._explodeProgress = Math.min(this._explodeProgress + deltaMS / 800, 1)

      for (const p of this._particles) {
        p.x += p.vx * dt * 6
        p.y += p.vy * dt * 6
        p.sprite.alpha *= 0.975
        p.sprite.x = p.x
        p.sprite.y = p.y
      }

      if (this._explodeProgress >= 1) {
        this._mode = MODE.FLOAT
        this._resetToFloat()
      }
    }
  }

  // Move all particles to target points in a point cloud (normalized 0–1)
  formShape(pointCloud, durationMS = 2000, onComplete = null) {
    const W = 1280, H = 720
    this._formProgress = 0
    this._formDuration = durationMS
    this._mode = MODE.FORMING
    this._onFormComplete = onComplete

    for (let i = 0; i < this._particles.length; i++) {
      const p = this._particles[i]
      p.originX = p.x
      p.originY = p.y
      const pt = pointCloud[i % pointCloud.length]
      p.targetX = pt.x * W
      p.targetY = pt.y * H
    }
  }

  explode() {
    this._mode = MODE.EXPLODING
    this._explodeProgress = 0
    for (const p of this._particles) {
      const angle = Math.random() * Math.PI * 2
      const speed = 1.5 + Math.random() * 5
      p.vx = Math.cos(angle) * speed
      p.vy = Math.sin(angle) * speed - 1.5
    }
  }

  startFloat() {
    this._mode = MODE.FLOAT
    this._resetToFloat()
  }

  _resetToFloat() {
    for (const p of this._particles) {
      p.x = Math.random() * 1280
      p.y = Math.random() * 720
      p.vx = (Math.random() - 0.5) * PARTICLES.FLOAT_SPEED * 2
      p.vy = -Math.random() * PARTICLES.FLOAT_SPEED - 0.08
      p.sprite.alpha = p.layer === 'pink'
        ? 0.35 + Math.random() * 0.5
        : 0.15 + Math.random() * 0.25
    }
  }

  _easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3)
  }

  destroy() {
    this.container.destroy({ children: true })
    this._particles = []
  }
}
