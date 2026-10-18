const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('wcapNative', { onToggle: cb => ipcRenderer.on('toggle', () => cb()) });
