import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision'
import { GESTURES, LANDMARKS, GESTURE_CONFIG } from '../utils/constants.js'

export class GestureDetector {
  constructor() {
    this._handLandmarker = null
    this._lastVideoTime = -1
    this.available = false
  }

  async init() {
    try {
      const vision = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.34/wasm'
      )
      this._handLandmarker = await HandLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath:
            'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
          delegate: 'GPU',
        },
        runningMode: 'VIDEO',
        numHands: 2,
        minHandDetectionConfidence: GESTURE_CONFIG.CONFIDENCE_MIN,
        minHandPresenceConfidence:  GESTURE_CONFIG.CONFIDENCE_MIN,
        minTrackingConfidence:      GESTURE_CONFIG.CONFIDENCE_MIN,
      })
      this.available = true
    } catch (err) {
      console.warn('MediaPipe HandLandmarker init failed:', err)
      this.available = false
    }
  }

  // Returns array of hand landmark arrays, or null if no new frame
  detectFromVideo(videoEl) {
    if (!this._handLandmarker || !this.available) return null
    if (videoEl.currentTime === this._lastVideoTime) return null
    this._lastVideoTime = videoEl.currentTime

    const result = this._handLandmarker.detectForVideo(videoEl, performance.now())
    this._lastHandednesses = result.handednesses
    return result.landmarks
  }

  classifyGesture(landmarks) {
    if (!landmarks || landmarks.length === 0) return GESTURES.NONE

    const hand = landmarks[0]
    const ext = GESTURE_CONFIG.EXTEND_THRESHOLD

    // Determine handedness for thumb direction check
    const handedness = this._lastHandednesses?.[0]?.[0]?.categoryName ?? 'Right'
    const isRight = handedness === 'Right'

    const thumbExtended = isRight
      ? hand[LANDMARKS.THUMB_TIP].x < hand[LANDMARKS.THUMB_IP].x
      : hand[LANDMARKS.THUMB_TIP].x > hand[LANDMARKS.THUMB_IP].x

    const indexExtended  = hand[LANDMARKS.INDEX_TIP].y  < hand[LANDMARKS.INDEX_PIP].y  - ext
    const middleExtended = hand[LANDMARKS.MIDDLE_TIP].y < hand[LANDMARKS.MIDDLE_PIP].y - ext
    const ringExtended   = hand[LANDMARKS.RING_TIP].y   < hand[LANDMARKS.RING_PIP].y   - ext
    const pinkyExtended  = hand[LANDMARKS.PINKY_TIP].y  < hand[LANDMARKS.PINKY_PIP].y  - ext

    const fingerCount = [indexExtended, middleExtended, ringExtended, pinkyExtended]
      .filter(Boolean).length

    // Prayer: two hands with wrists close together
    if (landmarks.length >= 2) {
      const dx = Math.abs(landmarks[0][LANDMARKS.WRIST].x - landmarks[1][LANDMARKS.WRIST].x)
      if (dx < GESTURE_CONFIG.PRAYER_MAX_WRIST_DIST) return GESTURES.PRAYER
    }

    if (fingerCount === 4 && thumbExtended) return GESTURES.FIVE
    if (fingerCount === 0 && !thumbExtended) return GESTURES.FIST
    if (indexExtended && middleExtended && !ringExtended && !pinkyExtended) return GESTURES.TWO

    return GESTURES.NONE
  }

  destroy() {
    this._handLandmarker?.close()
    this._handLandmarker = null
    this.available = false
  }
}
