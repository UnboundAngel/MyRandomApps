const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  saveFile: (content) => ipcRenderer.invoke('save-file', content),
  openFile: () => ipcRenderer.invoke('open-file'),
  saveTxtFile: (content) => ipcRenderer.invoke('save-txt-file', content),
  saveDocxFile: (sections) => ipcRenderer.invoke('save-docx-file', sections),
  savePDF: (options) => ipcRenderer.invoke('save-pdf', options),
  saveData: (data) => ipcRenderer.invoke('save-data', data),
  loadData: () => ipcRenderer.invoke('load-data'),
});
