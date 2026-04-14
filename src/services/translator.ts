import axios from 'axios'
import { PrismaClient, Language } from '@prisma/client'

const prisma = new PrismaClient()

interface TranslationResult {
  language: Language
  title: string
  description: string
  content: string
}

export class Translator {
  private openaiApiKey: string
  private googleApiKey: string
  private useOpenAI: boolean

  constructor() {
    this.openaiApiKey = process.env.OPENAI_API_KEY || ''
    this.googleApiKey = process.env.GOOGLE_TRANSLATE_API_KEY || ''
    this.useOpenAI = !!this.openaiApiKey
  }

  /**
   * Translate using OpenAI
   */
  private async translateWithOpenAI(
    text: string,
    targetLanguage: string,
    languageName: string
  ): Promise<string> {
    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: `You are a professional translator. Translate the following text to ${languageName}. Return ONLY the translated text, nothing else.`,
            },
            {
              role: 'user',
              content: text,
            },
          ],
          temperature: 0.3,
          max_tokens: 500,
        },
        {
          headers: {
            Authorization: `Bearer ${this.openaiApiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: 10000,
        }
      )

      return response.data.choices[0].message.content.trim()
    } catch (error) {
      console.error(`OpenAI translation error for ${languageName}:`, error)
      throw error
    }
  }

  /**
   * Translate using Google Translate
   */
  private async translateWithGoogle(
    text: string,
    targetLanguage: string
  ): Promise<string> {
    try {
      const response = await axios.post(
        'https://translation.googleapis.com/language/translate/v2',
        {
          q: text,
          target: targetLanguage,
          source: 'en',
        },
        {
          params: {
            key: this.googleApiKey,
          },
          timeout: 10000,
        }
      )

      return response.data.data.translations[0].translatedText
    } catch (error) {
      console.error(`Google Translate error for ${targetLanguage}:`, error)
      throw error
    }
  }

  /**
   * Translate text to target language
   */
  async translate(text: string, targetLanguage: string, languageName: string): Promise<string> {
    if (!text) return ''

    // Limit text length to avoid API costs
    const limitedText = text.substring(0, 1000)

    if (this.useOpenAI && this.openaiApiKey) {
      return this.translateWithOpenAI(limitedText, targetLanguage, languageName)
    } else if (this.googleApiKey) {
      return this.translateWithGoogle(limitedText, targetLanguage)
    } else {
      console.warn('No translation API configured')
      return text
    }
  }

  /**
   * Translate article to multiple languages
   */
  async translateArticle(
    articleId: string,
    title: string,
    description: string,
    content: string,
    targetLanguages: Language[] = ['AR', 'PL', 'DE', 'FR']
  ): Promise<TranslationResult[]> {
    const languageMap: { [key in Language]: { code: string; name: string } } = {
      EN: { code: 'en', name: 'English' },
      AR: { code: 'ar', name: 'Arabic' },
      PL: { code: 'pl', name: 'Polish' },
      DE: { code: 'de', name: 'German' },
      FR: { code: 'fr', name: 'French' },
    }

    const results: TranslationResult[] = []

    for (const language of targetLanguages) {
      try {
        console.log(`🌐 Translating to ${languageMap[language].name}...`)

        const [translatedTitle, translatedDescription, translatedContent] = await Promise.all([
          this.translate(title, languageMap[language].code, languageMap[language].name),
          this.translate(description, languageMap[language].code, languageMap[language].name),
          this.translate(content, languageMap[language].code, languageMap[language].name),
        ])

        results.push({
          language,
          title: translatedTitle,
          description: translatedDescription,
          content: translatedContent,
        })

        // Save translation to database
        await prisma.articleTranslation.upsert({
          where: {
            articleId_language: {
              articleId,
              language,
            },
          },
          update: {
            title: translatedTitle,
            description: translatedDescription,
            content: translatedContent,
            translatedAt: new Date(),
          },
          create: {
            articleId,
            language,
            title: translatedTitle,
            description: translatedDescription,
            content: translatedContent,
          },
        })

        console.log(`✅ ${languageMap[language].name} translation saved`)
      } catch (error) {
        console.error(`❌ Failed to translate to ${languageMap[language].name}:`, error)
      }
    }

    return results
  }

  /**
   * Translate all articles without translations
   */
  async translateMissingArticles() {
    console.log('\n🔄 Starting translation cycle...')

    try {
      // Find articles without translations
      const articlesWithoutTranslations = await prisma.article.findMany({
        where: {
          translations: {
            none: {},
          },
        },
        take: 10, // Process 10 at a time to avoid API rate limits
      })

      console.log(`📝 Found ${articlesWithoutTranslations.length} articles to translate`)

      for (const article of articlesWithoutTranslations) {
        await this.translateArticle(
          article.id,
          article.title,
          article.description || '',
          article.content || ''
        )

        // Add delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000))
      }

      console.log(`✅ Translation cycle completed`)
    } catch (error) {
      console.error('❌ Translation cycle failed:', error)
    }
  }
}

export default new Translator()
