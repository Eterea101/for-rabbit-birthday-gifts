import { Assets } from 'pixi.js'
import { ASSETS, COVER_FLOW } from './constants.js'

export class AssetLoader {
  // Stage 1: only what Loading scene needs immediately
  static async loadCritical() {
    const critical = [ASSETS.PARTICLE_TEX]
    for (const url of critical) {
      await Assets.load(url).catch(() => {
        // Silently skip missing assets — scenes use Graphics fallbacks
      })
    }
  }

  // Stage 2: called from LoadingScene while progress bar fills
  static async loadAll(onProgress) {
    const manifest = [
      ASSETS.RABBIT_IDLE,
      ASSETS.RABBIT_RUN,
      ASSETS.CLOCK_BG,
      ASSETS.CLOCK_HAND_MIN,
      ASSETS.CLOCK_HAND_HOUR,
      ASSETS.CANDLE,
      ASSETS.CANDLE_FLAME,
      ASSETS.SCROLL_BG,
    ]

    // Add photo thumbnails
    for (let i = 1; i <= COVER_FLOW.PHOTO_COUNT; i++) {
      manifest.push(`${COVER_FLOW.THUMBNAILS_PATH}photo-${i}.jpg`)
    }

    let loaded = 0
    for (const url of manifest) {
      await Assets.load(url).catch(() => {})
      loaded++
      onProgress?.(loaded / manifest.length)
    }
  }

  // Stage 3: full-res photos — deferred until ParticleWorld is entered
  static async loadPhotos(onProgress) {
    for (let i = 1; i <= COVER_FLOW.PHOTO_COUNT; i++) {
      const url = `${COVER_FLOW.PHOTOS_PATH}photo-${i}.jpg`
      await Assets.load(url).catch(() => {})
      onProgress?.(i / COVER_FLOW.PHOTO_COUNT)
    }
  }
}
