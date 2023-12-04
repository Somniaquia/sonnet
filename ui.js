const { ipcRenderer } = require('electron');
const WebSocket = require('ws');
const ws = new WebSocket('ws://127.0.0.1:3000');

ws.onopen = function(){
    console.log('Connected to the python backend.');
    sendUserPrompt('CONNECTED');
    updateSchedule();
};

ws.onclose = function(){ console.log('Disconnected'); };
ws.onerror = function (error) { console.error('WebSocket error:', error); };

//#region Toggling wings
var leftWingActive = false;
var rightWingActive = false;

let leftWing = document.getElementById("left_window");
let rightWing = document.getElementById("right_window");

let leftWingDimension = [leftWing.offsetLeft, leftWing.offsetTop, leftWing.offsetWidth, leftWing.offsetHeight];
let rightWingDimension = [rightWing.offsetLeft, rightWing.offsetTop, rightWing.offsetWidth, rightWing.offsetHeight];

ipcRenderer.on('toggleLeftWing', () => {
    leftWingActive = !leftWingActive;
    console.log("Hello");
    if (leftWingActive) openLeftWindow(); else closeLeftWindow();
});

ipcRenderer.on('toggleRightWing', () => {
    rightWingActive = !rightWingActive;
    if (rightWingActive) openRightWindow(); else closeRightWindow();
})

document.addEventListener('mousemove', (event) => {
    if (isTransparent(event.x, event.y)) {
        ipcRenderer.send('ignore-mouse-events', true, { forward: true });
    } else {
        ipcRenderer.send('ignore-mouse-events', false);
    }
});

function isTransparent(x, y) {
    return !(isInside(x, y, leftWingDimension) && leftWingActive) && !(isInside(x, y, rightWingDimension) && rightWingActive);
}

function isInside(x, y, dimensions) {
    let [left, top, width, height] = dimensions;
    let right = left + width;
    let bottom = top + height;

    return x >= left && x <= right && y >= top && y <= bottom;
}

//#endregion

//#region Left Wing functions
var blockedList = "";
var ignoredList = "";

var blockedListArea = document.getElementById("blockedListArea");
var ignorerdListArea = document.getElementById("ignoredList");

var selectedName;

ws.onmessage = function (event) {
    console.log('Received: %s', event.data);

    try {
        var message = JSON.parse(event.data);
        console.log('Response:', message);
        
        if (message['type'] == 'agentPrompt') {
            var agentPrompt = JSON.parse(message);
            addParagraphToPromptBox(agentPrompt)

        } else if (message["type"] == 'blockList') {
            var blockList = message["content"];

            const activatedSchedule = document.getElementById('left_window_title');
            const activatedScheduleExplanation = document.getElementById('activatedScheduleExplanation');

            activatedSchedule.innerText = blockList['activated'];
            activatedScheduleExplanation.innerText = ['explanation'].slice(0, 30) + "\n...";
        }
    } catch (e) {
        console.error('Could not parse JSON:', e);
    }
};

function refuteInterrogation(selectedInstance) {
    selectedInstance.name
}

function selectSchedule(scheduleName) {
    if (ws.readyState === WebSocket.OPEN) {
        let string = `{"type":"","content": "${message}"}`
        // console.log(JSON.parse(string));
        ws.send(string);
    } else {
        console.error('WebSocket is not open.');
    }
}
//#endregion

//#region Right Wing functions
var conversationArea = document.getElementById("conversationArea");
var promptArea = document.getElementById("promptArea");

function addParagraphToPromptBox(message, role) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add(className);
    messageDiv.textContent = text;
    conversationArea.appendChild(messageDiv);

    // Scroll to the latest message
    conversationArea.scrollTop = conversationArea.scrollHeight;
}

function sendUserPrompt(message) {
    if (ws.readyState === WebSocket.OPEN) {
        let string = `{"type":"userPrompt","content": "${message}"}`
        // console.log(JSON.parse(string));
        ws.send(string);
    } else {
        console.error('WebSocket is not open.');
    }
}

promptArea.addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
        event.preventDefault();
        sendUserPrompt(promptArea.value)
        promptArea.value = ""
    }
}); 

//#endregion