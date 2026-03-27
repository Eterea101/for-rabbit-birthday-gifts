import { Container, Sprite, Assets, Graphics } from 'pixi.js'
import { gsap } from 'gsap'
import { COVER_FLOW, COLORS, COLOR_HEX } from '../utils/constants.js'

export class CoverFlow {
  constructor(pixi) {
    this.pixi = pixi
    this.container = new Container()
    this.container.sortableChildren = true
    this._cards = []
    this._currentIndex = 0
    this._animating = false
    this._textures = []
    this._autoScrollTimer = null
    this._unsubs = []
  }

  async init() {
    for (let i = 1; i <= COVER_FLOW.PHOTO_COUNT; i++) {
      try {
        // Try full-res first, then thumbnail
        const url = `${COVER_FLOW.PHOTOS_PATH}photo-${i}.jpg`
        const tex = await Assets.load(url)
        this._textures.push(tex)
      } catch {
        try {
          const tex = await Assets.load(`${COVER_FLOW.THUMBNAILS_PATH}photo-${i}.jpg`)
          this._textures.push(tex)
        } catch {
          this._textures.push(this._makePlaceholderTex(i))
        }
      }
    }
    this._buildCards()
    this._layoutCards(0, false)
  }

  _buildCards() {
    const { CARD_WIDTH, CARD_HEIGHT } = COVER_FLOW

    for (let i = 0; i < this._textures.length; i++) {
      const card = new Container()

      // Soft shadow
      const shadow = new Graphics()
        .roundRect(4, 8, CARD_WIDTH, CARD_HEIGHT, 14)
        .fill({ color: 0x000000, alpha: 0.12 })
      card.addChild(shadow)

      // Photo
      const sp = new Sprite(this._textures[i])
      sp.width = CARD_WIDTH
      sp.height = CARD_HEIGHT
      card.addChild(sp)

      // Pink border
      const border = new Graphics()
        .roundRect(-2, -2, CARD_WIDTH + 4, CARD_HEIGHT + 4, 15)
        .stroke({ color: COLORS.accentPink, width: 3, alpha: 0.75 })
      card.addChild(border)

      card.pivot.set(CARD_WIDTH / 2, CARD_HEIGHT / 2)
      this.container.addChild(card)
      this._cards.push(card)
    }
  }

  _layoutCards(centerIndex, animate = false) {
    const CX = 640, CY = 360
    const { X_SPACING, SIDE_SCALE, SIDE_ALPHA, ROTATION_Y_DEG } = COVER_FLOW
    const cos45 = Math.cos((ROTATION_Y_DEG * Math.PI) / 180)

    this._cards.forEach((card, i) => {
      const offset = i - centerIndex
      const absOff = Math.abs(offset)

      if (absOff > 2) {
        card.visible = false
        return
      }
      card.visible = true

      const targetX     = CX + offset * X_SPACING
      const targetY     = CY
      const targetSY    = absOff === 0 ? 1.0 : SIDE_SCALE
      const targetSX    = absOff === 0 ? 1.0 : SIDE_SCALE * cos45
      const targetAlpha = absOff === 0 ? 1.0 : SIDE_ALPHA
      card.zIndex       = 10 - absOff

      if (!animate) {
        card.x = targetX
        card.y = targetY
        card.scale.x = targetSX
        card.scale.y = targetSY
        card.alpha = targetAlpha
      } else {
        const dur = COVER_FLOW.AUTO_SCROLL_INTERVAL_MS / 1000 * 0.3
        gsap.to(card, { x: targetX, y: targetY, alpha: targetAlpha, duration: dur, ease: 'power2.inOut' })
        gsap.to(card.scale, { x: targetSX, y: targetSY, duration: dur, ease: 'power2.inOut' })
      }
    })

    this.container.sortChildren()
  }

  scrollNext() {
    if (this._animating) return
    if (this._currentIndex >= this._cards.length - 1) {
      this.stopAutoScroll()
      return
    }
    this._animating = true
    this._currentIndex++
    this._layoutCards(this._currentIndex, true)
    setTimeout(() => { this._animating = false }, 300)
  }

  startAutoScroll() {
    this.stopAutoScroll()
    this._autoScrollTimer = setInterval(() => this.scrollNext(), COVER_FLOW.AUTO_SCROLL_INTERVAL_MS)
  }

  stopAutoScroll() {
    clearInterval(this._autoScrollTimer)
    this._autoScrollTimer = null
  }

  _makePlaceholderTex(index) {
    const { CARD_WIDTH, CARD_HEIGHT } = COVER_FLOW
    const hue = (index * 30) % 360
    const g = new Graphics()
      .roundRect(0, 0, CARD_WIDTH, CARD_HEIGHT, 12)
      .fill({ color: COLORS.particlePink, alpha: 0.5 })

    // Photo number label
    const tex = this.pixi.renderer.generateTexture(g)
    g.destroy()
    return tex
  }

  destroy() {
    this.stopAutoScroll()
    this._unsubs.forEach(u => u())
    this.container.destroy({ children: true })
  }
}
