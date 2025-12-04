import { GoogleGenerativeAI } from '@google/generative-ai';
import { Category } from './types';

const genAI = process.env.NEXT_PUBLIC_GEMINI_API_KEY
  ? new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY)
  : null;

/**
 * Decode HTML entities in text
 * Converts &#x27; -> ', &quot; -> ", &amp; -> &, etc.
 */
function decodeHtmlEntities(text: string): string {
  const entityMap: Record<string, string> = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
    '&#x27;': "'",
    '&apos;': "'",
    '&#x2F;': '/',
    '&#47;': '/',
  };

  let decoded = text;

  // Replace named entities
  for (const [entity, char] of Object.entries(entityMap)) {
    decoded = decoded.replace(new RegExp(entity, 'g'), char);
  }

  // Replace numeric entities (&#123; or &#xAB;)
  decoded = decoded.replace(/&#(\d+);/g, (match, dec) => String.fromCharCode(dec));
  decoded = decoded.replace(/&#x([0-9A-Fa-f]+);/g, (match, hex) => String.fromCharCode(parseInt(hex, 16)));

  return decoded;
}

export async function generateDescription(
  toolName: string,
  context: { websiteUrl: string; metaDescription?: string }
): Promise<string> {
  if (!genAI) {
    throw new Error('Gemini API key not configured');
  }

  const prompt = `You are a technical writer. Generate a concise description for this AI tool.

Tool Name: ${toolName}
Official Website: ${context.websiteUrl}
${context.metaDescription ? `Website Description: ${context.metaDescription}` : ''}

Requirements:
1. Length: EXACTLY 150-200 characters (strict requirement)
2. Tone: Professional, informative
3. Content: Focus on PRIMARY use case and key benefit
4. Accuracy: Use ONLY information from website description, no speculation
5. Format: Single sentence, no marketing fluff

Return ONLY the description text, nothing else.`;

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const result = await model.generateContent(prompt);
    let description = result.response.text().trim();

    // Decode HTML entities
    description = decodeHtmlEntities(description);

    // Enforce length constraint
    if (description.length < 150) {
      // Pad with context if too short
      return description.substring(0, 200);
    } else if (description.length > 200) {
      // Truncate if too long
      return description.substring(0, 197) + '...';
    }

    return description;
  } catch (error) {
    throw new Error(`Gemini description generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function categorize(toolName: string, websiteContext: string): Promise<Category> {
  if (!genAI) {
    throw new Error('Gemini API key not configured');
  }

  const prompt = `Categorize this AI tool into exactly ONE category based on its primary function.

Tool: ${toolName}
Context: ${websiteContext}

Categories:
- Image: Image generation, editing, enhancement
- Text: Writing, chat, language processing
- Video: Video creation, editing, generation
- Audio: Music, voice, audio processing
- Code: Programming, development tools
- Productivity: Task management, automation, workflows
- Research: Data analysis, information gathering
- Marketing: Advertising, SEO, content marketing
- AI Tools: General AI platforms or multi-purpose tools

Return ONLY the category name, nothing else.`;

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const result = await model.generateContent(prompt);
    const category = result.response.text().trim() as Category;

    // Validate category
    const validCategories: Category[] = ['Image', 'Text', 'Video', 'Audio', 'Code', 'Productivity', 'Research', 'Marketing', 'AI Tools'];
    if (!validCategories.includes(category)) {
      return 'AI Tools'; // Default fallback
    }

    return category;
  } catch (error) {
    throw new Error(`Gemini categorization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function detectToolType(
  toolName: string,
  context: { websiteUrl: string; metaDescription?: string }
): Promise<'Free' | 'Paid'> {
  if (!genAI) {
    throw new Error('Gemini API key not configured');
  }

  const prompt = `Determine if this AI tool is Free or Paid based on the available information.

Tool Name: ${toolName}
Official Website: ${context.websiteUrl}
Website Description: ${context.metaDescription || 'No description available'}

Instructions:
- Analyze the tool name and website description for pricing indicators
- Look for keywords: "free", "freemium", "free tier", "paid", "subscription", "pricing", "$", "premium", "pro"
- Consider context: If description mentions "free plan" or "free tier", it's still "Free"
- If uncertain and no clear pricing mentioned, default to "Free"

Decision Rules:
1. If tool offers any free tier/plan → "Free"
2. If tool is completely paid/subscription only → "Paid"
3. If unclear or no pricing info → "Free"

Return ONLY one word: "Free" or "Paid"`;

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const result = await model.generateContent(prompt);
    const toolType = result.response.text().trim();

    // Validate and return
    if (toolType === 'Paid') {
      return 'Paid';
    }
    return 'Free'; // Default to Free
  } catch (error) {
    console.error('Gemini tool type detection failed:', error);
    return 'Free'; // Default fallback
  }
}
