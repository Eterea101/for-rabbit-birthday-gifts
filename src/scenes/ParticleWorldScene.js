import { Container, Graphics } from 'pixi.js'
import { gsap } from 'gsap'
import { COLORS, COLOR_HEX, CANVAS, SCENES, GESTURES } from '../utils/constants.js'
import { ParticleSystem } from '../particles/ParticleSystem.js'
import { ShapeFormation } from '../particles/ShapeFormation.js'
import { CoverFlow } from '../ui/CoverFlow.js'
import { GestureHint } from '../ui/GestureHint.js'
import { FallbackUI } from '../gesture/FallbackUI.js'

const STATE = {
  FLOATING:       'floating',
  FORMING_RABBIT: 'forming_rabbit',
  COVER_FLOW:     'cover_flow',
  FORMING_TEXT:   'forming_text',
  TEXT_FORMED:    'text_formed',
}

export class ParticleWorldScene {
  constructor(ctx) {
    this.ctx = ctx
    this.container = new Container()
    this._state = STATE.FLOATING
    this._unsubs = []
    this._advanced = false

    this._particles = null
    this._coverFlow = null
    this._hint = null
    this._fallback = null
    this._coverFlowContainer = null
  }

  async init() {
    const { DESIGN_WIDTH, DESIGN_HEIGHT } = CANVAS

    // Background
    const bg = new Graphics()
      .rect(0, 0, DESIGN_WIDTH, DESIGN_HEIGHT)
      .fill({ color: COLORS.background })
    this.container.addChild(bg)

    // Particle system
    this._particles = new ParticleSystem(this.ctx.pixi)
    await this._particles.init()
    this.container.addChild(this._particles.container)

    // Cover Flow (hidden initially)
    this._coverFlow = new CoverFlow(this.ctx.pixi)
    await this._coverFlow.init()
    this._coverFlow.container.alpha = 0
    this._coverFlow.container.visible = false
    this.container.addChild(this._coverFlow.container)

    // Gesture hint
    this._hint = new GestureHint()
    this.container.addChild(this._hint.container)

    // Fallback UI
    this._fallback = new FallbackUI(this.ctx.gesture)
    this.container.addChild(this._fallback.container)

    // Pre-load shape point clouds
    this._rabbitPoints = await ShapeFormation.loadRabbitPoints()
    this._birthdayPoints = await ShapeFormation.loadBirthdayPoints()
  }

  async enter() {
    this._particles.startFloat()
    this._hint.show(GESTURES.FIVE)

    // Register gesture listeners
    const unsubFive = this.ctx.gesture.on(`gesture:${GESTURES.FIVE}`, () => this._onFive())
    const unsubTwo  = this.ctx.gesture.on(`gesture:${GESTURES.TWO}`,  () => this._onTwo())
    const unsubFist = this.ctx.gesture.on(`gesture:${GESTURES.FIST}`, () => this._onFist())
    this._unsubs.push(unsubFive, unsubTwo, unsubFist)

    // Arm fallback for gesture FIVE
    this.ctx.gesture.armFallback(() => {
      this._fallback.show()
    })
  }

  _onFive() {
    if (this._state !== STATE.FLOATING) return
    this._state = STATE.FORMING_RABBIT

    this.ctx.audio.play('sparkle')
    this._hint.hide()
    this._fallback.hide()
    this.ctx.gesture.disarmFallback()

    this._particles.formShape(this._rabbitPoints, 2000, () => {
      // Shape formed — shake then explode
      this._shakeAndExplode()
    })
  }

  _shakeAndExplode() {
    const c = this._particles.container
    gsap.timeline()
      .to(c, { x: 6, duration: 0.08, ease: 'none' })
      .to(c, { x: -6, duration: 0.08 })
      .to(c, { x: 4, duration: 0.06 })
      .to(c, { x: 0, duration: 0.06 })
      .call(() => {
        this.ctx.audio.play('whoosh')
        this._particles.explode()
        this._showCoverFlow()
      })
  }

  _showCoverFlow() {
    this._state = STATE.COVER_FLOW
    this._coverFlow.container.visible = true

    gsap.to(this._coverFlow.container, { alpha: 1, duration: 0.6 })
    this._hint.show(GESTURES.TWO)

    this.ctx.gesture.armFallback(() => {
      this._fallback.show()
    })
  }

  _onTwo() {
    if (this._state !== STATE.COVER_FLOW) return
    this._hint.hide()
    this._fallback.hide()
    this.ctx.gesture.disarmFallback()
    this._coverFlow.startAutoScroll()

    // After last card shown, arm fist gesture hint
    setTimeout(() => {
      this._coverFlow.stopAutoScroll()
      this._hint.show(GESTURES.FIST)
      this.ctx.gesture.armFallback(() => {
        this._fallback.show()
      })
    }, this._coverFlow._textures.length * 1500 + 1000)
  }

  _onFist() {
    if (this._state !== STATE.COVER_FLOW) return
    this._state = STATE.FORMING_TEXT

    this._coverFlow.stopAutoScroll()
    this._hint.hide()
    this._fallback.hide()
    this.ctx.gesture.disarmFallback()

    this.ctx.audio.play('sparkle')
    gsap.to(this._coverFlow.container, { alpha: 0, duration: 0.5 })
    setTimeout(() => {
      this._coverFlow.container.visible = false
    }, 500)

    this._particles.startFloat()
    setTimeout(() => {
      this._particles.formShape(this._birthdayPoints, 2000, () => {
        this._onBirthdayFormed()
      })
    }, 300)
  }

  _onBirthdayFormed() {
    this._state = STATE.TEXT_FORMED
    this.ctx.audio.play('chime')

    const c = this._particles.container
    gsap.timeline()
      .to(c.scale, { x: 1.06, y: 1.06, duration: 0.3, ease: 'power2.out' })
      .to(c.scale, { x: 1, y: 1, duration: 0.4, ease: 'power2.in' })
      .to(c.scale, { x: 1.04, y: 1.04, duration: 0.25 })
      .to(c.scale, { x: 1, y: 1, duration: 0.3 })
      .call(() => {
        setTimeout(() => this._advance(), 2000)
      })
  }

  _advance() {
    if (this._advanced) return
    this._advanced = true
    this.ctx.sceneManager.goTo(SCENES.CANDLE)
  }

  update(deltaMS) {
    this._particles?.update(deltaMS)
  }

  async exit() {
    this._unsubs.forEach(u => u())
    this._unsubs = []
    this.ctx.gesture.disarmFallback()
    this._hint.hide()
    this._fallback.hide()
  }

  destroy() {
    this._unsubs.forEach(u => u())
    this._particles?.destroy()
    this._coverFlow?.destroy()
    this._hint?.destroy()
    this._fallback?.destroy()
    this.container.destroy({ children: true })
  }
}
