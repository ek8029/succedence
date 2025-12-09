import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import {
  calculateValuationSimple,
  buildCommentaryPrompt,
  generateFallbackCommentary,
  ValuationCalculatorInput,
  ValuationCalculatorOutput,
} from '@/lib/valuation/ai-valuation-calculator';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Lazy initialize OpenAI
let openai: OpenAI | null = null;
const getOpenAI = () => {
  if (!openai) {
    openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return openai;
};

interface AIValuationRequest extends ValuationCalculatorInput {
  includeCommentary?: boolean; // Default true
}

interface AIValuationResponse {
  method: 'sde' | 'ebitda' | 'revenue';
  multiple: number;
  adjustedMultiple: number;
  valuation: number;
  valuationRange: { low: number; mid: number; high: number };
  commentary: string;
  // Additional context
  methodUsed: string;
  baseValue: number;
  industryName: string;
  fallbackApplied: boolean;
  fallbackReason?: string;
  appliedAdjustments: string[];
  confidenceScore: number;
}

export async function POST(request: NextRequest) {
  try {
    const body: AIValuationRequest = await request.json();

    // Validate required fields
    if (!body.industryKey) {
      return NextResponse.json(
        { error: 'industryKey is required' },
        { status: 400 }
      );
    }

    if (!body.financials || (!body.financials.sde && !body.financials.ebitda && !body.financials.revenue)) {
      return NextResponse.json(
        { error: 'At least one financial metric (sde, ebitda, or revenue) is required' },
        { status: 400 }
      );
    }

    // Default method to SDE if not specified
    const method = body.method || 'sde';

    // Calculate valuation (deterministic math with adjustments)
    const calculatorInput: ValuationCalculatorInput = {
      industryKey: body.industryKey,
      financials: body.financials,
      method,
      multiples: body.multiples,
      dealQuality: body.dealQuality,
      volatility: body.volatility,
      ownerHours: body.ownerHours,
      adjustments: body.adjustments,
    };

    let result: ValuationCalculatorOutput;
    try {
      result = calculateValuationSimple(calculatorInput);
    } catch (calcError) {
      return NextResponse.json(
        { error: calcError instanceof Error ? calcError.message : 'Calculation failed' },
        { status: 400 }
      );
    }

    // Generate AI commentary if requested (default: true)
    const includeCommentary = body.includeCommentary !== false;
    let commentary = '';

    if (includeCommentary && process.env.OPENAI_API_KEY) {
      try {
        const prompt = buildCommentaryPrompt(result);
        const client = getOpenAI();

        const completion = await client.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'You are a professional business valuation analyst. Provide concise, factual commentary.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          max_tokens: 200,
          temperature: 0.3, // Low temperature for consistent, factual output
        });

        commentary = completion.choices[0]?.message?.content?.trim() || '';
      } catch (aiError) {
        console.error('AI commentary generation failed:', aiError);
        // Fallback to enhanced template commentary
        commentary = generateFallbackCommentary(result);
      }
    } else {
      // No AI available, use enhanced fallback
      commentary = generateFallbackCommentary(result);
    }

    const response: AIValuationResponse = {
      method: result.method,
      multiple: result.multiple,
      adjustedMultiple: result.adjustedMultiple,
      valuation: result.valuation,
      valuationRange: result.valuationRange,
      commentary,
      methodUsed: result.methodUsed,
      baseValue: result.baseValue,
      industryName: result.industryName,
      fallbackApplied: result.fallbackApplied,
      fallbackReason: result.fallbackReason,
      appliedAdjustments: result.appliedAdjustments,
      confidenceScore: result.confidenceScore,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('AI valuation error:', error);
    return NextResponse.json(
      { error: 'Failed to process valuation request' },
      { status: 500 }
    );
  }
}
