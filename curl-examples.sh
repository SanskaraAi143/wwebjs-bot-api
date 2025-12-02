#!/bin/bash
# Quick reference for testing the WhatsApp Bot API with curl

API_URL="http://localhost:3000"

echo "WhatsApp Bot API - Quick Test Commands"
echo "======================================="
echo ""

# 1. Health Check
echo "1. Health Check:"
echo "curl $API_URL/health"
echo ""

# 2. Status Check
echo "2. Status Check:"
echo "curl $API_URL/status"
echo ""

# 3. List Channels
echo "3. List Channels:"
echo "curl $API_URL/channels"
echo ""

# 4. Send Text Message
echo "4. Send Text Message:"
cat << 'EOF'
curl -X POST http://localhost:3000/send-message \
  -H "Content-Type: application/json" \
  -d '{
    "channelName": "Test Channel",
    "messageType": "text",
    "messageData": {
      "text": "Hello from the API!"
    }
  }'
EOF
echo ""
echo ""

# 5. Send Image (example structure)
echo "5. Send Image (with base64 data):"
cat << 'EOF'
# First, convert image to base64:
# base64 -w 0 your-image.jpg > image.b64

curl -X POST http://localhost:3000/send-message \
  -H "Content-Type: application/json" \
  -d '{
    "channelName": "Test Channel",
    "messageType": "image",
    "messageData": {
      "data": "'"$(cat image.b64)"'",
      "mimetype": "image/jpeg",
      "filename": "image.jpg",
      "caption": "Check this out!"
    }
  }'
EOF
echo ""
echo ""

# 6. Send Audio
echo "6. Send Audio (with base64 data):"
cat << 'EOF'
# First, convert audio to base64:
# base64 -w 0 your-audio.mp3 > audio.b64

curl -X POST http://localhost:3000/send-message \
  -H "Content-Type: application/json" \
  -d '{
    "channelName": "Test Channel",
    "messageType": "audio",
    "messageData": {
      "data": "'"$(cat audio.b64)"'",
      "mimetype": "audio/mpeg",
      "filename": "audio.mp3",
      "asVoiceNote": true
    }
  }'
EOF
echo ""
echo ""

# 7. Send Video
echo "7. Send Video (with base64 data):"
cat << 'EOF'
# First, convert video to base64:
# base64 -w 0 your-video.mp4 > video.b64

curl -X POST http://localhost:3000/send-message \
  -H "Content-Type: application/json" \
  -d '{
    "channelName": "Test Channel",
    "messageType": "video",
    "messageData": {
      "data": "'"$(cat video.b64)"'",
      "mimetype": "video/mp4",
      "filename": "video.mp4",
      "caption": "Watch this!"
    }
  }'
EOF
echo ""
echo ""

echo "======================================="
echo "Tip: Add ' | jq .' at the end of any command to pretty-print JSON"
echo "Example: curl $API_URL/health | jq ."
