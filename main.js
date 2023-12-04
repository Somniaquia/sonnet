const electron = require('electron');
const { app, BrowserWindow, globalShortcut, session, ipcMain } = electron;
const { spawn } = require('child_process');

var uiWindow = null;

function createUIWindow() {
    const { width, height } = electron.screen.getPrimaryDisplay().workAreaSize;
    uiWindow = new BrowserWindow({
        width: width,
        height: height,
        frame: false,
        transparent: true,
        skipTaskbar: true,
        alwaysOnTop: true,
        resizable: false,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            webSecurity: false
        },
        show: false
    });

    uiWindow.loadFile('ui.html');
    uiWindow.once('ready-to-show', () => {
        uiWindow.setHasShadow(false);
        // uiWindow.setIgnoreMouseEvents(false);
        uiWindow.show();
    });
}

ipcMain.on('ignore-mouse-events', (event, ignore, options) => {
    uiWindow.setIgnoreMouseEvents(ignore, options);
});

app.whenReady().then(() => {
    createUIWindow();
    globalShortcut.register('CommandOrControl+Alt+O', () => {
        uiWindow.webContents.send("toggleLeftWing");
    });

    globalShortcut.register('CommandOrControl+Alt+P', () => {
        uiWindow.webContents.send("toggleRightWing");
    });

    // const blockerProcess = spawn('C:\\Users\\Somni\\anaconda3\\envs\\torch\\python.exe', ['-u', 'backend\\blocker.py'], { studio: 'pipe' });
    // const blockerProcess = spawn('/usr/bin/python3', ['-u', 'backend/blocker.py'], { studio: 'pipe' });
    // blockerProcess.stdout.on('data', (data) => { console.log(`${data.slice(0, -1)}`); });
    // blockerProcess.stderr.on('data', (data) => { console.log(`${data.slice(0, -1)}`); });

    // const transcriptorProcess = spawn('C:\\Users\\Somni\\anaconda3\\envs\\torch\\python.exe', ['-u', 'backend\\backend.py'], { studio: 'pipe' });
    // const transcriptorProcess = spawn('/usr/bin/python3', ['-u', 'backend/backend.py'], { studio: 'pipe' });
    // transcriptorProcess.stdout.on('data', (data) => { console.log(`${data.slice(0, -1)}`); });
    // transcriptorProcess.stderr.on('data', (data) => { console.log(`${data.slice(0, -1)}`); });
});

app.on('window-all-closed', () => {
    globalShortcut.unregisterAll();
    if (process.platform !== 'darwin') app.quit();
});