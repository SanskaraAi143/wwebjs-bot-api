// Import necessary classes from the library
const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const express = require('express');
const fs = require('fs');
const path = require('path');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON bodies
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Initialize the WhatsApp client with LocalAuth for session persistence
const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true,
        executablePath: '/usr/bin/chromium-browser',
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        timeout: 0
    }
});

// Track client ready state
let isClientReady = false;

console.log('Starting WhatsApp bot server...');

// This event fires when the QR code is generated
client.on('qr', (qr) => {
    console.log('QR Code received. Scan this QR code with WhatsApp:');
    qrcode.generate(qr, { small: true });
});

// This event fires when the bot is authenticated and ready
client.on('ready', () => {
    console.log('WhatsApp client is ready!');
    isClientReady = true;
});

// This event fires if authentication fails
client.on('auth_failure', msg => {
    console.error('AUTHENTICATION FAILURE:', msg);
    isClientReady = false;
});

// This event fires when the client is disconnected
client.on('disconnected', (reason) => {
    console.log('Client was disconnected:', reason);
    isClientReady = false;
});

// Helper function to find a channel by its name
async function findChannelByName(name) {
    try {
        const channels = await client.getChannels();
        const channel = channels.find(ch => ch.name.toLowerCase() === name.toLowerCase());
        return channel || null;
    } catch (error) {
        console.error('Error finding channel:', error);
        return null;
    }
}

// Helper function to process media data
// Saves base64 to a temp file to avoid browser evaluation issues with large strings
async function processMediaData(mediaData) {
    if (!mediaData.data || !mediaData.mimetype) return null;

    const tempDir = path.join(__dirname, '.wwebjs_cache', 'temp_media');
    if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
    }

    const filename = mediaData.filename || `media_${Date.now()}`;
    const filePath = path.join(tempDir, filename);

    // Write base64 to file
    fs.writeFileSync(filePath, mediaData.data, 'base64');

    // Return the MessageMedia object created from path
    // This is often more stable for large files than passing base64 directly
    return MessageMedia.fromFilePath(filePath);
}

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        whatsappReady: isClientReady,
        timestamp: new Date().toISOString()
    });
});

// Get client status
app.get('/status', (req, res) => {
    res.json({
        ready: isClientReady,
        timestamp: new Date().toISOString()
    });
});

// Main endpoint to send messages
app.post('/send-message', async (req, res) => {
    try {
        // Check if client is ready
        if (!isClientReady) {
            return res.status(503).json({
                success: false,
                error: 'WhatsApp client is not ready. Please wait or scan QR code.'
            });
        }

        const { channelName, messageType, messageData } = req.body;

        // Validate required fields
        if (!channelName) {
            return res.status(400).json({
                success: false,
                error: 'channelName is required'
            });
        }

        if (!messageType) {
            return res.status(400).json({
                success: false,
                error: 'messageType is required (text, image, audio, video)'
            });
        }

        // Find the channel
        const channel = await findChannelByName(channelName);

        if (!channel) {
            return res.status(404).json({
                success: false,
                error: `Channel "${channelName}" not found. Make sure you are subscribed to it.`
            });
        }

        console.log(`Sending ${messageType} message to channel "${channelName}"...`);

        // Handle different message types
        switch (messageType.toLowerCase()) {
            case 'text':
                if (!messageData || !messageData.text) {
                    return res.status(400).json({
                        success: false,
                        error: 'messageData.text is required for text messages'
                    });
                }
                await channel.sendMessage(messageData.text);
                break;

            case 'image':
                if (!messageData || !messageData.data || !messageData.mimetype) {
                    return res.status(400).json({
                        success: false,
                        error: 'messageData must contain data (base64) and mimetype for images'
                    });
                }
                const imageMedia = await processMediaData(messageData);
                try {
                    await channel.sendMessage(imageMedia, {
                        caption: messageData.caption || ''
                    });
                } finally {
                    // Cleanup temp file
                    if (imageMedia && imageMedia.filename) {
                        const tempPath = path.join(__dirname, '.wwebjs_cache', 'temp_media', imageMedia.filename);
                        if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
                    }
                }
                break;

            case 'audio':
                if (!messageData || !messageData.data || !messageData.mimetype) {
                    return res.status(400).json({
                        success: false,
                        error: 'messageData must contain data (base64) and mimetype for audio'
                    });
                }
                const audioMedia = await processMediaData(messageData);
                try {
                    await channel.sendMessage(audioMedia, {
                        sendAudioAsVoice: messageData.asVoiceNote !== false
                    });
                } finally {
                    // Cleanup temp file
                    if (audioMedia && audioMedia.filename) {
                        const tempPath = path.join(__dirname, '.wwebjs_cache', 'temp_media', audioMedia.filename);
                        if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
                    }
                }
                break;

            case 'video':
                if (!messageData || !messageData.data || !messageData.mimetype) {
                    return res.status(400).json({
                        success: false,
                        error: 'messageData must contain data (base64) and mimetype for video'
                    });
                }
                const videoMedia = await processMediaData(messageData);
                try {
                    await channel.sendMessage(videoMedia, {
                        caption: messageData.caption || ''
                    });
                } finally {
                    // Cleanup temp file
                    if (videoMedia && videoMedia.filename) {
                        const tempPath = path.join(__dirname, '.wwebjs_cache', 'temp_media', videoMedia.filename);
                        if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
                    }
                }
                break;

            default:
                return res.status(400).json({
                    success: false,
                    error: `Unsupported message type: ${messageType}. Supported types: text, image, audio, video`
                });
        }

        console.log(`Successfully sent ${messageType} message to "${channelName}"`);

        res.json({
            success: true,
            message: `${messageType} message sent successfully to ${channelName}`,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Error sending message:', error);
        if (error.stack) console.error(error.stack);
        res.status(500).json({
            success: false,
            error: error.message || 'Internal server error',
            stack: error.stack
        });
    }
});

// List all available channels
app.get('/channels', async (req, res) => {
    try {
        if (!isClientReady) {
            return res.status(503).json({
                success: false,
                error: 'WhatsApp client is not ready'
            });
        }

        const channels = await client.getChannels();
        const channelList = channels.map(ch => ({
            id: ch.id._serialized,
            name: ch.name
        }));

        res.json({
            success: true,
            channels: channelList,
            count: channelList.length
        });
    } catch (error) {
        console.error('Error fetching channels:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Internal server error'
        });
    }
});

// Start the Express server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/health`);
    console.log(`Send message: POST http://localhost:${PORT}/send-message`);
    console.log(`List channels: GET http://localhost:${PORT}/channels`);
});

// Initialize the WhatsApp client
client.initialize();