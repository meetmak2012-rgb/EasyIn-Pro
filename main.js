
const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    title: "EasyIn Invoicing",
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  // Load the local index.html file
  win.loadFile('index.html');
  
  // Professional desktop look: no menu bar
  win.setMenuBarVisibility(false);
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
