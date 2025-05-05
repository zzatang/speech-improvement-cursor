# Setting Up Google Cloud Text-to-Speech

This guide explains how to set up Google Cloud Text-to-Speech API credentials for the Speech Improvement application.

## Step 1: Create a Google Cloud Project

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Make note of your project ID

## Step 2: Enable the Text-to-Speech API

1. In the Google Cloud Console, go to "APIs & Services" > "Library"
2. Search for "Text-to-Speech API"
3. Select the API and click "Enable"

## Step 3: Create a Service Account and Download Credentials

1. Go to "IAM & Admin" > "Service Accounts"
2. Click "Create Service Account"
3. Enter a name and description for the service account
4. For the role, select "Project" > "Editor"
5. Click "Continue" and then "Done"
6. Find your new service account in the list and click on it
7. Go to the "Keys" tab
8. Click "Add Key" > "Create new key"
9. Select "JSON" as the key type and click "Create"
10. A JSON file will be downloaded to your computer

## Step 4: Add Credentials to Environment Variables

Add the following to your `.env.local` file:

```
# Google Cloud Text-to-Speech Configuration
GOOGLE_TTS_VOICE_NAME=en-AU-Neural2-B
GOOGLE_TTS_LANGUAGE_CODE=en-AU
GOOGLE_TTS_SPEAKING_RATE=0.9

# Google Cloud Text-to-Speech Credentials
# Copy the ENTIRE content of your downloaded JSON file and paste it as a string here
GOOGLE_APPLICATION_CREDENTIALS={"type":"service_account","project_id":"your-project-id","private_key_id":"...","private_key":"...","client_email":"...","client_id":"...","auth_uri":"...","token_uri":"...","auth_provider_x509_cert_url":"...","client_x509_cert_url":"...","universe_domain":"googleapis.com"}
```

## Troubleshooting

If you encounter a 500 error when using the Text-to-Speech feature:

1. Check that you've properly copied the entire JSON content into the GOOGLE_APPLICATION_CREDENTIALS variable
2. Make sure there are no line breaks or formatting issues in the JSON string
3. Verify that the Text-to-Speech API is enabled for your project
4. Check that your service account has the necessary permissions 