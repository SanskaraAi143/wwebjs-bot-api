# Quick Usage Guide - WhatsApp Bot API

## ✅ Your Bot is Running!

Server: `http://localhost:3000`
Status: WhatsApp client connected and ready

## 📤 Sending Messages

### 1. Send Text Message

```bash
curl -X POST http://localhost:3000/send-message \
  -H "Content-Type: application/json" \
  -d '{
    "channelName": "Test Channel",
    "messageType": "text",
    "messageData": {
      "text": "Hello from the API!"
    }
  }'
```

### 2. Send Audio File (Voice Note)

**Easy way - using helper script:**
```bash
node send-media.js audio.mp3 "Test Channel" audio
```

**Manual way - with curl:**
```bash
# First convert to base64
base64 -w 0 audio.mp3 > audio.b64

# Then send (only works for small files)
curl -X POST http://localhost:3000/send-message \
  -H "Content-Type: application/json" \
  -d '{
    "channelName": "Test Channel",
    "messageType": "audio",
    "messageData": {
      "data": "'$(cat audio.b64)'",
      "mimetype": "audio/mpeg",
      "filename": "audio.mp3",
      "asVoiceNote": true
    }
  }'
```

### 3. Send Image

**Easy way:**
```bash
node send-media.js image.jpg "Test Channel" image "Check this out!"
```

### 4. Send Video

**Note:** For videos, it is recommended to send as document to ensure reliable delivery.

**Easy way:**
```bash
node send-media.js video.mp4 "Test Channel" video --document
```

If you want to try sending as a regular video message (might fail in some environments):
```bash
node send-media.js video.mp4 "Test Channel" video "Watch this!"
```

## 📋 Useful Commands

### List All Channels
```bash
curl http://localhost:3000/channels | jq .
```

### Check Bot Status
```bash
curl http://localhost:3000/health | jq .
```

### Check if WhatsApp is Ready
```bash
curl http://localhost:3000/status | jq .
```

## 🎯 Your Available Channels

Based on your current setup, you have these channels:
- Test Channel
- SanskaraAi
- Dr. Gauri Rokkam
- Pawan Kalyan
- Vegan Forest Festival
- And 3 more unnamed channels

## 💡 Tips

1. **For large files (>100KB)**: Always use `send-media.js` instead of curl
2. **Audio files**: Automatically sent as voice notes
3. **Channel names**: Case-insensitive (e.g., "test channel" = "Test Channel")
4. **File formats supported**:
   - Audio: mp3, ogg, wav, m4a
   - Images: jpg, jpeg, png, gif, webp
   - Video: mp4, avi, mov, webm

## 🔧 Helper Scripts

| Script | Purpose | Example |
|--------|---------|---------|
| `send-media.js` | Send any media file | `node send-media.js file.mp3 "Channel" audio` |
| `send-audio.sh` | Send audio (bash) | `./send-audio.sh audio.mp3 "Channel"` |
| `send-image.sh` | Send image (bash) | `./send-image.sh image.jpg "Channel" "Caption"` |
| `send-video.sh` | Send video (bash) | `./send-video.sh video.mp4 "Channel" "Caption"` |
| `test-api.js` | Run all tests | `node test-api.js` |

## ✅ Tested and Working

- ✅ Text messages
- ✅ Audio files (voice notes)
- ✅ Session persistence
- ✅ Multiple channels
- ✅ API endpoints

## 🐳 Next Steps: Docker

When ready to dockerize:

```bash
# Stop the current server (Ctrl+C)

# Build and run with Docker
docker-compose up -d

# View logs
docker-compose logs -f

# Your session will be preserved!
```

## 📚 Full Documentation

See `README.md` for complete documentation including:
- All API endpoints
- Message format specifications
- Docker deployment
- Troubleshooting guide
- Security considerations
