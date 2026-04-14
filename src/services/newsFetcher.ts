import axios from 'axios'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface NewsArticle {
  title: string
  description: string
  content?: string
  urlToImage?: string
  url: string
  source: { name: string }
  publishedAt: string
  author?: string
}

interface GNewsArticle {
  title: string
  description: string
  content?: string
  image?: string
  url: string
  source: { name: string }
  publishedAt: string
}

// Polish news sources and keywords
const POLISH_SOURCES = [
  'tvn24',
  'onet',
  'gazeta-wyborcza',
  'pap',
  'rp',
  'polityka',
  'newsweek-polska',
]

const POLISH_KEYWORDS = [
  'Poland',
  'Polska',
  'Warsaw',
  'Warszawa',
  'Polish',
  'polski',
]

export class NewsFetcher {
  private newsApiKey: string
  private gNewsApiKey: string

  constructor() {
    this.newsApiKey = process.env.NEWSAPI_KEY || ''
    this.gNewsApiKey = process.env.GNEWS_API_KEY || ''
  }

  /**
   * Fetch news from NewsAPI
   */
  async fetchFromNewsAPI(): Promise<NewsArticle[]> {
    if (!this.newsApiKey) {
      console.warn('NewsAPI key not configured')
      return []
    }

    try {
      console.log('[NewsAPI] Fetching Polish news...')

      const response = await axios.get('https://newsapi.org/v2/everything', {
        params: {
          q: 'Poland OR Polska',
          sortBy: 'publishedAt',
          language: 'en',
          apiKey: this.newsApiKey,
          pageSize: 50,
        },
        timeout: 10000,
      })

      console.log(`[NewsAPI] Fetched ${response.data.articles.length} articles`)
      return response.data.articles || []
    } catch (error) {
      console.error('[NewsAPI] Error fetching news:', error)
      return []
    }
  }

  /**
   * Fetch news from GNews
   */
  async fetchFromGNews(): Promise<GNewsArticle[]> {
    if (!this.gNewsApiKey) {
      console.warn('GNews API key not configured')
      return []
    }

    try {
      console.log('[GNews] Fetching Polish news...')

      const response = await axios.get('https://gnews.io/api/v4/search', {
        params: {
          q: 'Poland',
          lang: 'en',
          country: 'pl',
          max: 50,
          apikey: this.gNewsApiKey,
        },
        timeout: 10000,
      })

      console.log(`[GNews] Fetched ${response.data.articles.length} articles`)
      return response.data.articles || []
    } catch (error) {
      console.error('[GNews] Error fetching news:', error)
      return []
    }
  }

  /**
   * Normalize article from different sources
   */
  private normalizeArticle(article: any, source: 'newsapi' | 'gnews') {
    const normalized = {
      title: article.title || '',
      description: article.description || article.content || '',
      content: article.content || '',
      imageUrl: source === 'newsapi' ? article.urlToImage : article.image,
      sourceUrl: article.url || '',
      sourceName: article.source?.name || 'Unknown',
      author: article.author || '',
      publishedAt: article.publishedAt || new Date().toISOString(),
    }

    return normalized
  }

  /**
   * Check if article already exists
   */
  private async articleExists(sourceUrl: string): Promise<boolean> {
    const article = await prisma.article.findFirst({
      where: { sourceUrl },
    })
    return !!article
  }

  /**
   * Generate slug from title
   */
  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .substring(0, 200)
  }

  /**
   * Get or create category
   */
  private async getOrCreateCategory(name: string) {
    let category = await prisma.category.findFirst({
      where: { slug: name.toLowerCase().replace(/\s+/g, '-') },
    })

    if (!category) {
      category = await prisma.category.create({
        data: {
          name,
          slug: name.toLowerCase().replace(/\s+/g, '-'),
        },
      })
    }

    return category
  }

  /**
   * Determine article category based on content
   */
  private categorizeArticle(title: string, description: string): string {
    const content = `${title} ${description}`.toLowerCase()

    const categories: { [key: string]: string[] } = {
      politics: ['government', 'parliament', 'election', 'minister', 'political', 'law', 'legislation'],
      business: ['business', 'economy', 'market', 'trade', 'company', 'corporate', 'financial'],
      technology: ['technology', 'tech', 'software', 'digital', 'cyber', 'ai', 'innovation'],
      sports: ['sport', 'football', 'soccer', 'game', 'player', 'team', 'championship'],
      entertainment: ['entertainment', 'movie', 'music', 'celebrity', 'film', 'actor', 'show'],
      health: ['health', 'medical', 'doctor', 'hospital', 'disease', 'covid', 'vaccine'],
      science: ['science', 'research', 'study', 'scientist', 'discovery', 'space', 'nasa'],
    }

    for (const [category, keywords] of Object.entries(categories)) {
      if (keywords.some(keyword => content.includes(keyword))) {
        return category
      }
    }

    return 'local'
  }

  /**
   * Save article to database
   */
  private async saveArticle(article: any) {
    try {
      const categoryName = this.categorizeArticle(article.title, article.description)
      const category = await this.getOrCreateCategory(categoryName)

      const slug = this.generateSlug(article.title)

      const savedArticle = await prisma.article.create({
        data: {
          title: article.title,
          slug,
          description: article.description,
          content: article.content,
          imageUrl: article.imageUrl,
          sourceUrl: article.sourceUrl,
          sourceName: article.sourceName,
          author: article.author,
          categoryId: category.id,
          status: 'PUBLISHED',
          isManual: false,
          publishedAt: new Date(article.publishedAt),
          fetchedAt: new Date(),
        },
      })

      return savedArticle
    } catch (error) {
      console.error('Error saving article:', error)
      return null
    }
  }

  /**
   * Main fetch and save function
   */
  async fetchAndSaveNews() {
    console.log('\n🔄 Starting news fetch cycle...')
    const startTime = Date.now()

    try {
      // Fetch from both sources
      const [newsApiArticles, gNewsArticles] = await Promise.all([
        this.fetchFromNewsAPI(),
        this.fetchFromGNews(),
      ])

      const allArticles = [...newsApiArticles, ...gNewsArticles]
      console.log(`📰 Total articles fetched: ${allArticles.length}`)

      let savedCount = 0
      let duplicateCount = 0

      // Process and save articles
      for (const article of allArticles) {
        const source = newsApiArticles.includes(article) ? 'newsapi' : 'gnews'
        const normalized = this.normalizeArticle(article, source)

        // Check for duplicates
        if (await this.articleExists(normalized.sourceUrl)) {
          duplicateCount++
          continue
        }

        // Save article
        const saved = await this.saveArticle(normalized)
        if (saved) {
          savedCount++
        }
      }

      const duration = ((Date.now() - startTime) / 1000).toFixed(2)

      // Log fetch result
      await prisma.fetchLog.create({
        data: {
          feedId: 'default', // You can create a default feed or use actual feed ID
          status: 'success',
          articlesFetched: savedCount,
          errorMessage: null,
        },
      })

      console.log(`✅ Fetch completed in ${duration}s`)
      console.log(`   - Saved: ${savedCount}`)
      console.log(`   - Duplicates: ${duplicateCount}`)
      console.log(`   - Failed: ${allArticles.length - savedCount - duplicateCount}`)

      return { savedCount, duplicateCount, duration }
    } catch (error) {
      console.error('❌ Fetch cycle failed:', error)

      await prisma.fetchLog.create({
        data: {
          feedId: 'default',
          status: 'failed',
          articlesFetched: 0,
          errorMessage: error instanceof Error ? error.message : 'Unknown error',
        },
      })

      throw error
    }
  }
}

export default new NewsFetcher()
