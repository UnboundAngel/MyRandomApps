const { app, BrowserWindow, ipcMain, dialog, powerSaveBlocker } = require('electron');
const path = require('path');
const fs = require('fs');
const docx = require('docx');

const dataPath = path.join(app.getPath('userData'), 'data.json');
let powerSaveBlockerId = null;

// Handle creating/removing shortcuts on Windows when installing/uninstalling
if (require('electron-squirrel-startup')) {
  app.quit();
}

function createWindow() {
  // Create the browser window.
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 1000,
    minHeight: 700,
    icon: path.join(__dirname, 'public', 'icon.ico'),
    webPreferences: {
      // Point to the preload script
      preload: path.join(__dirname, 'preload.js'),
      // Isolate the renderer process from the main process for security
      contextIsolation: true,
      // Disable Node.js integration in the renderer for security
      nodeIntegration: false,
    },
    // Removes the default white menu bar for better immersion
    autoHideMenuBar: true,
    // Dark background to match app
    backgroundColor: '#000000',
  });

  // Decide what to load
  const isDev = process.env.IS_DEV === "true";

  if (isDev) {
    // In dev mode, load the Vite local server
    win.loadURL('http://localhost:5173');
    // Open DevTools automatically if you want
    // win.webContents.openDevTools();
  } else {
    // In production, load the built index.html file
    win.loadFile(path.join(__dirname, 'dist', 'index.html'));
  }
}

// App Ready Event
app.whenReady().then(() => {
  powerSaveBlockerId = powerSaveBlocker.start('prevent-display-sleep');
  console.log('Power save blocker started:', powerSaveBlocker.isStarted(powerSaveBlockerId));
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed
app.on('window-all-closed', () => {
  if (powerSaveBlocker.isStarted(powerSaveBlockerId)) {
    powerSaveBlocker.stop(powerSaveBlockerId);
    console.log('Power save blocker stopped.');
  }
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// --- IPC HANDLERS FOR FILE OPERATIONS ---

ipcMain.handle('save-data', (event, data) => {
  try {
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
    return { success: true };
  } catch (err) {
    console.error(err);
    return { success: false, error: err.message };
  }
});

ipcMain.handle('load-data', () => {
  try {
    if (fs.existsSync(dataPath)) {
      const data = fs.readFileSync(dataPath, 'utf-8');
      return { success: true, data: JSON.parse(data) };
    }
  } catch (err) {
    console.error(err);
    return { success: false, error: err.message };
  }
  return { success: true, data: null }; // Return null if file doesn't exist
});


// Handle Save File Dialog
ipcMain.handle('save-file', async (event, content) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  const { filePath, canceled } = await dialog.showSaveDialog(win, {
    title: 'Export Book as Markdown',
    defaultPath: path.join(app.getPath('downloads'), `my-book.md`),
    filters: [{ name: 'Markdown Files', extensions: ['md', 'txt'] }]
  });

  if (!canceled && filePath) {
    try {
      fs.writeFileSync(filePath, content);
      return { success: true, path: filePath };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }
  return { success: false, canceled: true };
});

// Handle Open File Dialog
ipcMain.handle('open-file', async (event) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  const { filePaths, canceled } = await dialog.showOpenDialog(win, {
    title: 'Import Book from Markdown',
    defaultPath: app.getPath('downloads'),
    filters: [{ name: 'Markdown Files', extensions: ['md', 'txt'] }],
    properties: ['openFile']
  });

  if (!canceled && filePaths && filePaths.length > 0) {
    try {
      const content = fs.readFileSync(filePaths[0], 'utf-8');
      return { success: true, content: content, path: filePaths[0] };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }
  return { success: false, canceled: true };
});

// Handle Save TXT File Dialog
ipcMain.handle('save-txt-file', async (event, content) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  const { filePath, canceled } = await dialog.showSaveDialog(win, {
    title: 'Export Book as Text File',
    defaultPath: path.join(app.getPath('downloads'), `my-book.txt`),
    filters: [{ name: 'Text Files', extensions: ['txt'] }]
  });

  if (!canceled && filePath) {
    try {
      fs.writeFileSync(filePath, content);
      return { success: true, path: filePath };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }
  return { success: false, canceled: true };
});

// Handle Save DOCX File Dialog
ipcMain.handle('save-docx-file', async (event, data) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  const { filePath, canceled } = await dialog.showSaveDialog(win, {
    title: 'Export Book as DOCX',
    defaultPath: path.join(app.getPath('downloads'), `${data.title}.docx`),
    filters: [{ name: 'Word Documents', extensions: ['docx'] }]
  });

  if (!canceled && filePath) {
    const doc = new docx.Document({
      sections: [{
        children: [
          new docx.Paragraph({ text: data.title, heading: docx.HeadingLevel.HEADING_1 }),
          ...data.pages.flatMap(page =>
            page.map(p =>
              new docx.Paragraph({
                children: p.children.map(c =>
                  new docx.TextRun({
                    text: c.text,
                    bold: c.bold,
                    italics: c.italic,
                    highlight: c.highlight ? 'yellow' : undefined,
                  })
                )
              })
            )
          )
        ]
      }]
    });

    try {
      const buffer = await docx.Packer.toBuffer(doc);
      fs.writeFileSync(filePath, buffer);
      return { success: true, path: filePath };
    } catch (err) {
      console.error(err);
      return { success: false, error: err.message };
    }
  }
  return { success: false, canceled: true };
});

// Handle Save PDF (Themed)
ipcMain.handle('save-pdf', async (event, { html, title }) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  const { filePath, canceled } = await dialog.showSaveDialog(win, {
    title: 'Export Book as PDF',
    defaultPath: path.join(app.getPath('downloads'), `${title}.pdf`),
    filters: [{ name: 'PDF Document', extensions: ['pdf'] }]
  });

  if (!canceled && filePath) {
    // Create a hidden window to render the content
    const printWin = new BrowserWindow({ 
        show: false, 
        width: 800, 
        height: 1100,
        webPreferences: {
            offscreen: true
        } 
    });

    try {
        // Load the HTML content
        // Encode special characters to avoid parsing errors
        const encodedHtml = 'data:text/html;charset=UTF-8,' + encodeURIComponent(html);
        await printWin.loadURL(encodedHtml);
        
        // Wait for potential fonts/images (simple delay usually enough for data uris, but 'did-finish-load' handles main load)
        
        const pdfData = await printWin.webContents.printToPDF({
            printBackground: true,
            pageSize: 'A4',
            margins: {
                top: 0, bottom: 0, left: 0, right: 0 // We handle margins in CSS for the textured look
            }
        });

        fs.writeFileSync(filePath, pdfData);
        printWin.close();
        return { success: true, path: filePath };

    } catch (err) {
        if (!printWin.isDestroyed()) printWin.close();
        console.error('PDF Generation Error:', err);
        return { success: false, error: err.message };
    }
  }
  return { success: false, canceled: true };
});