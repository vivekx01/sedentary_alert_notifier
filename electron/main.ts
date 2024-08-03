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

let win: BrowserWindow | null;
let notificationInterval: NodeJS.Timeout | null = null;;
let userSchedule:scheduleObject | null;
let nextNotificationTime: Date | null = null; 

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
  // win.setMenuBarVisibility(false)

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

// ipc methods and handlers
ipcMain.on('show-notification', (event, data) => {
  showNormalNotification(data);
});

ipcMain.handle('show-notification-dialog', async (event, question, options) => {
  const response = await showNotificationDialog(question, options);
  return response.response;
});

ipcMain.on('set-notification-schedule', (event, schedule: scheduleObject) => {
  userSchedule = schedule;
  if (notificationInterval) {
    clearInterval(notificationInterval);
  }
  startNotificationLoop();
});
+
ipcMain.handle('get-next-notification-time', () => {
  return nextNotificationTime ? nextNotificationTime.toLocaleTimeString() : 'No notifications scheduled';
});

ipcMain.on('close-window', () => {
  app.quit();
});

// functions 
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

function showNormalNotification(data:notificationobject){
  const notification = new Notification({
    title: data.title,
    body: data.body
  });
  notification.show();
}

function startNotificationLoop() {
  if (!userSchedule) return;

  const [startHour, startMinute] = userSchedule.startTime.split(':').map(Number);
  const [endHour, endMinute] = userSchedule.endTime.split(':').map(Number);
  const intervalMs = userSchedule.interval * 60 * 1000;

  // Immediate check on the start of the loop
  calculateNextNotificationTime();

  notificationInterval = setInterval(() => {
    calculateNextNotificationTime();
  }, intervalMs);

  function calculateNextNotificationTime() {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const startMinutes = startHour * 60 + startMinute;
    const endMinutes = endHour * 60 + endMinute;
  
    if (currentMinutes >= startMinutes && currentMinutes < endMinutes) {
      let data = {
        title: "Sedentary Alert",
        body: "Its the time to get up and walk",
      };
      showNormalNotification(data);
  
      // Calculate the next notification time
      nextNotificationTime = new Date(now.getTime() + intervalMs);
    } else if (currentMinutes < startMinutes) {
      // If before the start time, set the next notification to the start time
      nextNotificationTime = new Date(now);
      nextNotificationTime.setHours(startHour, startMinute, 0, 0);
    } else {
      // If after the end time, set the next notification to null
      nextNotificationTime = null;
    }
  }
}

//type declarations
type notificationobject = {
  title: string;
  body: string;
}

type scheduleObject = {
  startTime: string;
  endTime: string;
  interval: number;
}

app.whenReady().then(createWindow)
