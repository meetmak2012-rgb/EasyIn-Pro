
const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1000,
    minHeight: 700,
    title: "EasyIn Invoicing",
    show: false, // Don't show until ready to prevent flickering
    backgroundColor: '#f8fafc',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.cjs'),
    },
  });

  win.once('ready-to-show', () => {
    win.show();
    win.maximize();
  });

  // Load the local index.html file from the dist folder
  const indexPath = app.isPackaged 
    ? path.join(__dirname, 'dist', 'index.html')
    : path.join(__dirname, 'index.html');
    
  win.loadFile(indexPath);
  
  // Professional desktop look: no menu bar
  win.setMenuBarVisibility(false);
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
