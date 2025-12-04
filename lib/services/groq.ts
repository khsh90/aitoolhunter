import { Category } from './types';

interface GroqChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface GroqChatRequest {
  model: string;
  messages: GroqChatMessage[];
  temperature?: number;
  max_tokens?: number;
}

interface GroqChatResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

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

async function callGroqAPI(prompt: string): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    throw new Error('Groq API key not configured');
  }

  const request: GroqChatRequest = {
    model: 'llama-3.1-70b-versatile',
    messages: [
      {
        role: 'user',
        content: prompt
      }
    ],
    temperature: 0.3,
    max_tokens: 500
  };

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(request)
  });

  if (!response.ok) {
    throw new Error(`Groq API error: ${response.status}`);
  }

  const data: GroqChatResponse = await response.json();
  return data.choices[0].message.content.trim();
}

export async function generateDescriptionWithGroq(
  toolName: string,
  context: { websiteUrl: string; metaDescription?: string }
): Promise<string> {
  const prompt = `Generate a concise description for this AI tool in exactly 150-200 characters.

Tool: ${toolName}
Website: ${context.websiteUrl}
${context.metaDescription ? `Description: ${context.metaDescription}` : ''}

Write a single professional sentence describing the primary use case and benefit. Return only the description, no extra text.`;

  let description = await callGroqAPI(prompt);

  // Decode HTML entities
  description = decodeHtmlEntities(description);

  // Enforce length
  if (description.length < 150) {
    return description.substring(0, 200);
  } else if (description.length > 200) {
    return description.substring(0, 197) + '...';
  }

  return description;
}

export async function categorizeWithGroq(toolName: string, websiteContext: string): Promise<Category> {
  const prompt = `Categorize "${toolName}" into ONE category: Image, Text, Video, Audio, Code, Productivity, Research, Marketing, or AI Tools.

Context: ${websiteContext}

Return ONLY the category name.`;

  const category = await callGroqAPI(prompt) as Category;

  const validCategories: Category[] = ['Image', 'Text', 'Video', 'Audio', 'Code', 'Productivity', 'Research', 'Marketing', 'AI Tools'];
  if (!validCategories.includes(category)) {
    return 'AI Tools';
  }

  return category;
}
