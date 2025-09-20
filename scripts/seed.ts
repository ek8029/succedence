import { config } from 'dotenv';
import { db, users, profiles, preferences, listings, listingMedia } from '../db';

config();

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
    role: 'broker',
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
    kycStatus: 'verified',
  },
  {
    phone: '+1-555-0456',
    company: 'Smith Enterprises',
    headline: 'Restaurant Chain Owner',
    location: 'Miami, FL',
    kycStatus: 'pending',
  },
  {
    phone: '+1-555-0789',
    company: 'DealFlow Partners',
    headline: 'Commercial Real Estate Broker',
    location: 'Denver, CO',
    kycStatus: 'verified',
  },
];

const samplePreferences = [
  {
    industries: ['restaurant', 'retail', 'technology'],
    states: ['TX', 'FL', 'CA'],
    minRevenue: 500000,
    minMetric: 100000,
    metricType: 'ebitda',
    ownerHoursMax: 40,
    priceMax: 2000000,
    alertFrequency: 'daily',
    keywords: ['franchise', 'established', 'growth'],
  },
  {
    industries: ['food service', 'hospitality'],
    states: ['FL', 'GA', 'SC'],
    minRevenue: 1000000,
    minMetric: 200000,
    metricType: 'net_income',
    ownerHoursMax: 20,
    priceMax: 5000000,
    alertFrequency: 'weekly',
    keywords: ['turnkey', 'management'],
  },
  {
    industries: ['all'],
    states: ['CO', 'UT', 'WY'],
    minRevenue: 250000,
    minMetric: 50000,
    metricType: 'sde',
    ownerHoursMax: 60,
    priceMax: 1500000,
    alertFrequency: 'daily',
    keywords: ['small business', 'owner operator'],
  },
];

const sampleListings = [
  {
    source: 'bizbuysell',
    title: 'Established Italian Restaurant - Downtown Location',
    description: 'Profitable family-owned Italian restaurant in prime downtown location. Established 15 years ago with loyal customer base. Full liquor license, outdoor seating, and catering capabilities. Owner retiring.',
    industry: 'restaurant',
    city: 'Austin',
    state: 'TX',
    revenue: 850000,
    ebitda: 180000,
    metricType: 'ebitda',
    ownerHours: 45,
    employees: 12,
    price: 650000,
    status: 'active',
  },
  {
    source: 'bizquest',
    title: 'Tech Consulting Firm - Remote Business',
    description: 'Growing software consulting business specializing in cloud migrations. 95% remote workforce, established client relationships with Fortune 500 companies. Recurring revenue model.',
    industry: 'technology',
    city: 'San Francisco',
    state: 'CA',
    revenue: 1200000,
    ebitda: 350000,
    metricType: 'ebitda',
    ownerHours: 35,
    employees: 8,
    price: 1800000,
    status: 'active',
  },
  {
    source: 'sunbelt',
    title: 'Auto Repair Shop - High Traffic Location',
    description: 'Full-service auto repair shop on busy commercial strip. State inspection license, loyal customer base, modern equipment. Clean financials and growth potential.',
    industry: 'automotive',
    city: 'Dallas',
    state: 'TX',
    revenue: 680000,
    ebitda: 125000,
    metricType: 'sde',
    ownerHours: 50,
    employees: 6,
    price: 495000,
    status: 'active',
  },
  {
    source: 'bizbuysell',
    title: 'Boutique Marketing Agency',
    description: 'Award-winning marketing agency serving mid-market clients. Strong brand, recurring contracts, talented team. Owner wants to focus on new ventures.',
    industry: 'marketing',
    city: 'Miami',
    state: 'FL',
    revenue: 950000,
    ebitda: 220000,
    metricType: 'ebitda',
    ownerHours: 30,
    employees: 15,
    price: 1400000,
    status: 'active',
  },
  {
    source: 'dealstream',
    title: 'Franchise Coffee Shop Chain (3 locations)',
    description: 'Three successful franchise coffee shop locations in growing suburban areas. Strong unit economics, established systems, and growth opportunities.',
    industry: 'food service',
    city: 'Phoenix',
    state: 'AZ',
    revenue: 1100000,
    ebitda: 165000,
    metricType: 'ebitda',
    ownerHours: 25,
    employees: 22,
    price: 850000,
    status: 'active',
  },
  {
    source: 'bizquest',
    title: 'E-commerce Sporting Goods Business',
    description: 'Online sporting goods retailer with 7-year track record. Private label products, Amazon FBA, and direct-to-consumer channels. Automated fulfillment.',
    industry: 'retail',
    city: 'Denver',
    state: 'CO',
    revenue: 2200000,
    ebitda: 440000,
    metricType: 'ebitda',
    ownerHours: 20,
    employees: 5,
    price: 2800000,
    status: 'active',
  },
  {
    source: 'sunbelt',
    title: 'HVAC Service Company',
    description: 'Established HVAC service and installation company. Residential and commercial contracts, fleet of vehicles, trained technicians. Steady recurring revenue.',
    industry: 'services',
    city: 'Atlanta',
    state: 'GA',
    revenue: 1350000,
    ebitda: 285000,
    metricType: 'ebitda',
    ownerHours: 40,
    employees: 18,
    price: 1600000,
    status: 'active',
  },
  {
    source: 'bizbuysell',
    title: 'Manufacturing - Custom Metal Fabrication',
    description: 'Custom metal fabrication shop serving construction and industrial clients. Modern equipment, skilled workforce, and strong order backlog.',
    industry: 'manufacturing',
    city: 'Houston',
    state: 'TX',
    revenue: 1800000,
    ebitda: 390000,
    metricType: 'ebitda',
    ownerHours: 45,
    employees: 24,
    price: 2200000,
    status: 'active',
  },
  {
    source: 'dealstream',
    title: 'Dental Practice - Growing Suburb',
    description: 'Modern dental practice in rapidly growing suburb. Digital equipment, insurance contracts, hygienist team. Owner retiring after 25 years.',
    industry: 'healthcare',
    city: 'Plano',
    state: 'TX',
    revenue: 750000,
    ebitda: 225000,
    metricType: 'collections',
    ownerHours: 32,
    employees: 8,
    price: 900000,
    status: 'active',
  },
  {
    source: 'bizquest',
    title: 'Pet Grooming Salon Chain',
    description: 'Two-location pet grooming business in affluent neighborhoods. Loyal customer base, online booking system, retail sales component.',
    industry: 'services',
    city: 'Scottsdale',
    state: 'AZ',
    revenue: 420000,
    ebitda: 95000,
    metricType: 'sde',
    ownerHours: 35,
    employees: 9,
    price: 385000,
    status: 'active',
  },
  {
    source: 'sunbelt',
    title: 'Commercial Cleaning Service',
    description: 'Established commercial cleaning service with long-term contracts. Office buildings, medical facilities, and retail clients. Well-trained staff.',
    industry: 'services',
    city: 'Tampa',
    state: 'FL',
    revenue: 890000,
    ebitda: 155000,
    metricType: 'ebitda',
    ownerHours: 30,
    employees: 35,
    price: 775000,
    status: 'active',
  },
  {
    source: 'bizbuysell',
    title: 'Fitness Studio - Boutique Concept',
    description: 'High-end boutique fitness studio with personal training and group classes. Strong membership base, premium pricing, modern equipment.',
    industry: 'fitness',
    city: 'Charleston',
    state: 'SC',
    revenue: 320000,
    ebitda: 75000,
    metricType: 'sde',
    ownerHours: 25,
    employees: 6,
    price: 295000,
    status: 'active',
  },
  {
    source: 'dealstream',
    title: 'SaaS Platform - Property Management',
    description: 'B2B SaaS platform for property management companies. Recurring revenue, low churn, growing market. Seeking strategic buyer.',
    industry: 'technology',
    city: 'Austin',
    state: 'TX',
    revenue: 1600000,
    ebitda: 480000,
    metricType: 'arr',
    ownerHours: 40,
    employees: 12,
    price: 4800000,
    status: 'active',
  },
  {
    source: 'bizquest',
    title: 'Dry Cleaning Business - Multiple Locations',
    description: 'Four-location dry cleaning business with pickup/delivery service. Modern equipment, environmental compliance, established routes.',
    industry: 'services',
    city: 'Orlando',
    state: 'FL',
    revenue: 1250000,
    ebitda: 235000,
    metricType: 'ebitda',
    ownerHours: 35,
    employees: 28,
    price: 1100000,
    status: 'active',
  },
  {
    source: 'sunbelt',
    title: 'Landscape Design & Installation',
    description: 'Full-service landscape design, installation, and maintenance company. High-end residential and commercial clients. Award-winning designs.',
    industry: 'services',
    city: 'Raleigh',
    state: 'NC',
    revenue: 1450000,
    ebitda: 275000,
    metricType: 'ebitda',
    ownerHours: 42,
    employees: 20,
    price: 1650000,
    status: 'active',
  },
  {
    source: 'bizbuysell',
    title: 'Specialty Food Distributor',
    description: 'Regional specialty food distributor serving restaurants and gourmet markets. Established supplier relationships, refrigerated warehouse.',
    industry: 'food service',
    city: 'Nashville',
    state: 'TN',
    revenue: 3200000,
    ebitda: 385000,
    metricType: 'ebitda',
    ownerHours: 45,
    employees: 16,
    price: 2400000,
    status: 'active',
  },
  {
    source: 'dealstream',
    title: 'Medical Equipment Rental',
    description: 'Medical equipment rental and sales business serving hospitals and clinics. Maintenance contracts, insurance billing, growth market.',
    industry: 'healthcare',
    city: 'Salt Lake City',
    state: 'UT',
    revenue: 980000,
    ebitda: 195000,
    metricType: 'ebitda',
    ownerHours: 38,
    employees: 11,
    price: 1200000,
    status: 'active',
  },
  {
    source: 'bizquest',
    title: 'Print Shop - Commercial & Digital',
    description: 'Full-service print shop with commercial and digital capabilities. Design services, wide format printing, direct mail campaigns.',
    industry: 'printing',
    city: 'Virginia Beach',
    state: 'VA',
    revenue: 650000,
    ebitda: 115000,
    metricType: 'sde',
    ownerHours: 48,
    employees: 8,
    price: 525000,
    status: 'active',
  },
  {
    source: 'sunbelt',
    title: 'Children\'s Learning Center',
    description: 'Licensed childcare center with pre-K program. State-of-the-art facility, experienced staff, waiting list for enrollment.',
    industry: 'education',
    city: 'Charlotte',
    state: 'NC',
    revenue: 580000,
    ebitda: 125000,
    metricType: 'ebitda',
    ownerHours: 40,
    employees: 15,
    price: 650000,
    status: 'active',
  },
  {
    source: 'bizbuysell',
    title: 'Mobile App Development Agency',
    description: 'Boutique mobile app development agency with Fortune 1000 clients. Proprietary development framework, recurring maintenance contracts.',
    industry: 'technology',
    city: 'Seattle',
    state: 'WA',
    revenue: 1100000,
    ebitda: 275000,
    metricType: 'ebitda',
    ownerHours: 35,
    employees: 14,
    price: 1925000,
    status: 'active',
  },
];

async function seedDatabase() {
  try {
    console.log('Starting database seed...');

    // Create users
    console.log('Creating users...');
    const createdUsers = [];
    for (const userData of sampleUsers) {
      const user = await db.insert(users).values(userData).returning();
      createdUsers.push(user[0]);
      console.log(`Created user: ${user[0].email}`);
    }

    // Create profiles
    console.log('Creating profiles...');
    for (let i = 0; i < createdUsers.length; i++) {
      const profileData = {
        userId: createdUsers[i].id,
        ...sampleProfiles[i],
      };
      await db.insert(profiles).values(profileData);
      console.log(`Created profile for user: ${createdUsers[i].email}`);
    }

    // Create preferences
    console.log('Creating preferences...');
    for (let i = 0; i < createdUsers.length; i++) {
      const preferencesData = {
        userId: createdUsers[i].id,
        ...samplePreferences[i],
      };
      await db.insert(preferences).values(preferencesData);
      console.log(`Created preferences for user: ${createdUsers[i].email}`);
    }

    // Create listings
    console.log('Creating listings...');
    const createdListings = [];
    for (const listingData of sampleListings) {
      const listing = await db.insert(listings).values(listingData).returning();
      createdListings.push(listing[0]);
      console.log(`Created listing: ${listing[0].title}`);
    }

    // Add some sample media for first 5 listings
    console.log('Adding sample media...');
    for (let i = 0; i < Math.min(5, createdListings.length); i++) {
      const mediaData = [
        {
          listingId: createdListings[i].id,
          url: `https://example.com/images/listing-${i + 1}-1.jpg`,
          kind: 'photo',
        },
        {
          listingId: createdListings[i].id,
          url: `https://example.com/images/listing-${i + 1}-2.jpg`,
          kind: 'photo',
        },
      ];

      for (const media of mediaData) {
        await db.insert(listingMedia).values(media);
      }
      console.log(`Added media for listing: ${createdListings[i].title}`);
    }

    console.log('✅ Database seeding completed successfully!');
    console.log(`Created ${createdUsers.length} users, ${createdListings.length} listings`);

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

// Run the seed function
seedDatabase();