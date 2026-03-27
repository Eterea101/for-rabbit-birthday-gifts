import { Container, Graphics, Text } from 'pixi.js'
import { gsap } from 'gsap'
import { GESTURES, GESTURE_SEQUENCE, COLORS, COLOR_HEX, CANVAS } from '../utils/constants.js'

const GESTURE_LABELS = {
  [GESTURES.FIVE]:   '张开手掌试试看～',
  [GESTURES.TWO]:    '比个 V 试试看～',
  [GESTURES.FIST]:   '握紧小拳拳～',
  [GESTURES.PRAYER]: '双手合十～',
}

export class FallbackUI {
  constructor(gestureManager) {
    this.gm = gestureManager
    this.container = new Container()
    this.container.alpha = 0
    this.container.zIndex = 9999
    this._inner = null
    this._tweens = []
  }

  show() {
    const gesture = this.gm.expectedGesture()
    if (!gesture) return

    // Remove previous button if any
    if (this._inner) {
      this._inner.destroy({ children: true })
      this._inner = null
    }

    const inner = new Container()

    // Pink flower: 5 petals + center circle
    const flower = new Graphics()
    for (let i = 0; i < 5; i++) {
      const angle = (i / 5) * Math.PI * 2 - Math.PI / 2
      flower
        .ellipse(Math.cos(angle) * 22, Math.sin(angle) * 22, 13, 19)
        .fill({ color: COLORS.particlePink, alpha: 0.92 })
    }
    flower.circle(0, 0, 15).fill(COLORS.accentPink)
    inner.addChild(flower)

    // Label
    const label = new Text({
      text: GESTURE_LABELS[gesture] ?? '点击继续',
      style: {
        fontSize: 14,
        fill: COLOR_HEX.textDark,
        fontFamily: 'serif',
        align: 'center',
      },
    })
    label.anchor.set(0.5)
    label.y = 50
    inner.addChild(label)

    inner.x = CANVAS.DESIGN_WIDTH / 2
    inner.y = CANVAS.DESIGN_HEIGHT - 70
    inner.cursor = 'pointer'
    inner.eventMode = 'static'
    inner.on('pointertap', () => this.gm.triggerFallback())

    // Gentle bob animation
    const tween = gsap.to(flower, {
      y: -6,
      duration: 1.2,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1,
    })
    this._tweens.push(tween)

    this.container.addChild(inner)
    this._inner = inner

    gsap.to(this.container, { alpha: 1, duration: 0.6, ease: 'power2.out' })
  }

  hide() {
    this._tweens.forEach(t => t.kill())
    this._tweens = []
    gsap.to(this.container, {
      alpha: 0,
      duration: 0.4,
      onComplete: () => {
        if (this._inner) {
          this._inner.destroy({ children: true })
          this._inner = null
        }
      },
    })
  }

  destroy() {
    this._tweens.forEach(t => t.kill())
    gsap.killTweensOf(this.container)
    this.container.destroy({ children: true })
  }
}
