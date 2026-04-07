import { Translate } from '@google-cloud/translate/build/src/v2/index.js'

const translate = new Translate({ key: process.env.GOOGLE_TRANSLATE_API_KEY })

const hasApiKey = !!process.env.GOOGLE_TRANSLATE_API_KEY

export async function detectLanguage(text: string): Promise<string> {
  if (!hasApiKey) return 'th' // default ถ้าไม่มี API key
  try {
    const [detection] = await translate.detect(text)
    return Array.isArray(detection) ? detection[0].language : detection.language
  } catch {
    return 'th'
  }
}

export async function translateText(text: string, targetLang: string): Promise<string> {
  if (!hasApiKey) return text // return ต้นฉบับถ้าไม่มี API key
  try {
    const [translation] = await translate.translate(text, targetLang)
    return translation
  } catch {
    return text
  }
}
