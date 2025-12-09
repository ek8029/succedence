// Industry-specific valuation multiples
// Based on BizBuySell, IBBA market data, and industry research

import { IndustryMultipleData } from './types';

export const INDUSTRY_MULTIPLES: Record<string, IndustryMultipleData> = {
  // ============= SERVICE BUSINESSES =============
  professional_services: {
    industryKey: 'professional_services',
    industryName: 'Professional Services',
    naicsCode: '54',
    sde: { low: 2.0, mid: 2.5, high: 3.5 },
    ebitda: { low: 3.0, mid: 4.0, high: 5.5 },
    revenue: { low: 0.4, mid: 0.6, high: 0.9 },
    typicalOwnerHours: 45,
    volatility: 'low',
  },
  accounting: {
    industryKey: 'accounting',
    industryName: 'Accounting & Tax Services',
    naicsCode: '541211',
    sde: { low: 1.0, mid: 1.25, high: 1.5 },
    ebitda: { low: 2.0, mid: 3.0, high: 4.0 },
    revenue: { low: 0.8, mid: 1.1, high: 1.4 },
    typicalOwnerHours: 50,
    volatility: 'low',
  },
  insurance_agency: {
    industryKey: 'insurance_agency',
    industryName: 'Insurance Agency',
    naicsCode: '524210',
    sde: { low: 1.5, mid: 2.0, high: 2.5 },
    ebitda: { low: 3.0, mid: 4.5, high: 6.0 },
    revenue: { low: 1.0, mid: 1.5, high: 2.2 },
    typicalOwnerHours: 40,
    volatility: 'low',
  },
  staffing: {
    industryKey: 'staffing',
    industryName: 'Staffing & Recruiting',
    naicsCode: '561311',
    sde: { low: 2.0, mid: 3.0, high: 4.0 },
    ebitda: { low: 3.5, mid: 5.0, high: 7.0 },
    revenue: { low: 0.3, mid: 0.5, high: 0.8 },
    typicalOwnerHours: 50,
    volatility: 'medium',
  },
  marketing_agency: {
    industryKey: 'marketing_agency',
    industryName: 'Marketing & Advertising Agency',
    naicsCode: '541810',
    sde: { low: 2.0, mid: 3.0, high: 4.5 },
    ebitda: { low: 3.0, mid: 4.5, high: 6.5 },
    revenue: { low: 0.5, mid: 0.8, high: 1.2 },
    typicalOwnerHours: 45,
    volatility: 'medium',
  },

  // ============= TRADES & HOME SERVICES =============
  hvac: {
    industryKey: 'hvac',
    industryName: 'HVAC Services',
    naicsCode: '238220',
    sde: { low: 2.5, mid: 3.0, high: 4.0 },
    ebitda: { low: 3.5, mid: 4.5, high: 6.0 },
    revenue: { low: 0.5, mid: 0.7, high: 1.0 },
    typicalOwnerHours: 50,
    volatility: 'low',
  },
  plumbing: {
    industryKey: 'plumbing',
    industryName: 'Plumbing Services',
    naicsCode: '238220',
    sde: { low: 2.0, mid: 2.8, high: 3.5 },
    ebitda: { low: 3.0, mid: 4.0, high: 5.0 },
    revenue: { low: 0.4, mid: 0.6, high: 0.85 },
    typicalOwnerHours: 50,
    volatility: 'low',
  },
  electrical: {
    industryKey: 'electrical',
    industryName: 'Electrical Services',
    naicsCode: '238210',
    sde: { low: 2.0, mid: 2.8, high: 3.5 },
    ebitda: { low: 3.0, mid: 4.0, high: 5.5 },
    revenue: { low: 0.4, mid: 0.6, high: 0.9 },
    typicalOwnerHours: 50,
    volatility: 'low',
  },
  landscaping: {
    industryKey: 'landscaping',
    industryName: 'Landscaping & Lawn Care',
    naicsCode: '561730',
    sde: { low: 1.5, mid: 2.0, high: 3.0 },
    ebitda: { low: 2.5, mid: 3.5, high: 4.5 },
    revenue: { low: 0.3, mid: 0.5, high: 0.7 },
    typicalOwnerHours: 55,
    volatility: 'medium',
  },
  cleaning_janitorial: {
    industryKey: 'cleaning_janitorial',
    industryName: 'Cleaning & Janitorial Services',
    naicsCode: '561720',
    sde: { low: 1.5, mid: 2.2, high: 3.0 },
    ebitda: { low: 2.5, mid: 3.5, high: 4.5 },
    revenue: { low: 0.3, mid: 0.5, high: 0.7 },
    typicalOwnerHours: 40,
    volatility: 'low',
  },
  pest_control: {
    industryKey: 'pest_control',
    industryName: 'Pest Control Services',
    naicsCode: '561710',
    sde: { low: 2.5, mid: 3.5, high: 4.5 },
    ebitda: { low: 4.0, mid: 5.5, high: 7.0 },
    revenue: { low: 0.6, mid: 0.9, high: 1.3 },
    typicalOwnerHours: 45,
    volatility: 'low',
  },
  roofing: {
    industryKey: 'roofing',
    industryName: 'Roofing Contractor',
    naicsCode: '238160',
    sde: { low: 1.8, mid: 2.5, high: 3.5 },
    ebitda: { low: 2.5, mid: 3.5, high: 5.0 },
    revenue: { low: 0.3, mid: 0.5, high: 0.7 },
    typicalOwnerHours: 55,
    volatility: 'medium',
  },
  auto_repair: {
    industryKey: 'auto_repair',
    industryName: 'Auto Repair & Service',
    naicsCode: '811111',
    sde: { low: 1.8, mid: 2.5, high: 3.2 },
    ebitda: { low: 2.5, mid: 3.5, high: 4.5 },
    revenue: { low: 0.3, mid: 0.5, high: 0.7 },
    typicalOwnerHours: 50,
    volatility: 'low',
  },

  // ============= CONSTRUCTION =============
  construction_general: {
    industryKey: 'construction_general',
    industryName: 'General Construction',
    naicsCode: '23',
    sde: { low: 1.8, mid: 2.5, high: 3.5 },
    ebitda: { low: 2.5, mid: 3.5, high: 5.0 },
    revenue: { low: 0.3, mid: 0.5, high: 0.7 },
    typicalOwnerHours: 55,
    volatility: 'high',
  },
  construction_specialty: {
    industryKey: 'construction_specialty',
    industryName: 'Specialty Trade Contractor',
    naicsCode: '238',
    sde: { low: 2.0, mid: 2.8, high: 3.8 },
    ebitda: { low: 3.0, mid: 4.0, high: 5.5 },
    revenue: { low: 0.35, mid: 0.55, high: 0.8 },
    typicalOwnerHours: 50,
    volatility: 'medium',
  },

  // ============= MANUFACTURING =============
  manufacturing_general: {
    industryKey: 'manufacturing_general',
    industryName: 'Manufacturing',
    naicsCode: '31-33',
    sde: { low: 2.5, mid: 3.5, high: 5.0 },
    ebitda: { low: 4.0, mid: 5.5, high: 7.0 },
    revenue: { low: 0.5, mid: 0.8, high: 1.2 },
    typicalOwnerHours: 50,
    volatility: 'medium',
  },
  manufacturing_food: {
    industryKey: 'manufacturing_food',
    industryName: 'Food Manufacturing',
    naicsCode: '311',
    sde: { low: 2.0, mid: 3.0, high: 4.5 },
    ebitda: { low: 3.5, mid: 5.0, high: 7.0 },
    revenue: { low: 0.4, mid: 0.7, high: 1.0 },
    typicalOwnerHours: 50,
    volatility: 'medium',
  },
  manufacturing_precision: {
    industryKey: 'manufacturing_precision',
    industryName: 'Precision Manufacturing / Machine Shop',
    naicsCode: '332710',
    sde: { low: 3.0, mid: 4.0, high: 5.5 },
    ebitda: { low: 4.5, mid: 6.0, high: 8.0 },
    revenue: { low: 0.6, mid: 0.9, high: 1.3 },
    typicalOwnerHours: 50,
    volatility: 'medium',
  },

  // ============= RETAIL =============
  retail_general: {
    industryKey: 'retail_general',
    industryName: 'Retail Store',
    naicsCode: '44-45',
    sde: { low: 1.5, mid: 2.2, high: 3.0 },
    ebitda: { low: 2.5, mid: 3.5, high: 4.5 },
    revenue: { low: 0.3, mid: 0.5, high: 0.7 },
    typicalOwnerHours: 55,
    volatility: 'medium',
  },
  convenience_store: {
    industryKey: 'convenience_store',
    industryName: 'Convenience Store',
    naicsCode: '445120',
    sde: { low: 1.5, mid: 2.0, high: 2.8 },
    ebitda: { low: 2.5, mid: 3.5, high: 4.5 },
    revenue: { low: 0.2, mid: 0.35, high: 0.5 },
    typicalOwnerHours: 60,
    volatility: 'low',
  },
  liquor_store: {
    industryKey: 'liquor_store',
    industryName: 'Liquor Store',
    naicsCode: '445310',
    sde: { low: 2.0, mid: 2.8, high: 3.5 },
    ebitda: { low: 3.0, mid: 4.0, high: 5.0 },
    revenue: { low: 0.3, mid: 0.5, high: 0.7 },
    typicalOwnerHours: 50,
    volatility: 'low',
  },

  // ============= FOOD & BEVERAGE =============
  restaurant_full_service: {
    industryKey: 'restaurant_full_service',
    industryName: 'Full-Service Restaurant',
    naicsCode: '722511',
    sde: { low: 1.5, mid: 2.0, high: 2.8 },
    ebitda: { low: 2.5, mid: 3.5, high: 4.5 },
    revenue: { low: 0.3, mid: 0.45, high: 0.6 },
    typicalOwnerHours: 60,
    volatility: 'high',
  },
  restaurant_fast_food: {
    industryKey: 'restaurant_fast_food',
    industryName: 'Fast Food / QSR',
    naicsCode: '722513',
    sde: { low: 2.0, mid: 2.5, high: 3.2 },
    ebitda: { low: 3.0, mid: 4.0, high: 5.0 },
    revenue: { low: 0.4, mid: 0.55, high: 0.7 },
    typicalOwnerHours: 55,
    volatility: 'medium',
  },
  restaurant_franchise: {
    industryKey: 'restaurant_franchise',
    industryName: 'Restaurant Franchise',
    naicsCode: '722513',
    sde: { low: 2.5, mid: 3.0, high: 4.0 },
    ebitda: { low: 3.5, mid: 4.5, high: 6.0 },
    revenue: { low: 0.45, mid: 0.65, high: 0.9 },
    typicalOwnerHours: 45,
    volatility: 'medium',
  },
  bar_nightclub: {
    industryKey: 'bar_nightclub',
    industryName: 'Bar / Nightclub',
    naicsCode: '722410',
    sde: { low: 1.5, mid: 2.2, high: 3.0 },
    ebitda: { low: 2.5, mid: 3.5, high: 4.5 },
    revenue: { low: 0.35, mid: 0.5, high: 0.7 },
    typicalOwnerHours: 50,
    volatility: 'high',
  },
  coffee_shop: {
    industryKey: 'coffee_shop',
    industryName: 'Coffee Shop / Cafe',
    naicsCode: '722515',
    sde: { low: 1.5, mid: 2.0, high: 2.8 },
    ebitda: { low: 2.5, mid: 3.5, high: 4.5 },
    revenue: { low: 0.35, mid: 0.5, high: 0.7 },
    typicalOwnerHours: 55,
    volatility: 'medium',
  },
  catering: {
    industryKey: 'catering',
    industryName: 'Catering Services',
    naicsCode: '722320',
    sde: { low: 1.5, mid: 2.2, high: 3.0 },
    ebitda: { low: 2.5, mid: 3.5, high: 4.5 },
    revenue: { low: 0.3, mid: 0.5, high: 0.7 },
    typicalOwnerHours: 55,
    volatility: 'medium',
  },

  // ============= HEALTHCARE =============
  medical_practice: {
    industryKey: 'medical_practice',
    industryName: 'Medical Practice',
    naicsCode: '621',
    sde: { low: 1.8, mid: 2.5, high: 3.5 },
    ebitda: { low: 3.0, mid: 4.5, high: 6.0 },
    revenue: { low: 0.4, mid: 0.7, high: 1.0 },
    typicalOwnerHours: 45,
    volatility: 'low',
  },
  dental_practice: {
    industryKey: 'dental_practice',
    industryName: 'Dental Practice',
    naicsCode: '621210',
    sde: { low: 2.0, mid: 2.8, high: 3.8 },
    ebitda: { low: 3.5, mid: 5.0, high: 6.5 },
    revenue: { low: 0.5, mid: 0.75, high: 1.1 },
    typicalOwnerHours: 40,
    volatility: 'low',
  },
  veterinary: {
    industryKey: 'veterinary',
    industryName: 'Veterinary Practice',
    naicsCode: '541940',
    sde: { low: 2.0, mid: 3.0, high: 4.0 },
    ebitda: { low: 4.0, mid: 5.5, high: 7.5 },
    revenue: { low: 0.5, mid: 0.8, high: 1.2 },
    typicalOwnerHours: 45,
    volatility: 'low',
  },
  pharmacy: {
    industryKey: 'pharmacy',
    industryName: 'Pharmacy / Drug Store',
    naicsCode: '446110',
    sde: { low: 2.0, mid: 2.8, high: 3.5 },
    ebitda: { low: 3.0, mid: 4.0, high: 5.5 },
    revenue: { low: 0.2, mid: 0.35, high: 0.5 },
    typicalOwnerHours: 50,
    volatility: 'low',
  },
  home_health: {
    industryKey: 'home_health',
    industryName: 'Home Health Care',
    naicsCode: '621610',
    sde: { low: 2.5, mid: 3.5, high: 5.0 },
    ebitda: { low: 4.0, mid: 6.0, high: 8.0 },
    revenue: { low: 0.5, mid: 0.8, high: 1.2 },
    typicalOwnerHours: 45,
    volatility: 'low',
  },

  // ============= TECHNOLOGY =============
  saas: {
    industryKey: 'saas',
    industryName: 'SaaS / Software',
    naicsCode: '511210',
    sde: { low: 3.0, mid: 4.5, high: 7.0 },
    ebitda: { low: 5.0, mid: 8.0, high: 12.0 },
    revenue: { low: 2.0, mid: 4.0, high: 8.0 },
    typicalOwnerHours: 45,
    volatility: 'medium',
  },
  it_services: {
    industryKey: 'it_services',
    industryName: 'IT Services / MSP',
    naicsCode: '541512',
    sde: { low: 2.5, mid: 3.5, high: 5.0 },
    ebitda: { low: 4.0, mid: 5.5, high: 7.5 },
    revenue: { low: 0.6, mid: 1.0, high: 1.5 },
    typicalOwnerHours: 45,
    volatility: 'medium',
  },
  web_development: {
    industryKey: 'web_development',
    industryName: 'Web Development Agency',
    naicsCode: '541511',
    sde: { low: 2.0, mid: 3.0, high: 4.0 },
    ebitda: { low: 3.0, mid: 4.5, high: 6.0 },
    revenue: { low: 0.5, mid: 0.8, high: 1.2 },
    typicalOwnerHours: 45,
    volatility: 'medium',
  },

  // ============= E-COMMERCE =============
  ecommerce: {
    industryKey: 'ecommerce',
    industryName: 'E-Commerce Business',
    naicsCode: '454110',
    sde: { low: 2.0, mid: 3.0, high: 4.5 },
    ebitda: { low: 3.0, mid: 4.5, high: 6.5 },
    revenue: { low: 0.5, mid: 0.9, high: 1.5 },
    typicalOwnerHours: 35,
    volatility: 'medium',
  },
  amazon_fba: {
    industryKey: 'amazon_fba',
    industryName: 'Amazon FBA Business',
    naicsCode: '454110',
    sde: { low: 2.5, mid: 3.5, high: 5.0 },
    ebitda: { low: 3.5, mid: 5.0, high: 7.0 },
    revenue: { low: 0.6, mid: 1.0, high: 1.5 },
    typicalOwnerHours: 30,
    volatility: 'high',
  },

  // ============= LOGISTICS & TRANSPORTATION =============
  trucking: {
    industryKey: 'trucking',
    industryName: 'Trucking / Freight',
    naicsCode: '484',
    sde: { low: 2.0, mid: 3.0, high: 4.0 },
    ebitda: { low: 3.0, mid: 4.5, high: 6.0 },
    revenue: { low: 0.4, mid: 0.6, high: 0.9 },
    typicalOwnerHours: 50,
    volatility: 'medium',
  },
  courier: {
    industryKey: 'courier',
    industryName: 'Courier / Delivery Service',
    naicsCode: '492110',
    sde: { low: 1.8, mid: 2.5, high: 3.5 },
    ebitda: { low: 2.5, mid: 3.5, high: 5.0 },
    revenue: { low: 0.35, mid: 0.55, high: 0.8 },
    typicalOwnerHours: 50,
    volatility: 'medium',
  },

  // ============= HOSPITALITY =============
  hotel_motel: {
    industryKey: 'hotel_motel',
    industryName: 'Hotel / Motel',
    naicsCode: '721110',
    sde: { low: 3.0, mid: 4.5, high: 6.0 },
    ebitda: { low: 5.0, mid: 7.0, high: 9.0 },
    revenue: { low: 0.8, mid: 1.2, high: 1.8 },
    typicalOwnerHours: 55,
    volatility: 'medium',
  },
  bed_breakfast: {
    industryKey: 'bed_breakfast',
    industryName: 'Bed & Breakfast',
    naicsCode: '721191',
    sde: { low: 2.0, mid: 3.0, high: 4.0 },
    ebitda: { low: 3.0, mid: 4.5, high: 6.0 },
    revenue: { low: 0.6, mid: 1.0, high: 1.5 },
    typicalOwnerHours: 60,
    volatility: 'medium',
  },

  // ============= PERSONAL SERVICES =============
  fitness_gym: {
    industryKey: 'fitness_gym',
    industryName: 'Gym / Fitness Center',
    naicsCode: '713940',
    sde: { low: 1.8, mid: 2.5, high: 3.5 },
    ebitda: { low: 3.0, mid: 4.0, high: 5.5 },
    revenue: { low: 0.4, mid: 0.6, high: 0.9 },
    typicalOwnerHours: 45,
    volatility: 'medium',
  },
  salon_spa: {
    industryKey: 'salon_spa',
    industryName: 'Salon / Spa',
    naicsCode: '812111',
    sde: { low: 1.5, mid: 2.2, high: 3.0 },
    ebitda: { low: 2.5, mid: 3.5, high: 4.5 },
    revenue: { low: 0.35, mid: 0.5, high: 0.7 },
    typicalOwnerHours: 45,
    volatility: 'low',
  },
  daycare: {
    industryKey: 'daycare',
    industryName: 'Daycare / Child Care Center',
    naicsCode: '624410',
    sde: { low: 2.0, mid: 2.8, high: 3.5 },
    ebitda: { low: 3.0, mid: 4.0, high: 5.5 },
    revenue: { low: 0.4, mid: 0.6, high: 0.9 },
    typicalOwnerHours: 50,
    volatility: 'low',
  },
  tutoring: {
    industryKey: 'tutoring',
    industryName: 'Tutoring / Education Services',
    naicsCode: '611691',
    sde: { low: 2.0, mid: 2.8, high: 3.8 },
    ebitda: { low: 3.0, mid: 4.0, high: 5.5 },
    revenue: { low: 0.5, mid: 0.75, high: 1.1 },
    typicalOwnerHours: 40,
    volatility: 'low',
  },

  // ============= DISTRIBUTION & WHOLESALE =============
  distribution: {
    industryKey: 'distribution',
    industryName: 'Distribution / Wholesale',
    naicsCode: '42',
    sde: { low: 2.0, mid: 3.0, high: 4.0 },
    ebitda: { low: 3.5, mid: 5.0, high: 6.5 },
    revenue: { low: 0.25, mid: 0.4, high: 0.6 },
    typicalOwnerHours: 50,
    volatility: 'medium',
  },

  // ============= PRINTING & SIGNAGE =============
  printing: {
    industryKey: 'printing',
    industryName: 'Printing / Graphics',
    naicsCode: '323111',
    sde: { low: 1.8, mid: 2.5, high: 3.5 },
    ebitda: { low: 2.5, mid: 3.5, high: 5.0 },
    revenue: { low: 0.35, mid: 0.55, high: 0.8 },
    typicalOwnerHours: 50,
    volatility: 'medium',
  },
  signage: {
    industryKey: 'signage',
    industryName: 'Sign Shop',
    naicsCode: '339950',
    sde: { low: 2.0, mid: 2.8, high: 3.8 },
    ebitda: { low: 3.0, mid: 4.0, high: 5.5 },
    revenue: { low: 0.4, mid: 0.6, high: 0.9 },
    typicalOwnerHours: 50,
    volatility: 'low',
  },

  // ============= DEFAULT FALLBACK =============
  general_business: {
    industryKey: 'general_business',
    industryName: 'General Business',
    naicsCode: 'default',
    sde: { low: 2.0, mid: 2.5, high: 3.5 },
    ebitda: { low: 3.0, mid: 4.0, high: 5.5 },
    revenue: { low: 0.4, mid: 0.6, high: 0.9 },
    typicalOwnerHours: 45,
    volatility: 'medium',
  },
};

// Industry name to key mapping for fuzzy matching
export const INDUSTRY_NAME_MAPPINGS: Record<string, string> = {
  // Professional Services
  'accounting': 'accounting',
  'tax': 'accounting',
  'cpa': 'accounting',
  'bookkeeping': 'accounting',
  'insurance': 'insurance_agency',
  'staffing': 'staffing',
  'recruiting': 'staffing',
  'hr': 'staffing',
  'marketing': 'marketing_agency',
  'advertising': 'marketing_agency',
  'digital marketing': 'marketing_agency',
  'seo': 'marketing_agency',
  'consulting': 'professional_services',
  'professional services': 'professional_services',

  // Trades
  'hvac': 'hvac',
  'heating': 'hvac',
  'air conditioning': 'hvac',
  'plumbing': 'plumbing',
  'electrical': 'electrical',
  'electrician': 'electrical',
  'landscaping': 'landscaping',
  'lawn care': 'landscaping',
  'lawn service': 'landscaping',
  'cleaning': 'cleaning_janitorial',
  'janitorial': 'cleaning_janitorial',
  'commercial cleaning': 'cleaning_janitorial',
  'pest control': 'pest_control',
  'exterminator': 'pest_control',
  'roofing': 'roofing',
  'auto repair': 'auto_repair',
  'automotive': 'auto_repair',
  'mechanic': 'auto_repair',
  'auto shop': 'auto_repair',

  // Construction
  'construction': 'construction_general',
  'general contractor': 'construction_general',
  'contractor': 'construction_specialty',

  // Manufacturing
  'manufacturing': 'manufacturing_general',
  'machine shop': 'manufacturing_precision',
  'machining': 'manufacturing_precision',
  'food manufacturing': 'manufacturing_food',
  'food production': 'manufacturing_food',

  // Retail
  'retail': 'retail_general',
  'store': 'retail_general',
  'convenience store': 'convenience_store',
  'gas station': 'convenience_store',
  'liquor store': 'liquor_store',
  'liquor': 'liquor_store',

  // Food & Beverage
  'restaurant': 'restaurant_full_service',
  'fast food': 'restaurant_fast_food',
  'qsr': 'restaurant_fast_food',
  'quick service': 'restaurant_fast_food',
  'franchise': 'restaurant_franchise',
  'bar': 'bar_nightclub',
  'nightclub': 'bar_nightclub',
  'pub': 'bar_nightclub',
  'coffee shop': 'coffee_shop',
  'cafe': 'coffee_shop',
  'coffee': 'coffee_shop',
  'catering': 'catering',

  // Healthcare
  'medical': 'medical_practice',
  'healthcare': 'medical_practice',
  'clinic': 'medical_practice',
  'doctor': 'medical_practice',
  'dental': 'dental_practice',
  'dentist': 'dental_practice',
  'veterinary': 'veterinary',
  'vet': 'veterinary',
  'animal hospital': 'veterinary',
  'pharmacy': 'pharmacy',
  'drug store': 'pharmacy',
  'home health': 'home_health',
  'home care': 'home_health',

  // Technology
  'saas': 'saas',
  'software': 'saas',
  'app': 'saas',
  'it': 'it_services',
  'msp': 'it_services',
  'managed services': 'it_services',
  'tech support': 'it_services',
  'web development': 'web_development',
  'web design': 'web_development',
  'website': 'web_development',

  // E-commerce
  'ecommerce': 'ecommerce',
  'e-commerce': 'ecommerce',
  'online store': 'ecommerce',
  'amazon': 'amazon_fba',
  'fba': 'amazon_fba',
  'amazon fba': 'amazon_fba',

  // Logistics
  'trucking': 'trucking',
  'freight': 'trucking',
  'transportation': 'trucking',
  'courier': 'courier',
  'delivery': 'courier',

  // Hospitality
  'hotel': 'hotel_motel',
  'motel': 'hotel_motel',
  'bed and breakfast': 'bed_breakfast',
  'b&b': 'bed_breakfast',

  // Personal Services
  'gym': 'fitness_gym',
  'fitness': 'fitness_gym',
  'salon': 'salon_spa',
  'spa': 'salon_spa',
  'hair salon': 'salon_spa',
  'beauty': 'salon_spa',
  'daycare': 'daycare',
  'child care': 'daycare',
  'preschool': 'daycare',
  'tutoring': 'tutoring',
  'education': 'tutoring',

  // Distribution
  'distribution': 'distribution',
  'wholesale': 'distribution',
  'distributor': 'distribution',

  // Printing
  'printing': 'printing',
  'print shop': 'printing',
  'graphics': 'printing',
  'sign': 'signage',
  'signage': 'signage',
  'sign shop': 'signage',
};

/**
 * Get industry multiples by industry key or name
 */
export function getIndustryMultiples(industry: string): IndustryMultipleData {
  const normalizedInput = industry.toLowerCase().trim();

  // Direct key match
  if (INDUSTRY_MULTIPLES[normalizedInput]) {
    return INDUSTRY_MULTIPLES[normalizedInput];
  }

  // Try name mapping
  const mappedKey = INDUSTRY_NAME_MAPPINGS[normalizedInput];
  if (mappedKey && INDUSTRY_MULTIPLES[mappedKey]) {
    return INDUSTRY_MULTIPLES[mappedKey];
  }

  // Partial match in name mappings
  for (const [name, key] of Object.entries(INDUSTRY_NAME_MAPPINGS)) {
    if (normalizedInput.includes(name) || name.includes(normalizedInput)) {
      return INDUSTRY_MULTIPLES[key];
    }
  }

  // Return default
  return INDUSTRY_MULTIPLES.general_business;
}

/**
 * Get all industry options for dropdown/selection
 */
export function getAllIndustryOptions(): { key: string; name: string }[] {
  return Object.values(INDUSTRY_MULTIPLES)
    .map(m => ({ key: m.industryKey, name: m.industryName }))
    .sort((a, b) => a.name.localeCompare(b.name));
}
