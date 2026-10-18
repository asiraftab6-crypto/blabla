const { app, BrowserWindow, session, desktopCapturer, dialog, globalShortcut } = require('electron');
const path = require('path');
let win;

function createWindow() {
  win = new BrowserWindow({
    width: 820, height: 780, autoHideMenuBar: true, title: 'wcap',
    webPreferences: { preload: path.join(__dirname, 'preload.js'), contextIsolation: true },
  });
  win.loadFile('index.html');
}

app.whenReady().then(() => {
  // allow microphone
  session.defaultSession.setPermissionRequestHandler((wc, permission, cb) => cb(permission === 'media'));

  // screen/window picker + system audio (loopback)
  session.defaultSession.setDisplayMediaRequestHandler(async (request, callback) => {
    try {
      const sources = await desktopCapturer.getSources({ types: ['screen', 'window'] });
      const list = sources.slice(0, 10);
      const r = await dialog.showMessageBox(win, {
        type: 'question', title: 'wcap', message: 'What do you want to record?',
        buttons: [...list.map(s => s.name.slice(0, 60)), 'Cancel'], cancelId: list.length, noLink: true,
      });
      if (r.response >= list.length) return callback({});
      const opts = { video: list[r.response] };
      if (request.audioRequested) opts.audio = 'loopback';
      callback(opts);
    } catch (e) { callback({}); }
  });

  createWindow();
  globalShortcut.register('CommandOrControl+Shift+R', () => win && win.webContents.send('toggle'));
});

app.on('will-quit', () => globalShortcut.unregisterAll());
app.on('window-all-closed', () => app.quit());
