import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Reset listings data
const listingsData = [
  {
    "id": "1",
    "title": "SaaS Analytics Platform",
    "description": "B2B SaaS platform providing advanced analytics and reporting for e-commerce businesses. 500+ active customers, 95% retention rate.",
    "owner": "TechCorp Inc.",
    "industry": "SaaS",
    "lane": "MAIN",
    "valuationLow": 2400000,
    "valuationHigh": 3600000,
    "revenue": 1200000
  },
  {
    "id": "2", 
    "title": "Local HVAC Service Business",
    "description": "Established HVAC installation and maintenance service in the greater metro area. 15 employees, 20+ years in business.",
    "owner": "Climate Control Solutions",
    "industry": "HVAC",
    "lane": "MAIN",
    "valuationLow": 800000,
    "valuationHigh": 1200000,
    "revenue": 400000
  },
  {
    "id": "3",
    "title": "E-commerce Dropshipping Store",
    "description": "Profitable dropshipping store specializing in home and garden products. Automated operations, strong social media presence.",
    "owner": "Green Thumb Ventures",
    "industry": "E-commerce",
    "lane": "STARTER",
    "valuationLow": 60000,
    "valuationHigh": 90000,
    "revenue": 75000
  },
  {
    "id": "4",
    "title": "Digital Marketing Agency",
    "description": "Full-service digital marketing agency serving local businesses. Specializes in SEO, PPC, and social media management.",
    "owner": "Digital Growth Partners",
    "industry": "Marketing",
    "lane": "MAIN",
    "valuationLow": 500000,
    "valuationHigh": 750000,
    "revenue": 250000
  },
  {
    "id": "5",
    "title": "Mobile App Development Studio",
    "description": "Boutique mobile app development studio with 10+ successful apps in the App Store. Strong client relationships.",
    "owner": "AppCraft Studios",
    "industry": "Technology",
    "lane": "STARTER",
    "valuationLow": 80000,
    "valuationHigh": 120000,
    "revenue": 95000
  },
  {
    "id": "6",
    "title": "Restaurant Chain",
    "description": "Popular casual dining restaurant chain with 5 locations. Strong brand recognition and loyal customer base.",
    "owner": "Taste of Home Restaurants",
    "industry": "Food & Beverage",
    "lane": "MAIN",
    "valuationLow": 1500000,
    "valuationHigh": 2200000,
    "revenue": 750000
  },
  {
    "id": "7",
    "title": "Online Fitness Coaching",
    "description": "Personalized online fitness coaching platform with 200+ active clients. High-touch service with excellent results.",
    "owner": "FitLife Coaching",
    "industry": "Health & Fitness",
    "lane": "STARTER",
    "valuationLow": 40000,
    "valuationHigh": 60000,
    "revenue": 50000
  }
];

// Reset NDAs data
const ndasData = [
  {
    "id": "1",
    "listingId": "1",
    "buyerName": "Acme Ventures",
    "status": "APPROVED"
  },
  {
    "id": "2",
    "listingId": "2", 
    "buyerName": "Private Equity Group",
    "status": "REQUESTED"
  }
];

// Reset messages data
const messagesData = [
  {
    "id": "1",
    "listingId": "1",
    "from": "Acme Ventures",
    "body": "Hi, we're interested in learning more about your SaaS platform. Could you share some additional metrics?",
    "timestamp": "2024-01-15T10:30:00Z"
  },
  {
    "id": "2",
    "listingId": "1",
    "from": "TechCorp Inc.",
    "body": "Absolutely! We have 500+ active customers with a 95% retention rate. Our monthly recurring revenue is growing 15% month-over-month.",
    "timestamp": "2024-01-15T11:00:00Z"
  },
  {
    "id": "3",
    "listingId": "2",
    "from": "Private Equity Group",
    "body": "We'd like to discuss the HVAC business opportunity. What's the current employee structure?",
    "timestamp": "2024-01-14T14:20:00Z"
  }
];

// Write data files
try {
  fs.writeFileSync(path.join(DATA_DIR, 'listings.json'), JSON.stringify(listingsData, null, 2));
  fs.writeFileSync(path.join(DATA_DIR, 'ndas.json'), JSON.stringify(ndasData, null, 2));
  fs.writeFileSync(path.join(DATA_DIR, 'messages.json'), JSON.stringify(messagesData, null, 2));
  
  console.log('✅ Data files reset successfully!');
  console.log(`📊 ${listingsData.length} listings created`);
  console.log(`📋 ${ndasData.length} NDA requests created`);
  console.log(`💬 ${messagesData.length} messages created`);
} catch (error) {
  console.error('❌ Error resetting data files:', error);
  process.exit(1);
}
