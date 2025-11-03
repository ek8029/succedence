import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

interface ImportResult {
  success: number;
  failed: number;
  errors: { row: number; error: string }[];
  duplicates: number;
}

function parseCSV(text: string): string[][] {
  const lines = text.split('\n');
  const result: string[][] = [];

  for (const line of lines) {
    if (!line.trim()) continue; // Skip empty lines

    const row: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        row.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    row.push(current.trim());
    result.push(row);
  }

  return result;
}

// Known admin emails - must match middleware and AuthContext
const KNOWN_ADMIN_EMAILS = [
  'evank8029@gmail.com',
  'succedence@gmail.com',
  'founder@succedence.com',
  'clydek627@gmail.com'
];

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();

    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin (either by email or database role)
    const isKnownAdmin = KNOWN_ADMIN_EMAILS.includes(user.email || '');

    if (!isKnownAdmin) {
      // If not in known admin list, check database role
      const { data: userData, error: userError } = await (supabase
        .from('users') as any)
        .select('role')
        .eq('id', user.id)
        .single();

      if (userError || userData?.role !== 'admin') {
        return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
      }
    }

    // Get the file from the request
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Read the file
    const text = await file.text();
    const rows = parseCSV(text);

    if (rows.length < 2) {
      return NextResponse.json({ error: 'CSV file must have at least a header row and one data row' }, { status: 400 });
    }

    // Parse header
    const headers = rows[0].map(h => h.toLowerCase().trim());
    const dataRows = rows.slice(1);

    // Required fields
    const requiredFields = ['title', 'industry', 'city', 'state', 'description'];
    const missingFields = requiredFields.filter(field => !headers.includes(field));

    if (missingFields.length > 0) {
      return NextResponse.json({
        error: `Missing required columns: ${missingFields.join(', ')}`
      }, { status: 400 });
    }

    // Process each row
    const result: ImportResult = {
      success: 0,
      failed: 0,
      errors: [],
      duplicates: 0,
    };

    for (let i = 0; i < dataRows.length; i++) {
      const row = dataRows[i];
      const rowNum = i + 2; // +2 because of header and 0-index

      try {
        // Build listing object
        const listing: any = {
          status: 'active',
        };

        // Map CSV columns to database fields
        headers.forEach((header, idx) => {
          const value = row[idx]?.trim();
          if (!value) return;

          switch (header) {
            case 'title':
              listing.title = value;
              break;
            case 'industry':
              listing.industry = value;
              break;
            case 'city':
              listing.city = value;
              break;
            case 'state':
              listing.state = value;
              break;
            case 'description':
              listing.description = value;
              break;
            case 'price':
            case 'asking_price':
              listing.price = parseFloat(value.replace(/[^0-9.-]/g, ''));
              break;
            case 'revenue':
              listing.revenue = parseFloat(value.replace(/[^0-9.-]/g, ''));
              break;
            case 'ebitda':
              listing.ebitda = parseFloat(value.replace(/[^0-9.-]/g, ''));
              break;
            case 'cash_flow':
              listing.cash_flow = parseFloat(value.replace(/[^0-9.-]/g, ''));
              break;
            case 'year_established':
              listing.year_established = parseInt(value);
              break;
            case 'employees':
              listing.employees = parseInt(value);
              break;
            case 'reason_for_selling':
              listing.reason_for_selling = value;
              break;
            case 'source_url':
              listing.source_url = value;
              break;
            case 'source_website':
              listing.source_website = value;
              break;
            case 'source_id':
              listing.source_id = value;
              break;
            case 'broker_name':
              listing.broker_name = value;
              break;
            case 'broker_company':
              listing.broker_company = value;
              break;
            case 'broker_phone':
              listing.broker_phone = value;
              break;
            case 'broker_email':
              listing.broker_email = value;
              break;
          }
        });

        // Validate required fields
        if (!listing.title || !listing.industry || !listing.city || !listing.state || !listing.description) {
          result.errors.push({
            row: rowNum,
            error: 'Missing required field(s)',
          });
          result.failed++;
          continue;
        }

        // Check for duplicates
        let existing = null;

        // First check by source_website + source_id (more accurate for aggregated listings)
        if (listing.source_website && listing.source_id) {
          const { data } = await (supabase
            .from('listings') as any)
            .select('id')
            .eq('source_website', listing.source_website)
            .eq('source_id', listing.source_id)
            .limit(1);
          existing = data;
        }

        // If no source match, check by title + city + state
        if (!existing || existing.length === 0) {
          const { data } = await (supabase
            .from('listings') as any)
            .select('id')
            .eq('title', listing.title)
            .eq('city', listing.city)
            .eq('state', listing.state)
            .limit(1);
          existing = data;
        }

        if (existing && existing.length > 0) {
          result.duplicates++;
          continue;
        }

        // Insert the listing
        const { error: insertError } = await (supabase
          .from('listings') as any)
          .insert(listing);

        if (insertError) {
          result.errors.push({
            row: rowNum,
            error: insertError.message,
          });
          result.failed++;
        } else {
          result.success++;
        }
      } catch (error) {
        result.errors.push({
          row: rowNum,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
        result.failed++;
      }
    }

    return NextResponse.json({
      success: true,
      result,
    });
  } catch (error) {
    console.error('Error importing listings:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
