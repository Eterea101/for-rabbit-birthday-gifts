import { Container } from 'pixi.js'
import { gsap } from 'gsap'
import { CANVAS, SCENES, TIMING } from '../utils/constants.js'

const SCENE_MODULES = {
  [SCENES.LOADING]:          () => import('./LoadingScene.js'),
  [SCENES.RABBIT_ENTRANCE]:  () => import('./RabbitEntranceScene.js'),
  [SCENES.CLOCK_REWIND]:     () => import('./ClockRewindScene.js'),
  [SCENES.DREAM_TRANSITION]: () => import('./DreamTransitionScene.js'),
  [SCENES.PARTICLE_WORLD]:   () => import('./ParticleWorldScene.js'),
  [SCENES.CANDLE]:           () => import('./CandleScene.js'),
  [SCENES.LETTER]:           () => import('./LetterScene.js'),
}

export class SceneManager {
  constructor(pixi, audioManager, gestureManager) {
    this.pixi = pixi
    this.audio = audioManager
    this.gesture = gestureManager

    this.root = new Container()
    this.pixi.stage.addChild(this.root)

    this.currentScene = null
    this.currentSceneName = null
    this._transitioning = false
  }

  async goTo(sceneName, params = {}) {
    if (this._transitioning) return
    this._transitioning = true

    if (this.currentScene) {
      await gsap.to(this.currentScene.container, {
        alpha: 0,
        duration: TIMING.SCENE_FADE_MS / 1000,
        ease: 'power2.in',
      })
      await this.currentScene.exit()
      this.currentScene.destroy()
      this.root.removeChildren()
    }

    const mod = await SCENE_MODULES[sceneName]()
    const SceneClass = Object.values(mod)[0]

    const ctx = {
      pixi: this.pixi,
      audio: this.audio,
      gesture: this.gesture,
      sceneManager: this,
    }

    this.currentScene = new SceneClass(ctx)
    this.currentSceneName = sceneName

    await this.currentScene.init(params)
    this.root.addChild(this.currentScene.container)
    this.currentScene.container.alpha = 0

    this._transitioning = false

    await this.currentScene.enter()
    await gsap.to(this.currentScene.container, {
      alpha: 1,
      duration: TIMING.SCENE_FADE_MS / 1000,
      ease: 'power2.out',
    })
  }

  update(deltaMS) {
    if (this.currentScene && !this._transitioning) {
      this.currentScene.update(deltaMS)
    }
  }

  handleResize() {
    const { DESIGN_WIDTH, DESIGN_HEIGHT } = CANVAS
    const scaleX = window.innerWidth / DESIGN_WIDTH
    const scaleY = window.innerHeight / DESIGN_HEIGHT
    const scale = Math.min(scaleX, scaleY)

    this.root.scale.set(scale)
    this.root.x = (window.innerWidth - DESIGN_WIDTH * scale) / 2
    this.root.y = (window.innerHeight - DESIGN_HEIGHT * scale) / 2
  }
}
