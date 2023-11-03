const WebSocket = require('ws');

const ws = new WebSocket('ws://localhost:6789');

ws.on('open', function open() {
    console.log('Connected to the python backend.');
});

ws.on('message', function incoming(data) {
    console.log('Received: %s', data);
    // TODO: Receive GPT messages and display them on the text boxes
});

ws.on('error', function handleError(error) {
    console.error('WebSocket error:', error);
});

function sendToPython(message) {
    if (ws.readyState === WebSocket.OPEN) {
        ws.send(message);
    } else {
        console.error('WebSocket is not open.');
    }
}