import { ipcRenderer, contextBridge } from 'electron'

const notify = (title:string, body:string) => {
  ipcRenderer.send('show-notification', { title, body })
}

const closeWindow= () => ipcRenderer.send('close-window');

const showNotificationDialog = (question:string, options:string[]) => ipcRenderer.invoke('show-notification-dialog', question, options)

const schedule = (startTime: string,endTime: string,interval: number) => ipcRenderer.send('set-notification-schedule',{ startTime, endTime, interval});

const getNextNotifyTime = () => ipcRenderer.invoke('get-next-notification-time')

contextBridge.exposeInMainWorld('api', {
  notify: notify,
  showNotificationDialog: showNotificationDialog,
  schedule: schedule,
  getNextNotifyTime: getNextNotifyTime,
  exit: closeWindow
});




// --------- Expose some API to the Renderer process ---------
contextBridge.exposeInMainWorld('ipcRenderer', {
  on(...args: Parameters<typeof ipcRenderer.on>) {
    const [channel, listener] = args
    return ipcRenderer.on(channel, (event, ...args) => listener(event, ...args))
  },
  off(...args: Parameters<typeof ipcRenderer.off>) {
    const [channel, ...omit] = args
    return ipcRenderer.off(channel, ...omit)
  },
  send(...args: Parameters<typeof ipcRenderer.send>) {
    const [channel, ...omit] = args
    return ipcRenderer.send(channel, ...omit)
  },
  invoke(...args: Parameters<typeof ipcRenderer.invoke>) {
    const [channel, ...omit] = args
    return ipcRenderer.invoke(channel, ...omit)
  },

  // You can expose other APTs you need here.
  // ...
})
