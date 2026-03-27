import { Container, Graphics, BlurFilter } from 'pixi.js'
import { gsap } from 'gsap'
import { COLORS, TIMING, CANVAS, SCENES } from '../utils/constants.js'

export class DreamTransitionScene {
  constructor(ctx) {
    this.ctx = ctx
    this.container = new Container()
    this._advanced = false
    this._sparkles = []
    this._bgRect = null
    this._blurFilter = null
  }

  async init() {
    const { DESIGN_WIDTH, DESIGN_HEIGHT } = CANVAS

    // Background
    this._bgRect = new Graphics()
      .rect(0, 0, DESIGN_WIDTH, DESIGN_HEIGHT)
      .fill({ color: COLORS.background })
    this.container.addChild(this._bgRect)

    // White overlay for fade-to-white effect
    this._whiteOverlay = new Graphics()
      .rect(0, 0, DESIGN_WIDTH, DESIGN_HEIGHT)
      .fill({ color: 0xFFFFFF, alpha: 0 })
    this.container.addChild(this._whiteOverlay)

    // Sparkle particles that float upward
    this._sparkleLayer = new Container()
    this.container.addChild(this._sparkleLayer)

    // Blur filter on the scene content
    this._blurFilter = new BlurFilter()
    this._blurFilter.blur = 0
    this.container.filters = [this._blurFilter]
  }

  async enter() {
    this.ctx.audio.play('chime')

    const tl = gsap.timeline({
      onComplete: () => this._advance(),
    })

    // Phase 1: blur up
    tl.to(this._blurFilter, { blur: 18, duration: 1.2, ease: 'power2.in' })

    // Phase 2: fade to white simultaneously
    tl.to(this._whiteOverlay, { alpha: 1, duration: 0.8, ease: 'power2.out' }, '-=0.4')

    // Spawn sparkles from various positions
    for (let i = 0; i < 12; i++) {
      const delay = Math.random() * 0.8
      tl.call(() => this._spawnSparkle(), null, delay)
    }

    // Phase 3: blur back to 0 as new scene (particles) fades in
    tl.to(this._blurFilter, { blur: 0, duration: 0.8, ease: 'power2.out' })
    tl.to(this._whiteOverlay, { alpha: 0, duration: 0.6 }, '-=0.6')
  }

  _spawnSparkle() {
    const { DESIGN_WIDTH, DESIGN_HEIGHT } = CANVAS
    const g = new Graphics()
      .star(0, 0, 4, 6, 2)
      .fill({ color: COLORS.particlePink, alpha: 0.9 })
    g.x = Math.random() * DESIGN_WIDTH
    g.y = DESIGN_HEIGHT * (0.4 + Math.random() * 0.5)
    this._sparkleLayer.addChild(g)
    this._sparkles.push(g)

    gsap.to(g, {
      y: g.y - 60 - Math.random() * 80,
      alpha: 0,
      rotation: Math.random() * Math.PI,
      duration: 1.5 + Math.random() * 1,
      ease: 'power1.out',
      onComplete: () => {
        g.destroy()
        this._sparkles = this._sparkles.filter(s => s !== g)
      },
    })
  }

  _advance() {
    if (this._advanced) return
    this._advanced = true
    this.ctx.sceneManager.goTo(SCENES.PARTICLE_WORLD)
  }

  update() {}

  async exit() {
    gsap.killTweensOf(this._blurFilter)
    gsap.killTweensOf(this._whiteOverlay)
  }

  destroy() {
    gsap.killTweensOf(this._blurFilter)
    this.container.filters = []
    this.container.destroy({ children: true })
  }
}
