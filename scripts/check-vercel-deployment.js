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
        
        
        if (result.valid) {
        } else {
          
          if (result.missingVariables) {
            result.missingVariables.forEach(v => console.log(`  - ${v}`));
          }
          
          if (result.invalidVariables) {
            result.invalidVariables.forEach(v => console.log(`  - ${v}`));
          }
          
          if (result.messages) {
            result.messages.forEach(m => console.log(`  - ${m}`));
          } else {
            // In production, we don't get detailed messages
            REQUIRED_VARIABLES.forEach(v => console.log(`  - ${v} (potentially missing)`));
          }
          
        }
      } catch (e) {
      }
    } else if (res.statusCode === 401 || res.statusCode === 403) {
    } else {
    }
  });
});

req.on('error', (e) => {
});

req.end(); 
