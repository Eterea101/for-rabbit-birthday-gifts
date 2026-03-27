import { Container, Graphics, Text } from 'pixi.js'
import { gsap } from 'gsap'
import { COLORS, COLOR_HEX, CANVAS, SCENES } from '../utils/constants.js'
import { AssetLoader } from '../utils/AssetLoader.js'

export class LoadingScene {
  constructor(ctx) {
    this.ctx = ctx
    this.container = new Container()
    this._tweens = []
    this._clickable = false
    this._bar = null
    this._barBg = null
    this._label = null
    this._enterBtn = null
    this._dots = null
    this._dotTween = null
  }

  async init() {
    const { DESIGN_WIDTH, DESIGN_HEIGHT } = CANVAS
    const cx = DESIGN_WIDTH / 2
    const cy = DESIGN_HEIGHT / 2

    // Background tint
    const bg = new Graphics()
      .rect(0, 0, DESIGN_WIDTH, DESIGN_HEIGHT)
      .fill({ color: COLORS.background })
    this.container.addChild(bg)

    // Decorative rabbit silhouette (placeholder)
    const rabbit = this._drawRabbit()
    rabbit.x = cx
    rabbit.y = cy - 120
    this.container.addChild(rabbit)

    // Loading label
    this._label = new Text({
      text: '少女心满载中',
      style: { fontSize: 22, fill: COLOR_HEX.textDark, fontFamily: 'serif' },
    })
    this._label.anchor.set(0.5)
    this._label.x = cx
    this._label.y = cy + 20
    this.container.addChild(this._label)

    // Animated dots
    this._dots = new Text({
      text: '...',
      style: { fontSize: 22, fill: COLOR_HEX.accentPink, fontFamily: 'serif' },
    })
    this._dots.anchor.set(0, 0.5)
    this._dots.x = cx + this._label.width / 2 + 4
    this._dots.y = cy + 20
    this.container.addChild(this._dots)

    // Progress bar background
    const barW = 320, barH = 10
    this._barBg = new Graphics()
      .roundRect(cx - barW / 2, cy + 54, barW, barH, 5)
      .fill({ color: COLORS.accentPink, alpha: 0.25 })
    this.container.addChild(this._barBg)

    // Progress bar fill
    this._bar = new Graphics()
    this._bar.x = cx - barW / 2
    this._bar.y = cy + 54
    this._barWidth = barW
    this._barH = barH
    this.container.addChild(this._bar)
    this._updateBar(0)
  }

  async enter() {
    // Dots blinking
    let dotCount = 0
    this._dotTween = gsap.to({}, {
      duration: 0.5,
      repeat: -1,
      onRepeat: () => {
        dotCount = (dotCount + 1) % 4
        this._dots.text = '.'.repeat(dotCount)
      },
    })

    // Start loading all assets while progress bar fills
    await AssetLoader.loadAll((progress) => {
      gsap.to({ p: this._currentProgress ?? 0 }, {
        p: progress,
        duration: 0.3,
        onUpdate: function () {
          // accessed via closure
        },
      })
      this._currentProgress = progress
      this._updateBar(progress)
    })

    // Loading done — show enter button
    this._updateBar(1)
    this._dotTween?.kill()
    this._dots.text = ''
    this._label.text = '准备好了！'
    this._showEnterButton()
  }

  _updateBar(progress) {
    const w = Math.max(4, this._barWidth * progress)
    this._bar.clear()
      .roundRect(0, 0, w, this._barH, 5)
      .fill({ color: COLORS.accentPink, alpha: 0.85 })
  }

  _showEnterButton() {
    const { DESIGN_WIDTH, DESIGN_HEIGHT } = CANVAS
    const cx = DESIGN_WIDTH / 2

    const btnContainer = new Container()
    btnContainer.x = cx
    btnContainer.y = DESIGN_HEIGHT / 2 + 100
    btnContainer.alpha = 0

    const bg = new Graphics()
      .roundRect(-80, -22, 160, 44, 22)
      .fill({ color: COLORS.particlePink, alpha: 0.9 })
    btnContainer.addChild(bg)

    const text = new Text({
      text: '点击进入 ✨',
      style: { fontSize: 18, fill: COLOR_HEX.textDark, fontFamily: 'serif' },
    })
    text.anchor.set(0.5)
    btnContainer.addChild(text)

    btnContainer.cursor = 'pointer'
    btnContainer.eventMode = 'static'
    btnContainer.on('pointertap', () => this._onEnter())

    // Pulse
    gsap.to(btnContainer.scale, {
      x: 1.05, y: 1.05,
      duration: 1,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1,
    })

    this.container.addChild(btnContainer)
    this._enterBtn = btnContainer
    gsap.to(btnContainer, { alpha: 1, duration: 0.6 })
  }

  _onEnter() {
    if (this._clickable === false) {
      this._clickable = true
    }
    this.ctx.audio.init()
    this.ctx.audio.startBGM()
    // Start camera in background (non-blocking)
    this.ctx.gesture.initCamera()
    this.ctx.sceneManager.goTo(SCENES.RABBIT_ENTRANCE)
  }

  update() {}

  async exit() {
    this._dotTween?.kill()
    await gsap.to(this.container, { alpha: 0, duration: 0.3 })
  }

  destroy() {
    this._dotTween?.kill()
    gsap.killTweensOf(this.container)
    this.container.destroy({ children: true })
  }

  _drawRabbit() {
    const g = new Graphics()
    const c = COLORS.particlePink
    const d = COLORS.accentPink
    // Body
    g.ellipse(0, 0, 35, 45).fill(c)
    // Head
    g.circle(0, -55, 28).fill(c)
    // Ears
    g.ellipse(-14, -98, 10, 24).fill(c)
    g.ellipse(14, -98, 10, 24).fill(c)
    // Eyes
    g.circle(-10, -58, 5).fill(d)
    g.circle(10, -58, 5).fill(d)
    // Nose
    g.ellipse(0, -50, 4, 3).fill(d)
    // Sparkles
    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI * 2
      const r = 55 + Math.random() * 15
      g.star(Math.cos(angle) * r, Math.sin(angle) * r - 20, 4, 8, 3).fill({ color: d, alpha: 0.6 })
    }
    return g
  }
}
