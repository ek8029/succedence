const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false }
});

async function fixIndustryNames() {
  console.log('🔧 Starting industry name fixes...');

  const updates = [
    // Technology variations
    { from: 'technology', to: 'Technology Services' },
    { from: 'Technology', to: 'Technology Services' },

    // SaaS variations
    { from: 'saas', to: 'SaaS (Software as a Service)' },
    { from: 'SaaS', to: 'SaaS (Software as a Service)' },
    { from: 'software as a service', to: 'SaaS (Software as a Service)' },

    // E-commerce variations
    { from: 'ecommerce', to: 'E-commerce' },
    { from: 'e-commerce', to: 'E-commerce' },
    { from: 'E-Commerce', to: 'E-commerce' },

    // Food & Beverage variations
    { from: 'food & beverage', to: 'Food & Beverage' },
    { from: 'restaurant', to: 'Food & Beverage' },
    { from: 'restaurants', to: 'Food & Beverage' },
    { from: 'food service', to: 'Food & Beverage' },

    // Manufacturing variations
    { from: 'manufacturing', to: 'Manufacturing' },
    { from: 'Manufacturing (Small-Scale)', to: 'Manufacturing' },

    // Professional Services variations
    { from: 'professional services', to: 'Professional Services' },
    { from: 'services', to: 'Professional Services' },
    { from: 'printing', to: 'Professional Services' },

    // Real Estate variations
    { from: 'real estate', to: 'Real Estate Services' },
    { from: 'Real Estate', to: 'Real Estate Services' },

    // Healthcare variations
    { from: 'healthcare', to: 'Healthcare Services' },
    { from: 'Healthcare', to: 'Healthcare Services' },

    // Education variations
    { from: 'education', to: 'Education & Training' },
    { from: 'Education', to: 'Education & Training' },

    // Transportation variations
    { from: 'transportation', to: 'Transportation & Logistics' },
    { from: 'logistics', to: 'Transportation & Logistics' },

    // Retail variations
    { from: 'retail', to: 'Retail (Local/Traditional)' },
    { from: 'Retail', to: 'Retail (Local/Traditional)' },

    // Marketing variations
    { from: 'digital marketing', to: 'Digital Marketing' },
    { from: 'marketing', to: 'Digital Marketing' },

    // Software Development variations
    { from: 'software development', to: 'Software Development' },
    { from: 'software', to: 'Software Development' },

    // Specific service industries
    { from: 'hvac', to: 'HVAC Services' },
    { from: 'HVAC', to: 'HVAC Services' },
    { from: 'plumbing', to: 'Plumbing Services' },
    { from: 'electrical', to: 'Electrical Services' },
    { from: 'auto repair', to: 'Auto Repair & Service' },
    { from: 'automotive', to: 'Auto Repair & Service' },
    { from: 'construction', to: 'Construction & Contracting' },
    { from: 'cleaning', to: 'Cleaning Services' },
    { from: 'property management', to: 'Property Management' },
    { from: 'medical', to: 'Medical & Dental Practices' },
    { from: 'dental', to: 'Medical & Dental Practices' },
    { from: 'accounting', to: 'Accounting & Tax Services' },
    { from: 'tax services', to: 'Accounting & Tax Services' },
    { from: 'insurance', to: 'Insurance Services' },
    { from: 'legal', to: 'Legal Services' },
    { from: 'beauty', to: 'Beauty & Personal Care' },
    { from: 'personal care', to: 'Beauty & Personal Care' },
    { from: 'pet services', to: 'Pet Services' },
    { from: 'pets', to: 'Pet Services' },
    { from: 'fitness', to: 'Fitness & Wellness' },
    { from: 'wellness', to: 'Fitness & Wellness' },

    // Tech variations
    { from: 'fintech', to: 'FinTech' },
    { from: 'financial technology', to: 'FinTech' },
    { from: 'healthtech', to: 'HealthTech' },
    { from: 'health technology', to: 'HealthTech' },
    { from: 'edtech', to: 'EdTech' },
    { from: 'educational technology', to: 'EdTech' },
    { from: 'media', to: 'Media & Entertainment' },
    { from: 'entertainment', to: 'Media & Entertainment' },
  ];

  let totalUpdates = 0;

  for (const update of updates) {
    try {
      const { data, error } = await supabase
        .from('listings')
        .update({ industry: update.to })
        .eq('industry', update.from)
        .select();

      if (error) {
        console.error(`❌ Error updating ${update.from} -> ${update.to}:`, error);
      } else if (data && data.length > 0) {
        console.log(`✅ Updated ${data.length} records: ${update.from} -> ${update.to}`);
        totalUpdates += data.length;
      }
    } catch (error) {
      console.error(`❌ Error processing ${update.from}:`, error);
    }
  }

  console.log(`\n🎉 Completed! Total records updated: ${totalUpdates}`);

  // Check results
  console.log('\n📊 Current industry distribution:');
  const { data: results, error } = await supabase
    .from('listings')
    .select('industry')
    .not('industry', 'is', null);

  if (error) {
    console.error('Error fetching results:', error);
  } else {
    const counts = {};
    results.forEach(row => {
      counts[row.industry] = (counts[row.industry] || 0) + 1;
    });

    Object.entries(counts)
      .sort(([,a], [,b]) => b - a)
      .forEach(([industry, count]) => {
        console.log(`   ${industry}: ${count}`);
      });
  }
}

fixIndustryNames().catch(console.error);