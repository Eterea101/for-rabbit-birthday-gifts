import { Container, Graphics, Assets, Sprite } from 'pixi.js'
import { gsap } from 'gsap'
import { COLORS, ASSETS, TIMING, CANVAS, SCENES } from '../utils/constants.js'

const CLOCK_R = 210      // radius of clock face
const RABBIT_PATH_R = 235 // radius rabbit runs along

export class ClockRewindScene {
  constructor(ctx) {
    this.ctx = ctx
    this.container = new Container()
    this._clock = null
    this._hourHand = null
    this._minuteHand = null
    this._rabbit = null
    this._angle = Math.PI / 2   // start at bottom (6 o'clock position)
    this._speed = 0.002          // radians per ms (slow start)
    this._elapsed = 0
    this._advanced = false
    this._trail = []
    this._speedTween = null
  }

  async init() {
    const { DESIGN_WIDTH, DESIGN_HEIGHT } = CANVAS
    const cx = DESIGN_WIDTH / 2
    const cy = DESIGN_HEIGHT / 2

    const bg = new Graphics()
      .rect(0, 0, DESIGN_WIDTH, DESIGN_HEIGHT)
      .fill({ color: COLORS.background })
    this.container.addChild(bg)

    // Clock container centered
    this._clock = new Container()
    this._clock.x = cx
    this._clock.y = cy
    this.container.addChild(this._clock)

    // Try to load clock sprite; fall back to Graphics
    let clockLoaded = false
    try {
      const tex = await Assets.load(ASSETS.CLOCK_BG)
      const sp = new Sprite(tex)
      sp.anchor.set(0.5)
      sp.scale.set(CLOCK_R * 2 / sp.texture.width)
      this._clock.addChild(sp)
      clockLoaded = true
    } catch {
      this._clock.addChild(this._drawClockFace())
    }

    // Hour hand
    try {
      const tex = await Assets.load(ASSETS.CLOCK_HAND_HOUR)
      const sp = new Sprite(tex)
      sp.anchor.set(0.5, 0.9)
      sp.scale.set(0.5)
      this._hourHand = sp
    } catch {
      this._hourHand = this._drawHand(CLOCK_R * 0.55, 6, COLORS.textDark)
    }
    this._clock.addChild(this._hourHand)

    // Minute hand
    try {
      const tex = await Assets.load(ASSETS.CLOCK_HAND_MIN)
      const sp = new Sprite(tex)
      sp.anchor.set(0.5, 0.9)
      sp.scale.set(0.5)
      this._minuteHand = sp
    } catch {
      this._minuteHand = this._drawHand(CLOCK_R * 0.75, 4, COLORS.accentPink)
    }
    this._clock.addChild(this._minuteHand)

    // Rabbit
    this._rabbit = new Container()
    this._rabbit.addChild(this._drawSmallRabbit())
    this.container.addChild(this._rabbit)

    // Trail container (behind rabbit)
    this._trailContainer = new Container()
    this._trailContainer.alpha = 0.5
    this.container.addChild(this._trailContainer)
    this.container.addChild(this._rabbit)  // ensure rabbit is on top

    // Fade in the clock
    this._clock.alpha = 0
    gsap.to(this._clock, { alpha: 1, duration: 1 })
  }

  async enter() {
    // Speed ramp: slow → very fast over the duration
    const speedObj = { speed: 0.0015 }
    this._speed = speedObj.speed
    this._speedTween = gsap.to(speedObj, {
      speed: 0.025,
      duration: TIMING.CLOCK_REWIND_MS / 1000 * 0.85,
      ease: 'power2.in',
      onUpdate: () => {
        this._speed = speedObj.speed
      },
    })
  }

  update(deltaMS) {
    if (this._advanced) return

    this._elapsed += deltaMS
    this._angle -= this._speed * deltaMS  // counterclockwise

    const { DESIGN_WIDTH, DESIGN_HEIGHT } = CANVAS
    const cx = DESIGN_WIDTH / 2
    const cy = DESIGN_HEIGHT / 2

    // Rabbit position on circular path
    this._rabbit.x = cx + Math.cos(this._angle) * RABBIT_PATH_R
    this._rabbit.y = cy + Math.sin(this._angle) * RABBIT_PATH_R
    // Rabbit faces tangent direction
    this._rabbit.rotation = this._angle + Math.PI / 2

    // Clock hands (minute spins 12x faster than hour, both counterclockwise)
    this._minuteHand.rotation = -this._angle * 4
    this._hourHand.rotation   = -this._angle * 0.5

    // Trail: add a sparkle every ~80ms at high speeds
    if (this._speed > 0.008 && this._elapsed % 80 < deltaMS) {
      this._addTrail()
    }

    // Auto-advance
    if (this._elapsed >= TIMING.CLOCK_REWIND_MS) {
      this._advance()
    }
  }

  _addTrail() {
    const dot = new Graphics()
      .circle(0, 0, 3 + Math.random() * 3)
      .fill({ color: COLORS.particlePink, alpha: 0.7 })
    dot.x = this._rabbit.x
    dot.y = this._rabbit.y
    this._trailContainer.addChild(dot)
    this._trail.push(dot)

    gsap.to(dot, {
      alpha: 0,
      duration: 0.5,
      onComplete: () => {
        dot.destroy()
        this._trail = this._trail.filter(t => t !== dot)
      },
    })
  }

  _advance() {
    if (this._advanced) return
    this._advanced = true
    this._speedTween?.kill()
    this.ctx.sceneManager.goTo(SCENES.DREAM_TRANSITION)
  }

  async exit() {
    this._speedTween?.kill()
  }

  destroy() {
    this._speedTween?.kill()
    gsap.killTweensOf(this._clock)
    this.container.destroy({ children: true })
  }

  _drawClockFace() {
    const g = new Graphics()
    // Outer ring
    g.circle(0, 0, CLOCK_R).fill({ color: 0xFFF5F8, alpha: 0.95 })
    g.circle(0, 0, CLOCK_R).stroke({ color: COLORS.accentPink, width: 3, alpha: 0.6 })

    // Hour markers
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2 - Math.PI / 2
      const r1 = CLOCK_R - 8
      const r2 = CLOCK_R - 20
      g.moveTo(Math.cos(a) * r1, Math.sin(a) * r1)
       .lineTo(Math.cos(a) * r2, Math.sin(a) * r2)
       .stroke({ color: COLORS.textDark, width: i % 3 === 0 ? 3 : 1.5, alpha: 0.5 })
    }

    // Center dot
    g.circle(0, 0, 6).fill(COLORS.accentPink)

    return g
  }

  _drawHand(length, width, color) {
    const g = new Graphics()
    g.moveTo(0, 8).lineTo(0, -length)
    g.stroke({ color, width, lineCap: 'round' })
    return g
  }

  _drawSmallRabbit() {
    const g = new Graphics()
    const c = COLORS.particlePink
    const d = COLORS.accentPink
    g.ellipse(0, 4, 14, 18).fill(c)
    g.circle(0, -14, 12).fill(c)
    g.ellipse(-6, -30, 4, 10).fill(c)
    g.ellipse(6, -30, 4, 10).fill(c)
    g.circle(-4, -16, 2).fill(d)
    g.circle(4, -16, 2).fill(d)
    return g
  }
}
