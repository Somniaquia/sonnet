const { ipcRenderer } = require(`electron`);
const WebSocket = require(`ws`);

function consoleLog(message) {
    ipcRenderer.send(`log`, message);
}

var ws = undefined;

function initializeWebSocket() {
    function reconnectWebSocket() {
        consoleLog(`JS-side websocket attempting to reconnect to the python backend...`);

        setTimeout(() => {
            initializeWebSocket();
        }, 1000);
    }

    ws = new WebSocket(`ws://127.0.0.1:3000`);

    ws.onopen = function () {
        consoleLog(`JS-side websocket connected to the python backend.`);
    };

    ws.onclose = function () {
        consoleLog(`JS-side websocket disconnected from the python backend.`);
        reconnectWebSocket();
    };

    ws.onerror = function (error) {
        consoleLog(`JS-side websocket detected error from the python backend:`, error);
    };

    ws.onmessage = function (event) {
        consoleLog(`JS-side websocket received data: ${event.data}`, );

        try {
            var message = JSON.parse(event.data);

            if (message[`type`] == `agentPrompt`) {
                var agentPrompt = message['content'];
                addParagraphToPromptBox(agentPrompt)

            } else if (message["type"] == `blockList`) {
                var blockList = message["content"];

                const activatedSchedule = document.getElementById(`left_window_title`);
                const activatedScheduleExplanation = document.getElementById(`activatedScheduleExplanation`);

                activatedSchedule.innerText = blockList[`activated`];
                activatedScheduleExplanation.innerText = [`explanation`].slice(0, 30) + "\n...";
            }
        } catch (e) {
            consoleLog(`Could not parse JSON:`, e);
        }
    };
}

initializeWebSocket();

//#region Toggling wings
var leftWingActive = false;
var rightWingActive = false;

let leftWing = document.getElementById("left_window");
let rightWing = document.getElementById("right_window");

let leftWingDimension = [leftWing.offsetLeft, leftWing.offsetTop, leftWing.offsetWidth, leftWing.offsetHeight];
let rightWingDimension = [rightWing.offsetLeft, rightWing.offsetTop, rightWing.offsetWidth, rightWing.offsetHeight];

ipcRenderer.on(`toggleLeftWing`, () => {
    leftWingActive = !leftWingActive;
    if (leftWingActive) openLeftWindow(); else closeLeftWindow();
});

ipcRenderer.on(`toggleRightWing`, () => {
    rightWingActive = !rightWingActive;
    if (rightWingActive) openRightWindow(); else closeRightWindow();
})

document.addEventListener(`mousemove`, (event) => {
    if (isTransparent(event.x, event.y)) {
        ipcRenderer.send(`ignore-mouse-events`, true, { forward: true });
    } else {
        ipcRenderer.send(`ignore-mouse-events`, false);
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

function refuteInterrogation(selectedInstance) {
    selectedInstance.name
}

function selectSchedule(scheduleName) {
    if (ws.readyState === WebSocket.OPEN) {
        let string = `{"type":"","content": "${message}"}`
        ws.send(string);
    } else {
        consoleLog(`WebSocket is not open.`);
    }
}
//#endregion

//#region Right Wing functions
var conversationArea = document.getElementById("chat_scroller");
var promptArea = document.getElementById("chat_input_box_input");

function addParagraphToPromptBox(message, role) {
    var newChatBox = document.createElement("div");

    newChatBox.setAttribute("id", "chat_box");
    var dataFrom = (role == "user") ? "right" : "left";
    newChatBox.setAttribute("data-from", dataFrom);
    newChatBox.textContent = message;

    conversationArea.appendChild(newChatBox);
    conversationArea.scrollTop = conversationArea.scrollHeight;
}

function sendUserPrompt(message, role) {
    addParagraphToPromptBox(message, role);

    if (ws.readyState === WebSocket.OPEN) {
        let string = `{"type":"userPrompt","content": "${message}"}`
        ws.send(string);
    } else {
        consoleLog(`WebSocket is not open; Couldn't send user prompt.`);
    }
}

promptArea.addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
        event.preventDefault();
        sendUserPrompt(promptArea.value, "user");
        promptArea.value = "";
    }
}); 

//#endregion