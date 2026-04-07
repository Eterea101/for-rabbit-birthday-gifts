import { App } from './App.js'

try {
  const app = new App()
  await app.init()
  app.start()
} catch (err) {
  console.error('App failed to start:', err)
  document.getElementById('app').innerHTML =
    `<div style="color:#5C3D4A;font-family:serif;text-align:center;padding:40px;font-size:18px;">
      加载中遇到问题，请刷新重试<br><small style="font-size:12px;opacity:0.6">${err?.message ?? err}</small>
    </div>`
}
