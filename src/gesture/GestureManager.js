import { GestureDetector } from './GestureDetector.js'
import { GESTURES, GESTURE_SEQUENCE, GESTURE_CONFIG } from '../utils/constants.js'

export class GestureManager {
  constructor() {
    this.detector = new GestureDetector()
    this.cameraAllowed = false

    this._sequenceIndex = 0
    this._holdStart = null
    this._currentCandidate = GESTURES.NONE

    this._listeners = {}
    this._fallbackTimer = null
    this.fallbackActive = false
    this._videoEl = null
  }

  async initCamera() {
    this._videoEl = document.getElementById('camera-feed')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' },
      })
      this._videoEl.srcObject = stream
      await this._videoEl.play()
      this.cameraAllowed = true
      await this.detector.init()
    } catch (err) {
      console.warn('Camera unavailable:', err.message)
      this.cameraAllowed = false
      this.emit('cameradenied')
    }
  }

  // Called every frame from App ticker
  tick() {
    if (!this.cameraAllowed || !this.detector.available) return

    const landmarks = this.detector.detectFromVideo(this._videoEl)
    const gesture = this.detector.classifyGesture(landmarks)

    const expected = GESTURE_SEQUENCE[this._sequenceIndex]
    if (!expected) return  // all gestures done

    if (gesture === expected) {
      if (this._currentCandidate !== gesture) {
        this._currentCandidate = gesture
        this._holdStart = performance.now()
      } else if (performance.now() - this._holdStart >= GESTURE_CONFIG.HOLD_DURATION_MS) {
        this._confirm(gesture)
      }
    } else {
      this._currentCandidate = GESTURES.NONE
      this._holdStart = null
    }

    this.emit('frame', { gesture, landmarks })
  }

  _confirm(gesture) {
    this._sequenceIndex++
    this._currentCandidate = GESTURES.NONE
    this._holdStart = null
    this.fallbackActive = false
    clearTimeout(this._fallbackTimer)
    this.emit('gesture', gesture)
    this.emit(`gesture:${gesture}`)
  }

  // Arm the 5-second fallback timer for the current scene's expected gesture
  armFallback(callback) {
    clearTimeout(this._fallbackTimer)
    this._fallbackTimer = setTimeout(() => {
      this.fallbackActive = true
      callback?.()
      this.emit('fallback')
    }, GESTURE_CONFIG.FALLBACK_TIMEOUT_MS)
  }

  disarmFallback() {
    clearTimeout(this._fallbackTimer)
  }

  // Called by FallbackUI button — simulates the next expected gesture
  triggerFallback() {
    const gesture = GESTURE_SEQUENCE[this._sequenceIndex]
    if (!gesture) return
    this._confirm(gesture)
  }

  // Returns the currently expected gesture (for UI hints)
  expectedGesture() {
    return GESTURE_SEQUENCE[this._sequenceIndex] ?? null
  }

  on(event, cb) {
    if (!this._listeners[event]) this._listeners[event] = new Set()
    this._listeners[event].add(cb)
    return () => this._listeners[event]?.delete(cb)
  }

  off(event, cb) {
    this._listeners[event]?.delete(cb)
  }

  emit(event, data) {
    this._listeners[event]?.forEach(cb => cb(data))
  }

  destroy() {
    clearTimeout(this._fallbackTimer)
    this.detector.destroy()
  }
}
