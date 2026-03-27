import { Container, Graphics, Assets, Sprite } from 'pixi.js'
import { gsap } from 'gsap'
import { COLORS, ASSETS, TIMING, CANVAS, SCENES } from '../utils/constants.js'

export class RabbitEntranceScene {
  constructor(ctx) {
    this.ctx = ctx
    this.container = new Container()
    this._rabbit = null
    this._timeline = null
    this._advanced = false
    this._sparkles = []
    this._sparkleTimer = null
  }

  async init() {
    const bg = new Graphics()
      .rect(0, 0, CANVAS.DESIGN_WIDTH, CANVAS.DESIGN_HEIGHT)
      .fill({ color: COLORS.background })
    this.container.addChild(bg)

    // Load rabbit sprite or draw placeholder
    let rabbitTex
    try {
      rabbitTex = await Assets.load(ASSETS.RABBIT_IDLE)
    } catch {
      rabbitTex = null
    }

    const rabbitContainer = new Container()

    if (rabbitTex) {
      const sp = new Sprite(rabbitTex)
      sp.anchor.set(0.5)
      sp.scale.set(0.5)
      rabbitContainer.addChild(sp)
    } else {
      rabbitContainer.addChild(this._drawRabbit())
    }

    rabbitContainer.x = -100
    rabbitContainer.y = CANVAS.DESIGN_HEIGHT / 2 + 20
    this.container.addChild(rabbitContainer)
    this._rabbit = rabbitContainer
  }

  async enter() {
    this.ctx.audio.play('whoosh')

    const cx = CANVAS.DESIGN_WIDTH / 2
    const cy = CANVAS.DESIGN_HEIGHT / 2 + 20

    // Hop path: 4 arcs across the screen
    const hopPoints = [
      { x: 160, y: cy - 30 },
      { x: 320, y: cy + 10 },
      { x: 480, y: cy - 40 },
      { x: cx,  y: cy - 10 },
    ]

    this._timeline = gsap.timeline({ onComplete: () => this._onArrived() })

    for (const pt of hopPoints) {
      const midY = Math.min(this._rabbit.y, pt.y) - 60
      this._timeline
        .to(this._rabbit, {
          motionPath: {
            path: [
              { x: this._rabbit.x, y: this._rabbit.y },
              { x: (this._rabbit.x + pt.x) / 2, y: midY },
              { x: pt.x, y: pt.y },
            ],
            type: 'cubic',
          },
          duration: 0.5,
          ease: 'power1.inOut',
          onUpdate: () => {
            // Squash & stretch during hop
            const progress = this._timeline?.progress() ?? 0
            this._rabbit.scale.y = 0.9 + Math.sin(progress * Math.PI * 8) * 0.12
            this._rabbit.scale.x = 1 / this._rabbit.scale.y
          },
        })
    }

    // Idle wiggle after arrival
    this._timeline.to(this._rabbit, { x: cx, y: cy, duration: 0.3, ease: 'back.out(1.5)' })
    this._timeline.to(this._rabbit.scale, { x: 1, y: 1, duration: 0.2 })

    // Sparkle particles near the rabbit
    this._sparkleTimer = setInterval(() => this._spawnSparkle(), 300)

    // Auto-advance after entrance duration
    setTimeout(() => this._advance(), TIMING.RABBIT_ENTRANCE_MS)
  }

  _onArrived() {
    // Gentle idle bob
    gsap.to(this._rabbit, {
      y: this._rabbit.y - 8,
      duration: 0.8,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1,
    })
  }

  _spawnSparkle() {
    const spark = new Graphics()
      .star(0, 0, 4, 8, 3)
      .fill({ color: COLORS.accentPink, alpha: 0.8 })
    const rx = (Math.random() - 0.5) * 80
    const ry = (Math.random() - 0.5) * 100
    spark.x = this._rabbit.x + rx
    spark.y = this._rabbit.y + ry - 40
    this.container.addChild(spark)
    this._sparkles.push(spark)

    gsap.to(spark, {
      y: spark.y - 30,
      alpha: 0,
      duration: 0.8,
      ease: 'power1.out',
      onComplete: () => {
        spark.destroy()
        this._sparkles = this._sparkles.filter(s => s !== spark)
      },
    })
  }

  _advance() {
    if (this._advanced) return
    this._advanced = true
    this.ctx.sceneManager.goTo(SCENES.CLOCK_REWIND)
  }

  update() {}

  async exit() {
    clearInterval(this._sparkleTimer)
    this._timeline?.kill()
    gsap.killTweensOf(this._rabbit)
  }

  destroy() {
    clearInterval(this._sparkleTimer)
    this._timeline?.kill()
    gsap.killTweensOf(this._rabbit)
    this.container.destroy({ children: true })
  }

  _drawRabbit() {
    const g = new Graphics()
    const c = COLORS.particlePink
    const d = COLORS.accentPink
    g.ellipse(0, 0, 32, 42).fill(c)
    g.circle(0, -52, 26).fill(c)
    g.ellipse(-13, -90, 9, 22).fill(c)
    g.ellipse(13, -90, 9, 22).fill(c)
    g.circle(-9, -55, 4).fill(d)
    g.circle(9, -55, 4).fill(d)
    g.ellipse(0, -47, 4, 3).fill(d)
    return g
  }
}
