import { App } from './App.js'

const bootMsg = document.getElementById('boot-msg')
const bootText = document.getElementById('boot-text')

try {
  if (bootText) bootText.textContent = 'JavaScript 已加载，正在初始化…'
  const app = new App()
  await app.init()
  if (bootMsg) bootMsg.style.display = 'none'
  app.start()
} catch (err) {
  console.error('App failed to start:', err)
  if (bootText) bootText.innerHTML = `出错了，请刷新重试<br><small style="font-size:12px;opacity:0.6">${err?.message ?? String(err)}</small>`
}
