# PowerShell script for testing the Text-to-Speech API
# This script sends a POST request to the TTS endpoint and saves the audio response to a file
#
# Usage: .\test\tts-endpoint-test.ps1

# Test configuration
$ApiUrl = "http://localhost:3000/api/speech/tts"
$OutputDir = ".\test\output"
$OutputFile = "$OutputDir\tts-powershell-test-output.mp3"
$TestText = "Hello, this is a test of the Australian accent for the Speech Buddy application."

# Create output directory if it doesn't exist
if (-not (Test-Path $OutputDir)) {
    New-Item -ItemType Directory -Path $OutputDir | Out-Null
    Write-Host "Created output directory: $OutputDir"
}

Write-Host "Testing TTS endpoint with PowerShell..."
Write-Host "Sending request to: $ApiUrl"
Write-Host "Test text: '$TestText'"
Write-Host "Output will be saved to: $OutputFile"

# Create the request body
$Body = @{
    text = $TestText
} | ConvertTo-Json

try {
    # Send request and save response to file
    $Response = Invoke-WebRequest -Uri $ApiUrl -Method Post -ContentType "application/json" -Body $Body -OutFile $OutputFile -PassThru
    
    # Display response details
    Write-Host "`nResponse Status: $($Response.StatusCode) $($Response.StatusDescription)"
    Write-Host "Response Headers:"
    $Response.Headers | Format-Table -AutoSize
    
    # Check if the file was created and has content
    if (Test-Path $OutputFile) {
        $FileSize = (Get-Item $OutputFile).Length
        if ($FileSize -gt 0) {
            Write-Host "`nSuccess! Audio file saved at: $OutputFile"
            Write-Host "File size: $FileSize bytes"
            Write-Host "`nTest completed successfully."
        } else {
            Write-Host "`nWarning: Output file exists but is empty."
        }
    } else {
        Write-Host "`nError: Failed to save output file."
    }
} catch {
    Write-Host "`nError: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $StatusCode = $_.Exception.Response.StatusCode.value__
        $StatusDescription = $_.Exception.Response.StatusDescription
        Write-Host "Status: $StatusCode $StatusDescription" -ForegroundColor Red
        
        $ResponseStream = $_.Exception.Response.GetResponseStream()
        $StreamReader = New-Object System.IO.StreamReader($ResponseStream)
        $ResponseBody = $StreamReader.ReadToEnd()
        Write-Host "Response Body: $ResponseBody" -ForegroundColor Red
    }
} 