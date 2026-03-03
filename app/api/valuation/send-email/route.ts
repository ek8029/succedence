import { NextRequest, NextResponse } from 'next/server';
import { sendDigestEmail, isValidEmail } from '@/lib/email';
import { ValuationOutput } from '@/lib/valuation';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface SendValuationEmailRequest {
  email: string;
  valuation: ValuationOutput;
  businessName?: string;
  anonymousId?: string;
}

function formatCurrency(value: number): string {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `$${Math.round(value / 1000)}K`;
  return `$${value.toLocaleString()}`;
}

function buildValuationEmailHtml(
  valuation: ValuationOutput,
  businessName: string,
): string {
  const { valuationRange, dealQualityScore, dealQualityGrade, confidence, riskAdjustments, industryData } = valuation;
  const positiveAdj = riskAdjustments.filter(a => a.severity === 'positive').slice(0, 3);
  const negativeAdj = riskAdjustments.filter(a => a.severity === 'negative' || a.severity === 'critical').slice(0, 3);

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Your Business Valuation — Succedence</title>
</head>
<body style="margin:0;padding:0;background:#0f172a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#e2e8f0;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f172a;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

          <!-- Header -->
          <tr>
            <td style="padding-bottom:32px;">
              <p style="margin:0;font-size:22px;font-weight:700;color:#f8fafc;letter-spacing:-0.5px;">Succedence</p>
              <p style="margin:4px 0 0;font-size:13px;color:#64748b;">Free Business Valuation Tool</p>
            </td>
          </tr>

          <!-- Main Card -->
          <tr>
            <td style="background:#1e293b;border:1px solid #334155;border-radius:12px;padding:32px;">
              <p style="margin:0 0 8px;font-size:13px;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;">Your Valuation Results</p>
              <h1 style="margin:0 0 4px;font-size:28px;font-weight:700;color:#f8fafc;">${businessName}</h1>
              <p style="margin:0 0 28px;font-size:14px;color:#64748b;">${industryData.industryName}</p>

              <!-- Valuation Range -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                <tr>
                  <td align="center" style="background:#0f172a;border:1px solid #334155;border-radius:8px;padding:24px;">
                    <p style="margin:0 0 4px;font-size:13px;color:#94a3b8;">Estimated Value</p>
                    <p style="margin:0;font-size:42px;font-weight:700;color:#f59e0b;font-family:monospace;">${formatCurrency(valuationRange.mid)}</p>
                    <p style="margin:4px 0 0;font-size:14px;color:#94a3b8;">Range: ${formatCurrency(valuationRange.low)} — ${formatCurrency(valuationRange.high)}</p>
                  </td>
                </tr>
              </table>

              <!-- Deal Quality -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                <tr>
                  <td width="50%" style="padding-right:8px;">
                    <div style="background:#0f172a;border:1px solid #334155;border-radius:8px;padding:16px;text-align:center;">
                      <p style="margin:0 0 4px;font-size:12px;color:#94a3b8;">Deal Quality Score</p>
                      <p style="margin:0;font-size:28px;font-weight:700;color:${dealQualityScore >= 70 ? '#4ade80' : dealQualityScore >= 50 ? '#facc15' : '#f87171'};">${dealQualityScore}<span style="font-size:16px;color:#94a3b8;">/100</span></p>
                      ${dealQualityGrade ? `<p style="margin:4px 0 0;font-size:13px;color:#94a3b8;">Grade: ${dealQualityGrade}</p>` : ''}
                    </div>
                  </td>
                  <td width="50%" style="padding-left:8px;">
                    <div style="background:#0f172a;border:1px solid #334155;border-radius:8px;padding:16px;text-align:center;">
                      <p style="margin:0 0 4px;font-size:12px;color:#94a3b8;">Confidence</p>
                      <p style="margin:0;font-size:20px;font-weight:700;color:${confidence?.label === 'High' ? '#4ade80' : confidence?.label === 'Medium' ? '#facc15' : '#f87171'};">${confidence?.label ?? 'Medium'}</p>
                      <p style="margin:4px 0 0;font-size:12px;color:#94a3b8;">${confidence?.score ?? 70}/100</p>
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Strengths & Risks -->
              ${positiveAdj.length > 0 ? `
              <div style="margin-bottom:16px;">
                <p style="margin:0 0 8px;font-size:13px;font-weight:600;color:#4ade80;">Key Strengths</p>
                ${positiveAdj.map(a => `<p style="margin:0 0 4px;font-size:13px;color:#94a3b8;padding-left:12px;">✓ ${a.description}</p>`).join('')}
              </div>` : ''}

              ${negativeAdj.length > 0 ? `
              <div style="margin-bottom:24px;">
                <p style="margin:0 0 8px;font-size:13px;font-weight:600;color:#f87171;">Risk Factors</p>
                ${negativeAdj.map(a => `<p style="margin:0 0 4px;font-size:13px;color:#94a3b8;padding-left:12px;">⚠ ${a.description}</p>`).join('')}
              </div>` : ''}

              <!-- Disclaimer -->
              <p style="margin:0;font-size:11px;color:#475569;line-height:1.6;border-top:1px solid #334155;padding-top:16px;">
                This valuation is an estimate based on provided data and market comparables. It is not a certified business appraisal. Actual value may vary. Consult with qualified professionals for major financial decisions.
              </p>
            </td>
          </tr>

          <!-- CTA -->
          <tr>
            <td style="padding:24px 0 0;text-align:center;">
              <a href="https://www.succedence.com/valuation" style="display:inline-block;background:#2563eb;color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;padding:12px 28px;border-radius:8px;">Run Another Valuation</a>
              <p style="margin:16px 0 0;font-size:12px;color:#475569;">Powered by <a href="https://www.succedence.com" style="color:#f59e0b;text-decoration:none;">Succedence.com</a> — Free Business Valuation for Brokers</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function buildValuationEmailText(valuation: ValuationOutput, businessName: string): string {
  const { valuationRange, dealQualityScore, dealQualityGrade, industryData } = valuation;
  return `YOUR BUSINESS VALUATION — SUCCEDENCE
=====================================

Business: ${businessName}
Industry: ${industryData.industryName}

ESTIMATED VALUE
Mid-point: ${formatCurrency(valuationRange.mid)}
Range: ${formatCurrency(valuationRange.low)} — ${formatCurrency(valuationRange.high)}

DEAL QUALITY SCORE: ${dealQualityScore}/100${dealQualityGrade ? ` (Grade ${dealQualityGrade})` : ''}

Run another valuation at https://www.succedence.com/valuation

---
This is an estimate, not a certified appraisal. Powered by Succedence.com`;
}

export async function POST(request: NextRequest) {
  try {
    const body: SendValuationEmailRequest = await request.json();
    const { email, valuation, businessName, anonymousId } = body;

    if (!email || !isValidEmail(email)) {
      return NextResponse.json({ error: 'Valid email address required' }, { status: 400 });
    }

    if (!valuation?.valuationRange) {
      return NextResponse.json({ error: 'Valuation data required' }, { status: 400 });
    }

    const name = businessName || 'Your Business';

    await sendDigestEmail({
      to: email,
      subject: `Your valuation for ${name} — ${formatCurrency(valuation.valuationRange.mid)} estimated value`,
      html: buildValuationEmailHtml(valuation, name),
      text: buildValuationEmailText(valuation, name),
    });

    // If anonymous, record email capture on the valuation record
    if (anonymousId) {
      try {
        // Best-effort: update capturedEmail on the most recent valuation for this anonymousId
        const { createClient } = await import('@/lib/supabase/server');
        const supabase = await createClient();
        const updateData: Record<string, unknown> = { captured_email: email };
        await supabase
          .from('valuations')
          .update(updateData as never)
          .eq('anonymous_id', anonymousId)
          .is('captured_email', null)
          .order('created_at', { ascending: false })
          .limit(1);
      } catch {
        // Non-critical — don't fail the request if DB update fails
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Valuation email error:', error);
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }
}
