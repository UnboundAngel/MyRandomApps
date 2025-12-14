const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  openDirectory: (hideDotFiles) => ipcRenderer.invoke('open-directory', hideDotFiles),
  getFileContent: (filePath) => ipcRenderer.invoke('get-file-content', filePath),
  isDirectory: (path) => ipcRenderer.invoke('is-directory', path),
  openDroppedDirectory: (dirPath, hideDotFiles) => ipcRenderer.invoke('open-dropped-directory', dirPath, hideDotFiles),
  saveFile: (filePath, content) => ipcRenderer.invoke('save-file', filePath, content),
  getImageAsBase64: (filePath) => ipcRenderer.invoke('get-image-as-base64', filePath),
  windowControl: (control) => ipcRenderer.invoke('window-control', control),
});
