const electron = require('electron');
const { app, BrowserWindow, globalShortcut, session, ipcMain } = electron;
const { spawn } = require('child_process');

var canvasWindow = null;
var splashWindow = null;

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
            nodeIntegration: true
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
let splashWindowActivated = false;

function createOrToggleSplashWindow() {
    function driftWindowToShow() {
        clearInterval(hideInterval); 
        const { width, height } = electron.screen.getPrimaryDisplay().workAreaSize;
        splashWindow.setSize(width / 3, height, false);
        let x = -width / 3;
        splashWindow.setPosition(x, 0);

        showInterval = setInterval(() => {
            if (x < 0) {
                x += 10;
                splashWindow.setPosition(x, 0, false);
            } else {
                splashWindowActivated = true;
                splashWindow.setPosition(0, 0, false);
                clearInterval(showInterval);
            }
        }, 1);
    }

    function driftWindowToHide() {
        clearInterval(showInterval);
        const { width, height } = electron.screen.getPrimaryDisplay().workAreaSize;
        splashWindow.setSize(width / 3, height, false);
        let x = splashWindow.getPosition()[0];

        hideInterval = setInterval(() => {
            if (x >= -width / 3) {
                x -= 10;
                splashWindow.setPosition(x, 0, false);
            } else {
                splashWindowActivated = false;
                splashWindow.setPosition(-width / 3, 0, false);
                clearInterval(hideInterval);
            }
        }, 1);
    }

    if (splashWindow && !splashWindow.isDestroyed()) {
        if (splashWindowActivated) {
            driftWindowToHide();
        } else {
            driftWindowToShow();
        }
    } else {
        const { width, height } = electron.screen.getPrimaryDisplay().workAreaSize;
        splashWindow = new BrowserWindow({
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
                nodeIntegration: true
            }
        });
        
        splashWindow.loadFile('splash.html');
        
        splashWindow.once('ready-to-show', () => {
            splashWindow.setHasShadow(false);
            driftWindowToShow();
        });
        
        splashWindow.on('blur', () => {
            driftWindowToHide();
        });
    }
}

app.whenReady().then(() => {
    createCanvasWindow();
    globalShortcut.register('CommandOrControl+Alt+P', createOrToggleSplashWindow);

    console.log(canvasWindow.y)

    // const blockerProcess = spawn('C:\\Users\\Somni\\anaconda3\\envs\\torch\\python.exe', ['-u', 'backend\\blocker.py'], { studio: 'pipe' });
    // blockerProcess.stdout.on('data', (data) => { console.log(`${data.slice(0, -1)}`); });
    // blockerProcess.stderr.on('data', (data) => { console.log(`${data.slice(0, -1)}`); });

    const transcriptorProcess = spawn('C:\\Users\\Somni\\anaconda3\\envs\\torch\\python.exe', ['-u', 'backend\\backend.py'], { studio: 'pipe' });
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