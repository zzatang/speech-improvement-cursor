const fs = require('fs');
const path = require('path');

// Path to your Google credentials file
const credentialsPath = path.join(process.cwd(), 'google-credentials.json');

try {
  // Read the credentials file
  const credentials = fs.readFileSync(credentialsPath, 'utf8');
  
  // Minify the JSON (removes whitespace)
  const minifiedCredentials = JSON.stringify(JSON.parse(credentials));
  
  console.log('\n===== COPY THIS VALUE FOR VERCEL ENVIRONMENT VARIABLE =====\n');
  console.log(minifiedCredentials);
  console.log('\n===========================================================\n');
  
  console.log('Instructions:');
  console.log('1. Copy the entire JSON string above');
  console.log('2. Go to your Vercel project settings');
  console.log('3. Navigate to "Environment Variables"');
  console.log('4. Add a new variable named GOOGLE_CLOUD_CREDENTIALS');
  console.log('5. Paste the copied JSON string as the value');
  console.log('6. Also add GOOGLE_CLOUD_PROJECT_ID with the value: ' + JSON.parse(credentials).project_id);
  console.log('7. Save and redeploy your application');
  
} catch (error) {
  console.error('Error preparing credentials:', error);
  process.exit(1);
} 