# Vercel Deployment Guide

This document provides detailed instructions for deploying the Speech Improvement application to Vercel, ensuring all environment variables are correctly configured.

## Prerequisites

Before deploying to Vercel, ensure you have:

- A [Vercel account](https://vercel.com/signup)
- Your GitHub repository connected to Vercel
- Access to all required API keys and credentials

## Deployment Methods

You can deploy to Vercel using one of these methods:

1. **GitHub Integration (Recommended)**: Automatic deployments triggered by Git commits
2. **Vercel CLI**: Manual deployments using the command line
3. **GitHub Actions**: CI/CD pipeline we've already set up

## Method 1: GitHub Integration

### Step 1: Connect Repository

1. Log in to your [Vercel dashboard](https://vercel.com/dashboard)
2. Click "Add New..." > "Project"
3. Select your GitHub repository
4. Configure project settings:
   - Framework Preset: Next.js
   - Root Directory: `./` (default)

### Step 2: Configure Environment Variables

In the project setup page, scroll down to "Environment Variables" and add the following:

| Name | Value | Environment |
|------|-------|-------------|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Your Clerk publishable key | Production, Preview, Development |
| `CLERK_SECRET_KEY` | Your Clerk secret key | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase URL | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon key | Production, Preview, Development |
| `GOOGLE_CLOUD_PROJECT_ID` | Your GCP project ID | Production, Preview, Development |
| `GOOGLE_CLOUD_CREDENTIALS` | Your GCP service account JSON | Production, Preview, Development |
| `GOOGLE_TTS_VOICE_NAME` | en-AU-Neural2-B | Production, Preview, Development |
| `GOOGLE_TTS_LANGUAGE_CODE` | en-AU | Production, Preview, Development |
| `GOOGLE_TTS_SPEAKING_RATE` | 0.9 | Production, Preview, Development |
| `GOOGLE_STT_LANGUAGE_CODE` | en-AU | Production, Preview, Development |
| `GOOGLE_STT_MODEL` | command_and_search | Production, Preview, Development |
| `GOOGLE_STT_ENABLE_AUTOMATIC_PUNCTUATION` | true | Production, Preview, Development |
| `GOOGLE_STT_ENABLE_WORD_TIME_OFFSETS` | true | Production, Preview, Development |
| `IS_PRODUCTION` | true | Production only |

### Step 3: Deploy

1. Click "Deploy"
2. Wait for the build to complete
3. Once deployed, Vercel will provide a URL for your application

## Method 2: Vercel CLI

### Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

### Step 2: Login to Vercel

```bash
vercel login
```

### Step 3: Set Up Environment Variables

Create a `.env.production` file (it will be ignored by git) with all your environment variables.

### Step 4: Deploy

From your project root:

```bash
vercel --prod
```

Or use our deployment scripts:

- For Unix/Linux/macOS: `./deploy-to-vercel.sh`
- For Windows: `.\deploy-to-vercel.ps1`

## Method 3: GitHub Actions (Already Set Up)

Our GitHub Actions workflow automatically deploys to Vercel when code is pushed to the main branch.

To use this method:

1. Add your Vercel API token as a GitHub repository secret named `VERCEL_TOKEN`
2. Ensure environment variables are configured in Vercel

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

## Troubleshooting

### Build Errors

- Check build logs in the Vercel dashboard
- Verify all dependencies are listed in package.json
- Make sure Next.js configuration is correct

### Runtime Errors

- Check server logs in the Vercel dashboard
- Verify environment variables are correctly set
- Test locally with the same configuration

### API Connection Issues

- Verify credential format and permissions
- Check if API services are enabled in Google Cloud
- Ensure all required environment variables are set

## Regular Maintenance

- Keep dependencies updated
- Rotate API keys periodically
- Monitor Vercel usage and quotas

## Conclusion

Following this guide ensures proper deployment of the Speech Improvement application to Vercel with the correct configuration of all necessary environment variables for Clerk authentication, Supabase database, and Google Cloud services for Australian-accented speech processing. 