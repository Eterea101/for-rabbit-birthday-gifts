import { Howl, Howler } from 'howler'
import { ASSETS } from '../utils/constants.js'

export class AudioManager {
  constructor() {
    this._bgm = null
    this._sounds = {}
    this._muted = false
    this._initialized = false
  }

  // Must be called from a user gesture (click) to satisfy browser autoplay policy
  init() {
    if (this._initialized) return
    this._initialized = true

    this._bgm = new Howl({
      src: [ASSETS.AUDIO_BGM],
      loop: true,
      volume: 0.35,
      onloaderror: () => console.warn('BGM failed to load — continuing without audio'),
    })

    const sfxMap = {
      whoosh:  ASSETS.AUDIO_WHOOSH,
      sparkle: ASSETS.AUDIO_SPARKLE,
      chime:   ASSETS.AUDIO_CHIME,
      blow:    ASSETS.AUDIO_BLOW,
      letter:  ASSETS.AUDIO_LETTER,
    }

    for (const [name, src] of Object.entries(sfxMap)) {
      this._sounds[name] = new Howl({
        src: [src],
        volume: 0.7,
        onloaderror: () => console.warn(`SFX "${name}" failed to load`),
      })
    }
  }

  startBGM() {
    if (!this._bgm) return
    if (!this._bgm.playing()) this._bgm.play()
  }

  stopBGM() {
    this._bgm?.stop()
  }

  fadeOutBGM(durationMs = 2000) {
    if (!this._bgm?.playing()) return
    this._bgm.fade(this._bgm.volume(), 0, durationMs)
  }

  play(name) {
    this._sounds[name]?.play()
  }

  toggleMute() {
    this._muted = !this._muted
    Howler.mute(this._muted)
    return this._muted
  }
}
