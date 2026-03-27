import { Container, Graphics, Text } from 'pixi.js'
import { gsap } from 'gsap'
import { GESTURES, COLORS, COLOR_HEX, CANVAS } from '../utils/constants.js'

const HINT_DATA = {
  [GESTURES.FIVE]: {
    label: '张开五指\n召唤魔法～',
    rabbitPose: 'arms_open',
  },
  [GESTURES.TWO]: {
    label: '比个 V\n翻翻照片～',
    rabbitPose: 'v_ears',
  },
  [GESTURES.FIST]: {
    label: '握紧小拳头\n集中能量～',
    rabbitPose: 'fist',
  },
  [GESTURES.PRAYER]: {
    label: '双手合十\n许个心愿～',
    rabbitPose: 'prayer',
  },
}

export class GestureHint {
  constructor() {
    this.container = new Container()
    this.container.alpha = 0
    this._inner = null
    this._floatTween = null
  }

  show(gesture) {
    this._clearInner()

    const data = HINT_DATA[gesture]
    if (!data) return

    const inner = new Container()

    // Mini rabbit sketch (programmatic stand-in)
    const rabbit = this._drawRabbit(data.rabbitPose)
    rabbit.x = 0
    rabbit.y = 0
    inner.addChild(rabbit)

    // Text label
    const label = new Text({
      text: data.label,
      style: {
        fontSize: 16,
        fill: COLOR_HEX.textDark,
        fontFamily: 'serif',
        align: 'center',
        lineHeight: 22,
      },
    })
    label.anchor.set(0.5, 0)
    label.x = 0
    label.y = 70
    inner.addChild(label)

    // Position: bottom-left corner, above fallback button
    inner.x = 120
    inner.y = CANVAS.DESIGN_HEIGHT - 160

    this.container.addChild(inner)
    this._inner = inner

    // Gentle float
    this._floatTween = gsap.to(inner, {
      y: inner.y - 8,
      duration: 1.5,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1,
    })

    gsap.to(this.container, { alpha: 1, duration: 0.5 })
  }

  hide() {
    this._floatTween?.kill()
    gsap.to(this.container, {
      alpha: 0,
      duration: 0.4,
      onComplete: () => this._clearInner(),
    })
  }

  _clearInner() {
    if (this._inner) {
      this._inner.destroy({ children: true })
      this._inner = null
    }
  }

  _drawRabbit(pose) {
    const g = new Graphics()
    const c = COLORS.particlePink
    const dark = COLORS.accentPink

    // Body
    g.ellipse(0, 20, 22, 28).fill(c)
    // Head
    g.circle(0, -14, 18).fill(c)
    // Ears (base shape; pose adjusts)
    if (pose === 'arms_open') {
      // Left ear raised wide
      g.ellipse(-14, -40, 7, 16).fill(c)
      g.ellipse(14, -40, 7, 16).fill(c)
    } else if (pose === 'v_ears') {
      // V-shape ears apart
      g.ellipse(-10, -42, 6, 15).fill(c)
      g.ellipse(10, -42, 6, 15).fill(c)
    } else if (pose === 'fist') {
      // Ears slightly back
      g.ellipse(-8, -38, 6, 14).fill(c)
      g.ellipse(8, -38, 6, 14).fill(c)
    } else {
      // Prayer: ears folded forward
      g.ellipse(-6, -36, 5, 13).fill(c)
      g.ellipse(6, -36, 5, 13).fill(c)
    }
    // Eyes
    g.circle(-7, -16, 3).fill(dark)
    g.circle(7, -16, 3).fill(dark)
    // Nose
    g.ellipse(0, -10, 3, 2).fill(dark)
    // Pose-specific arms
    if (pose === 'arms_open') {
      g.moveTo(-22, 10).lineTo(-36, -2).stroke({ color: dark, width: 3 })
      g.moveTo(22, 10).lineTo(36, -2).stroke({ color: dark, width: 3 })
    } else if (pose === 'fist') {
      g.circle(-28, 14, 8).fill(dark)
      g.circle(28, 14, 8).fill(dark)
    } else if (pose === 'prayer') {
      // Hands together at chest
      g.roundRect(-10, 12, 20, 14, 4).fill(dark)
    }

    return g
  }

  destroy() {
    this._floatTween?.kill()
    gsap.killTweensOf(this.container)
    this.container.destroy({ children: true })
  }
}
