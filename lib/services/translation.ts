import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || '');

interface TranslationCache {
    [key: string]: string;
}

// In-memory cache for translations
const translationCache: TranslationCache = {};

/**
 * Translate text from English to Arabic using Gemini
 */
export async function translateToArabic(text: string): Promise<string> {
    // Check cache first
    const cacheKey = `en_ar_${text}`;
    if (translationCache[cacheKey]) {
        console.log('📦 Using cached translation');
        return translationCache[cacheKey];
    }

    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

        const prompt = `Translate the following English text to Arabic. Provide ONLY the Arabic translation without any explanations or additional text:

"${text}"

Arabic translation:`;

        const result = await model.generateContent(prompt);
        const translation = result.response.text().trim();

        // Cache the translation
        translationCache[cacheKey] = translation;

        return translation;
    } catch (error) {
        console.error('Translation error:', error);
        return text; // Return original text if translation fails
    }
}

/**
 * Translate page content to Arabic
 */
export async function translatePageContent(content: Record<string, string>): Promise<Record<string, string>> {
    const translated: Record<string, string> = {};

    for (const [key, value] of Object.entries(content)) {
        if (typeof value === 'string' && value.trim()) {
            translated[key] = await translateToArabic(value);
        } else {
            translated[key] = value;
        }
    }

    return translated;
}

/**
 * Batch translate multiple texts
 */
export async function batchTranslate(texts: string[]): Promise<string[]> {
    const uniqueTexts = Array.from(new Set(texts));
    const translations: string[] = [];

    for (const text of uniqueTexts) {
        const translation = await translateToArabic(text);
        translations.push(translation);
    }

    // Map back to original array (handling duplicates)
    return texts.map(text => {
        const index = uniqueTexts.indexOf(text);
        return translations[index];
    });
}
