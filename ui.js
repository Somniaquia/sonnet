// const WebSocket = require('ws');
// const remote = require('electron').remote;
// const fs = require('fs');

const ws = new WebSocket('ws://127.0.0.1:3000');

ws.onopen = function(){
    console.log('Connected to the python backend.');
    sendMessage('CONNECTED');
    updateSchedule();
};
ws.onclose = function(){
    console.log('Disconnected');
};

var blocklist = "";
ws.onmessage = function (event) {
    console.log('Received: %s', event.data);

    try {
        var message = JSON.parse(event.data);
        console.log('Response:', message);
        if (message["type"] == 'blocklist'){
            blocklist = JSON.stringify(message);

            const cur_schedule_name = document.getElementById('cur_schedule_name');
            const cur_schedule_explanation = document.getElementById('cur_schedule_explanation');
            const cur_process_name = message['current'];
            const cur_process_context = message[cur_process_name];

            cur_schedule_name.innerText = cur_process_name;
            cur_schedule_explanation.innerText = cur_process_context['explanation'].slice(0, 30) + "\n...";
        }
    } catch (e) {
        console.error('Could not parse JSON:', e);
    }
};

ws.onerror = function(error) {
    console.error('WebSocket error:', error);
};

var input = document.getElementById("promptBox");

input.addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
        event.preventDefault();
        sendMessage(input.value)
        input.value = ""
        // document.getElementById("myBtn").click();
    }
}); 

function sendMessage(message) {
    if (ws.readyState === WebSocket.OPEN) {
        let string = `{"type":"msg","context": "${message}"}`
        // console.log(JSON.parse(string));
        ws.send(string);
    } else {
        console.error('WebSocket is not open.');
    }
}
function sleep(sec) {
    return new Promise(resolve => setTimeout(resolve, sec * 1000));
  } 

activated = false;