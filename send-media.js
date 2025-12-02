#!/usr/bin/env node

// Script to send media files (audio, image, video) to WhatsApp channel
// Usage: node send-media.js <file-path> <channel-name> <message-type> [caption] [--document]

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);
const API_URL = 'http://localhost:3000';

// Get command line arguments
const args = process.argv.slice(2);

if (args.length < 3) {
    console.log('Usage: node send-media.js <file-path> <channel-name> <message-type> [caption]');
    console.log('');
    console.log('Message types: text, image, audio, video');
    console.log('');
    console.log('Examples:');
    console.log('  node send-media.js audio.mp3 "Test Channel" audio');
    console.log('  node send-media.js video.mp4 "Test Channel" video "Watch this!"');
    process.exit(1);
}

const [filePath, channelName, messageType, caption] = args;

// Check if file exists
if (!fs.existsSync(filePath)) {
    console.error(`Error: File '${filePath}' not found`);
    process.exit(1);
}

// Check if ffmpeg is available
async function hasFfmpeg() {
    try {
        await execAsync('ffmpeg -version');
        return true;
    } catch (error) {
        return false;
    }
}

// Convert audio to OGG Opus format for WhatsApp mobile compatibility
async function convertToOggOpus(inputPath) {
    const tempOutput = path.join('/tmp', `whatsapp_audio_${Date.now()}.ogg`);
    console.log('Converting audio to OGG Opus format for mobile compatibility...');
    try {
        await execAsync(`ffmpeg -i "${inputPath}" -c:a libopus -b:a 64k -vbr on -compression_level 10 -frame_duration 60 -application voip "${tempOutput}" -y`);
        console.log('✅ Audio conversion successful!');
        return tempOutput;
    } catch (error) {
        console.warn('⚠️  Audio conversion failed, sending original file...');
        return null;
    }
}

// Compress/Convert video for WhatsApp compatibility
async function compressVideo(inputPath) {
    const tempOutput = path.join('/tmp', `whatsapp_video_${Date.now()}.mp4`);
    console.log('Optimizing video for WhatsApp (H.264/AAC)...');
    try {
        // Convert to H.264 video and AAC audio, ensure pixel format is yuv420p (widely supported)
        // Resize to 720p max width if larger, keeping aspect ratio
        await execAsync(`ffmpeg -i "${inputPath}" -c:v libx264 -preset fast -crf 26 -vf "scale='min(1280,iw)':-2,format=yuv420p" -c:a aac -b:a 128k -movflags +faststart "${tempOutput}" -y`);
        console.log('✅ Video optimization successful!');
        return tempOutput;
    } catch (error) {
        console.warn('⚠️  Video optimization failed:', error.message);
        console.warn('Sending original file...');
        return null;
    }
}

// Determine mimetype based on file extension
function getMimeType(filePath, type) {
    const ext = path.extname(filePath).toLowerCase();

    const mimetypes = {
        // Images
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.gif': 'image/gif',
        '.webp': 'image/webp',

        // Audio
        '.mp3': 'audio/mpeg',
        '.ogg': 'audio/ogg; codecs=opus',
        '.opus': 'audio/ogg; codecs=opus',
        '.wav': 'audio/wav',
        '.m4a': 'audio/mp4',

        // Video
        '.mp4': 'video/mp4',
        '.avi': 'video/x-msvideo',
        '.mov': 'video/quicktime',
        '.webm': 'video/webm',
        '.mkv': 'video/x-matroska'
    };

    return mimetypes[ext] || `${type}/${ext.slice(1)}`;
}

// Main function
async function main() {
    let fileToSend = filePath;
    let tempFile = null;
    const ffmpegAvailable = await hasFfmpeg();

    // Audio conversion
    if (messageType === 'audio') {
        const ext = path.extname(filePath).toLowerCase();
        if (ext !== '.ogg' && ext !== '.opus' && ffmpegAvailable) {
            const convertedFile = await convertToOggOpus(filePath);
            if (convertedFile) {
                fileToSend = convertedFile;
                tempFile = convertedFile;
            }
        }
    }

    // Video optimization
    if (messageType === 'video' && ffmpegAvailable) {
        // We optimize video to ensure it has compatible codecs (H.264+AAC)
        // This fixes "Evaluation failed" errors caused by incompatible formats
        const optimizedFile = await compressVideo(filePath);
        if (optimizedFile) {
            fileToSend = optimizedFile;
            tempFile = optimizedFile;
        }
    }

    // Read file and convert to base64
    console.log(`Reading file: ${fileToSend}`);
    const fileBuffer = fs.readFileSync(fileToSend);
    const base64Data = fileBuffer.toString('base64');
    const mimetype = getMimeType(fileToSend, messageType);

    console.log(`File size: ${(fileBuffer.length / 1024).toFixed(2)} KB`);
    console.log(`MIME type: ${mimetype}`);
    console.log(`Sending ${messageType} to channel: ${channelName}`);

    // Prepare the payload
    const payload = {
        channelName: channelName,
        messageType: messageType,
        messageData: {
            data: base64Data,
            mimetype: mimetype,
            filename: path.basename(filePath), // Use original filename
            filesize: fileBuffer.length
        }
    };

    // Add type-specific options
    if (messageType === 'audio') {
        payload.messageData.asVoiceNote = true;
    } else if (messageType === 'image' || messageType === 'video') {
        payload.messageData.caption = caption || '';
    }

    // Send the request
    try {
        const response = await fetch(`${API_URL}/send-message`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const result = await response.json();

        if (response.ok) {
            console.log('\n✅ Success!');
            console.log(JSON.stringify(result, null, 2));
        } else {
            console.error('\n❌ Error:');
            console.error(JSON.stringify(result, null, 2));
            process.exit(1);
        }
    } catch (error) {
        console.error('\n❌ Error sending message:', error.message);
        process.exit(1);
    } finally {
        // Clean up temporary file
        if (tempFile && fs.existsSync(tempFile)) {
            fs.unlinkSync(tempFile);
        }
    }
}

main();
