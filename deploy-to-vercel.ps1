# Vercel deployment script for Windows

Write-Host "Starting manual deployment to Vercel..." -ForegroundColor Green

# Check if Vercel CLI is installed
$vercelInstalled = $null
try {
    $vercelInstalled = Get-Command vercel -ErrorAction SilentlyContinue
} catch {
    $vercelInstalled = $null
}

if ($null -eq $vercelInstalled) {
    Write-Host "Installing Vercel CLI..." -ForegroundColor Yellow
    npm install -g vercel
}

# Check if token is provided as argument
if ($args.Count -eq 0) {
    Write-Host "No Vercel token provided, will attempt to use Vercel CLI login" -ForegroundColor Yellow
    # Deploy to production
    vercel --prod
} else {
    # Use token provided as argument
    Write-Host "Using provided Vercel token for deployment" -ForegroundColor Green
    vercel --token=$args[0] --prod
}

Write-Host "Deployment complete! Check Vercel dashboard for details." -ForegroundColor Green 