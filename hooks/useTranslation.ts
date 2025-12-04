'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

interface TranslatedContent {
    [key: string]: string;
}

/**
 * Hook to manage translated content for a page
 */
export function useTranslation(originalContent: TranslatedContent) {
    const { language } = useLanguage();
    const [content, setContent] = useState<TranslatedContent>(originalContent);
    const [isTranslating, setIsTranslating] = useState(false);

    useEffect(() => {
        async function translate() {
            if (language === 'ar') {
                setIsTranslating(true);
                try {
                    const response = await fetch('/api/translate', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ content: originalContent }),
                    });

                    if (response.ok) {
                        const translated = await response.json();
                        setContent(translated);
                    } else {
                        // Fallback to original content if translation fails
                        setContent(originalContent);
                    }
                } catch (error) {
                    console.error('Translation error:', error);
                    setContent(originalContent);
                } finally {
                    setIsTranslating(false);
                }
            } else {
                setContent(originalContent);
            }
        }

        translate();
    }, [language, originalContent]);

    return { content, isTranslating };
}
