#!/bin/bash

# Vercel deployment script
echo "Starting manual deployment to Vercel..."

# Install Vercel CLI if not already installed
if ! command -v vercel &> /dev/null
then
    echo "Installing Vercel CLI..."
    npm install -g vercel
fi

# Check if token is provided as argument
if [ -z "$1" ]
then
    echo "No Vercel token provided, will attempt to use Vercel CLI login"
    # Deploy to production
    vercel --prod
else
    # Use token provided as argument
    echo "Using provided Vercel token for deployment"
    vercel --token=$1 --prod
fi

echo "Deployment complete! Check Vercel dashboard for details." 