import { App } from './App.js'

const bootMsg = document.getElementById('boot-msg')
const bootText = document.getElementById('boot-text')

;(async () => {
  try {
    if (bootText) bootText.textContent = 'JavaScript 已加载，正在初始化…'
    const app = new App()
    await app.init()
    if (bootMsg) bootMsg.style.display = 'none'
    app.start()
  } catch (err) {
    console.error('App failed to start:', err)
    if (bootMsg) {
      bootMsg.style.background = 'rgba(255,255,255,0.9)'
      bootMsg.style.padding = '30px'
      bootMsg.style.borderRadius = '12px'
    }
    if (bootText) bootText.innerHTML =
      `出错了，请刷新重试<br><small style="font-size:13px;opacity:0.7">${err?.message ?? String(err)}</small>`
  }
})()
