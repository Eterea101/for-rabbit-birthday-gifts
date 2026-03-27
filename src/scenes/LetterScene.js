import { Container, Graphics, Text, Assets, Sprite } from 'pixi.js'
import { gsap } from 'gsap'
import { COLORS, COLOR_HEX, CANVAS, SCENES, GESTURES, LETTER_TEXT } from '../utils/constants.js'
import { GestureHint } from '../ui/GestureHint.js'
import { FallbackUI } from '../gesture/FallbackUI.js'

export class LetterScene {
  constructor(ctx) {
    this.ctx = ctx
    this.container = new Container()
    this._hint = null
    this._fallback = null
    this._scroll = null
    this._scrollContent = null
    this._unsubs = []
    this._opened = false
  }

  async init() {
    const { DESIGN_WIDTH, DESIGN_HEIGHT } = CANVAS

    const bg = new Graphics()
      .rect(0, 0, DESIGN_WIDTH, DESIGN_HEIGHT)
      .fill({ color: COLORS.background })
    this.container.addChild(bg)

    // Scroll/parchment
    this._scroll = new Container()
    this._scroll.x = DESIGN_WIDTH / 2
    this._scroll.y = DESIGN_HEIGHT / 2
    this._scroll.scale.y = 0   // collapsed initially
    this.container.addChild(this._scroll)

    // Parchment background
    let parchmentDrawn = false
    try {
      const tex = await Assets.load('/assets/sprites/scroll-bg.png')
      const sp = new Sprite(tex)
      sp.anchor.set(0.5)
      sp.width = 560
      sp.height = 680
      this._scroll.addChild(sp)
      parchmentDrawn = true
    } catch {
      this._scroll.addChild(this._drawParchment())
    }

    // Decorative border
    const border = new Graphics()
      .roundRect(-268, -334, 536, 668, 12)
      .stroke({ color: COLORS.accentPink, width: 2, alpha: 0.5 })
    this._scroll.addChild(border)

    // Inner floral corner decorations
    this._scroll.addChild(this._drawCornerFlowers())

    // Letter text (hidden, revealed after unfurl)
    this._letterText = new Text({
      text: LETTER_TEXT,
      style: {
        fontSize: 17,
        fill: COLOR_HEX.textDark,
        fontFamily: 'serif',
        wordWrap: true,
        wordWrapWidth: 460,
        lineHeight: 28,
        align: 'left',
      },
    })
    this._letterText.anchor.set(0.5, 0.5)
    this._letterText.alpha = 0
    this._scroll.addChild(this._letterText)

    // Hint and fallback
    this._hint = new GestureHint()
    this.container.addChild(this._hint.container)
    this._fallback = new FallbackUI(this.ctx.gesture)
    this.container.addChild(this._fallback.container)

    // Replay button (hidden initially)
    this._replayBtn = this._buildReplayBtn()
    this._replayBtn.alpha = 0
    this.container.addChild(this._replayBtn)
  }

  async enter() {
    this._hint.show(GESTURES.PRAYER)

    const unsubPrayer = this.ctx.gesture.on(`gesture:${GESTURES.PRAYER}`, () => {
      this._openScroll()
    })
    this._unsubs.push(unsubPrayer)

    this.ctx.gesture.armFallback(() => {
      this._fallback.show()
    })
  }

  _openScroll() {
    if (this._opened) return
    this._opened = true

    this._hint.hide()
    this._fallback.hide()
    this.ctx.gesture.disarmFallback()
    this.ctx.audio.play('letter')

    // Unfurl animation
    gsap.to(this._scroll.scale, {
      y: 1,
      duration: 1.2,
      ease: 'back.out(1.2)',
      onComplete: () => {
        // Fade in text with stagger feel
        gsap.to(this._letterText, { alpha: 1, duration: 1, ease: 'power2.out', delay: 0.2 })
        // Show replay button
        setTimeout(() => gsap.to(this._replayBtn, { alpha: 1, duration: 0.6 }), 3000)
      },
    })
  }

  _buildReplayBtn() {
    const btn = new Container()
    btn.x = CANVAS.DESIGN_WIDTH / 2
    btn.y = CANVAS.DESIGN_HEIGHT - 48

    const bg = new Graphics()
      .roundRect(-70, -18, 140, 36, 18)
      .fill({ color: COLORS.particlePink, alpha: 0.8 })
    btn.addChild(bg)

    const label = new Text({
      text: '再看一遍 ✨',
      style: { fontSize: 16, fill: COLOR_HEX.textDark, fontFamily: 'serif' },
    })
    label.anchor.set(0.5)
    btn.addChild(label)

    btn.cursor = 'pointer'
    btn.eventMode = 'static'
    btn.on('pointertap', () => {
      // Reload page for replay
      window.location.reload()
    })

    return btn
  }

  _drawParchment() {
    const g = new Graphics()
    g.roundRect(-268, -334, 536, 668, 12)
      .fill({ color: COLORS.scrollPaper, alpha: 0.97 })
    // Subtle texture lines
    for (let y = -310; y < 310; y += 28) {
      g.moveTo(-240, y).lineTo(240, y)
        .stroke({ color: COLORS.accentPink, width: 0.5, alpha: 0.15 })
    }
    return g
  }

  _drawCornerFlowers() {
    const g = new Graphics()
    const corners = [
      { x: -252, y: -318 },
      { x:  252, y: -318 },
      { x: -252, y:  318 },
      { x:  252, y:  318 },
    ]
    for (const { x, y } of corners) {
      for (let i = 0; i < 5; i++) {
        const angle = (i / 5) * Math.PI * 2
        g.ellipse(x + Math.cos(angle) * 9, y + Math.sin(angle) * 9, 5, 8)
          .fill({ color: COLORS.particlePink, alpha: 0.6 })
      }
      g.circle(x, y, 5).fill({ color: COLORS.accentPink, alpha: 0.7 })
    }
    return g
  }

  update() {}

  async exit() {
    this._unsubs.forEach(u => u())
    this._unsubs = []
    this.ctx.gesture.disarmFallback()
  }

  destroy() {
    this._unsubs.forEach(u => u())
    this._hint?.destroy()
    this._fallback?.destroy()
    gsap.killTweensOf(this._scroll.scale)
    this.container.destroy({ children: true })
  }
}
