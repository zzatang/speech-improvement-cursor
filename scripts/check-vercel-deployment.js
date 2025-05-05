#!/usr/bin/env node

/**
 * Vercel Deployment Checker
 * 
 * This script checks if a Vercel deployment has all the required environment variables.
 * Run it with: node scripts/check-vercel-deployment.js [deployment-url]
 */

const https = require('https');
const url = require('url');

// Required environment variables to check
const REQUIRED_VARIABLES = [
  'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
  'CLERK_SECRET_KEY',
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'GOOGLE_CLOUD_PROJECT_ID',
  'GOOGLE_CLOUD_CREDENTIALS',
  'GOOGLE_TTS_VOICE_NAME',
  'GOOGLE_TTS_LANGUAGE_CODE',
  'GOOGLE_STT_LANGUAGE_CODE',
  'GOOGLE_STT_MODEL',
];

// Get deployment URL from command line or use default
const deploymentUrl = process.argv[2] || 'https://speech-improvement.vercel.app';
const adminToken = process.argv[3]; // Optional admin token for production environments

// Normalize URL
let targetUrl = deploymentUrl;
if (!targetUrl.startsWith('http')) {
  targetUrl = `https://${targetUrl}`;
}

// Add API endpoint for environment check
const apiUrl = `${targetUrl}/api/env-check`;

console.log(`🔍 Checking Vercel deployment at: ${targetUrl}`);

// Prepare request options
const parsedUrl = url.parse(apiUrl);
const options = {
  hostname: parsedUrl.hostname,
  port: 443,
  path: parsedUrl.path,
  method: 'GET',
  headers: {
    'User-Agent': 'Vercel-Deployment-Checker/1.0',
  }
};

// Add admin token if provided
if (adminToken) {
  options.headers['x-admin-token'] = adminToken;
}

// Make the request
const req = https.request(options, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    if (res.statusCode === 200) {
      try {
        const result = JSON.parse(data);
        
        console.log(`\n📊 Environment Check Result:`);
        console.log(`✓ Timestamp: ${result.timestamp}`);
        console.log(`✓ Environment: ${result.environment}`);
        console.log(`✓ Vercel Environment: ${result.vercelEnv}`);
        
        if (result.valid) {
          console.log('\n✅ All required environment variables are configured correctly!');
        } else {
          console.log('\n❌ Some environment variables are missing or invalid:');
          
          if (result.missingVariables) {
            console.log('\nMissing variables:');
            result.missingVariables.forEach(v => console.log(`  - ${v}`));
          }
          
          if (result.invalidVariables) {
            console.log('\nInvalid variables:');
            result.invalidVariables.forEach(v => console.log(`  - ${v}`));
          }
          
          if (result.messages) {
            console.log('\nMessages:');
            result.messages.forEach(m => console.log(`  - ${m}`));
          } else {
            // In production, we don't get detailed messages
            console.log('\nMissing or invalid variables (exact list not available in production):');
            REQUIRED_VARIABLES.forEach(v => console.log(`  - ${v} (potentially missing)`));
          }
          
          console.log('\n⚠️  Please fix the environment configuration in the Vercel dashboard.');
          console.log('   Refer to documentation/vercel-deployment-guide.md for details.');
        }
      } catch (e) {
        console.error('\n❌ Error parsing response:', e.message);
        console.error('Raw response:', data);
      }
    } else if (res.statusCode === 401 || res.statusCode === 403) {
      console.error(`\n❌ Authentication error (${res.statusCode}):`);
      console.error('  You need admin privileges to check environment variables in production.');
      console.error('  Try running with an admin token: node scripts/check-vercel-deployment.js [url] [token]');
    } else {
      console.error(`\n❌ Error: Received status code ${res.statusCode}`);
      console.error('Response:', data);
    }
  });
});

req.on('error', (e) => {
  console.error(`\n❌ Error connecting to ${apiUrl}:`);
  console.error(`  ${e.message}`);
  console.error('\nPossible causes:');
  console.error('  - The deployment URL is incorrect');
  console.error('  - The deployment is not yet ready');
  console.error('  - There are network connectivity issues');
});

req.end(); 