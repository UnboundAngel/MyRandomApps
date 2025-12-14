const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    frame: false,
    titleBarStyle: 'hidden',
    backgroundColor: '#000000',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  win.loadFile('index.html');
  
  // Optional: Open DevTools for debugging
  // win.webContents.openDevTools();
}

function readDirectoryTree(dir, hideDotFiles) {
  const dirents = fs.readdirSync(dir, { withFileTypes: true });
  const files = dirents
    .filter(dirent => !hideDotFiles || !dirent.name.startsWith('.'))
    .map((dirent) => {
      const res = path.resolve(dir, dirent.name);
      return {
        id: res,
        name: dirent.name,
        type: dirent.isDirectory() ? 'folder' : 'file',
        children: dirent.isDirectory() ? readDirectoryTree(res, hideDotFiles) : undefined,
      };
  });
  return {
    id: dir,
    name: path.basename(dir),
    type: 'folder',
    isOpen: true,
    children: files
  };
}

app.whenReady().then(() => {
  createWindow();

  ipcMain.handle('window-control', (event, control) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (control === 'minimize') {
      win.minimize();
    } else if (control === 'maximize') {
      if (win.isMaximized()) {
        win.unmaximize();
      } else {
        win.maximize();
      }
    } else if (control === 'close') {
      win.close();
    }
  });

  ipcMain.handle('get-image-as-base64', async (event, filePath) => {
    const data = fs.readFileSync(filePath);
    const extension = path.extname(filePath).substring(1);
    return `data:image/${extension};base64,${data.toString('base64')}`;
  });

  ipcMain.handle('is-directory', async (event, path) => {
    return fs.statSync(path).isDirectory();
  });

  ipcMain.handle('save-file', async (event, filePath, content) => {
    fs.writeFileSync(filePath, content, 'utf-8');
  });

  ipcMain.handle('get-file-content', async (event, filePath) => {
    return fs.readFileSync(filePath, 'utf-8');
  });

  ipcMain.handle('open-directory', async (event, hideDotFiles) => {
    const { canceled, filePaths } = await dialog.showOpenDialog({
      properties: ['openDirectory']
    });
    if (canceled) {
      return;
    } else {
      const dirPath = filePaths[0];
      return readDirectoryTree(dirPath, hideDotFiles);
    }
  });

  ipcMain.handle('open-dropped-directory', async (event, dirPath, hideDotFiles) => {
    return readDirectoryTree(dirPath, hideDotFiles);
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
