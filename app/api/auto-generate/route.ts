import { NextRequest, NextResponse } from 'next/server';
import { autoGenerateToolData } from '@/lib/ai';

export async function POST(request: NextRequest) {
  try {
    const { toolName } = await request.json();

    if (!toolName || typeof toolName !== 'string') {
      return NextResponse.json(
        { error: 'Tool name is required' },
        { status: 400 }
      );
    }

    // Call the auto-generation function server-side
    const result = await autoGenerateToolData(toolName.trim());

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Auto-generation API error:', error);

    // Handle UnknownToolError specifically
    if (error.name === 'UnknownToolError') {
      return NextResponse.json(
        {
          success: false,
          error: 'unknown_tool',
          message: error.message,
          toolName: error.toolName,
          reason: error.reason
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}
