import { NextRequest, NextResponse } from 'next/server';
import { isAIEnabled } from '@/lib/ai/openai';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  // Get raw environment variable values
  const aiEnabledRaw = process.env.AI_FEATURES_ENABLED;
  const openaiKeyRaw = process.env.OPENAI_API_KEY;

  // Check each condition individually
  const condition1 = aiEnabledRaw === 'true';
  const condition2 = aiEnabledRaw === 'TRUE';
  const condition3 = aiEnabledRaw === '1';
  const anyConditionMet = condition1 || condition2 || condition3;
  const hasOpenAIKey = !!openaiKeyRaw;
  const isEnabled = isAIEnabled();

  const result = {
    timestamp: new Date().toISOString(),
    raw_values: {
      AI_FEATURES_ENABLED: aiEnabledRaw,
      AI_FEATURES_ENABLED_TYPE: typeof aiEnabledRaw,
      AI_FEATURES_ENABLED_LENGTH: aiEnabledRaw?.length || 0,
      OPENAI_API_KEY_EXISTS: hasOpenAIKey,
      OPENAI_API_KEY_LENGTH: openaiKeyRaw?.length || 0,
      OPENAI_API_KEY_STARTS_WITH: openaiKeyRaw?.substring(0, 10) || null,
    },
    checks: {
      'aiEnabledRaw === "true"': condition1,
      'aiEnabledRaw === "TRUE"': condition2,
      'aiEnabledRaw === "1"': condition3,
      anyConditionMet: anyConditionMet,
      hasOpenAIKey: hasOpenAIKey,
      'isAIEnabled() result': isEnabled,
    },
    all_env_keys: Object.keys(process.env).filter(key =>
      key.includes('AI') || key.includes('OPENAI') || key.includes('NEXT_PUBLIC')
    ),
    diagnosis: {
      should_work: anyConditionMet && hasOpenAIKey,
      actual_result: isEnabled,
      matches: (anyConditionMet && hasOpenAIKey) === isEnabled,
      problem: !isEnabled ?
        (!anyConditionMet ? 'AI_FEATURES_ENABLED not set to valid value' :
         !hasOpenAIKey ? 'OPENAI_API_KEY not found' :
         'Unknown issue') :
        'Everything looks good'
    }
  };

  return NextResponse.json(result, { status: 200 });
}