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
  // Prontuario
  saveProntuario: (data) => ipcRenderer.invoke('save-prontuario', data),
  getProntuarios: (data) => ipcRenderer.invoke('get-prontuarios', data),
  updateProntuario: (data) => ipcRenderer.invoke('update-prontuario', data),
  deleteProntuario: (data) => ipcRenderer.invoke('delete-prontuario', data),
  uploadAnexo: (data) => ipcRenderer.invoke('upload-anexo', data),
  listAnexos: (data) => ipcRenderer.invoke('list-anexos', data),
  getAnexo: (data) => ipcRenderer.invoke('get-anexo', data),
  deleteAnexo: (data) => ipcRenderer.invoke('delete-anexo', data),
  windowMinimize: () => ipcRenderer.invoke('window-minimize'),
  windowMaximize: () => ipcRenderer.invoke('window-maximize'),
  windowClose: () => ipcRenderer.invoke('window-close'),
});
