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
async function onActivationClicked(){
    const container = document.getElementById("circle_container");
    const paragraphs = container.querySelectorAll("circle");
    const activation = document.getElementById("activation");
    const green = document.getElementById("green");
    const dark_green = document.getElementById("dark_green");

    activation.removeAttribute('href');
    if (activated){
        circle = dark_green
        board = green
    }else {
        circle = green
        board = dark_green
    }
    circle.classList = 'circle';
    circle.style.visibility = 'visible';
    
    await sleep(1.4);
    
    board.style.visibility = 'hidden';
    circle.classList.remove("circle");
    container.appendChild(paragraphs[1]);
    container.appendChild(paragraphs[0]);

    activated = !activated

    activation.href = "#";
    ws.send('{"type":"fileEdit", "location":"activating","context":"'+activation+'"}')

}

function closeSplash(){
    window.close();
}


function updateSchedule(){
    ws.send('{"type":"fileAccess"}');
}

function showCurrentDetail(){
    var blocked = JSON.parse(blocklist)
    alert("Name\n "+blocked['current']+"\nExplanation\n "+blocked[blocked['current']]['explanation']+"\nBlocked List\n "+blocked[blocked['current']]['blocked']);
}

function chatToGPT(e) {
    if(e.keyCode == 13) { 
        alert("엔터를 입력하셨습니다!");
        return false;
    } else {
        return true;
    }
}