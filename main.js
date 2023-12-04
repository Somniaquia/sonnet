const electron = require('electron');
const { app, BrowserWindow, globalShortcut, session, ipcMain } = electron;
const { spawn } = require('child_process');

var canvasWindow = null;
var uiWindow = null;

function createCanvasWindow() {
    const { width, height } = electron.screen.getPrimaryDisplay().workAreaSize;
    canvasWindow = new BrowserWindow({
        width: width,
        height: height,
        frame: false,
        transparent: true,
        skipTaskbar: true,
        alwaysOnTop: true,
        resizable: false,
        webPreferences: {
            nodeIntegration: true,
            webSecurity: false
        },
        show: false
    });

    canvasWindow.loadFile('canvas.html');
    canvasWindow.setIgnoreMouseEvents(true);
    
    canvasWindow.once('ready-to-show', () => {
        canvasWindow.setHasShadow(false);
        canvasWindow.show();
    });
}

let showInterval, hideInterval;
let uiWindowActivated = false;

function createOrToggleuiWindow() {

    function driftWindowToShow() {
        clearInterval(showInterval);
        clearInterval(hideInterval);

        const { width, height } = electron.screen.getPrimaryDisplay().workAreaSize;
        let x = uiWindow.getPosition()[0];
        
        showInterval = setInterval(() => {
            // canvasWindow.webContents.executeJavaScript('canvasApp()');

            if (x < 0) {
                x += 10;
                uiWindow.setPosition(x, 0, false);
                uiWindow.setSize(width / 3, height, false);
            } else {
                uiWindowActivated = true;
                uiWindow.setPosition(0, 0, false);
                uiWindow.setSize(Math.round(width / 3), height, false);
                clearInterval(showInterval);
                uiWindow.focus();
            }
        }, 1);
    }

    function driftWindowToHide() {
        clearInterval(showInterval);
        clearInterval(hideInterval);

        const { width, height } = electron.screen.getPrimaryDisplay().workAreaSize;
        let x = uiWindow.getPosition()[0];
        
        hideInterval = setInterval(() => {
            if (x >= -width / 3) {
                x -= 10;
                uiWindow.setPosition(x, 0, false);
                uiWindow.setSize(Math.round(width / 3), height, false);
            } else {
                uiWindowActivated = false;
                uiWindow.setPosition(-Math.round(width / 3), 0, false);
                uiWindow.setSize(Math.round(width / 3), height, false);
                clearInterval(hideInterval);
            }
        }, 1);
    }

    if (uiWindow && !uiWindow.isDestroyed()) {
        if (uiWindowActivated) {
            driftWindowToHide();
        } else {
            driftWindowToShow();
        }
    } else {
        const { width, height } = electron.screen.getPrimaryDisplay().workAreaSize;
        uiWindow = new BrowserWindow({
            x: 0,
            y: 0,
            width: width / 3,
            height: height,
            frame:false,
            transparent: true,
            skipTaskbar: true,
            alwaysOnTop: true,
            resizable: false,
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: false
            },
            show: false,
            webPreferences:{
                webSecurity: false
            }
        });
        
        uiWindow.loadFile('ui.html');
        uiWindow.once('ready-to-show', () => {
            uiWindow.setHasShadow(false);
            uiWindow.show();
            driftWindowToShow();
        });
        
        uiWindow.on('blur', () => {
            driftWindowToHide();
        });
    }
}

app.whenReady().then(() => {
    createCanvasWindow();
    globalShortcut.register('CommandOrControl+Alt+P', createOrToggleuiWindow);

    console.log(canvasWindow.y)
    // const blockerProcess = spawn('C:\\Users\\Somni\\anaconda3\\envs\\torch\\python.exe', ['-u', 'backend\\blocker.py'], { studio: 'pipe' });
    // const blockerProcess = spawn('/usr/bin/python3', ['-u', 'backend/blocker.py'], { studio: 'pipe' });
    blockerProcess.stdout.on('data', (data) => { console.log(`${data.slice(0, -1)}`); });
    blockerProcess.stderr.on('data', (data) => { console.log(`${data.slice(0, -1)}`); });

    // const transcriptorProcess = spawn('C:\\Users\\Somni\\anaconda3\\envs\\torch\\python.exe', ['-u', 'backend\\backend.py'], { studio: 'pipe' });
    // const transcriptorProcess = spawn('/usr/bin/python3', ['-u', 'backend/backend.py'], { studio: 'pipe' });
    transcriptorProcess.stdout.on('data', (data) => { console.log(`${data.slice(0, -1)}`); });
    transcriptorProcess.stderr.on('data', (data) => { console.log(`${data.slice(0, -1)}`); });
});

app.on('window-all-closed', () => {
    globalShortcut.unregisterAll();
    if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createCanvasWindow();
});