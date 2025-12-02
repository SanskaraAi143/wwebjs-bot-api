# WhatsApp Bot API

A WhatsApp bot that runs as an HTTP API endpoint, allowing you to send messages (text, images, audio, video) to WhatsApp channels programmatically.

## Features

- 🚀 RESTful API endpoint for sending messages
- 📱 Supports multiple message types: text, image, audio, video
- 💾 Session persistence (no need to scan QR code every time)
- 🐳 Docker support for easy deployment
- 🔄 Stays connected and ready to send messages

## Prerequisites

- Node.js 18+ (for local testing)
- Docker and Docker Compose (for containerized deployment)
- WhatsApp account

## Quick Start (Local Testing)

### 1. Install Dependencies

```bash
npm install
```

### 2. Start the Bot

```bash
node bot.js
```

### 3. Scan QR Code

When you first run the bot, a QR code will appear in the terminal. Scan it with your WhatsApp mobile app:
- Open WhatsApp on your phone
- Go to Settings → Linked Devices
- Tap "Link a Device"
- Scan the QR code

**Note:** You only need to do this once. The session will be saved in `.wwebjs_auth` folder.

### 4. Wait for Ready Status

Wait until you see: `WhatsApp client is ready!`

### 5. Test the API

In a new terminal, run the test script:

```bash
node test-api.js
```

Or test manually with curl:

```bash
# Check health
curl http://localhost:3000/health

# List available channels
curl http://localhost:3000/channels

# Send a text message
curl -X POST http://localhost:3000/send-message \
  -H "Content-Type: application/json" \
  -d '{
    "channelName": "Your Channel Name",
    "messageType": "text",
    "messageData": {
      "text": "Hello from the API!"
    }
  }'
```

## API Endpoints

### GET `/health`
Check if the server is running and WhatsApp client status.

**Response:**
```json
{
  "status": "ok",
  "whatsappReady": true,
  "timestamp": "2025-11-28T08:00:00.000Z"
}
```

### GET `/status`
Get WhatsApp client ready status.

**Response:**
```json
{
  "ready": true,
  "timestamp": "2025-11-28T08:00:00.000Z"
}
```

### GET `/channels`
List all available WhatsApp channels you're subscribed to.

**Response:**
```json
{
  "success": true,
  "channels": [
    {
      "id": "123456789@newsletter",
      "name": "Test Channel"
    }
  ],
  "count": 1
}
```

### POST `/send-message`
Send a message to a WhatsApp channel.

**Request Body:**
```json
{
  "channelName": "Channel Name",
  "messageType": "text|image|audio|video",
  "messageData": {
    // See message types below
  }
}
```

## Message Types

### Text Message

```json
{
  "channelName": "My Channel",
  "messageType": "text",
  "messageData": {
    "text": "Your message here"
  }
}
```

### Image Message

```json
{
  "channelName": "My Channel",
  "messageType": "image",
  "messageData": {
    "data": "base64_encoded_image_data",
    "mimetype": "image/jpeg",
    "filename": "image.jpg",
    "caption": "Optional caption"
  }
}
```

### Audio Message

```json
{
  "channelName": "My Channel",
  "messageType": "audio",
  "messageData": {
    "data": "base64_encoded_audio_data",
    "mimetype": "audio/mpeg",
    "filename": "audio.mp3",
    "asVoiceNote": true
  }
}
```

### Video Message

```json
{
  "channelName": "My Channel",
  "messageType": "video",
  "messageData": {
    "data": "base64_encoded_video_data",
    "mimetype": "video/mp4",
    "filename": "video.mp4",
    "caption": "Optional caption"
  }
}
```

## Docker Deployment

### Build and Run with Docker Compose

```bash
# Build and start the container
docker-compose up -d

# View logs (to see QR code on first run)
docker-compose logs -f

# Stop the container
docker-compose down

# Restart the container
docker-compose restart
```

### Build and Run with Docker

```bash
# Build the image
docker build -t whatsapp-bot .

# Run the container
docker run -d \
  -p 3000:3000 \
  -v $(pwd)/.wwebjs_auth:/app/.wwebjs_auth \
  -v $(pwd)/.wwebjs_cache:/app/.wwebjs_cache \
  --security-opt seccomp:unconfined \
  --shm-size=2gb \
  --name whatsapp-bot \
  whatsapp-bot

# View logs
docker logs -f whatsapp-bot

# Stop the container
docker stop whatsapp-bot
docker rm whatsapp-bot
```

### First Time Docker Setup

1. Start the container: `docker-compose up`
2. Watch the logs for the QR code: `docker-compose logs -f`
3. Scan the QR code with WhatsApp
4. Wait for "WhatsApp client is ready!"
5. The session is now saved in `.wwebjs_auth` folder
6. You can stop and restart the container without scanning again

## Session Persistence

The bot saves the WhatsApp session in the `.wwebjs_auth` and `.wwebjs_cache` folders. This means:
- ✅ You only need to scan the QR code once
- ✅ The bot will automatically reconnect on restart
- ✅ Sessions persist across Docker container restarts (when using volumes)

**Important:** Keep these folders safe and don't delete them, or you'll need to scan the QR code again.

## Environment Variables

- `PORT`: Server port (default: 3000)
- `NODE_ENV`: Environment mode (default: production in Docker)

## Troubleshooting

### QR Code Not Appearing
- Make sure the bot is running: `docker-compose logs -f`
- Delete `.wwebjs_auth` and `.wwebjs_cache` folders and restart

### "WhatsApp client is not ready" Error
- Wait a few seconds after starting the bot
- Check `/status` endpoint to see if client is ready
- If stuck, restart the bot

### Channel Not Found
- Make sure you're subscribed to the channel
- Check the exact channel name with `/channels` endpoint
- Channel names are case-insensitive

### Docker Container Crashes
- Check logs: `docker-compose logs`
- Ensure you have enough memory (at least 2GB)
- Try increasing `shm_size` in docker-compose.yml

## Helper Scripts

For convenience, we provide helper scripts to send media files without manually encoding them to base64.

### send-media.js - Universal Media Sender

The easiest way to send any media file:

```bash
# Send an audio file
node send-media.js audio.mp3 "Test Channel" audio

# Send an image with caption
node send-media.js image.jpg "Test Channel" image "Check this out!"

# Send a video with caption
node send-media.js video.mp4 "Test Channel" video "Watch this!"
```

**Usage:**
```bash
node send-media.js <file-path> <channel-name> <message-type> [caption]
```

**Supported message types:** `audio`, `image`, `video`

**Features:**
- Automatically detects MIME type from file extension
- Handles large files (no command line size limits)
- Shows file size and upload progress
- Audio files are sent as voice notes by default

### Alternative: Bash Scripts (for smaller files)

```bash
# Send audio
./send-audio.sh audio.mp3 "Test Channel"

# Send image
./send-image.sh image.jpg "Test Channel" "Optional caption"

# Send video
./send-video.sh video.mp4 "Test Channel" "Optional caption"
```

**Note:** Bash scripts may fail with large files due to command line argument limits. Use `send-media.js` for files larger than ~100KB.


## Example: Sending an Image from File

```javascript
const fs = require('fs');

// Read image file and convert to base64
const imageBuffer = fs.readFileSync('./my-image.jpg');
const base64Image = imageBuffer.toString('base64');

// Send the image
const response = await fetch('http://localhost:3000/send-message', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    channelName: 'My Channel',
    messageType: 'image',
    messageData: {
      data: base64Image,
      mimetype: 'image/jpeg',
      filename: 'my-image.jpg',
      caption: 'Check out this image!'
    }
  })
});

const result = await response.json();
console.log(result);
```

## Security Notes

- 🔒 This bot has access to your WhatsApp account
- 🔒 Keep your `.wwebjs_auth` folder secure
- 🔒 Don't expose the API publicly without authentication
- 🔒 Consider adding API key authentication for production use

## License

ISC
