const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  getDbStatus: () => ipcRenderer.invoke('get-db-status'),
  getMachineId: () => ipcRenderer.invoke('get-machine-id'),
  registerUser: (data) => ipcRenderer.invoke('register-user', data),
  loginUser: (data) => ipcRenderer.invoke('login-user', data),
  forgotPassword: (data) => ipcRenderer.invoke('forgot-password', data),
  resetPassword: (data) => ipcRenderer.invoke('reset-password', data),
  saveAppointment: (data) => ipcRenderer.invoke('save-appointment', data),
  deleteAppointment: (data) => ipcRenderer.invoke('delete-appointment', data),
  getAppointments: (data) => ipcRenderer.invoke('get-appointments', data),
  windowMinimize: () => ipcRenderer.invoke('window-minimize'),
  windowMaximize: () => ipcRenderer.invoke('window-maximize'),
  windowClose: () => ipcRenderer.invoke('window-close'),
});
