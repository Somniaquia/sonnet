// const WebSocket = require('ws');
// const remote = require('electron').remote;

const ws = new WebSocket('ws://127.0.0.1:3000');

ws.onopen = function(){
    console.log('Connected to the python backend.');
};
ws.onclose = function(){
    console.log('Disconnected');
};

ws.onmessage = function(data){
    console.log('Received: %s', data);
    // TODO: Receive GPT messages and display them on the text boxes
};

ws.onerror = function(error) {
    console.error('WebSocket error:', error);
};

function sendToPython(message) {
    if (ws.readyState === WebSocket.OPEN) {
        ws.send(message);
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