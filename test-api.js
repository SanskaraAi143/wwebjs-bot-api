// Test script for WhatsApp Bot API
const fs = require('fs');
const path = require('path');

const API_URL = 'http://localhost:3000';

// Helper function to make HTTP requests
async function makeRequest(endpoint, method = 'GET', body = null) {
    const url = `${API_URL}${endpoint}`;
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json'
        }
    };

    if (body) {
        options.body = JSON.stringify(body);
    }

    try {
        const response = await fetch(url, options);
        const data = await response.json();
        return { status: response.status, data };
    } catch (error) {
        console.error(`Error making request to ${endpoint}:`, error.message);
        return { status: 0, error: error.message };
    }
}

// Helper function to convert file to base64
function fileToBase64(filePath) {
    const fileBuffer = fs.readFileSync(filePath);
    return fileBuffer.toString('base64');
}

// Test 1: Check health
async function testHealth() {
    console.log('\n=== Test 1: Health Check ===');
    const result = await makeRequest('/health');
    console.log('Status:', result.status);
    console.log('Response:', result.data);
}

// Test 2: Check status
async function testStatus() {
    console.log('\n=== Test 2: Status Check ===');
    const result = await makeRequest('/status');
    console.log('Status:', result.status);
    console.log('Response:', result.data);
}

// Test 3: List channels
async function testListChannels() {
    console.log('\n=== Test 3: List Channels ===');
    const result = await makeRequest('/channels');
    console.log('Status:', result.status);
    console.log('Response:', result.data);
    return result.data?.channels || [];
}

// Test 4: Send text message
async function testSendText(channelName) {
    console.log('\n=== Test 4: Send Text Message ===');
    const payload = {
        channelName: channelName,
        messageType: 'text',
        messageData: {
            text: 'Hello from the WhatsApp Bot API! 🤖'
        }
    };

    const result = await makeRequest('/send-message', 'POST', payload);
    console.log('Status:', result.status);
    console.log('Response:', result.data);
}

// Test 5: Send image (if you have a test image)
async function testSendImage(channelName, imagePath) {
    console.log('\n=== Test 5: Send Image ===');

    if (!fs.existsSync(imagePath)) {
        console.log(`Image file not found: ${imagePath}`);
        console.log('Skipping image test...');
        return;
    }

    const base64Data = fileToBase64(imagePath);
    const ext = path.extname(imagePath).toLowerCase();
    const mimetypes = {
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.gif': 'image/gif'
    };

    const payload = {
        channelName: channelName,
        messageType: 'image',
        messageData: {
            data: base64Data,
            mimetype: mimetypes[ext] || 'image/jpeg',
            filename: path.basename(imagePath),
            caption: 'Test image from API'
        }
    };

    const result = await makeRequest('/send-message', 'POST', payload);
    console.log('Status:', result.status);
    console.log('Response:', result.data);
}

// Test 6: Send audio (if you have a test audio file)
async function testSendAudio(channelName, audioPath) {
    console.log('\n=== Test 6: Send Audio ===');

    if (!fs.existsSync(audioPath)) {
        console.log(`Audio file not found: ${audioPath}`);
        console.log('Skipping audio test...');
        return;
    }

    const base64Data = fileToBase64(audioPath);
    const ext = path.extname(audioPath).toLowerCase();
    const mimetypes = {
        '.mp3': 'audio/mpeg',
        '.ogg': 'audio/ogg',
        '.wav': 'audio/wav',
        '.m4a': 'audio/mp4'
    };

    const payload = {
        channelName: channelName,
        messageType: 'audio',
        messageData: {
            data: base64Data,
            mimetype: mimetypes[ext] || 'audio/mpeg',
            filename: path.basename(audioPath),
            asVoiceNote: true
        }
    };

    const result = await makeRequest('/send-message', 'POST', payload);
    console.log('Status:', result.status);
    console.log('Response:', result.data);
}

// Main test runner
async function runTests() {
    console.log('Starting WhatsApp Bot API Tests...');
    console.log('Make sure the bot server is running on port 3000!');

    // Wait a bit for user to read
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Run basic tests
    await testHealth();
    await testStatus();

    // List channels
    const channels = await testListChannels();

    if (channels.length === 0) {
        console.log('\n⚠️  No channels found. Make sure you are subscribed to at least one channel.');
        console.log('You can manually test with curl:');
        console.log('\ncurl -X POST http://localhost:3000/send-message \\');
        console.log('  -H "Content-Type: application/json" \\');
        console.log('  -d \'{"channelName":"Your Channel Name","messageType":"text","messageData":{"text":"Hello!"}}\'');
        return;
    }

    // Use the first channel for testing
    const testChannel = channels[0].name;
    console.log(`\n📢 Using channel "${testChannel}" for message tests`);

    // Test sending text
    await testSendText(testChannel);

    // Optional: Test image (provide your own test image path)
    // await testSendImage(testChannel, './test-image.jpg');

    // Optional: Test audio (provide your own test audio path)
    // await testSendAudio(testChannel, './test-audio.mp3');

    console.log('\n✅ Tests completed!');
}

// Run the tests
runTests().catch(console.error);
