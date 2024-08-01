import { app, BrowserWindow } from 'electron'
import { fileURLToPath } from 'node:url'
import  { ipcMain, dialog, Notification } from 'electron'
import path from 'node:path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// The built directory structure
//
// ├─┬─┬ dist
// │ │ └── index.html
// │ │
// │ ├─┬ dist-electron
// │ │ ├── main.js
// │ │ └── preload.mjs
// │
process.env.APP_ROOT = path.join(__dirname, '..')

// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, 'public') : RENDERER_DIST

let win: BrowserWindow | null

function createWindow() {
  win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, 'notification.png'),
    width: 600,
    height: 300,
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
      nodeIntegration: true,
    },
  })
  if (process.platform === 'win32')
    {
        app.setAppUserModelId(app.name);
    }
  win.setMenuBarVisibility(false)

  // Test active push message to Renderer-process.
  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', (new Date).toLocaleString())
  })

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL)
  } else {
    // win.loadFile('dist/index.html')
    win.loadFile(path.join(RENDERER_DIST, 'index.html'))
  }
}

// ipc methods
ipcMain.on('show-notification', (event, data) => {
  const notification = new Notification({
    title: data.title,
    body: data.body
  });
  notification.show();
  setTimeout(() => {
    notification.close();
  }, 5000);
});

ipcMain.on('close-window', () => {
  app.quit();
});

function showNotificationDialog(question:string,selections:string[]) {
  const options: Electron.MessageBoxOptions = {
    type: 'question',
    buttons: selections,
    defaultId: 0,
    title: 'Notification',
    message: question,
  };

  const blankWindow = new BrowserWindow({
    show: false,
    alwaysOnTop: true
  })

  return dialog.showMessageBox(blankWindow, options);
}

ipcMain.handle('show-notification-dialog', async (event, question, options) => {
  const response = await showNotificationDialog(question, options);
  return response.response;
});


// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
    win = null
  }
})

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

app.whenReady().then(createWindow)
