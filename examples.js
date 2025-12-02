// Example usage of the WhatsApp Bot API
// This file demonstrates how to send different types of messages

const API_URL = 'http://localhost:3000';

// Example 1: Send a text message
async function sendTextMessage() {
    const response = await fetch(`${API_URL}/send-message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            channelName: 'Test Channel',
            messageType: 'text',
            messageData: {
                text: 'Hello from the API! 👋'
            }
        })
    });

    const result = await response.json();
    console.log('Text message result:', result);
}

// Example 2: Send an image from a file
async function sendImageFromFile() {
    const fs = require('fs');

    // Read the image file
    const imageBuffer = fs.readFileSync('./example-image.jpg');
    const base64Image = imageBuffer.toString('base64');

    const response = await fetch(`${API_URL}/send-message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            channelName: 'Test Channel',
            messageType: 'image',
            messageData: {
                data: base64Image,
                mimetype: 'image/jpeg',
                filename: 'example-image.jpg',
                caption: 'Check out this image! 📸'
            }
        })
    });

    const result = await response.json();
    console.log('Image message result:', result);
}

// Example 3: Send an audio file as voice note
async function sendAudioMessage() {
    const fs = require('fs');

    // Read the audio file
    const audioBuffer = fs.readFileSync('./example-audio.mp3');
    const base64Audio = audioBuffer.toString('base64');

    const response = await fetch(`${API_URL}/send-message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            channelName: 'Test Channel',
            messageType: 'audio',
            messageData: {
                data: base64Audio,
                mimetype: 'audio/mpeg',
                filename: 'example-audio.mp3',
                asVoiceNote: true  // Set to false for regular audio file
            }
        })
    });

    const result = await response.json();
    console.log('Audio message result:', result);
}

// Example 4: Send a video file
async function sendVideoMessage() {
    const fs = require('fs');

    // Read the video file
    const videoBuffer = fs.readFileSync('./example-video.mp4');
    const base64Video = videoBuffer.toString('base64');

    const response = await fetch(`${API_URL}/send-message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            channelName: 'Test Channel',
            messageType: 'video',
            messageData: {
                data: base64Video,
                mimetype: 'video/mp4',
                filename: 'example-video.mp4',
                caption: 'Watch this video! 🎥'
            }
        })
    });

    const result = await response.json();
    console.log('Video message result:', result);
}

// Example 5: List all available channels
async function listChannels() {
    const response = await fetch(`${API_URL}/channels`);
    const result = await response.json();

    console.log('Available channels:');
    result.channels.forEach(channel => {
        console.log(`  - ${channel.name} (${channel.id})`);
    });
}

// Example 6: Check bot status
async function checkStatus() {
    const response = await fetch(`${API_URL}/health`);
    const result = await response.json();

    console.log('Bot status:', result);
    if (result.whatsappReady) {
        console.log('✅ WhatsApp client is ready!');
    } else {
        console.log('❌ WhatsApp client is not ready. Please wait or scan QR code.');
    }
}

// Run examples
async function main() {
    console.log('WhatsApp Bot API Examples\n');

    // Check status first
    await checkStatus();
    console.log('\n---\n');

    // List channels
    await listChannels();
    console.log('\n---\n');

    // Send a text message
    await sendTextMessage();

    // Uncomment to test other message types:
    // await sendImageFromFile();
    // await sendAudioMessage();
    // await sendVideoMessage();
}

// Run if executed directly
if (require.main === module) {
    main().catch(console.error);
}

module.exports = {
    sendTextMessage,
    sendImageFromFile,
    sendAudioMessage,
    sendVideoMessage,
    listChannels,
    checkStatus
};
