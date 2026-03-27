// ─── Visual Theme ─────────────────────────────────────────────────────────────
export const COLORS = {
  background:      0xFDF0F3,
  particlePink:    0xF2B8C6,
  particleGold:    0xF5DFA0,
  accentPink:      0xE8A0B4,
  textDark:        0x5C3D4A,
  candleFlame:     0xFFD080,
  candleGlow:      0xFF9040,
  white:           0xFFFFFF,
  scrollPaper:     0xFFF8F0,
}

export const COLOR_HEX = {
  background:   '#FDF0F3',
  particlePink: '#F2B8C6',
  particleGold: '#F5DFA0',
  accentPink:   '#E8A0B4',
  textDark:     '#5C3D4A',
  scrollPaper:  '#FFF8F0',
}

// ─── Scene Names ──────────────────────────────────────────────────────────────
export const SCENES = {
  LOADING:           'Loading',
  RABBIT_ENTRANCE:   'RabbitEntrance',
  CLOCK_REWIND:      'ClockRewind',
  DREAM_TRANSITION:  'DreamTransition',
  PARTICLE_WORLD:    'ParticleWorld',
  CANDLE:            'Candle',
  LETTER:            'Letter',
}

// ─── Gestures ─────────────────────────────────────────────────────────────────
export const GESTURES = {
  NONE:    'none',
  FIVE:    'five',
  TWO:     'two',
  FIST:    'fist',
  PRAYER:  'prayer',
}

// Strictly-ordered sequence
export const GESTURE_SEQUENCE = [
  GESTURES.FIVE,
  GESTURES.TWO,
  GESTURES.FIST,
  GESTURES.PRAYER,
]

// ─── Gesture Detection Config ─────────────────────────────────────────────────
export const GESTURE_CONFIG = {
  HOLD_DURATION_MS:    800,
  FALLBACK_TIMEOUT_MS: 5000,
  CONFIDENCE_MIN:      0.7,
  EXTEND_THRESHOLD:    0.04,
  PRAYER_MAX_WRIST_DIST: 0.15,
}

// MediaPipe landmark indices (0–20)
export const LANDMARKS = {
  WRIST: 0,
  THUMB_CMC: 1, THUMB_MCP: 2, THUMB_IP: 3, THUMB_TIP: 4,
  INDEX_MCP: 5, INDEX_PIP: 6, INDEX_DIP: 7, INDEX_TIP: 8,
  MIDDLE_MCP: 9, MIDDLE_PIP: 10, MIDDLE_DIP: 11, MIDDLE_TIP: 12,
  RING_MCP: 13, RING_PIP: 14, RING_DIP: 15, RING_TIP: 16,
  PINKY_MCP: 17, PINKY_PIP: 18, PINKY_DIP: 19, PINKY_TIP: 20,
}

// ─── Timing (ms) ──────────────────────────────────────────────────────────────
export const TIMING = {
  RABBIT_ENTRANCE_MS:   3500,
  CLOCK_REWIND_MS:      17000,
  DREAM_TRANSITION_MS:  3500,
  SCENE_FADE_MS:        400,
  PARTICLE_FORM_MS:     2000,
  PARTICLE_EXPLODE_MS:  800,
  COVER_FLOW_SCROLL_MS: 400,
  CANDLE_DISPLAY_MS:    3000,
  CANDLE_FLICKER_MS:    120,
  LETTER_UNFURL_MS:     2500,
}

// ─── Canvas / Design Space ────────────────────────────────────────────────────
export const CANVAS = {
  DESIGN_WIDTH:  1280,
  DESIGN_HEIGHT: 720,
}

// ─── Particle System ──────────────────────────────────────────────────────────
export const PARTICLES = {
  PINK_COUNT:       200,
  GOLD_COUNT:       150,
  SHAPE_COUNT:      350,
  PARTICLE_RADIUS:  5,
  FLOAT_SPEED:      0.4,
  RABBIT_POINTS_PATH:   '/assets/shapes/rabbit-points.json',
  BIRTHDAY_POINTS_PATH: '/assets/shapes/birthday-points.json',
}

// ─── Cover Flow ───────────────────────────────────────────────────────────────
export const COVER_FLOW = {
  CARD_WIDTH:       280,
  CARD_HEIGHT:      380,
  X_SPACING:        220,
  SIDE_SCALE:       0.72,
  SIDE_ALPHA:       0.55,
  ROTATION_Y_DEG:   45,
  AUTO_SCROLL_INTERVAL_MS: 1500,
  PHOTOS_PATH:      '/assets/photos/',
  THUMBNAILS_PATH:  '/assets/thumbnails/',
  PHOTO_COUNT:      8,
}

// ─── Asset Paths ──────────────────────────────────────────────────────────────
export const ASSETS = {
  RABBIT_IDLE:      '/assets/sprites/rabbit-idle.png',
  RABBIT_RUN:       '/assets/sprites/rabbit-run.json',
  CLOCK_BG:         '/assets/sprites/clock-bg.png',
  CLOCK_HAND_MIN:   '/assets/sprites/clock-hand-min.png',
  CLOCK_HAND_HOUR:  '/assets/sprites/clock-hand-hour.png',
  CANDLE:           '/assets/sprites/candle.png',
  CANDLE_FLAME:     '/assets/sprites/candle-flame.json',
  SCROLL_BG:        '/assets/sprites/scroll-bg.png',
  PARTICLE_TEX:     '/assets/sprites/particle.png',
  FONT_HANDWRITTEN: '/assets/fonts/handwritten.woff2',

  AUDIO_BGM:        '/assets/audio/bgm.mp3',
  AUDIO_WHOOSH:     '/assets/audio/whoosh.mp3',
  AUDIO_SPARKLE:    '/assets/audio/sparkle.mp3',
  AUDIO_CHIME:      '/assets/audio/chime.mp3',
  AUDIO_BLOW:       '/assets/audio/blow.mp3',
  AUDIO_LETTER:     '/assets/audio/letter-unfurl.mp3',
}

// ─── Letter Content (placeholder — replace with real text) ───────────────────
export const LETTER_TEXT = `亲爱的小兔子，

今天是你的生日，时光如白驹过隙，转眼又是一年。
记得我们一起走过的那些日子，每一刻都珍贵如初。

你的笑容像春天的阳光，总能照亮身边的每一个人。
你的善良和温柔，是我最喜欢的你的样子。

愿你今天开心，愿你每天开心。
愿所有美好的事情都在你身边悄悄发生。

生日快乐，永远年轻，永远热泪盈眶。

                                      爱你的朋友
                                      ${new Date().getFullYear()}年春`
