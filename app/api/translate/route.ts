import { NextRequest, NextResponse } from 'next/server';
import { translatePageContent } from '@/lib/services/translation';

export async function POST(request: NextRequest) {
    try {
        const { content } = await request.json();

        if (!content || typeof content !== 'object') {
            return NextResponse.json(
                { error: 'Invalid content format' },
                { status: 400 }
            );
        }

        const translated = await translatePageContent(content);

        return NextResponse.json(translated);
    } catch (error) {
        console.error('Translation API error:', error);
        return NextResponse.json(
            { error: 'Translation failed' },
            { status: 500 }
        );
    }
}
