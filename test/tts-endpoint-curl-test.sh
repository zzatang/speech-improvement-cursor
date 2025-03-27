#!/bin/bash
# Test script for the Text-to-Speech API using curl
# This script tests the TTS endpoint by sending a POST request with sample text
# and saving the audio response to a file.
#
# Usage: bash test/tts-endpoint-curl-test.sh

# Test configuration
API_URL="http://localhost:3000/api/speech/tts"
OUTPUT_DIR="./test/output"
OUTPUT_FILE="$OUTPUT_DIR/tts-curl-test-output.mp3"
TEST_TEXT="Hello, this is a test of the Australian accent for the Speech Buddy application."

# Create output directory if it doesn't exist
mkdir -p "$OUTPUT_DIR"

echo "Testing TTS endpoint with curl..."
echo "Sending request to: $API_URL"
echo "Test text: \"$TEST_TEXT\""
echo "Output will be saved to: $OUTPUT_FILE"

# Send request and save response to file
curl -X POST \
  -H "Content-Type: application/json" \
  -d "{\"text\": \"$TEST_TEXT\"}" \
  --output "$OUTPUT_FILE" \
  -v \
  "$API_URL"

# Check if the file was created and has content
if [ -f "$OUTPUT_FILE" ] && [ -s "$OUTPUT_FILE" ]; then
  echo -e "\nSuccess! Audio file saved at: $OUTPUT_FILE"
  echo "File size: $(du -h "$OUTPUT_FILE" | cut -f1) bytes"
else
  echo -e "\nFailed to save audio file or file is empty."
  exit 1
fi

echo -e "\nTest completed successfully." 