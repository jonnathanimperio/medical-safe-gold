const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const crypto = require('crypto');
const os = require('os');
const fs = require('fs');
const fernet = require('fernet');

// --- Backend API Configuration ---
// Default API URL - override via config.json in the app root directory
let API_URL = 'http://localhost:8000';

let mainWindow;
let jwtToken = null;
let userFernetKey = null;
let userFernetSecret = null;
let apiConnected = false;

// Load backend URL from local config.json
function loadConfig() {
  const configPaths = [
    path.join(__dirname, 'config.json'),
    path.join(app.getPath('userData'), 'config.json'),
  ];
  for (const configPath of configPaths) {
    try {
      if (fs.existsSync(configPath)) {
        const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
        if (config.api_url) API_URL = config.api_url;
        console.log('[CONFIG] Loaded config from', configPath, '- API_URL:', API_URL);
        return;
      }
    } catch (e) {
      console.error('[CONFIG] Error reading', configPath, ':', e.message);
    }
  }
  console.log('[CONFIG] No config.json found, using default API_URL:', API_URL);
}

// --- Encryption using per-user Fernet key ---
function encryptData(data) {
  if (!userFernetSecret) throw new Error('No encryption key');
  const token = new fernet.Token({ secret: userFernetSecret });
  return token.encode(JSON.stringify(data));
}

function decryptData(tokenStr) {
  try {
    if (!userFernetSecret) return null;
    const token = new fernet.Token({ secret: userFernetSecret, token: tokenStr, ttl: 0 });
    return JSON.parse(token.decode());
  } catch (e) {
    console.error('Decryption error:', e);
    return null;
  }
}

// --- HTTP Helper ---
async function apiCall(endpoint, options = {}) {
  const url = `${API_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  if (jwtToken) {
    headers['Authorization'] = `Bearer ${jwtToken}`;
  }
  const maxRetries = 3;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 30000);
      const response = await fetch(url, { ...options, headers, signal: controller.signal });
      clearTimeout(timeout);
      return await response.json();
    } catch (e) {
      console.error(`API call failed (attempt ${attempt}/${maxRetries}): ${endpoint}`, e.message);
      if (attempt === maxRetries) throw e;
      await new Promise(r => setTimeout(r, 2000 * attempt));
    }
  }
}

// Check API connectivity with retries for cold starts
async function checkApiHealth() {
  for (let i = 0; i < 5; i++) {
    try {
      const data = await apiCall('/health');
      apiConnected = data.status === 'ok';
      if (apiConnected) return;
    } catch (e) {
      console.log(`[HEALTH] Attempt ${i + 1}/5 failed, retrying...`);
    }
    await new Promise(r => setTimeout(r, 3000));
  }
  apiConnected = false;
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1100,
    height: 800,
    minWidth: 900,
    minHeight: 700,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    frame: false,
    titleBarStyle: 'hidden',
    backgroundColor: '#0a0a0f',
    icon: path.join(__dirname, 'assets', 'icon.png'),
    show: false,
  });

  mainWindow.loadFile(path.join(__dirname, 'renderer', 'index.html'));

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });
}

app.whenReady().then(async () => {
  loadConfig();
  await checkApiHealth();
  createWindow();
});

app.on('window-all-closed', () => {
  app.quit();
});

// --- Machine ID ---
function getMachineId() {
  const interfaces = os.networkInterfaces();
  let mac = '';
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (!iface.internal && iface.mac && iface.mac !== '00:00:00:00:00:00') {
        mac = iface.mac;
        break;
      }
    }
    if (mac) break;
  }
  const raw = `${os.hostname()}-${os.platform()}-${os.arch()}-${mac || 'no-mac'}`;
  return crypto.createHash('sha256').update(raw).digest('hex').substring(0, 16).toUpperCase();
}

// --- IPC Handlers ---

ipcMain.handle('get-db-status', async () => {
  try {
    const data = await apiCall('/health');
    apiConnected = data.status === 'ok' && data.database === 'connected';
    return apiConnected;
  } catch (e) {
    apiConnected = false;
    return false;
  }
});

ipcMain.handle('get-machine-id', () => getMachineId());

// --- User Authentication via API ---

ipcMain.handle('register-user', async (event, { email, password, licenseKey }) => {
  try {
    const machineId = getMachineId();
    const result = await apiCall('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, machine_id: machineId, license_key: licenseKey }),
    });

    if (result.success) {
      jwtToken = result.token;
      userFernetKey = result.fernet_key;
      userFernetSecret = new fernet.Secret(userFernetKey);
      return {
        success: true,
        clinicaId: result.clinica_id,
        subscriptionStatus: result.subscription_status,
        subscriptionExpires: result.subscription_expires,
      };
    } else {
      return { success: false, error: result.error };
    }
  } catch (e) {
    return { success: false, error: 'API_ERROR' };
  }
});

ipcMain.handle('login-user', async (event, { email, password }) => {
  try {
    const machineId = getMachineId();
    console.log('[LOGIN] Attempting login for:', email, 'machineId:', machineId);
    const result = await apiCall('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password, machine_id: machineId }),
    });
    console.log('[LOGIN] API response success:', result.success, 'error:', result.error);

    if (result.success) {
      jwtToken = result.token;
      userFernetKey = result.fernet_key;
      console.log('[LOGIN] Got fernet key, length:', userFernetKey ? userFernetKey.length : 0);
      try {
        userFernetSecret = new fernet.Secret(userFernetKey);
        console.log('[LOGIN] Fernet secret created OK');
      } catch (fe) {
        console.error('[LOGIN] Fernet secret creation failed:', fe.message);
        userFernetSecret = null;
      }
      return {
        success: true,
        clinicaId: result.clinica_id,
        subscriptionStatus: result.subscription_status,
        subscriptionPlan: result.subscription_plan,
        subscriptionExpires: result.subscription_expires,
      };
    } else {
      return { success: false, error: result.error };
    }
  } catch (e) {
    console.error('[LOGIN] Error:', e.message);
    return { success: false, error: 'API_ERROR' };
  }
});

// --- Appointments via API ---

ipcMain.handle('save-appointment', async (event, { nome, servico, dia, hora, cpf, whatsapp, clinicaId }) => {
  console.log('[SAVE] Starting save. jwtToken:', !!jwtToken, 'fernetSecret:', !!userFernetSecret, 'clinicaId:', clinicaId);
  if (!jwtToken || !userFernetSecret) return { success: false, error: 'NOT_AUTHENTICATED' };
  if (!clinicaId) return { success: false, error: 'NO_CLINICA_ID' };
  try {
    const dados = { nome, servico, dia, hora, cpf: cpf || '', whatsapp: whatsapp || '' };
    console.log('[SAVE] Encrypting data...');
    const encryptedPayload = encryptData(dados);
    console.log('[SAVE] Encrypted OK, calling API...');
    const result = await apiCall('/appointments', {
      method: 'POST',
      body: JSON.stringify({ payload: encryptedPayload, clinica_id: clinicaId }),
    });
    console.log('[SAVE] API response:', JSON.stringify(result));
    return { success: result.success, error: result.error || null };
  } catch (e) {
    console.error('[SAVE] Error:', e.message, e.stack);
    return { success: false, error: e.message };
  }
});

ipcMain.handle('delete-appointment', async (event, { id, clinicaId }) => {
  if (!jwtToken) return { success: false, error: 'NOT_AUTHENTICATED' };
  if (!id || !clinicaId) return { success: false, error: 'MISSING_PARAMS' };
  try {
    console.log('[DELETE] Deleting appointment:', id, 'clinica:', clinicaId);
    const result = await apiCall(`/appointments/${encodeURIComponent(id)}?clinica_id=${encodeURIComponent(clinicaId)}`, {
      method: 'DELETE',
    });
    console.log('[DELETE] Result:', JSON.stringify(result));
    return { success: result.success || false, error: result.error || null };
  } catch (e) {
    console.error('[DELETE] Error:', e.message);
    return { success: false, error: e.message };
  }
});

ipcMain.handle('get-appointments', async (event, { clinicaId }) => {
  if (!jwtToken) return { success: false, error: 'Not authenticated', data: [] };
  try {
    const result = await apiCall(`/appointments/${encodeURIComponent(clinicaId)}`);
    if (result.success) {
      const decrypted = [];
      for (const doc of result.data) {
        const dados = decryptData(doc.payload);
        if (dados) {
          decrypted.push({ id: doc.id, ...dados });
        }
      }
      return { success: true, data: decrypted };
    }
    return { success: false, data: [] };
  } catch (e) {
    return { success: false, error: e.message, data: [] };
  }
});

// --- Forgot / Reset Password ---

ipcMain.handle('forgot-password', async (event, { email }) => {
  try {
    const result = await apiCall('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
    return result;
  } catch (e) {
    return { success: false, error: 'API_ERROR' };
  }
});

ipcMain.handle('reset-password', async (event, { token, new_password }) => {
  try {
    const result = await apiCall('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, new_password }),
    });
    return result;
  } catch (e) {
    return { success: false, error: 'API_ERROR' };
  }
});

// --- Prontuario via API ---

ipcMain.handle('save-prontuario', async (event, data) => {
  if (!jwtToken) return { success: false, error: 'NOT_AUTHENTICATED' };
  try {
    const result = await apiCall('/prontuarios', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return result;
  } catch (e) {
    return { success: false, error: e.message };
  }
});

ipcMain.handle('get-prontuarios', async (event, { patientId }) => {
  if (!jwtToken) return { success: false, error: 'NOT_AUTHENTICATED', data: [] };
  try {
    const result = await apiCall(`/prontuarios/${encodeURIComponent(patientId)}`);
    return result;
  } catch (e) {
    return { success: false, error: e.message, data: [] };
  }
});

ipcMain.handle('update-prontuario', async (event, { id, data }) => {
  if (!jwtToken) return { success: false, error: 'NOT_AUTHENTICATED' };
  try {
    const result = await apiCall(`/prontuarios/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return result;
  } catch (e) {
    return { success: false, error: e.message };
  }
});

ipcMain.handle('delete-prontuario', async (event, { id }) => {
  if (!jwtToken) return { success: false, error: 'NOT_AUTHENTICATED' };
  try {
    const result = await apiCall(`/prontuarios/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    return result;
  } catch (e) {
    return { success: false, error: e.message };
  }
});

ipcMain.handle('upload-anexo', async (event, { prontuarioId, fileData, fileName, contentType, descricao }) => {
  if (!jwtToken) return { success: false, error: 'NOT_AUTHENTICATED' };
  try {
    // Build multipart form data manually
    const boundary = '----FormBoundary' + Date.now().toString(36);
    const fileBuffer = Buffer.from(fileData, 'base64');
    
    let body = '';
    body += `--${boundary}\r\n`;
    body += `Content-Disposition: form-data; name="descricao"\r\n\r\n`;
    body += `${descricao || ''}\r\n`;
    body += `--${boundary}\r\n`;
    body += `Content-Disposition: form-data; name="file"; filename="${fileName}"\r\n`;
    body += `Content-Type: ${contentType || 'application/octet-stream'}\r\n\r\n`;
    
    const headerBuffer = Buffer.from(body, 'utf-8');
    const footerBuffer = Buffer.from(`\r\n--${boundary}--\r\n`, 'utf-8');
    const fullBody = Buffer.concat([headerBuffer, fileBuffer, footerBuffer]);

    const url = `${API_URL}/prontuarios/${encodeURIComponent(prontuarioId)}/upload`;
    const headers = {
      'Content-Type': `multipart/form-data; boundary=${boundary}`,
      'Authorization': `Bearer ${jwtToken}`,
    };

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 60000);
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: fullBody,
      signal: controller.signal,
    });
    clearTimeout(timeout);
    return await response.json();
  } catch (e) {
    return { success: false, error: e.message };
  }
});

ipcMain.handle('list-anexos', async (event, { prontuarioId }) => {
  if (!jwtToken) return { success: false, error: 'NOT_AUTHENTICATED', data: [] };
  try {
    const result = await apiCall(`/prontuarios/anexos/${encodeURIComponent(prontuarioId)}`);
    return result;
  } catch (e) {
    return { success: false, error: e.message, data: [] };
  }
});

ipcMain.handle('get-anexo', async (event, { anexoId }) => {
  if (!jwtToken) return { success: false, error: 'NOT_AUTHENTICATED' };
  try {
    const url = `${API_URL}/prontuarios/anexo/${encodeURIComponent(anexoId)}`;
    const headers = { 'Authorization': `Bearer ${jwtToken}` };
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);
    const response = await fetch(url, { headers, signal: controller.signal });
    clearTimeout(timeout);
    
    const contentType = response.headers.get('content-type') || 'application/octet-stream';
    const disposition = response.headers.get('content-disposition') || '';
    const fileNameMatch = disposition.match(/filename="?([^"]+)"?/);
    const fileName = fileNameMatch ? fileNameMatch[1] : 'arquivo';
    
    const buffer = await response.arrayBuffer();
    return {
      success: true,
      data: Buffer.from(buffer).toString('base64'),
      contentType,
      fileName,
    };
  } catch (e) {
    return { success: false, error: e.message };
  }
});

ipcMain.handle('delete-anexo', async (event, { anexoId }) => {
  if (!jwtToken) return { success: false, error: 'NOT_AUTHENTICATED' };
  try {
    const result = await apiCall(`/prontuarios/anexo/${encodeURIComponent(anexoId)}`, {
      method: 'DELETE',
    });
    return result;
  } catch (e) {
    return { success: false, error: e.message };
  }
});

ipcMain.handle('window-minimize', () => mainWindow.minimize());
ipcMain.handle('window-maximize', () => {
  if (mainWindow.isMaximized()) mainWindow.unmaximize();
  else mainWindow.maximize();
});
ipcMain.handle('window-close', () => mainWindow.close());
