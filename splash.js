// const WebSocket = require('ws');
// const remote = require('electron').remote;

const ws = new WebSocket('ws://127.0.0.1:3000');

ws.onopen = function(){
    console.log('Connected to the python backend.');
    sendToPython('{"type":"message", "context":"연결확인"}')
};
ws.onclose = function(){
    console.log('Disconnected');
};

ws.onmessage = function (event) {
    console.log('Received: %s', event.data);

    try {
        const message = JSON.parse(event.data);
        console.log('Response:', message.response);
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
        let string = `{"message": "${message}"}`
        console.log(JSON.parse(string));
        ws.send(JSON.parse(string));
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

}

function closeSplash(){
    window.close();
}
function getCurrentSchedule(){
    try {
        const data = fs.readFileSync('blocklist.json', 'utf8');
        const jsonData = JSON.parse(data);
        console.log(jsonData);
    } catch (err) {
        console.error(err);
    }
    return jsonData.current

}
console.log(getCurrentSchedule())
