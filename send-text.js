#!/usr/bin/env node

// Script to send text messages to WhatsApp channel
// Usage: node send-text.js <channel-name> <message-text>

const API_URL = 'http://localhost:3000';

const args = process.argv.slice(2);

if (args.length < 2) {
    console.log('Usage: node send-text.js <channel-name> <message-text>');
    console.log('Example: node send-text.js "Test Channel" "Hello world!"');
    process.exit(1);
}

const [channelName, text] = args;

async function sendText() {
    console.log(`Sending text to "${channelName}": "${text}"`);

    try {
        const response = await fetch(`${API_URL}/send-message`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                channelName: channelName,
                messageType: 'text',
                messageData: { text: text }
            })
        });

        const result = await response.json();

        if (response.ok) {
            console.log('\n✅ Success!');
            console.log(JSON.stringify(result, null, 2));
        } else {
            console.error('\n❌ Error:');
            console.error(JSON.stringify(result, null, 2));
        }
    } catch (error) {
        console.error('\n❌ Error sending message:', error.message);
    }
}

sendText();
