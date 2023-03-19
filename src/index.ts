import { Telegram } from 'telegraf'
import { chromium } from 'playwright'
import cron from 'node-cron'
import dotenv from 'dotenv'

dotenv.config()

const PAGE_URL = 'https://www.cgeonline.com.ar/informacion/apertura-de-citas.html'
const LAST_OPENING_SELECTOR =
  '#cuerpo > div > div > div > table > tbody > tr:nth-child(11) > td:nth-child(2)'
const NEXT_OPENING_SELECTOR =
  '#cuerpo > div > div > div > table > tbody > tr:nth-child(11) > td:nth-child(3)'
const CHAT_ID = process.env.CHAT_ID ?? 0

const bot = new Telegram(process.env.BOT_KEY ?? '')
const browser = await chromium.launch()

cron.schedule('*/30 * * * *', async () => {
  const page = await browser.newPage()

  await page.goto(PAGE_URL)

  const lastOpening = await page.$eval(LAST_OPENING_SELECTOR, (event) => event.textContent)
  const nextOpening = await page.$eval(NEXT_OPENING_SELECTOR, (event) => event.textContent)

  if (nextOpening === 'fecha por confirmar') {
    console.log(
      `Todavía no abrieron las fechas para renovar el pasaporte. La última fecha de apertura fue ${lastOpening}`,
    )
  } else {
    bot.sendMessage(
      CHAT_ID,
      'HAY FECHAS PARA RENOVAR EL PASAPORTE. https://www.cgeonline.com.ar/tramites/citas/opciones-pasaporte.html',
    )
  }

  await page.close()
})
