# Vercel Deployment Guide

This guide explains how to set up continuous deployment to Vercel for the Speech Improvement application.

## Setting Up GitHub Actions for Vercel Deployment

The application is configured to deploy automatically to Vercel when changes are pushed to the `main` branch and pass all CI checks.

### Prerequisites

1. A Vercel account linked to your GitHub repository
2. A Vercel project created for this application

### Setting Up the Vercel Token

1. **Generate a Vercel Token**:
   - Log in to your [Vercel dashboard](https://vercel.com/dashboard)
   - Go to Settings → Tokens
   - Create a new token with a descriptive name (e.g., "GitHub Actions Deployment")
   - Set the appropriate scope (usually "Full Account" is needed for deployment)
   - Copy the generated token

2. **Add the Token to GitHub Secrets**:
   - Go to your GitHub repository
   - Navigate to Settings → Secrets and variables → Actions
   - Click "New repository secret"
   - Name: `VERCEL_TOKEN`
   - Value: Paste the token you copied from Vercel
   - Click "Add secret"

3. **Verify the Secret is Available**:
   - The deployment workflow will now have access to the token
   - Check the Actions tab to see if deployments are running properly

## Environment Variables

Ensure all required environment variables are set in your Vercel project settings:

### Required Environment Variables

- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`: Clerk public key
- `CLERK_SECRET_KEY`: Clerk secret key
- `NEXT_PUBLIC_SUPABASE_URL`: Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase anonymous key
- `GOOGLE_CLOUD_PROJECT_ID`: Google Cloud project ID
- `GOOGLE_CLOUD_CREDENTIALS`: Google Cloud service account credentials
- `GOOGLE_TTS_VOICE_NAME`: Google TTS voice name (e.g., "en-AU-Standard-A")
- `GOOGLE_TTS_LANGUAGE_CODE`: Google TTS language code (e.g., "en-AU")
- `GOOGLE_STT_LANGUAGE_CODE`: Google STT language code (e.g., "en-AU")
- `GOOGLE_STT_MODEL`: Google STT model (e.g., "latest_long")

## Manual Deployment

If you prefer to deploy manually or the GitHub Actions workflow is not working:

1. Install the Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Log in to Vercel from the CLI:
   ```bash
   vercel login
   ```

3. Deploy the project:
   ```bash
   vercel --prod
   ```

## Troubleshooting

- **Deployment fails with authentication errors**: Check that your `VERCEL_TOKEN` is correctly set up in GitHub Secrets.
- **Build errors**: Check the logs in Vercel for detailed error messages.
- **Environment variable issues**: Ensure all required environment variables are set in your Vercel project.

## Verifying Deployment

After deployment, check:

1. **Application Loading**: Verify the app loads at the Vercel URL
2. **Authentication**: Test login functionality with Clerk
3. **Database Connection**: Ensure Supabase connectivity
4. **Speech Features**: Test Text-to-Speech with Australian accent
5. **Speech Recognition**: Test Speech-to-Text functionality

## Managing Environment Variables

### Updating Variables

1. Go to your [Vercel project](https://vercel.com/dashboard)
2. Select your Speech Improvement project
3. Go to "Settings" > "Environment Variables"
4. Edit existing or add new variables
5. Click "Save"

### Environment-Specific Variables

Vercel allows setting variables for specific environments:
- Production: For your live site
- Preview: For pull request previews
- Development: For local development

Configure variables accordingly based on your needs.

## Special Considerations for Google Cloud Credentials

The `GOOGLE_CLOUD_CREDENTIALS` variable contains a JSON string with sensitive information:

1. Make sure the service account has the minimum necessary permissions:
   - Cloud Text-to-Speech API User
   - Cloud Speech-to-Text API User

2. The JSON structure should be escaped properly for Vercel:
   ```
   {"type":"service_account","project_id":"your-project-id",...}
   ```

3. For security, consider using separate service accounts for different environments.

## Regular Maintenance

- Keep dependencies updated
- Rotate API keys periodically
- Monitor Vercel usage and quotas

## Conclusion

Following this guide ensures proper deployment of the Speech Improvement application to Vercel with the correct configuration of all necessary environment variables for Clerk authentication, Supabase database, and Google Cloud services for Australian-accented speech processing. 