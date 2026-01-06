#!/usr/bin/env node

/**
 * Environment Validation Script
 *
 * Validates that all required environment variables are set correctly
 * before deploying to production.
 *
 * Usage: node scripts/validate-env.js
 */

const fs = require('fs');
const path = require('path');

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

// Helper functions
const log = (message, color = 'reset') => {
  console.log(`${colors[color]}${message}${colors.reset}`);
};

const success = (message) => log(`✓ ${message}`, 'green');
const error = (message) => log(`✗ ${message}`, 'red');
const warning = (message) => log(`⚠ ${message}`, 'yellow');
const info = (message) => log(`ℹ ${message}`, 'blue');

// Load .env file if it exists
const loadEnvFile = () => {
  const envPath = path.join(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    envContent.split('\n').forEach(line => {
      const match = line.match(/^([^=:#]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        const value = match[2].trim().replace(/^["'](.*)["']$/, '$1');
        if (!process.env[key]) {
          process.env[key] = value;
        }
      }
    });
  }
};

// Required environment variables
const requiredVars = {
  'Database & Auth': [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'DATABASE_URL',
  ],
};

// Optional but recommended environment variables
const optionalVars = {
  'AI Features': [
    'OPENAI_API_KEY',
    'AI_FEATURES_ENABLED',
  ],
  'Payment Processing': [
    'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
    'STRIPE_SECRET_KEY',
    'STRIPE_WEBHOOK_SECRET',
    'STRIPE_STARTER_PRICE_ID_MONTHLY',
    'STRIPE_STARTER_PRICE_ID_ANNUAL',
    'STRIPE_PROFESSIONAL_PRICE_ID_MONTHLY',
    'STRIPE_PROFESSIONAL_PRICE_ID_ANNUAL',
    'STRIPE_ENTERPRISE_PRICE_ID_MONTHLY',
    'STRIPE_ENTERPRISE_PRICE_ID_ANNUAL',
  ],
  'Email': [
    'RESEND_API_KEY',
    'EMAIL_SENDING_ENABLED',
  ],
};

// Variables that should NOT be set or should be false in production
const dangerousVars = {
  'DEV_BYPASS_AUTH': {
    shouldBe: ['false', 'undefined', ''],
    message: 'DEV_BYPASS_AUTH should be false or not set in production',
  },
};

// Variables that should have specific values in production
const productionVars = {
  'NODE_ENV': {
    shouldBe: ['production'],
    message: 'NODE_ENV should be set to "production"',
  },
};

// Main validation function
const validateEnvironment = () => {
  log('\n========================================', 'cyan');
  log('🔍 ENVIRONMENT VALIDATION STARTED', 'cyan');
  log('========================================\n', 'cyan');

  let hasErrors = false;
  let hasWarnings = false;

  // Load .env file
  loadEnvFile();

  // Check required variables
  log('📋 Checking Required Variables:', 'magenta');
  log('─────────────────────────────────\n', 'magenta');

  for (const [category, vars] of Object.entries(requiredVars)) {
    info(`${category}:`);
    for (const varName of vars) {
      if (process.env[varName] && process.env[varName].trim() !== '') {
        success(`${varName} is set`);
      } else {
        error(`${varName} is MISSING or EMPTY`);
        hasErrors = true;
      }
    }
    console.log('');
  }

  // Check optional variables
  log('📝 Checking Optional Variables:', 'magenta');
  log('─────────────────────────────────\n', 'magenta');

  for (const [category, vars] of Object.entries(optionalVars)) {
    info(`${category}:`);
    for (const varName of vars) {
      if (process.env[varName] && process.env[varName].trim() !== '') {
        success(`${varName} is set`);
      } else {
        warning(`${varName} is not set (feature may be disabled)`);
        hasWarnings = true;
      }
    }
    console.log('');
  }

  // Check dangerous variables (should not be set in production)
  log('🚨 Checking Security Settings:', 'magenta');
  log('─────────────────────────────────\n', 'magenta');

  for (const [varName, config] of Object.entries(dangerousVars)) {
    const value = process.env[varName] || '';
    const isAcceptable = config.shouldBe.includes(value) ||
                         (value === '' && config.shouldBe.includes('undefined'));

    if (isAcceptable) {
      success(`${varName} is safe (${value || 'not set'})`);
    } else {
      error(`${varName} has dangerous value: "${value}"`);
      error(`  → ${config.message}`);
      hasErrors = true;
    }
  }
  console.log('');

  // Check production-specific variables
  log('🎯 Checking Production Settings:', 'magenta');
  log('─────────────────────────────────\n', 'magenta');

  for (const [varName, config] of Object.entries(productionVars)) {
    const value = process.env[varName] || '';
    const isCorrect = config.shouldBe.includes(value);

    if (isCorrect) {
      success(`${varName} is correctly set to "${value}"`);
    } else {
      warning(`${varName} is "${value}"`);
      warning(`  → ${config.message}`);
      hasWarnings = true;
    }
  }
  console.log('');

  // URL format validation
  log('🔗 Validating URL Formats:', 'magenta');
  log('─────────────────────────────────\n', 'magenta');

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (supabaseUrl) {
    if (supabaseUrl.startsWith('https://') && supabaseUrl.includes('.supabase.co')) {
      success('NEXT_PUBLIC_SUPABASE_URL has valid format');
    } else {
      warning('NEXT_PUBLIC_SUPABASE_URL may have incorrect format');
      hasWarnings = true;
    }
  }

  const databaseUrl = process.env.DATABASE_URL;
  if (databaseUrl) {
    if (databaseUrl.startsWith('postgresql://') || databaseUrl.startsWith('postgres://')) {
      success('DATABASE_URL has valid format');
    } else {
      warning('DATABASE_URL may have incorrect format');
      hasWarnings = true;
    }
  }
  console.log('');

  // Summary
  log('========================================', 'cyan');
  log('📊 VALIDATION SUMMARY', 'cyan');
  log('========================================\n', 'cyan');

  if (!hasErrors && !hasWarnings) {
    success('All checks passed! Environment is ready for deployment.');
    log('\n✨ You can proceed with deployment safely.\n', 'green');
    return true;
  } else if (hasErrors) {
    error('VALIDATION FAILED - Critical issues found!');
    log('\n⛔ Fix all errors before deploying to production.\n', 'red');
    return false;
  } else {
    warning('Validation passed with warnings.');
    log('\n⚠️  Review warnings before deploying to production.\n', 'yellow');
    return true;
  }
};

// Run validation
const isValid = validateEnvironment();
process.exit(isValid ? 0 : 1);
