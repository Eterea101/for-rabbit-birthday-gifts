import { Container, Graphics, Assets, Sprite } from 'pixi.js'
import { gsap } from 'gsap'
import { COLORS, ASSETS, TIMING, CANVAS, SCENES } from '../utils/constants.js'

export class CandleScene {
  constructor(ctx) {
    this.ctx = ctx
    this.container = new Container()
    this._flame = null
    this._glow = null
    this._flickerTween = null
    this._advanced = false
  }

  async init() {
    const { DESIGN_WIDTH, DESIGN_HEIGHT } = CANVAS
    const cx = DESIGN_WIDTH / 2
    const cy = DESIGN_HEIGHT / 2

    const bg = new Graphics()
      .rect(0, 0, DESIGN_WIDTH, DESIGN_HEIGHT)
      .fill({ color: COLORS.background })
    this.container.addChild(bg)

    // Candle group
    const candleGroup = new Container()
    candleGroup.x = cx
    candleGroup.y = cy + 60

    // Warm glow circle behind flame
    this._glow = new Graphics()
      .circle(0, -140, 80)
      .fill({ color: COLORS.candleGlow, alpha: 0.15 })
    candleGroup.addChild(this._glow)

    // Candle body
    let candleLoaded = false
    try {
      const tex = await Assets.load(ASSETS.CANDLE)
      const sp = new Sprite(tex)
      sp.anchor.set(0.5, 1)
      sp.scale.set(0.5)
      candleGroup.addChild(sp)
      candleLoaded = true
    } catch {
      candleGroup.addChild(this._drawCandleBody())
    }

    // Flame
    this._flame = new Container()
    this._flame.x = 0
    this._flame.y = -170
    this._flame.addChild(this._drawFlame())
    candleGroup.addChild(this._flame)

    this.container.addChild(candleGroup)
    this._candleGroup = candleGroup

    // Fade in
    candleGroup.alpha = 0
  }

  async enter() {
    this.ctx.audio.play('blow')

    // Fade in
    await gsap.to(this._candleGroup, { alpha: 1, duration: 1, ease: 'power2.out' })

    // Flame flicker loop
    this._startFlicker()

    // Glow pulse
    gsap.to(this._glow, {
      alpha: 0.28,
      duration: 0.8,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1,
    })

    // Auto-advance after display time
    setTimeout(() => this._advance(), TIMING.CANDLE_DISPLAY_MS)
  }

  _startFlicker() {
    const flame = this._flame
    const flicker = () => {
      if (!flame.parent) return
      this._flickerTween = gsap.to(flame, {
        x: (Math.random() - 0.5) * 6,
        y: (Math.random() - 0.5) * 4 - 170,
        scaleX: 0.92 + Math.random() * 0.16,
        scaleY: 0.90 + Math.random() * 0.18,
        duration: TIMING.CANDLE_FLICKER_MS / 1000,
        ease: 'none',
        onComplete: flicker,
      })
    }
    flicker()
  }

  _advance() {
    if (this._advanced) return
    this._advanced = true
    this._flickerTween?.kill()
    // Blow out: flame fades with small smoke wisp
    this._blowOut().then(() => {
      this.ctx.sceneManager.goTo(SCENES.LETTER)
    })
  }

  async _blowOut() {
    const smoke = new Graphics()
      .ellipse(0, 0, 4, 10)
      .fill({ color: 0xCCCCCC, alpha: 0.5 })
    smoke.x = this._flame.x + this._candleGroup.x
    smoke.y = this._flame.y + this._candleGroup.y
    this.container.addChild(smoke)

    await Promise.all([
      gsap.to(this._flame, { alpha: 0, duration: 0.4 }),
      gsap.to(this._glow, { alpha: 0, duration: 0.6 }),
      gsap.to(smoke, { y: smoke.y - 50, alpha: 0, duration: 0.8, ease: 'power1.out' }),
    ])
    smoke.destroy()
  }

  update() {}

  async exit() {
    this._flickerTween?.kill()
    gsap.killTweensOf(this._glow)
  }

  destroy() {
    this._flickerTween?.kill()
    gsap.killTweensOf(this._glow)
    this.container.destroy({ children: true })
  }

  _drawCandleBody() {
    const g = new Graphics()
    // Candle shaft
    g.roundRect(-22, -160, 44, 160, 4)
      .fill({ color: 0xFFE0EC, alpha: 0.95 })
    g.roundRect(-22, -160, 44, 160, 4)
      .stroke({ color: COLORS.accentPink, width: 1.5, alpha: 0.4 })
    // Wax drip
    g.moveTo(-22, -120).bezierCurveTo(-30, -100, -28, -80, -22, -70)
      .stroke({ color: 0xFFD0E0, width: 10, lineCap: 'round' })
    // Wick
    g.moveTo(0, -160).lineTo(0, -172).stroke({ color: 0x6B4226, width: 2 })
    return g
  }

  _drawFlame() {
    const g = new Graphics()
    // Outer flame (warm yellow)
    g.moveTo(0, -30)
      .bezierCurveTo(14, -20, 12, 0, 0, 4)
      .bezierCurveTo(-12, 0, -14, -20, 0, -30)
      .fill({ color: COLORS.candleFlame, alpha: 0.9 })
    // Inner flame (brighter)
    g.moveTo(0, -22)
      .bezierCurveTo(7, -15, 6, -4, 0, -2)
      .bezierCurveTo(-6, -4, -7, -15, 0, -22)
      .fill({ color: 0xFFF0A0, alpha: 0.95 })
    return g
  }
}
