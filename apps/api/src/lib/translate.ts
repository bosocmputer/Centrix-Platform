import { Translate } from '@google-cloud/translate/build/src/v2/index.js'

function getTranslate(apiKey?: string | null) {
  const key = apiKey ?? process.env.GOOGLE_TRANSLATE_API_KEY
  if (!key) return null
  return new Translate({ key })
}

export async function detectLanguage(text: string, apiKey?: string | null): Promise<string> {
  const translate = getTranslate(apiKey)
  if (!translate) return 'th'
  try {
    const [detection] = await translate.detect(text)
    return Array.isArray(detection) ? detection[0].language : detection.language
  } catch {
    return 'th'
  }
}

export async function translateText(text: string, targetLang: string, apiKey?: string | null): Promise<string> {
  const translate = getTranslate(apiKey)
  if (!translate) return text
  try {
    const [translation] = await translate.translate(text, targetLang)
    return translation
  } catch {
    return text
  }
}
