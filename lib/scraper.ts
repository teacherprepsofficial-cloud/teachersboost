import puppeteer, { Browser, Page } from 'puppeteer'

const TPT_BASE = 'https://www.teacherspayteachers.com'

class TptScraper {
  private browser: Browser | null = null

  async init() {
    if (!this.browser) {
      this.browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      })
    }
    return this.browser
  }

  async close() {
    if (this.browser) {
      await this.browser.close()
      this.browser = null
    }
  }

  private async humanDelay() {
    await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 2000))
  }

  async scrapeKeywordSuggestions(keyword: string): Promise<string[]> {
    const browser = await this.init()
    const page = await browser.newPage()

    try {
      const searchUrl = `${TPT_BASE}/browse?search=${encodeURIComponent(keyword)}`
      await page.goto(searchUrl, { waitUntil: 'networkidle2' })

      await this.humanDelay()

      // Try to find the suggestions dropdown
      const suggestions = await page.evaluate(() => {
        const items: string[] = []
        // Look for autocomplete suggestions
        const suggestionElements = document.querySelectorAll(
          '[role="option"], .search-suggestion, .autocomplete-item'
        )
        suggestionElements.forEach((el) => {
          const text = el.textContent?.trim()
          if (text && text !== '') {
            items.push(text)
          }
        })
        return items
      })

      return suggestions.length > 0 ? suggestions : [keyword]
    } catch (error) {
      console.error(`Error scraping suggestions for "${keyword}":`, error)
      return [keyword]
    } finally {
      await page.close()
    }
  }

  async scrapeKeywordResults(keyword: string): Promise<{
    resultCount: number
    competitionScore: number
    isRocket: boolean
  }> {
    const browser = await this.init()
    const page = await browser.newPage()

    try {
      const searchUrl = `${TPT_BASE}/browse?search=${encodeURIComponent(keyword)}`
      await page.goto(searchUrl, { waitUntil: 'networkidle2' })

      await this.humanDelay()

      const resultData = await page.evaluate(() => {
        // Look for result count text like "1,005 results"
        const resultText = document.body.innerText
        const match = resultText.match(/(\d+(?:,\d+)?)\s*results/i)
        const count = match ? parseInt(match[1].replace(/,/g, ''), 10) : 0
        return { count }
      })

      const competitionScore = parseFloat((resultData.count / 1000).toFixed(2))
      const isRocket = resultData.count < 1000

      return {
        resultCount: resultData.count,
        competitionScore,
        isRocket,
      }
    } catch (error) {
      console.error(`Error scraping results for "${keyword}":`, error)
      return { resultCount: 0, competitionScore: 0, isRocket: false }
    } finally {
      await page.close()
    }
  }

  async scrapeProductPage(url: string): Promise<{
    title: string
    price: number
    rating: number
    ratingCount: number
    views24h: number
    sellerName: string
    sellerUrl: string
  }> {
    const browser = await this.init()
    const page = await browser.newPage()

    try {
      await page.goto(url, { waitUntil: 'networkidle2' })
      await this.humanDelay()

      const productData = await page.evaluate(() => {
        const getText = (selector: string) =>
          document.querySelector(selector)?.textContent?.trim() || ''

        // Parse price: "$15.00" → 15.00
        const priceText = getText('.product-price, [data-testid="price"]')
        const price = parseFloat(priceText.replace(/[^0-9.]/g, '')) || 0

        // Parse views: "500+ views in the last 24 hours" → 500
        const viewsText = document.body.innerText
        const viewsMatch = viewsText.match(/(\d+)\+?\s*views/i)
        const views = viewsMatch ? parseInt(viewsMatch[1], 10) : 0

        // Parse rating and count: "4.5 (123 ratings)" → [4.5, 123]
        const ratingText = getText('[data-testid="rating"], .rating')
        const ratingMatch = ratingText.match(/([\d.]+)\s*\((\d+)\s*ratings?\)/)
        const rating = ratingMatch ? parseFloat(ratingMatch[1]) : 0
        const ratingCount = ratingMatch ? parseInt(ratingMatch[2], 10) : 0

        return {
          title: getText('h1, [data-testid="product-title"]'),
          price,
          rating,
          ratingCount,
          views24h: views,
          sellerName: getText('[data-testid="seller-name"], .seller-name'),
          sellerUrl: document
            .querySelector('[data-testid="seller-link"], .seller-link')
            ?.getAttribute('href') || '',
        }
      })

      return productData
    } catch (error) {
      console.error(`Error scraping product "${url}":`, error)
      return {
        title: '',
        price: 0,
        rating: 0,
        ratingCount: 0,
        views24h: 0,
        sellerName: '',
        sellerUrl: '',
      }
    } finally {
      await page.close()
    }
  }

  async scrapeShop(shopUrl: string): Promise<{
    storeName: string
    rating: number
    ratingCount: number
    followers: number
    productCount: number
  }> {
    const browser = await this.init()
    const page = await browser.newPage()

    try {
      await page.goto(shopUrl, { waitUntil: 'networkidle2' })
      await this.humanDelay()

      const shopData = await page.evaluate(() => {
        const getText = (selector: string) =>
          document.querySelector(selector)?.textContent?.trim() || ''

        const ratingText = getText('[data-testid="shop-rating"], .rating')
        const ratingMatch = ratingText.match(/([\d.]+)\s*\((\d+)\s*ratings?\)/)

        const followerText = getText('[data-testid="followers"], .followers')
        const followerMatch = followerText.match(/(\d+(?:,\d+)?)\s*followers?/i)

        return {
          storeName: getText('h1, [data-testid="shop-name"]'),
          rating: ratingMatch ? parseFloat(ratingMatch[1]) : 0,
          ratingCount: ratingMatch ? parseInt(ratingMatch[2], 10) : 0,
          followers: followerMatch
            ? parseInt(followerMatch[1].replace(/,/g, ''), 10)
            : 0,
          productCount: 0, // Will be scraped from product grid
        }
      })

      return shopData
    } catch (error) {
      console.error(`Error scraping shop "${shopUrl}":`, error)
      return { storeName: '', rating: 0, ratingCount: 0, followers: 0, productCount: 0 }
    } finally {
      await page.close()
    }
  }
}

export const scraper = new TptScraper()
