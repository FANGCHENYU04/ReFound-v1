import { generateText } from "ai"

export interface ImageAnalysisResult {
  description: string
  category: string
  color: string
  brand: string | null
  identifyingFeatures: string[]
  suggestedTitle: string
}

export async function analyzeItemImage(imageUrl: string): Promise<ImageAnalysisResult> {
  try {
    const { text } = await generateText({
      model: "openai/gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analyze this lost/found item image and provide:
1. A detailed description
2. Category (Electronics, Clothing, Bags & Wallets, Keys, ID & Cards, Books & Stationery, Accessories, Sports Equipment, Other)
3. Primary color
4. Brand (if visible, otherwise null)
5. Identifying features (list 3-5 key features)
6. Suggested title (brief, like "Blue iPhone 15 Pro")

Respond in JSON format only:
{
  "description": "...",
  "category": "...",
  "color": "...",
  "brand": "..." or null,
  "identifyingFeatures": ["...", "..."],
  "suggestedTitle": "..."
}`,
            },
            {
              type: "image",
              image: imageUrl,
            },
          ],
        },
      ],
      maxOutputTokens: 500,
    })

    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    }

    return getDefaultResult()
  } catch (error) {
    console.error("[v0] Error analyzing image:", error)
    return getDefaultResult()
  }
}

function getDefaultResult(): ImageAnalysisResult {
  return {
    description: "Unable to analyze image",
    category: "Other",
    color: "Unknown",
    brand: null,
    identifyingFeatures: [],
    suggestedTitle: "Unknown Item",
  }
}

export async function compareImages(imageUrl1: string, imageUrl2: string): Promise<number> {
  try {
    const { text } = await generateText({
      model: "openai/gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Compare these two images of potentially the same lost/found item.
              
Analyze similarity in: color, shape, brand, size, and identifying features.

Respond with ONLY a number from 0-100 representing the likelihood these are the same item.`,
            },
            {
              type: "image",
              image: imageUrl1,
            },
            {
              type: "image",
              image: imageUrl2,
            },
          ],
        },
      ],
      maxOutputTokens: 10,
    })

    const score = Number.parseInt(text.trim())
    return isNaN(score) ? 0 : Math.min(100, Math.max(0, score))
  } catch (error) {
    console.error("[v0] Error comparing images:", error)
    return 0
  }
}
