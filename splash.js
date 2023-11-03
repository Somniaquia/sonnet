const WebSocket = require('ws');

const ws = new WebSocket('ws://localhost:6789');

ws.on('open', function open() {
    console.log('Connected to the python backend.');
});

ws.on('message', function incoming(data) {
    console.log('Received: %s', data);
    // TODO: Receive GPT messages and display them on screen
});

ws.on('error', function handleError(error) {
    console.error('WebSocket error:', error);
});