const fs = require('fs');
const path = require('path');

// Path to your Google credentials file
const credentialsPath = path.join(process.cwd(), 'google-credentials.json');

try {
  // Read the credentials file
  const credentials = fs.readFileSync(credentialsPath, 'utf8');
  
  // Minify the JSON (removes whitespace)
  const minifiedCredentials = JSON.stringify(JSON.parse(credentials));
  
  
  
} catch (error) {
  process.exit(1);
} 
