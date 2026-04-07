import { Application } from 'pixi.js'
import { COLORS, CANVAS } from './utils/constants.js'
import { SceneManager } from './scenes/SceneManager.js'
import { AudioManager } from './audio/AudioManager.js'
import { GestureManager } from './gesture/GestureManager.js'
import { AssetLoader } from './utils/AssetLoader.js'

export class App {
  constructor() {
    this.pixi = null
    this.sceneManager = null
    this.audioManager = null
    this.gestureManager = null
  }

  async init() {
    this.pixi = new Application()
    await this.pixi.init({
      background: COLORS.background,
      resizeTo: window,
      antialias: true,
      resolution: Math.min(window.devicePixelRatio ?? 1, 2),
      autoDensity: true,
      preference: 'webgl',
    })

    document.getElementById('app').appendChild(this.pixi.canvas)

    this.audioManager = new AudioManager()
    this.gestureManager = new GestureManager()

    this.sceneManager = new SceneManager(
      this.pixi,
      this.audioManager,
      this.gestureManager,
    )

    window.addEventListener('resize', () => this.sceneManager.handleResize())
    this.sceneManager.handleResize()

    await AssetLoader.loadCritical()
  }

  start() {
    this.sceneManager.goTo('Loading')

    this.pixi.ticker.add(() => {
      this.gestureManager.tick()
    })

    this.pixi.ticker.add((ticker) => {
      this.sceneManager.update(ticker.deltaMS)
    })
  }
}
