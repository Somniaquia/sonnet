const electron = require('electron');
const { app, BrowserWindow, globalShortcut, session, ipcMain } = electron;
const { spawn } = require('child_process');

var canvasWindow;
var splashWindow;

function createCanvasWindow() {
    const { width, height } = electron.screen.getPrimaryDisplay().workAreaSize;
    canvasWindow = new BrowserWindow({
        width: width,
        height: height,
        transparent: true,
        frame: false,
        skipTaskbar: true,
        alwaysOnTop: true,
        resizable: false,
        webPreferences: {
            nodeIntegration: true
        },
    });

    canvasWindow.loadFile('canvas.html');
    canvasWindow.setIgnoreMouseEvents(true);
    canvasWindow.setHasShadow(false);
}

function createSplashWindow() {
    splashWindow = new BrowserWindow({
        width: 800,
        height: 600,
        transparent: true,
        webPreferences: {
            nodeIntegration: true
        }
    });

    splashWindow.loadFile('config.html');
}

app.whenReady().then(() => {
    createCanvasWindow();
    globalShortcut.register('CommandOrControl+Alt+P', createSplashWindow);

    console.log(canvasWindow.y)

    const blockerProcess = spawn('C:\\Users\\Somni\\anaconda3\\envs\\torch\\python.exe', ['-u', 'backend\\blocker.py'], { studio: 'pipe' });
    blockerProcess.stdout.on('data', (data) => { console.log(`${data.slice(0, -1)}`); });
    blockerProcess.stderr.on('data', (data) => { console.log(`${data.slice(0, -1)}`); });

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