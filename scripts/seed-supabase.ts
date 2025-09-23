import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false }
});

const sampleUsers = [
  {
    email: 'john.doe@example.com',
    name: 'John Doe',
    role: 'buyer',
    plan: 'premium',
    status: 'active',
  },
  {
    email: 'jane.smith@example.com',
    name: 'Jane Smith',
    role: 'seller',
    plan: 'basic',
    status: 'active',
  },
  {
    email: 'broker@deals.com',
    name: 'Mike Broker',
    role: 'seller',
    plan: 'professional',
    status: 'active',
  },
];

const sampleProfiles = [
  {
    phone: '+1-555-0123',
    company: 'Investment Partners LLC',
    headline: 'Serial Entrepreneur & Business Buyer',
    location: 'Austin, TX',
    kyc_status: 'verified',
  },
  {
    phone: '+1-555-0456',
    company: 'Smith Enterprises',
    headline: 'Restaurant Chain Owner',
    location: 'Miami, FL',
    kyc_status: 'pending',
  },
  {
    phone: '+1-555-0789',
    company: 'DealFlow Partners',
    headline: 'Commercial Real Estate Broker',
    location: 'Denver, CO',
    kyc_status: 'verified',
  },
];

const enhancedBusinessListings = [
  {
    source: 'bizbuysell',
    title: 'Award-Winning Italian Restaurant - Prime Downtown Location',
    description: 'Established 18 years ago, this family-owned Italian restaurant has built a loyal customer base in the heart of downtown Austin. Features include a full liquor license, outdoor patio seating for 40 guests, a wood-fired pizza oven, and an established catering operation serving corporate clients. The restaurant has received multiple local awards including "Best Italian" three years running. Current owners are retiring but have trained management team in place.',
    industry: 'Food & Beverage',
    city: 'Austin',
    state: 'TX',
    revenue: 1200000,
    ebitda: 280000,
    metric_type: 'ebitda',
    owner_hours: 35,
    employees: 18,
    price: 875000,
    status: 'active',
  },
  {
    source: 'bizquest',
    title: 'Cloud Migration Consulting Firm - 95% Remote Workforce',
    description: 'Rapidly growing B2B consulting firm specializing in enterprise cloud migrations and digital transformation. 95% remote workforce with established client relationships including Fortune 500 companies. Recurring revenue model with 85% client retention rate. Proprietary methodologies and IP. Strong pipeline and growing demand. Owner looking to scale with strategic partner.',
    industry: 'Technology Services',
    city: 'San Francisco',
    state: 'CA',
    revenue: 2100000,
    ebitda: 525000,
    metric_type: 'ebitda',
    owner_hours: 40,
    employees: 12,
    price: 2800000,
    status: 'active',
  },
  {
    source: 'sunbelt',
    title: 'Full-Service Auto Repair - State Inspection Station',
    description: 'Well-established auto repair shop on busy commercial boulevard with high visibility and traffic. State-certified inspection station with loyal customer base built over 15 years. Modern equipment including computerized diagnostics, alignment machine, and four service bays. Clean financials, excellent reputation, and strong cash flow. Growth potential with extended hours.',
    industry: 'Auto Repair & Service',
    city: 'Dallas',
    state: 'TX',
    revenue: 850000,
    ebitda: 185000,
    metric_type: 'sde',
    owner_hours: 45,
    employees: 8,
    price: 650000,
    status: 'active',
  },
  {
    source: 'bizbuysell',
    title: 'Boutique Digital Marketing Agency - Award-Winning',
    description: 'Prestigious digital marketing agency serving mid-market and enterprise clients. Award-winning creative team with strong brand recognition. Recurring contracts with high-profile clients in healthcare, finance, and technology sectors. Proprietary analytics platform and proven ROI methodologies. Owner transitioning to advisory role. Excellent growth trajectory and market position.',
    industry: 'Digital Marketing',
    city: 'Miami',
    state: 'FL',
    revenue: 1400000,
    ebitda: 350000,
    metric_type: 'ebitda',
    owner_hours: 35,
    employees: 22,
    price: 1850000,
    status: 'active',
  },
  {
    source: 'dealstream',
    title: 'Franchise Coffee Shop Portfolio (4 Locations)',
    description: 'Four successful franchise coffee shop locations in high-traffic suburban areas with strong unit economics. Established systems, trained management teams, and growth opportunities. Drive-thru operations at all locations. Strong same-store sales growth and excellent franchise support. Perfect for owner-operator or investment group looking for established cash flow.',
    industry: 'Food & Beverage',
    city: 'Phoenix',
    state: 'AZ',
    revenue: 1800000,
    ebitda: 285000,
    metric_type: 'ebitda',
    owner_hours: 25,
    employees: 35,
    price: 1350000,
    status: 'active',
  },
  {
    source: 'bizquest',
    title: 'E-commerce Sporting Goods - Amazon FBA + Direct-to-Consumer',
    description: 'Profitable online sporting goods retailer with diversified sales channels including Amazon FBA, Shopify store, and B2B wholesale. Private label products with strong brand recognition. Automated fulfillment systems, established supplier relationships, and growing subscription business. Significant growth potential in international markets.',
    industry: 'E-commerce',
    city: 'Denver',
    state: 'CO',
    revenue: 3200000,
    ebitda: 640000,
    metric_type: 'ebitda',
    owner_hours: 30,
    employees: 8,
    price: 3600000,
    status: 'active',
  },
  {
    source: 'sunbelt',
    title: 'HVAC Service & Installation - Commercial Focus',
    description: 'Established HVAC company with strong commercial and residential client base. Service contracts provide recurring revenue. Fleet of service vehicles, warehouse facility, and trained technician team. Strong relationships with general contractors and property management companies. Excellent reputation and growth potential with residential expansion.',
    industry: 'HVAC Services',
    city: 'Atlanta',
    state: 'GA',
    revenue: 2100000,
    ebitda: 420000,
    metric_type: 'ebitda',
    owner_hours: 40,
    employees: 25,
    price: 2400000,
    status: 'active',
  },
  {
    source: 'bizbuysell',
    title: 'Custom Metal Fabrication - Industrial & Construction',
    description: 'Precision metal fabrication shop serving construction, industrial, and architectural markets. Modern CNC equipment, skilled workforce, and strong order backlog. Established relationships with general contractors and industrial clients. Clean facility with room for expansion. Excellent growth potential in renewable energy sector.',
    industry: 'Manufacturing',
    city: 'Houston',
    state: 'TX',
    revenue: 2800000,
    ebitda: 560000,
    metric_type: 'ebitda',
    owner_hours: 45,
    employees: 32,
    price: 3200000,
    status: 'active',
  },
  {
    source: 'dealstream',
    title: 'Modern Dental Practice - Rapidly Growing Suburb',
    description: 'State-of-the-art dental practice in one of the fastest-growing suburbs in Texas. Digital X-ray, intraoral cameras, and modern patient management systems. Insurance contracts with major providers. Established patient base of 2,800+ active patients. Owner retiring after 22 years. Excellent opportunity for associate dentist or practice group.',
    industry: 'Medical & Dental Practices',
    city: 'Plano',
    state: 'TX',
    revenue: 1100000,
    ebitda: 385000,
    metric_type: 'collections',
    owner_hours: 32,
    employees: 12,
    price: 1400000,
    status: 'active',
  },
  {
    source: 'bizquest',
    title: 'Luxury Pet Grooming & Daycare - Two Locations',
    description: 'Premium pet grooming and daycare service with two locations in affluent neighborhoods. Loyal customer base, online booking system, and retail component. Climate-controlled facilities with webcam monitoring for daycare. Strong recurring revenue from grooming subscriptions and daycare memberships. Excellent growth potential for additional locations.',
    industry: 'Pet Services',
    city: 'Scottsdale',
    state: 'AZ',
    revenue: 680000,
    ebitda: 165000,
    metric_type: 'sde',
    owner_hours: 35,
    employees: 15,
    price: 725000,
    status: 'active',
  },
  {
    source: 'sunbelt',
    title: 'Commercial Cleaning Service - Long-Term Contracts',
    description: 'Established commercial cleaning service with portfolio of long-term contracts including office buildings, medical facilities, and retail spaces. Night and weekend operations allow for daytime management. Well-trained staff, quality control systems, and excellent client retention. Bonded and insured with strong safety record.',
    industry: 'Cleaning Services',
    city: 'Tampa',
    state: 'FL',
    revenue: 1350000,
    ebitda: 270000,
    metric_type: 'ebitda',
    owner_hours: 35,
    employees: 45,
    price: 1200000,
    status: 'active',
  },
  {
    source: 'bizbuysell',
    title: 'High-End Fitness Studio - Boutique Concept',
    description: 'Premium fitness studio offering personal training, group classes, and specialized programs. High-end equipment, experienced trainers, and strong membership base with premium pricing. Corporate wellness contracts and nutrition coaching services. Located in affluent area with limited competition. Strong brand and growth potential.',
    industry: 'Fitness & Wellness',
    city: 'Charleston',
    state: 'SC',
    revenue: 485000,
    ebitda: 125000,
    metric_type: 'sde',
    owner_hours: 30,
    employees: 8,
    price: 525000,
    status: 'active',
  },
  {
    source: 'dealstream',
    title: 'B2B SaaS Platform - Property Management Software',
    description: 'Profitable B2B SaaS platform serving property management companies with 200+ clients. Recurring subscription revenue, low churn rate, and strong customer satisfaction scores. Modern tech stack, API integrations, and mobile apps. Growing market opportunity and excellent unit economics. Seeking strategic buyer for accelerated growth.',
    industry: 'Technology Services',
    city: 'Austin',
    state: 'TX',
    revenue: 2400000,
    ebitda: 720000,
    metric_type: 'arr',
    owner_hours: 40,
    employees: 18,
    price: 7200000,
    status: 'active',
  },
  {
    source: 'bizquest',
    title: 'Multi-Location Dry Cleaning Chain - Pickup/Delivery',
    description: 'Five-location dry cleaning business with pickup and delivery service throughout metropolitan area. Modern equipment, environmental compliance, and established routes. Strong brand recognition and customer loyalty. Plant and satellite locations with growth potential for additional routes and locations.',
    industry: 'Cleaning Services',
    city: 'Orlando',
    state: 'FL',
    revenue: 1850000,
    ebitda: 370000,
    metric_type: 'ebitda',
    owner_hours: 40,
    employees: 38,
    price: 1650000,
    status: 'active',
  },
  {
    source: 'sunbelt',
    title: 'Landscape Design & Build - High-End Residential',
    description: 'Full-service landscape design, installation, and maintenance company serving luxury residential market. Award-winning designs, skilled crews, and established client relationships. Design-build capabilities with project values up to $500K. Strong recurring maintenance revenue and excellent reputation in target market.',
    industry: 'Professional Services',
    city: 'Raleigh',
    state: 'NC',
    revenue: 2200000,
    ebitda: 440000,
    metric_type: 'ebitda',
    owner_hours: 45,
    employees: 28,
    price: 2500000,
    status: 'active',
  },
  {
    source: 'bizbuysell',
    title: 'Specialty Food Distribution - Regional Gourmet Market',
    description: 'Regional specialty food distributor serving upscale restaurants, gourmet markets, and culinary institutions. Established supplier relationships, refrigerated warehouse, and delivery fleet. Strong relationships with chefs and buyers. Growing market for artisanal and specialty foods presents excellent expansion opportunities.',
    industry: 'Food & Beverage',
    city: 'Nashville',
    state: 'TN',
    revenue: 4500000,
    ebitda: 675000,
    metric_type: 'ebitda',
    owner_hours: 45,
    employees: 22,
    price: 3800000,
    status: 'active',
  },
  {
    source: 'dealstream',
    title: 'Medical Equipment Rental & Sales - Regional Leader',
    description: 'Leading provider of medical equipment rental and sales serving hospitals, clinics, and home healthcare providers. Maintenance and service contracts provide recurring revenue. Insurance billing capabilities and strong relationships with healthcare systems. Growing market driven by aging population and healthcare expansion.',
    industry: 'Healthcare Services',
    city: 'Salt Lake City',
    state: 'UT',
    revenue: 1650000,
    ebitda: 330000,
    metric_type: 'ebitda',
    owner_hours: 40,
    employees: 16,
    price: 1950000,
    status: 'active',
  },
  {
    source: 'bizquest',
    title: 'Commercial Printing & Marketing Services',
    description: 'Full-service commercial printing company with digital and offset capabilities. Design services, wide format printing, direct mail campaigns, and promotional products. Diverse client base including healthcare, education, and professional services. Modern equipment and strong reputation for quality and service.',
    industry: 'Professional Services',
    city: 'Virginia Beach',
    state: 'VA',
    revenue: 980000,
    ebitda: 195000,
    metric_type: 'sde',
    owner_hours: 45,
    employees: 12,
    price: 850000,
    status: 'active',
  },
  {
    source: 'sunbelt',
    title: 'Licensed Childcare Center - Established 12 Years',
    description: 'Licensed childcare center serving infants through pre-K with excellent reputation and waiting list. State-of-the-art facility, experienced staff, and strong parent satisfaction. Licensed for 85 children with expansion potential. Located in growing suburban area with limited competition.',
    industry: 'Education & Training',
    city: 'Charlotte',
    state: 'NC',
    revenue: 750000,
    ebitda: 180000,
    metric_type: 'ebitda',
    owner_hours: 40,
    employees: 22,
    price: 950000,
    status: 'active',
  },
  {
    source: 'bizbuysell',
    title: 'Mobile App Development Agency - Enterprise Focus',
    description: 'Boutique mobile app development agency specializing in enterprise solutions for Fortune 1000 clients. Proprietary development framework, experienced team, and recurring maintenance contracts. Strong client relationships and excellent reputation for complex projects. Growing market for digital transformation services.',
    industry: 'Technology Services',
    city: 'Seattle',
    state: 'WA',
    revenue: 1800000,
    ebitda: 450000,
    metric_type: 'ebitda',
    owner_hours: 40,
    employees: 20,
    price: 3150000,
    status: 'active',
  },
];

async function seedDatabase() {
  try {
    console.log('🌱 Starting Supabase database seed...');

    // Create users first
    console.log('👥 Creating users...');
    const createdUsers = [];

    for (const userData of sampleUsers) {
      const { data: user, error } = await supabase
        .from('users')
        .insert(userData)
        .select()
        .single();

      if (error) {
        console.error(`Error creating user ${userData.email}:`, error);
        continue;
      }

      createdUsers.push(user);
      console.log(`✅ Created user: ${user.email}`);
    }

    // Create profiles
    console.log('📋 Creating profiles...');
    for (let i = 0; i < createdUsers.length; i++) {
      const profileData = {
        user_id: createdUsers[i].id,
        ...sampleProfiles[i],
      };

      const { error } = await supabase
        .from('profiles')
        .insert(profileData);

      if (error) {
        console.error(`Error creating profile for ${createdUsers[i].email}:`, error);
      } else {
        console.log(`✅ Created profile for: ${createdUsers[i].email}`);
      }
    }

    // Create business listings
    console.log('🏢 Creating business listings...');
    const createdListings = [];

    for (const listingData of enhancedBusinessListings) {
      const { data: listing, error } = await supabase
        .from('listings')
        .insert(listingData)
        .select()
        .single();

      if (error) {
        console.error(`Error creating listing "${listingData.title}":`, error);
        continue;
      }

      createdListings.push(listing);
      console.log(`✅ Created listing: ${listing.title}`);
    }

    // Add sample media for first few listings
    console.log('📸 Adding sample media...');
    const sampleMediaUrls = [
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=600&fit=crop', // Restaurant
      'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=600&fit=crop', // Office/Tech
      'https://images.unsplash.com/photo-1487754180451-c456f719a1fc?w=800&h=600&fit=crop', // Auto shop
      'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&h=600&fit=crop', // Marketing office
      'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&h=600&fit=crop', // Coffee shop
    ];

    for (let i = 0; i < Math.min(5, createdListings.length); i++) {
      const mediaData = [
        {
          listing_id: createdListings[i].id,
          url: sampleMediaUrls[i] || `https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&h=600&fit=crop`,
          kind: 'photo',
        },
        {
          listing_id: createdListings[i].id,
          url: `https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=600&fit=crop`,
          kind: 'photo',
        },
      ];

      for (const media of mediaData) {
        const { error } = await supabase
          .from('listing_media')
          .insert(media);

        if (error) {
          console.error(`Error adding media for ${createdListings[i].title}:`, error);
        }
      }
      console.log(`✅ Added media for: ${createdListings[i].title}`);
    }

    console.log('🎉 Database seeding completed successfully!');
    console.log(`📊 Summary:`);
    console.log(`   👥 Users created: ${createdUsers.length}`);
    console.log(`   🏢 Listings created: ${createdListings.length}`);
    console.log(`   📸 Media items added: ${Math.min(5, createdListings.length) * 2}`);

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

// Run the seed function
seedDatabase();