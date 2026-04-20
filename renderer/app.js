// ========================================
// Medical Safe Gold - App Logic
// ========================================

let currentLang = 'pt';
let clinicaId = null;
let currentScreen = 0;
let allAppointments = [];
let userRole = 'doctor'; // 'doctor' or 'receptionist'
let updateListenerRegistered = false;
let allConfirmacoes = [];
let alertsRefreshInterval = null;
let doctorName = '';

// --- UTC Date Parser (backend returns UTC without Z suffix) ---
function parseUTCDate(dateStr) {
  if (!dateStr) return null;
  // Ensure the ISO string is treated as UTC by appending Z if no timezone info
  if (!dateStr.endsWith('Z') && !dateStr.includes('+') && !dateStr.includes('-', 10)) {
    dateStr += 'Z';
  }
  return new Date(dateStr);
}

// --- HTML Escaping (XSS prevention) ---
function escapeHtml(str) {
  if (!str) return '';
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

// --- Translation ---
function t(key) {
  if (!key) return '';
  const lang = currentLang;
  if (lang === 'pt') return key.toUpperCase();
  const dict = translations[lang];
  if (dict && dict[key]) return dict[key].toUpperCase();
  return key.toUpperCase();
}

function updateAllTranslations() {
  document.querySelectorAll('[data-t]').forEach(el => {
    const key = el.getAttribute('data-t');
    el.textContent = t(key);
  });
  document.querySelectorAll('[data-t-placeholder]').forEach(el => {
    const key = el.getAttribute('data-t-placeholder');
    el.placeholder = t(key);
  });
}

// --- Snackbar ---
function showSnack(text, isError = false) {
  const snackbar = document.getElementById('snackbar');
  const snackText = document.getElementById('snackbar-text');
  const snackIcon = document.getElementById('snackbar-icon');

  // Verificar se os elementos existem antes de usar
  if (!snackbar || !snackText || !snackIcon) {
    console.error('Snackbar elements not found');
    return;
  }

  snackText.textContent = text;
  snackIcon.textContent = isError ? 'error_outline' : 'check_circle';
  snackbar.className = isError ? 'snackbar show error' : 'snackbar show';

  setTimeout(() => {
    snackbar.className = 'snackbar';
  }, 3000);
}

// --- Clock ---
function startClock() {
  function update() {
    const now = new Date();
    const time = now.toLocaleTimeString('pt-BR', { hour12: false });
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const el = document.getElementById('clock-time');
    if (el) el.textContent = `${day}/${month} - ${time}`;
  }
  update();
  setInterval(update, 1000);
}

// --- DB Status ---
async function updateDbStatus() {
  try {
    const status = await window.api.getDbStatus();
    const dot = document.getElementById('status-dot');
    const dotTop = document.getElementById('status-dot-top');
    const text = document.getElementById('status-text');

    if (status) {
      dot && dot.classList.remove('disconnected');
      dotTop && dotTop.classList.remove('disconnected');
      if (text) text.textContent = t('Conectado');
    } else {
      dot && dot.classList.add('disconnected');
      dotTop && dotTop.classList.add('disconnected');
      if (text) text.textContent = t('Desconectado');
    }
  } catch (e) {
    console.error('DB status error:', e);
  }
}

// --- Fetch all appointments ---
async function fetchAppointments() {
  if (!clinicaId) return [];
  try {
    const result = await window.api.getAppointments({ clinicaId });
    if (result.success) {
      allAppointments = result.data;
      return result.data;
    }
  } catch (e) {
    console.error('Fetch error:', e);
  }
  return [];
}

// --- Navigation ---
function setupNavigation() {
  document.querySelectorAll('.nav-item').forEach(btn => {
    btn.addEventListener('click', () => {
      const index = parseInt(btn.getAttribute('data-index'));
      setActiveNav(index);
      showScreen(index);
    });
  });
}

function setActiveNav(index) {
  document.querySelectorAll('.nav-item').forEach(btn => {
    const i = parseInt(btn.getAttribute('data-index'));
    if (i === index) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
  currentScreen = index;
}

// --- Show Screen ---
const bgClasses = ['bg-new', 'bg-vault', 'bg-summary', 'bg-search', 'bg-alerts', 'bg-logout'];

async function showScreen(index) {
  const content = document.getElementById('content-area');
  content.innerHTML = '';
  content.scrollTop = 0;

  // Apply background class
  bgClasses.forEach(cls => content.classList.remove(cls));
  if (bgClasses[index]) content.classList.add(bgClasses[index]);

  switch (index) {
    case 0: showNewRecord(content); break;
    case 1: await showVaultMonths(content); break;
    case 2: await showSummary(content); break;
    case 3: showSearch(content); break;
    case 4: await showAlerts(content); break;
    case 5: showLogout(content); break;
    case 6: showProntuarioMain(content); break;
  }
}

// ========================================
// Screen 0: New Record
// ========================================
function showNewRecord(container) {
  container.innerHTML = `
    <div class="fade-in">
      <div class="screen-header">
        <h1 class="screen-title">${t('NOVO REGISTRO')}</h1>
        <p class="screen-subtitle">${t('Preencha os dados para criptografia no Atlas')}</p>
      </div>
      <div class="form-card">
        <div class="form-group">
          <label class="form-label">${t('Nome do Paciente')}</label>
          <div class="form-input-wrapper">
            <input type="text" class="form-input" id="input-nome" placeholder="${t('Nome do Paciente')}">
            <div class="icon-3d icon-3d-sm icon-3d-blue form-input-icon"><span class="material-icons-round">person</span></div>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">${t('Procedimento')}</label>
          <div class="form-input-wrapper">
            <input type="text" class="form-input" id="input-servico" placeholder="${t('Procedimento')}">
            <div class="icon-3d icon-3d-sm icon-3d-green form-input-icon"><span class="material-icons-round">medical_services</span></div>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">${t('Data')}</label>
            <div class="form-input-wrapper">
              <input type="text" class="form-input" id="input-dia" placeholder="DD/MM/AAAA">
              <div class="icon-3d icon-3d-sm icon-3d-purple form-input-icon"><span class="material-icons-round">calendar_today</span></div>
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">${t('Hora')}</label>
            <div class="form-input-wrapper">
              <input type="text" class="form-input" id="input-hora" placeholder="HH:MM">
              <div class="icon-3d icon-3d-sm icon-3d-orange form-input-icon"><span class="material-icons-round">schedule</span></div>
            </div>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">${t('CPF')}</label>
            <div class="form-input-wrapper">
              <input type="text" class="form-input" id="input-cpf" placeholder="000.000.000-00">
              <div class="icon-3d icon-3d-sm icon-3d-cyan form-input-icon"><span class="material-icons-round">badge</span></div>
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">${t('WhatsApp')}</label>
            <div class="form-input-wrapper">
              <input type="text" class="form-input" id="input-whatsapp" placeholder="(00) 00000-0000">
              <div class="icon-3d icon-3d-sm icon-3d-green form-input-icon"><span class="material-icons-round">phone_iphone</span></div>
            </div>
          </div>
        </div>
        <button class="btn-save" id="btn-save">
          <div class="icon-3d icon-3d-sm icon-3d-gold" style="pointer-events:none;"><span class="material-icons-round">lock</span></div>
          <span>${t('AUTENTICAR E SALVAR')}</span>
        </button>
        <div class="encryption-badge">
          <div class="icon-3d icon-3d-green" style="width:24px;height:24px;border-radius:6px;pointer-events:none;"><span class="material-icons-round" style="font-size:12px;">verified_user</span></div>
          <span>${t('CRIPTOGRAFIA MILITAR AES-256 ATIVA')}</span>
        </div>
      </div>
    </div>
  `;

  document.getElementById('btn-save').addEventListener('click', saveAppointment);
}

async function saveAppointment() {
  const nome = document.getElementById('input-nome').value.trim();
  const servico = document.getElementById('input-servico').value.trim();
  const dia = document.getElementById('input-dia').value.trim();
  const hora = document.getElementById('input-hora').value.trim();
  const cpf = document.getElementById('input-cpf').value.trim();
  const whatsapp = document.getElementById('input-whatsapp').value.trim();

  if (!nome || !servico) {
    showSnack(t('Preencha os campos obrigatórios.'), true);
    return;
  }

  try {
    const result = await window.api.saveAppointment({
      nome, servico, dia, hora, cpf, whatsapp, clinicaId
    });

    if (result.success) {
      showSnack(t('Agendamento Seguro e Salvo!'));
      // Create confirmation record for WhatsApp link
      if (whatsapp && dia && hora) {
        try {
          await window.api.createConfirmacao({
            appointment_id: result.id || '',
            patient_name: nome,
            patient_whatsapp: whatsapp,
            appointment_date: dia,
            appointment_time: hora,
            doctor_name: doctorName || 'Médico',
            service: servico,
            clinica_id: clinicaId,
          });
        } catch (ce) {
          console.error('Confirmacao creation error:', ce);
        }
      }
      document.getElementById('input-nome').value = '';
      document.getElementById('input-servico').value = '';
      document.getElementById('input-dia').value = '';
      document.getElementById('input-hora').value = '';
      document.getElementById('input-cpf').value = '';
      document.getElementById('input-whatsapp').value = '';
    } else {
      const errMsg = result.error || 'UNKNOWN';
      showSnack(t('Erro ao salvar no Atlas') + ' (' + errMsg + ')', true);
    }
  } catch (e) {
    showSnack(t('Erro ao salvar no Atlas') + ' (CATCH: ' + e.message + ')', true);
  }
}

// ========================================
// Screen 1: Vault - Months
// ========================================
async function showVaultMonths(container) {
  const meses = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril',
    'Maio', 'Junho', 'Julho', 'Agosto',
    'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  container.innerHTML = `
    <div class="fade-in">
      <div class="screen-header">
        <h1 class="screen-title">${t('Selecione o Mês')}</h1>
      </div>
      <div class="months-grid" id="months-grid"></div>
    </div>
  `;

  const grid = document.getElementById('months-grid');
  meses.forEach((nome, i) => {
    const btn = document.createElement('button');
    btn.className = 'month-btn stagger-item';
    btn.style.animationDelay = `${i * 0.04}s`;
    btn.textContent = t(nome);
    btn.addEventListener('click', () => showVaultDays(container, i + 1));
    grid.appendChild(btn);
  });
}

async function showVaultDays(container, mes) {
  const ano = new Date().getFullYear();
  const nextMonth = new Date(ano, mes, 1);
  const lastDay = new Date(nextMonth - 86400000).getDate();

  // Fetch appointments
  await fetchAppointments();

  // Find days with appointments
  const daysWithAppointments = new Set();
  allAppointments.forEach(appt => {
    try {
      const parts = appt.dia.split('/');
      const m = parseInt(parts[1]);
      const y = parseInt(parts[2]);
      if (m === mes && y === ano) {
        daysWithAppointments.add(appt.dia);
      }
    } catch (e) {}
  });

  container.innerHTML = `
    <div class="fade-in">
      <button class="back-btn" id="back-to-months">
        <span class="material-icons-round">arrow_back</span>
        <span>${t('Mês')} ${String(mes).padStart(2, '0')}/${ano}</span>
      </button>
      <div class="days-grid" id="days-grid"></div>
    </div>
  `;

  document.getElementById('back-to-months').addEventListener('click', () => showVaultMonths(container));

  const grid = document.getElementById('days-grid');
  for (let d = 1; d <= lastDay; d++) {
    const dataStr = `${String(d).padStart(2, '0')}/${String(mes).padStart(2, '0')}/${ano}`;
    const hasAppt = daysWithAppointments.has(dataStr);

    const cell = document.createElement('div');
    cell.className = `day-cell stagger-item ${hasAppt ? 'has-appointments' : ''}`;
    cell.style.animationDelay = `${d * 0.02}s`;
    cell.textContent = String(d).padStart(2, '0');
    cell.addEventListener('click', () => showDayAppointments(container, dataStr, mes));
    grid.appendChild(cell);
  }
}

async function showDayAppointments(container, dataStr, mesOrigem) {
  await fetchAppointments();

  const registros = allAppointments
    .filter(a => a.dia === dataStr)
    .sort((a, b) => {
      try {
        const [ah, am] = a.hora.split(':').map(Number);
        const [bh, bm] = b.hora.split(':').map(Number);
        return (ah * 60 + am) - (bh * 60 + bm);
      } catch (e) { return 0; }
    });

  container.innerHTML = `
    <div class="fade-in">
      <button class="back-btn" id="back-to-days">
        <span class="material-icons-round">arrow_back</span>
        <span>${t('Data:')} ${dataStr}</span>
      </button>
      <div id="appointments-list"></div>
    </div>
  `;

  document.getElementById('back-to-days').addEventListener('click', () => showVaultDays(container, mesOrigem));

  const list = document.getElementById('appointments-list');

  if (registros.length === 0) {
    list.innerHTML = `
      <div class="empty-state">
        <span class="material-icons-round">event_busy</span>
        <p>${t('Nenhum compromisso para os próximos 7 dias.')}</p>
      </div>
    `;
    return;
  }

  registros.forEach((dados, i) => {
    const card = document.createElement('div');
    card.className = 'appointment-card stagger-item';
    card.style.animationDelay = `${i * 0.06}s`;
    card.innerHTML = `
      <div class="appointment-header">
        <div class="appointment-info">
          <h3>${dados.nome.toUpperCase()}</h3>
          <p>${dados.servico}</p>
        </div>
        <button class="btn-delete" data-id="${dados.id}" title="Excluir">
          <span class="material-icons-round">delete_outline</span>
        </button>
      </div>
      <div class="appointment-divider"></div>
      <div class="appointment-meta">
        <div class="meta-tag">
          <span class="material-icons-round">calendar_today</span>
          <span>${dados.dia}</span>
        </div>
        <div class="meta-tag">
          <span class="material-icons-round">schedule</span>
          <span>${dados.hora}</span>
        </div>
        ${dados.cpf ? `<div class="meta-tag"><span class="material-icons-round">badge</span><span>${dados.cpf}</span></div>` : ''}
        ${dados.whatsapp ? `<div class="meta-tag"><span class="material-icons-round">phone_iphone</span><span>${dados.whatsapp}</span></div>` : ''}
        <div class="protected-tag">
          <span class="material-icons-round">shield</span>
          <span>${t('PROTEGIDO')}</span>
        </div>
      </div>
    `;

    card.querySelector('.btn-delete').addEventListener('click', async () => {
      await deleteAppointment(dados.id);
      showDayAppointments(container, dataStr, mesOrigem);
    });

    list.appendChild(card);
  });
}

async function deleteAppointment(id) {
  try {
    const result = await window.api.deleteAppointment({ id, clinicaId });
    if (result.success) {
      showSnack(t('Registro removido com segurança.'));
    } else {
      showSnack(t('Erro ao excluir registro') + ' (' + (result.error || 'UNKNOWN') + ')', true);
    }
  } catch (e) {
    showSnack(t('Erro ao excluir registro'), true);
  }
}

// ========================================
// Screen 2: Summary
// ========================================
async function showSummary(container) {
  const meses = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril',
    'Maio', 'Junho', 'Julho', 'Agosto',
    'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  await fetchAppointments();

  const contagem = {};
  for (let i = 1; i <= 12; i++) contagem[i] = 0;

  allAppointments.forEach(appt => {
    try {
      const parts = appt.dia.split('/');
      const mesNum = parseInt(parts[1]);
      if (contagem[mesNum] !== undefined) contagem[mesNum]++;
    } catch (e) {}
  });

  container.innerHTML = `
    <div class="fade-in">
      <div class="screen-header">
        <h1 class="screen-title">${t('Resumo Mensal')}</h1>
      </div>
      <div class="summary-list" id="summary-list"></div>
    </div>
  `;

  const list = document.getElementById('summary-list');
  meses.forEach((nome, i) => {
    const item = document.createElement('div');
    item.className = 'summary-item stagger-item';
    item.style.animationDelay = `${i * 0.04}s`;
    item.innerHTML = `
      <span class="summary-month">${t(nome)}</span>
      <div class="summary-count">
        <span class="summary-number">${contagem[i + 1]}</span>
        <span class="summary-label">${t('agendamento(s)')}</span>
      </div>
    `;
    list.appendChild(item);
  });
}

// ========================================
// Screen 3: Search
// ========================================
function showSearch(container) {
  container.innerHTML = `
    <div class="fade-in">
      <div class="screen-header">
        <h1 class="screen-title" style="color: var(--gold);">${t('PESQUISAR NO COFRE')}</h1>
      </div>
      <div class="search-bar">
        <div class="search-input-wrapper">
          <input type="text" class="search-input" id="search-input" placeholder="${t('Nome do paciente')}">
          <span class="material-icons-round search-icon">search</span>
        </div>
        <button class="btn-search" id="btn-search">${t('BUSCAR')}</button>
      </div>
      <div class="search-results" id="search-results"></div>
    </div>
  `;

  const executeSearch = () => performSearch(container);
  document.getElementById('btn-search').addEventListener('click', executeSearch);
  document.getElementById('search-input').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') executeSearch();
  });
}

async function performSearch(container) {
  const termo = document.getElementById('search-input').value.trim().toLowerCase();
  if (!termo) return;

  const results = document.getElementById('search-results');
  results.innerHTML = '<div class="spinner"></div>';

  await fetchAppointments();

  const matched = allAppointments.filter(a => a.nome.toLowerCase().includes(termo));

  results.innerHTML = '';

  if (matched.length === 0) {
    results.innerHTML = `<div class="search-not-found">${t('Paciente não encontrado.')}</div>`;
    return;
  }

  matched.forEach((dados, i) => {
    const card = document.createElement('div');
    card.className = 'search-result-card stagger-item';
    card.style.animationDelay = `${i * 0.05}s`;
    card.innerHTML = `
      <div class="search-result-icon">
        <div class="icon-3d icon-3d-gold"><span class="material-icons-round">person_search</span></div>
      </div>
      <div class="search-result-info">
        <div class="search-result-name">${dados.nome.toUpperCase()}</div>
        <div class="search-result-detail">${dados.servico} | ${dados.dia} - ${dados.hora}${dados.cpf ? ' | CPF: ' + dados.cpf : ''}${dados.whatsapp ? ' | WhatsApp: ' + dados.whatsapp : ''}</div>
      </div>
      <button class="btn-delete" data-id="${dados.id}" title="Excluir">
        <span class="material-icons-round">delete_outline</span>
      </button>
    `;

    card.querySelector('.btn-delete').addEventListener('click', async () => {
      await deleteAppointment(dados.id);
      // Re-run search
      performSearch(container);
    });

    results.appendChild(card);
  });
}

// ========================================
// Screen 4: Alerts
// ========================================
async function fetchConfirmacoes() {
  if (!clinicaId) return [];
  try {
    const result = await window.api.listConfirmacoes({ clinicaId });
    if (result.success) {
      allConfirmacoes = result.data || [];
      return allConfirmacoes;
    }
  } catch (e) {
    console.error('Fetch confirmacoes error:', e);
  }
  return [];
}

function getConfirmationForAppointment(appointment) {
  return allConfirmacoes.find(c =>
    c.patient_name === appointment.nome &&
    c.appointment_date === appointment.dia &&
    c.appointment_time === appointment.hora
  );
}

function getStatusColor(status) {
  switch (status) {
    case 'Confirmado': return 'var(--success)';
    case 'Cancelado': return 'var(--danger)';
    case 'Enviado': return '#f0a030';
    default: return 'var(--border-subtle)';
  }
}

function getStatusLabel(status) {
  switch (status) {
    case 'Confirmado': return t('CONFIRMADO');
    case 'Cancelado': return t('CANCELADO');
    case 'Enviado': return t('AGUARDANDO');
    default: return t('PENDENTE');
  }
}

function getStatusIcon(status) {
  switch (status) {
    case 'Confirmado': return 'check_circle';
    case 'Cancelado': return 'cancel';
    case 'Enviado': return 'hourglass_top';
    default: return 'radio_button_unchecked';
  }
}

function formatWhatsAppNumber(whatsapp) {
  const digits = (whatsapp || '').replace(/\D/g, '');
  if (digits.startsWith('55')) return digits;
  return '55' + digits;
}

async function enviarZap(appointment, confirmacao) {
  // Get backend URL from config (via IPC) instead of hardcoding
  let backendUrl = 'https://web-production-2043d.up.railway.app';
  try {
    const apiUrl = await window.api.getApiUrl();
    if (apiUrl) backendUrl = apiUrl;
  } catch (e) {
    console.error('Get API URL error:', e);
  }
  let uuid = confirmacao ? confirmacao.uuid : null;
  // If no confirmation record exists yet, create one
  if (!uuid && appointment.whatsapp) {
    try {
      const res = await window.api.createConfirmacao({
        appointment_id: appointment.id || '',
        patient_name: appointment.nome,
        patient_whatsapp: appointment.whatsapp,
        appointment_date: appointment.dia,
        appointment_time: appointment.hora,
        doctor_name: doctorName || 'Médico',
        service: appointment.servico,
        clinica_id: clinicaId,
      });
      if (res.success) {
        uuid = res.uuid;
      }
    } catch (e) {
      console.error('Create confirmacao error:', e);
    }
  }
  if (!uuid) {
    showSnack(t('Erro ao gerar link de confirmação.'), true);
    return;
  }
  // Mark as Enviado
  try {
    await window.api.markConfirmacaoEnviado({ uuid });
  } catch (e) {
    console.error('Mark enviado error:', e);
  }
  // Build wa.me link
  const phone = formatWhatsAppNumber(appointment.whatsapp);
  const confirmUrl = `${backendUrl}/confirmar/${uuid}`;
  const msg = `Olá ${appointment.nome}, confirmamos sua consulta para ${appointment.dia} às ${appointment.hora}?\n\nClique para confirmar: ${confirmUrl}`;
  const waUrl = `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
  // Open in system default browser (not Electron window)
  try {
    await window.api.openExternalUrl({ url: waUrl });
  } catch (e) {
    // Fallback to window.open if IPC fails
    window.open(waUrl, '_blank');
  }
  // Refresh the alerts view
  await fetchConfirmacoes();
  const content = document.getElementById('content-area');
  if (content && currentScreen === 4) {
    await showAlerts(content);
  }
}

async function showAlerts(container) {
  await fetchAppointments();
  await fetchConfirmacoes();

  // Clear any previous refresh interval
  if (alertsRefreshInterval) {
    clearInterval(alertsRefreshInterval);
    alertsRefreshInterval = null;
  }

  // Get next 7 days
  const today = new Date();
  const targetDates = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    targetDates.push(`${dd}/${mm}/${yyyy}`);
  }

  const weekAppointments = allAppointments
    .filter(a => targetDates.includes(a.dia))
    .sort((a, b) => {
      try {
        const da = a.dia.split('/').reverse().join('') + a.hora.replace(':', '');
        const db = b.dia.split('/').reverse().join('') + b.hora.replace(':', '');
        return da.localeCompare(db);
      } catch (e) { return 0; }
    });

  container.innerHTML = `
    <div class="fade-in">
      <div class="screen-header">
        <h1 class="screen-title" style="color: var(--gold);">${t('CENTRAL DE SEGURANÇA E ALERTAS')}</h1>
      </div>

      <div class="alerts-status-grid">
        <div class="alert-status-card">
          <div class="icon-3d icon-3d-lg icon-3d-green"><span class="material-icons-round">cloud_done</span></div>
          <div class="alert-status-title">${t('BACKUP NUVEM')}</div>
          <div class="alert-status-value" style="color: var(--success);">${t('SINCRO ATIVA')}</div>
        </div>
        <div class="alert-status-card">
          <div class="icon-3d icon-3d-lg icon-3d-gold"><span class="material-icons-round">shield</span></div>
          <div class="alert-status-title">${t('CRIPTOGRAFIA')}</div>
          <div class="alert-status-value" style="color: var(--gold);">${t('MILITAR ATIVA')}</div>
        </div>
      </div>

      <div class="alerts-week-card">
        <div class="alerts-week-header">
          <div class="icon-3d icon-3d-orange"><span class="material-icons-round">notification_important</span></div>
          <span class="alerts-week-title">${t('ALERTAS DA SEMANA')}</span>
        </div>
        <div class="alerts-week-count">
          ${weekAppointments.length > 0
            ? `${weekAppointments.length} ${t('agendamentos detectados para a semana')}`
            : t('Nenhum compromisso para os próximos 7 dias.')}
        </div>
      </div>

      <div id="week-appointments"></div>
    </div>
  `;

  const list = document.getElementById('week-appointments');
  weekAppointments.forEach((p, i) => {
    const conf = getConfirmationForAppointment(p);
    const status = conf ? conf.status : 'Pendente';
    const statusColor = getStatusColor(status);
    const statusLabel = getStatusLabel(status);
    const statusIcon = getStatusIcon(status);
    const hasWhatsapp = !!(p.whatsapp && p.whatsapp.trim());
    const showZapBtn = hasWhatsapp && status !== 'Confirmado' && status !== 'Cancelado';

    const card = document.createElement('div');
    card.className = 'alert-appointment stagger-item';
    card.style.animationDelay = `${i * 0.05}s`;
    card.style.borderLeft = `4px solid ${statusColor}`;
    card.innerHTML = `
      <div class="alert-appointment-info">
        <h4>${(p.nome || '').toUpperCase()}</h4>
        <p>${(p.servico || t('PROCEDIMENTO')).toUpperCase()}</p>
        <div class="alert-confirmation-status" style="color: ${statusColor}; margin-top: 6px; font-size: 12px; font-weight: 600; display: flex; align-items: center; gap: 4px;">
          <span class="material-icons-round" style="font-size: 16px;">${statusIcon}</span>
          <span>${statusLabel}</span>
        </div>
      </div>
      <div class="alert-appointment-actions">
        <div class="alert-appointment-time">
          <div class="meta-row">
            <span class="material-icons-round">calendar_today</span>
            <span>${p.dia}</span>
          </div>
          <div class="meta-row">
            <span class="material-icons-round">schedule</span>
            <span>${p.hora}</span>
          </div>
        </div>
        ${showZapBtn ? `<button class="btn-zap" data-idx="${i}" title="${t('Enviar confirmação via WhatsApp')}">
          <span class="material-icons-round" style="font-size: 18px;">send</span>
          <span>${t('Enviar Zap')}</span>
        </button>` : ''}
        ${!hasWhatsapp ? `<div class="no-whatsapp-hint" style="color: var(--text-muted); font-size: 11px; margin-top: 4px;">${t('Sem WhatsApp')}</div>` : ''}
      </div>
    `;
    list.appendChild(card);

    // Add click handler for Zap button
    if (showZapBtn) {
      const btn = card.querySelector('.btn-zap');
      if (btn) {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          enviarZap(p, conf);
        });
      }
    }
  });

  // Auto-refresh confirmations every 30 seconds
  alertsRefreshInterval = setInterval(async () => {
    if (currentScreen !== 4) {
      clearInterval(alertsRefreshInterval);
      alertsRefreshInterval = null;
      return;
    }
    await fetchConfirmacoes();
    // Update status badges without full re-render
    const cards = document.querySelectorAll('.alert-appointment');
    cards.forEach((card, i) => {
      if (i < weekAppointments.length) {
        const p = weekAppointments[i];
        const conf = getConfirmationForAppointment(p);
        const status = conf ? conf.status : 'Pendente';
        const statusColor = getStatusColor(status);
        const statusLabel = getStatusLabel(status);
        const statusIcon = getStatusIcon(status);
        card.style.borderLeft = `4px solid ${statusColor}`;
        const statusEl = card.querySelector('.alert-confirmation-status');
        if (statusEl) {
          statusEl.style.color = statusColor;
          statusEl.innerHTML = `<span class="material-icons-round" style="font-size: 16px;">${statusIcon}</span><span>${statusLabel}</span>`;
        }
      }
    });
  }, 30000);
}

// ========================================
// Screen 5: Logout
// ========================================
function showLogout(container) {
  container.innerHTML = `
    <div class="logout-container fade-in">
      <div class="logout-card">
        <div class="logout-icon">
          <div class="icon-3d icon-3d-xl icon-3d-red"><span class="material-icons-round">logout</span></div>
        </div>
        <h2 class="logout-title">${t('DESEJA REALMENTE SAIR?')}</h2>
        <p class="logout-subtitle">${t('AO SAIR, O CRM SERÁ DESCONECTADO DESTE DISPOSITIVO POR SEGURANÇA.')}</p>
        <div class="logout-actions">
          <button class="btn-danger" id="btn-confirm-logout">${t('SIM, ENCERRAR')}</button>
          <button class="btn-outline" id="btn-cancel-logout">${t('CANCELAR')}</button>
        </div>
      </div>
    </div>
  `;

  document.getElementById('btn-confirm-logout').addEventListener('click', confirmLogout);
  document.getElementById('btn-cancel-logout').addEventListener('click', () => {
    setActiveNav(0);
    showScreen(0);
  });
}

function confirmLogout() {
  localStorage.removeItem('clinica_id');
  localStorage.removeItem('user_email');
  localStorage.removeItem('crm_medico');
  localStorage.removeItem('user_role');
  clinicaId = null;
  userRole = 'doctor';

  const content = document.getElementById('content-area');
  content.innerHTML = `
    <div class="session-ended fade-in">
      <div class="icon-3d icon-3d-xl icon-3d-gold"><span class="material-icons-round">lock_reset</span></div>
      <h2>${t('SESSÃO ENCERRADA')}</h2>
      <div class="progress-bar"><div class="progress-bar-fill"></div></div>
    </div>
  `;

  setTimeout(() => {
    // Show activation screen again
    document.getElementById('main-screen').classList.add('hidden');
    document.getElementById('activation-screen').classList.remove('hidden');
  }, 1800);
}

// ========================================
// Language Change
// ========================================
function setupLanguage() {
  const select = document.getElementById('language-select');
  if (!select) return;

  // Detect system language
  const sysLang = navigator.language?.substring(0, 2) || 'pt';
  if (['pt', 'en', 'de', 'es'].includes(sysLang)) {
    select.value = sysLang;
    currentLang = sysLang;
  }

  select.addEventListener('change', (e) => {
    currentLang = e.target.value;
    updateAllTranslations();
    // Re-render current screen
    showScreen(currentScreen);
    // Update nav labels
    const navLabels = ['NOVO', 'COFRE', 'RESUMO', 'PESQUISAR', 'ALERTAS'];
    document.querySelectorAll('.nav-items .nav-label').forEach((el, i) => {
      if (navLabels[i]) el.textContent = t(navLabels[i]);
    });
    const logoutLabel = document.querySelector('.nav-logout .nav-label');
    if (logoutLabel) logoutLabel.textContent = t('SAIR');
  });
}

// ========================================
// Authentication (Login / Register)
// ========================================
async function setupActivation() {
  const tabLogin = document.getElementById('tab-login');
  const tabRegister = document.getElementById('tab-register');
  const formLogin = document.getElementById('form-login');
  const formRegister = document.getElementById('form-register');
  const errorDiv = document.getElementById('activation-error');
  const machineIdDiv = document.getElementById('activation-machine-id');

  // Show machine ID
  try {
    const mid = await window.api.getMachineId();
    if (machineIdDiv) {
      machineIdDiv.innerHTML = `<span class="material-icons-round" style="font-size:14px;vertical-align:middle;margin-right:4px;">computer</span>ID: ${mid}`;
    }
  } catch (e) {}

  const formForgot = document.getElementById('form-forgot-password');
  const formReset = document.getElementById('form-reset-password');

  function hideAllForms() {
    formLogin.classList.add('hidden');
    formRegister.classList.add('hidden');
    if (formForgot) formForgot.classList.add('hidden');
    if (formReset) formReset.classList.add('hidden');
    if (errorDiv) { errorDiv.classList.add('hidden'); errorDiv.textContent = ''; }
  }

  // --- Tab switching ---
  tabLogin.addEventListener('click', () => {
    tabLogin.classList.add('active');
    tabRegister.classList.remove('active');
    hideAllForms();
    formLogin.classList.remove('hidden');
  });
  tabRegister.addEventListener('click', () => {
    tabRegister.classList.add('active');
    tabLogin.classList.remove('active');
    hideAllForms();
    formRegister.classList.remove('hidden');
  });

  // --- Forgot Password link ---
  const linkForgot = document.getElementById('link-forgot-password');
  if (linkForgot) {
    linkForgot.addEventListener('click', (e) => {
      e.preventDefault();
      hideAllForms();
      formForgot.classList.remove('hidden');
    });
  }

  // --- Back to login links ---
  const linkBack1 = document.getElementById('link-back-login');
  const linkBack2 = document.getElementById('link-back-login2');
  [linkBack1, linkBack2].forEach(link => {
    if (link) {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        hideAllForms();
        formLogin.classList.remove('hidden');
      });
    }
  });

  // --- Toggle Password Visibility ---
  document.querySelectorAll('.toggle-password').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-target');
      const input = document.getElementById(targetId);
      if (!input) return;
      const icon = btn.querySelector('.material-icons-round');
      if (input.type === 'password') {
        input.type = 'text';
        icon.textContent = 'visibility';
        btn.classList.add('active');
      } else {
        input.type = 'password';
        icon.textContent = 'visibility_off';
        btn.classList.remove('active');
      }
    });
  });

  // --- Email validation helper ---
  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  // --- LOGIN ---
  const btnLogin = document.getElementById('btn-login');
  const loginEmail = document.getElementById('login-email');
  const loginPassword = document.getElementById('login-password');

  btnLogin.addEventListener('click', async () => {
    const email = loginEmail.value.trim();
    const password = loginPassword.value;

    if (!email) { showSnack(t('Digite seu e-mail!'), true); return; }
    if (!isValidEmail(email)) { showSnack(t('E-mail inválido!'), true); return; }
    if (!password) { showSnack(t('Digite sua senha!'), true); return; }

    btnLogin.disabled = true;
    btnLogin.style.opacity = '0.6';
    if (errorDiv) { errorDiv.classList.add('hidden'); errorDiv.textContent = ''; }

    try {
      const result = await window.api.loginUser({ email, password });
      if (result.success) {
        clinicaId = result.clinicaId || email;
        userRole = result.role || 'doctor';
        doctorName = email.split('@')[0].replace(/[._-]/g, ' ');
        localStorage.setItem('clinica_id', clinicaId);
        localStorage.setItem('user_email', email);
        localStorage.setItem('user_role', userRole);
        localStorage.setItem('doctor_name', doctorName);
        showSnack(t('Login realizado com sucesso!'));
        showMainScreen();
      } else {
        let msg = t('Erro de Conexão');
        if (result.error === 'USER_NOT_FOUND') msg = t('Usuário não encontrado!');
        else if (result.error === 'WRONG_PASSWORD') msg = t('Senha incorreta!');
        else if (result.error === 'SUBSCRIPTION_EXPIRED') msg = t('Assinatura expirada! Renove seu plano.');
        else if (result.error === 'DB_NOT_CONNECTED' || result.error === 'API_ERROR') msg = t('Erro de Conexão');
        if (errorDiv) { errorDiv.textContent = msg; errorDiv.classList.remove('hidden'); }
        showSnack(msg, true);
      }
    } catch (e) {
      if (errorDiv) { errorDiv.textContent = t('Erro de Conexão'); errorDiv.classList.remove('hidden'); }
      showSnack(t('Erro de Conexão'), true);
    }

    btnLogin.disabled = false;
    btnLogin.style.opacity = '1';
  });

  // Enter key on login fields
  loginEmail.addEventListener('keydown', (e) => { if (e.key === 'Enter') loginPassword.focus(); });
  loginPassword.addEventListener('keydown', (e) => { if (e.key === 'Enter') btnLogin.click(); });

  // --- REGISTER ---
  const btnRegister = document.getElementById('btn-register');
  const registerEmail = document.getElementById('register-email');
  const registerPassword = document.getElementById('register-password');
  const registerPasswordConfirm = document.getElementById('register-password-confirm');
  const registerLicenseKey = document.getElementById('register-license-key');

  btnRegister.addEventListener('click', async () => {
    const licenseKey = registerLicenseKey ? registerLicenseKey.value.trim().toUpperCase() : '';
    const email = registerEmail.value.trim();
    const password = registerPassword.value;
    const passwordConfirm = registerPasswordConfirm.value;

    if (!licenseKey) { showSnack(t('Digite sua chave de licenca!'), true); return; }
    if (!email) { showSnack(t('Digite seu e-mail!'), true); return; }
    if (!isValidEmail(email)) { showSnack(t('E-mail inválido!'), true); return; }
    if (!password) { showSnack(t('Digite sua senha!'), true); return; }
    if (password.length < 8) { showSnack(t('A senha deve ter pelo menos 8 caracteres!'), true); return; }
    if (password !== passwordConfirm) { showSnack(t('As senhas não coincidem!'), true); return; }

    btnRegister.disabled = true;
    btnRegister.style.opacity = '0.6';
    if (errorDiv) { errorDiv.classList.add('hidden'); errorDiv.textContent = ''; }

    try {
      const registerRole = document.getElementById('register-role');
      const role = registerRole ? registerRole.value : 'doctor';
      const result = await window.api.registerUser({ email, password, licenseKey, role });
      if (result.success) {
        clinicaId = result.clinicaId || email;
        userRole = result.role || role;
        doctorName = email.split('@')[0].replace(/[._-]/g, ' ');
        localStorage.setItem('clinica_id', clinicaId);
        localStorage.setItem('user_email', email);
        localStorage.setItem('user_role', userRole);
        localStorage.setItem('doctor_name', doctorName);
        showSnack(t('Conta criada com sucesso!'));
        showMainScreen();
      } else {
        let msg = t('Erro de Conexão');
        if (result.error === 'USER_EXISTS') msg = t('Este e-mail já está cadastrado!');
        else if (result.error === 'MISSING_FIELDS') msg = t('Preencha os campos obrigatórios.');
        else if (result.error === 'INVALID_LICENSE_KEY') msg = t('Chave de licenca invalida!');
        else if (result.error === 'LICENSE_ALREADY_USED') msg = t('Chave de licenca ja utilizada!');
        else if (result.error === 'LICENSE_REVOKED') msg = t('Chave de licenca revogada!');
        else if (result.error === 'MISSING_LICENSE_KEY') msg = t('Digite sua chave de licenca!');
        else if (result.error === 'DB_NOT_CONNECTED' || result.error === 'API_ERROR') msg = t('Erro de Conexão');
        if (errorDiv) { errorDiv.textContent = msg; errorDiv.classList.remove('hidden'); }
        showSnack(msg, true);
      }
    } catch (e) {
      if (errorDiv) { errorDiv.textContent = t('Erro de Conexão'); errorDiv.classList.remove('hidden'); }
      showSnack(t('Erro de Conexão'), true);
    }

    btnRegister.disabled = false;
    btnRegister.style.opacity = '1';
  });

  // Enter key on register fields
  if (registerLicenseKey) registerLicenseKey.addEventListener('keydown', (e) => { if (e.key === 'Enter') registerEmail.focus(); });
  registerEmail.addEventListener('keydown', (e) => { if (e.key === 'Enter') registerPassword.focus(); });
  registerPassword.addEventListener('keydown', (e) => { if (e.key === 'Enter') registerPasswordConfirm.focus(); });
  registerPasswordConfirm.addEventListener('keydown', (e) => { if (e.key === 'Enter') btnRegister.click(); });

  // --- FORGOT PASSWORD ---
  const btnSendReset = document.getElementById('btn-send-reset');
  const forgotEmail = document.getElementById('forgot-email');

  if (btnSendReset) {
    btnSendReset.addEventListener('click', async () => {
      const email = forgotEmail.value.trim();
      if (!email) { showSnack(t('Digite seu e-mail!'), true); return; }
      if (!isValidEmail(email)) { showSnack(t('E-mail inválido!'), true); return; }

      btnSendReset.disabled = true;
      btnSendReset.style.opacity = '0.6';

      try {
        const result = await window.api.forgotPassword({ email });
        if (result.success) {
          showSnack(t('Codigo enviado para seu e-mail!'));
          // Store email for reset step
          if (formReset) {
            formReset.dataset.email = email;
          }
          hideAllForms();
          formReset.classList.remove('hidden');
          // If debug code is returned (SMTP not configured), show it
          if (result._debug_code) {
            showSnack(`Codigo: ${result._debug_code}`, false);
          }
        } else {
          showSnack(t('Erro de Conexão'), true);
        }
      } catch (e) {
        showSnack(t('Erro de Conexão'), true);
      }

      btnSendReset.disabled = false;
      btnSendReset.style.opacity = '1';
    });
  }

  // --- RESET PASSWORD ---
  const btnResetPassword = document.getElementById('btn-reset-password');
  const resetCode = document.getElementById('reset-code');
  const resetNewPassword = document.getElementById('reset-new-password');
  const resetConfirmPassword = document.getElementById('reset-confirm-password');

  if (btnResetPassword) {
    btnResetPassword.addEventListener('click', async () => {
      const code = resetCode.value.trim();
      const newPassword = resetNewPassword.value;
      const confirmPassword = resetConfirmPassword.value;

      if (!code) { showSnack(t('Digite o codigo!'), true); return; }
      if (code.length !== 6) { showSnack(t('O codigo deve ter 6 digitos!'), true); return; }
      if (!newPassword) { showSnack(t('Digite sua senha!'), true); return; }
      if (newPassword.length < 8) { showSnack(t('A senha deve ter pelo menos 8 caracteres!'), true); return; }
      if (newPassword !== confirmPassword) { showSnack(t('As senhas não coincidem!'), true); return; }

      btnResetPassword.disabled = true;
      btnResetPassword.style.opacity = '0.6';

      try {
        const result = await window.api.resetPassword({ token: code, new_password: newPassword });
        if (result.success) {
          showSnack(t('Senha redefinida com sucesso!'));
          hideAllForms();
          formLogin.classList.remove('hidden');
        } else {
          let msg = t('Erro de Conexão');
          if (result.error === 'INVALID_OR_EXPIRED_CODE') msg = t('Codigo invalido ou expirado!');
          showSnack(msg, true);
        }
      } catch (e) {
        showSnack(t('Erro de Conexão'), true);
      }

      btnResetPassword.disabled = false;
      btnResetPassword.style.opacity = '1';
    });
  }
}

function setupUpdateListener() {
  if (updateListenerRegistered) return;
  if (!window.api.onUpdateStatus) return;
  updateListenerRegistered = true;
  window.api.onUpdateStatus((data) => {
    const banner = document.getElementById('update-banner');
    const text = document.getElementById('update-text');
    const installBtn = document.getElementById('update-install-btn');
    if (!banner || !text) return;

    text.textContent = data.message;
    banner.classList.remove('hidden');

    if (data.status === 'downloaded') {
      installBtn.classList.remove('hidden');
      installBtn.onclick = () => window.api.installUpdate();
    } else {
      installBtn.classList.add('hidden');
    }
  });

  const closeBtn = document.getElementById('update-close-btn');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      document.getElementById('update-banner').classList.add('hidden');
    });
  }
}

function showMainScreen() {
  document.getElementById('activation-screen').classList.add('hidden');
  document.getElementById('main-screen').classList.remove('hidden');
  updateDbStatus();
  setupNavigation();
  setupLanguage();
  startClock();
  setupUpdateListener();

  // Show/hide prontuario nav based on role
  const navProntuario = document.getElementById('nav-prontuario');
  if (navProntuario) {
    if (userRole === 'doctor') {
      navProntuario.classList.remove('hidden');
    } else {
      navProntuario.classList.add('hidden');
    }
  }

  setActiveNav(0);
  showScreen(0);
}

// ========================================
// Window Controls
// ========================================
function setupWindowControls() {
  document.getElementById('btn-minimize')?.addEventListener('click', () => window.api.windowMinimize());
  document.getElementById('btn-maximize')?.addEventListener('click', () => window.api.windowMaximize());
  document.getElementById('btn-close')?.addEventListener('click', () => window.api.windowClose());
}

// ========================================
// Init
// ========================================
document.addEventListener('DOMContentLoaded', () => {
  setupWindowControls();
  doctorName = localStorage.getItem('doctor_name') || '';
  setupActivation();
  // Always show login screen - user must authenticate to get JWT + encryption key
});

// ========================================
// Prontuario Module (Doctor Only)
// ========================================

function showProntuarioMain(container) {
  container.innerHTML = `
    <div class="prontuario-container fade-in">
      <div class="prontuario-header">
        <div class="prontuario-title">
          <span class="material-icons-round">description</span>
          ${t('PRONTUARIO ELETRONICO')}
        </div>
      </div>
      <div class="prontuario-search-bar">
        <input type="text" class="prontuario-search-input" id="prontuario-patient-search" 
          placeholder="${t('Nome do paciente ou CPF')}" />
        <button class="btn-prontuario" id="btn-search-prontuario">
          <span class="material-icons-round">search</span>
          ${t('BUSCAR')}
        </button>
        <button class="btn-prontuario btn-secondary" id="btn-new-prontuario-main">
          <span class="material-icons-round">add_circle</span>
          ${t('NOVO PRONTUARIO')}
        </button>
      </div>
      <div id="prontuario-results"></div>
    </div>
  `;
  // Enter key triggers search
  const searchInput = document.getElementById('prontuario-patient-search');
  if (searchInput) {
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') searchProntuarioPatient();
    });
    searchInput.focus();
  }
  document.getElementById('btn-search-prontuario').addEventListener('click', () => searchProntuarioPatient());
  document.getElementById('btn-new-prontuario-main').addEventListener('click', () => showProntuarioForm());
}

async function searchProntuarioPatient() {
  const query = document.getElementById('prontuario-patient-search')?.value.trim();
  if (!query) { showSnack(t('Digite o nome ou CPF do paciente.'), true); return; }

  const resultsDiv = document.getElementById('prontuario-results');
  if (!resultsDiv) return;
  resultsDiv.innerHTML = '<div class="loading-spinner"></div>';

  try {
    // Search by patient name, CPF, or ID (partial, case-insensitive)
    const result = await window.api.searchProntuarios({ query });
    console.log('[SEARCH] Result:', result);
    console.log('[SEARCH] First doc:', result.data?.[0]);
    console.log('[SEARCH] patient_id from first doc:', result.data?.[0]?.patient_id);
    if (result.success && result.data && result.data.length > 0) {
      const patientId = result.data[0]?.patient_id || query;
      console.log('[SEARCH] Using patientId:', patientId);
      renderProntuarioList(resultsDiv, result.data, patientId);
    } else {
      // Also search in appointments for matching patients
      await fetchAppointments();
      const matchingPatients = allAppointments.filter(a =>
        (a.nome && a.nome.toLowerCase().includes(query.toLowerCase())) ||
        (a.cpf && a.cpf.includes(query))
      );
      if (matchingPatients.length > 0) {
        resultsDiv.innerHTML = `
          <div style="margin-bottom:16px;color:var(--text-secondary);font-size:13px;">
            ${t('Nenhum prontuario encontrado.')} ${t('Pacientes encontrados no cofre:')}
          </div>
        `;
        const uniquePatients = [];
        const seen = new Set();
        matchingPatients.forEach(p => {
          const key = (p.cpf || '') + '|' + (p.nome || '').toLowerCase();
          if (!seen.has(key)) {
            seen.add(key);
            uniquePatients.push(p);
          }
        });
        uniquePatients.forEach(p => {
          const card = document.createElement('div');
          card.className = 'prontuario-card';
          card.innerHTML = `
            <div class="prontuario-card-header">
              <div><strong style="color:var(--text-primary);">${escapeHtml(p.nome)}</strong></div>
              <div class="prontuario-card-badge">${t('SEM PRONTUARIO')}</div>
            </div>
            <div class="prontuario-card-field">
              <span class="prontuario-card-label">CPF:</span>
              <span class="prontuario-card-value">${escapeHtml(p.cpf) || '-'}</span>
            </div>
            <div class="prontuario-card-actions">
              <button class="btn-prontuario btn-sm" data-cpf="${escapeHtml(p.cpf)}" data-nome="${escapeHtml(p.nome)}">
                <span class="material-icons-round">add</span> ${t('CRIAR PRONTUARIO')}
              </button>
            </div>
          `;
          const addBtn = card.querySelector('[data-cpf]');
          if (addBtn) {
            addBtn.addEventListener('click', () => showProntuarioForm(addBtn.dataset.cpf, addBtn.dataset.nome));
          }
          resultsDiv.appendChild(card);
        });
      } else {
        resultsDiv.innerHTML = `
          <div class="prontuario-empty">
            <span class="material-icons-round">search_off</span>
            <div class="prontuario-empty-text">${t('Nenhum paciente encontrado.')}</div>
            <div class="prontuario-empty-sub">${t('Verifique o nome ou CPF digitado.')}</div>
          </div>
        `;
      }
    }
  } catch (e) {
    resultsDiv.innerHTML = `<div class="prontuario-empty"><span class="material-icons-round">error</span><div class="prontuario-empty-text">${t('Erro de Conexão')}</div></div>`;
  }
}

function renderProntuarioList(container, prontuarios, patientId) {
  const patientName = prontuarios[0]?.patient_name || patientId;
  container.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;">
      <div style="color:var(--text-primary);font-size:15px;font-weight:600;">
        <span class="material-icons-round" style="vertical-align:middle;color:var(--gold);margin-right:6px;">person</span>
        ${escapeHtml(patientName)}
        <span style="color:var(--text-muted);font-size:12px;margin-left:8px;">${prontuarios.length} ${t('prontuario(s)')}</span>
      </div>
      <div style="display:flex;gap:8px;">
        <button class="btn-prontuario btn-sm btn-secondary" id="btn-print-prontuarios">
          <span class="material-icons-round">print</span> ${t('IMPRIMIR')}
        </button>
        <button class="btn-prontuario btn-sm" id="btn-new-prontuario">
          <span class="material-icons-round">add</span> ${t('NOVO')}
        </button>
      </div>
    </div>
  `;

  document.getElementById('btn-print-prontuarios').addEventListener('click', () => printProntuarios(patientId));
  document.getElementById('btn-new-prontuario').addEventListener('click', () => showProntuarioForm(patientId, patientName));

  prontuarios.forEach(p => {
    const dateObj = p.created_at ? parseUTCDate(p.created_at) : null;
    const date = dateObj ? dateObj.toLocaleDateString('pt-BR') : '-';
    const time = dateObj ? dateObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '';
    const locked = isRecordLocked(p.created_at);
    const card = document.createElement('div');
    card.className = 'prontuario-card';
    card.innerHTML = `
      <div class="prontuario-card-header">
        <div class="prontuario-card-date">
          ${date} ${time}
          ${locked ? `<span style="color:var(--danger);margin-left:8px;font-size:11px;"><span class="material-icons-round" style="font-size:14px;vertical-align:middle;">lock</span> ${t('BLOQUEADO')}</span>` : ''}
        </div>
        <div class="prontuario-card-badge">
          ${p.integrity_hash ? '<span class="material-icons-round" style="font-size:12px;vertical-align:middle;color:#4caf50;">verified</span> ' : ''}
          ${p.anexo_count ? p.anexo_count + ' ' + t('ANEXO(S)') : t('PRONTUARIO')}
        </div>
      </div>
      ${p.cid10_codigo ? `<div class="prontuario-card-field"><div class="prontuario-card-label">${t('CID-10')}</div><div class="prontuario-card-value">${escapeHtml(p.cid10_codigo)}${p.cid10_descricao ? ' - ' + escapeHtml(p.cid10_descricao) : ''}</div></div>` : ''}
      <div class="prontuario-card-field">
        <div class="prontuario-card-label">${t('SINTOMAS')}</div>
        <div class="prontuario-card-value">${escapeHtml(p.sintomas) || '-'}</div>
      </div>
      <div class="prontuario-card-field">
        <div class="prontuario-card-label">${t('DIAGNOSTICO')}</div>
        <div class="prontuario-card-value">${escapeHtml(p.diagnostico) || '-'}</div>
      </div>
      <div class="prontuario-card-field">
        <div class="prontuario-card-label">${t('TRATAMENTO')}</div>
        <div class="prontuario-card-value">${escapeHtml(p.tratamento) || '-'}</div>
      </div>
      ${p.anamnese ? `<div class="prontuario-card-field"><div class="prontuario-card-label">${t('ANAMNESE')}</div><div class="prontuario-card-value">${escapeHtml(p.anamnese)}</div></div>` : ''}
      ${p.prescricoes ? `<div class="prontuario-card-field"><div class="prontuario-card-label">${t('PRESCRICOES')}</div><div class="prontuario-card-value">${escapeHtml(p.prescricoes)}</div></div>` : ''}
      ${p.observacoes ? `<div class="prontuario-card-field"><div class="prontuario-card-label">${t('OBSERVACOES')}</div><div class="prontuario-card-value">${escapeHtml(p.observacoes)}</div></div>` : ''}
      <div class="prontuario-card-actions">
        ${!locked ? `<button class="btn-prontuario btn-sm btn-secondary btn-edit-pront" data-id="${escapeHtml(p.id)}"><span class="material-icons-round">edit</span> ${t('EDITAR')}</button>` : `<button class="btn-prontuario btn-sm btn-secondary btn-retificar-pront" data-id="${escapeHtml(p.id)}"><span class="material-icons-round">history</span> ${t('RETIFICACAO')}</button>`}
        <button class="btn-prontuario btn-sm btn-secondary btn-exames-pront" data-id="${escapeHtml(p.id)}">
          <span class="material-icons-round">biotech</span> ${t('EXAMES')}
        </button>
        <button class="btn-prontuario btn-sm btn-secondary btn-evolucoes-pront" data-id="${escapeHtml(p.id)}">
          <span class="material-icons-round">timeline</span> ${t('EVOLUCOES')}
        </button>
        <button class="btn-prontuario btn-sm btn-secondary btn-anexos-pront" data-id="${escapeHtml(p.id)}">
          <span class="material-icons-round">attach_file</span> ${t('ANEXOS')}
        </button>
        <button class="btn-prontuario btn-sm btn-secondary btn-verify-pront" data-id="${escapeHtml(p.id)}" title="${t('VERIFICAR INTEGRIDADE')}">
          <span class="material-icons-round">verified_user</span>
        </button>
      </div>
    `;
    if (!locked) {
      const editBtn = card.querySelector('.btn-edit-pront');
      if (editBtn) editBtn.addEventListener('click', () => editProntuario(p.id, patientId));
    } else {
      const retBtn = card.querySelector('.btn-retificar-pront');
      if (retBtn) retBtn.addEventListener('click', () => showRetificacaoForm(p.id));
    }
    card.querySelector('.btn-exames-pront').addEventListener('click', () => showExamesSection(p.id));
    card.querySelector('.btn-evolucoes-pront').addEventListener('click', () => showEvolucoesTimeline(p.id));
    card.querySelector('.btn-anexos-pront').addEventListener('click', () => viewAnexos(p.id));
    card.querySelector('.btn-verify-pront').addEventListener('click', () => verifyProntuarioIntegrity(p.id));
    container.appendChild(card);
  });
}

function isRecordLocked(createdAt) {
  if (!createdAt) return false;
  const created = parseUTCDate(createdAt);
  const now = new Date();
  const endOfDay = new Date(created);
  endOfDay.setHours(23, 59, 59, 999);
  return now > endOfDay;
}

function showProntuarioForm(patientId, patientName, editData) {
  const container = document.getElementById('content-area');
  const isEdit = !!editData;
  const locked = isEdit && isRecordLocked(editData.created_at);

  if (locked) {
    showSnack(t('Este prontuario esta bloqueado para edicao.'), true);
    return;
  }

  container.innerHTML = `
    <div class="prontuario-container fade-in">
      <div class="prontuario-header">
        <div class="prontuario-title">
          <span class="material-icons-round">${isEdit ? 'edit_note' : 'note_add'}</span>
          ${isEdit ? t('EDITAR PRONTUARIO') : t('NOVO PRONTUARIO')}
        </div>
        <button class="btn-prontuario btn-secondary btn-sm" id="btn-back-form">
          <span class="material-icons-round">arrow_back</span> ${t('VOLTAR')}
        </button>
      </div>
      <div class="prontuario-form">
        <div class="prontuario-form-row">
          <div class="prontuario-form-group">
            <label class="prontuario-form-label">${t('PACIENTE (CPF OU ID)')}</label>
            <input type="text" class="prontuario-form-input" id="pront-patient-id" value="${escapeHtml(patientId)}" placeholder="CPF" />
          </div>
          <div class="prontuario-form-group">
            <label class="prontuario-form-label">${t('NOME DO PACIENTE')}</label>
            <input type="text" class="prontuario-form-input" id="pront-patient-name" value="${escapeHtml(patientName)}" placeholder="${t('Nome do Paciente')}" />
          </div>
        </div>
        <div class="prontuario-form-row">
          <div class="prontuario-form-group">
            <label class="prontuario-form-label">${t('DATA DE NASCIMENTO')}</label>
            <input type="date" class="prontuario-form-input" id="pront-data-nascimento" value="${escapeHtml(editData?.data_nascimento || '')}" />
          </div>
          <div class="prontuario-form-group">
            <label class="prontuario-form-label">${t('CONTATO')}</label>
            <input type="text" class="prontuario-form-input" id="pront-contato" value="${escapeHtml(editData?.contato || '')}" placeholder="${t('Telefone ou WhatsApp do paciente')}" />
          </div>
        </div>
        <div class="prontuario-form-group">
          <label class="prontuario-form-label">${t('HISTORICO CLINICO')}</label>
          <textarea class="prontuario-form-textarea" id="pront-historico-clinico" placeholder="${t('Historico clinico completo do paciente')}">${escapeHtml(editData?.historico_clinico || '')}</textarea>
        </div>
        <div class="prontuario-form-group">
          <label class="prontuario-form-label">${t('ANAMNESE')}</label>
          <textarea class="prontuario-form-textarea" id="pront-anamnese" placeholder="${t('Anamnese detalhada')}">${escapeHtml(editData?.anamnese || '')}</textarea>
        </div>
        <div class="prontuario-form-group">
          <label class="prontuario-form-label">${t('SINTOMAS')}</label>
          <textarea class="prontuario-form-textarea" id="pront-sintomas" placeholder="${t('Descreva os sintomas do paciente')}">${escapeHtml(editData?.sintomas || '')}</textarea>
        </div>
        <div class="prontuario-form-group">
          <label class="prontuario-form-label">${t('DIAGNOSTICO')}</label>
          <textarea class="prontuario-form-textarea" id="pront-diagnostico" placeholder="${t('Diagnostico medico')}">${escapeHtml(editData?.diagnostico || '')}</textarea>
        </div>
        <div class="prontuario-form-group">
          <label class="prontuario-form-label">${t('CID-10')} (${t('OPCIONAL')})</label>
          <div style="position:relative;">
            <input type="text" class="prontuario-form-input" id="pront-cid10-search" placeholder="${t('Buscar CID-10')}" value="${escapeHtml(editData?.cid10_codigo ? editData.cid10_codigo + ' - ' + (editData.cid10_descricao || '') : '')}" autocomplete="off" />
            <div id="cid10-dropdown" style="display:none;position:absolute;top:100%;left:0;right:0;max-height:200px;overflow-y:auto;background:var(--bg-secondary);border:1px solid var(--gold);border-radius:8px;z-index:100;"></div>
          </div>
          <input type="hidden" id="pront-cid10-codigo" value="${escapeHtml(editData?.cid10_codigo || '')}" />
          <input type="hidden" id="pront-cid10-descricao" value="${escapeHtml(editData?.cid10_descricao || '')}" />
        </div>
        <div class="prontuario-form-group">
          <label class="prontuario-form-label">${t('TRATAMENTO')}</label>
          <textarea class="prontuario-form-textarea" id="pront-tratamento" placeholder="${t('Plano de tratamento prescrito')}">${escapeHtml(editData?.tratamento || '')}</textarea>
        </div>
        <div class="prontuario-form-group">
          <label class="prontuario-form-label">${t('PRESCRICOES')} (${t('OPCIONAL')})</label>
          <textarea class="prontuario-form-textarea" id="pront-prescricoes" placeholder="${t('Prescricoes medicas')}">${escapeHtml(editData?.prescricoes || '')}</textarea>
        </div>
        <div class="prontuario-form-group">
          <label class="prontuario-form-label">${t('OBSERVACOES')} (${t('OPCIONAL')})</label>
          <textarea class="prontuario-form-textarea" id="pront-observacoes" placeholder="${t('Observacoes adicionais')}">${escapeHtml(editData?.observacoes || '')}</textarea>
        </div>
        <div class="prontuario-form-actions">
          <button class="btn-prontuario" id="btn-save-prontuario">
            <span class="material-icons-round">save</span>
            ${isEdit ? t('SALVAR ALTERACOES') : t('SALVAR PRONTUARIO')}
          </button>
          <button class="btn-prontuario btn-secondary" id="btn-cancel-prontuario">
            <span class="material-icons-round">cancel</span>
            ${t('CANCELAR')}
          </button>
        </div>
      </div>
    </div>
  `;
  document.getElementById('btn-back-form').addEventListener('click', () => showScreen(6));
  document.getElementById('btn-save-prontuario').addEventListener('click', () => {
    if (isEdit) saveProntuarioEdit(editData.id, patientId);
    else saveProntuarioNew();
  });
  document.getElementById('btn-cancel-prontuario').addEventListener('click', () => showScreen(6));

  // CID-10 autocomplete
  const cid10Input = document.getElementById('pront-cid10-search');
  const cid10Dropdown = document.getElementById('cid10-dropdown');
  let cid10Timer = null;
  cid10Input.addEventListener('input', () => {
    clearTimeout(cid10Timer);
    const q = cid10Input.value.trim();
    if (q.length < 2) { cid10Dropdown.style.display = 'none'; return; }
    cid10Timer = setTimeout(async () => {
      const res = await window.api.getCid10({ query: q });
      if (res.success && res.data && res.data.length > 0) {
        cid10Dropdown.innerHTML = res.data.map(c =>
          `<div class="cid10-option" data-code="${escapeHtml(c.codigo)}" data-desc="${escapeHtml(c.descricao)}" style="padding:8px 12px;cursor:pointer;border-bottom:1px solid rgba(255,255,255,0.05);color:var(--text-primary);font-size:13px;">${escapeHtml(c.codigo)} - ${escapeHtml(c.descricao)}</div>`
        ).join('');
        cid10Dropdown.style.display = 'block';
        cid10Dropdown.querySelectorAll('.cid10-option').forEach(opt => {
          opt.addEventListener('click', () => {
            document.getElementById('pront-cid10-codigo').value = opt.dataset.code;
            document.getElementById('pront-cid10-descricao').value = opt.dataset.desc;
            cid10Input.value = opt.dataset.code + ' - ' + opt.dataset.desc;
            cid10Dropdown.style.display = 'none';
          });
          opt.addEventListener('mouseenter', () => { opt.style.background = 'rgba(212,175,55,0.15)'; });
          opt.addEventListener('mouseleave', () => { opt.style.background = 'transparent'; });
        });
      } else {
        cid10Dropdown.style.display = 'none';
      }
    }, 300);
  });
  document.addEventListener('click', (e) => {
    if (!cid10Input.contains(e.target) && !cid10Dropdown.contains(e.target)) {
      cid10Dropdown.style.display = 'none';
    }
  });
}

async function saveProntuarioNew() {
  const patientId = document.getElementById('pront-patient-id')?.value.trim();
  const patientName = document.getElementById('pront-patient-name')?.value.trim();
  const sintomas = document.getElementById('pront-sintomas')?.value.trim();
  const diagnostico = document.getElementById('pront-diagnostico')?.value.trim();
  const tratamento = document.getElementById('pront-tratamento')?.value.trim();
  const observacoes = document.getElementById('pront-observacoes')?.value.trim();
  const dataNascimento = document.getElementById('pront-data-nascimento')?.value.trim();
  const contato = document.getElementById('pront-contato')?.value.trim();
  const historicoClin = document.getElementById('pront-historico-clinico')?.value.trim();
  const anamnese = document.getElementById('pront-anamnese')?.value.trim();
  const prescricoes = document.getElementById('pront-prescricoes')?.value.trim();
  const cid10Codigo = document.getElementById('pront-cid10-codigo')?.value.trim();
  const cid10Descricao = document.getElementById('pront-cid10-descricao')?.value.trim();

  if (!patientId) { showSnack(t('Digite o CPF ou ID do paciente.'), true); return; }
  if (!sintomas) { showSnack(t('Preencha os sintomas.'), true); return; }
  if (!diagnostico) { showSnack(t('Preencha o diagnostico.'), true); return; }
  if (!tratamento) { showSnack(t('Preencha o tratamento.'), true); return; }

  try {
    const result = await window.api.saveProntuario({
      patient_id: patientId,
      patient_name: patientName || '',
      patient_cpf: patientId,
      sintomas,
      diagnostico,
      tratamento,
      observacoes: observacoes || '',
      data_nascimento: dataNascimento || '',
      contato: contato || '',
      historico_clinico: historicoClin || '',
      anamnese: anamnese || '',
      prescricoes: prescricoes || '',
      cid10_codigo: cid10Codigo || '',
      cid10_descricao: cid10Descricao || '',
    });
    if (result.success) {
      showSnack(t('Prontuario salvo com sucesso!'));
      showScreen(6);
    } else {
      let msg = t('Erro ao salvar prontuario.');
      if (result.detail === 'ACCESS_DENIED_DOCTOR_ONLY') msg = t('Acesso negado. Apenas medicos podem criar prontuarios.');
      showSnack(msg, true);
    }
  } catch (e) {
    showSnack(t('Erro de Conexão'), true);
  }
}

async function saveProntuarioEdit(prontuarioId, patientId) {
  const sintomas = document.getElementById('pront-sintomas')?.value.trim();
  const diagnostico = document.getElementById('pront-diagnostico')?.value.trim();
  const tratamento = document.getElementById('pront-tratamento')?.value.trim();
  const observacoes = document.getElementById('pront-observacoes')?.value.trim();
  const dataNascimento = document.getElementById('pront-data-nascimento')?.value.trim();
  const contato = document.getElementById('pront-contato')?.value.trim();
  const historicoClin = document.getElementById('pront-historico-clinico')?.value.trim();
  const anamnese = document.getElementById('pront-anamnese')?.value.trim();
  const prescricoes = document.getElementById('pront-prescricoes')?.value.trim();
  const cid10Codigo = document.getElementById('pront-cid10-codigo')?.value.trim();
  const cid10Descricao = document.getElementById('pront-cid10-descricao')?.value.trim();

  if (!sintomas) { showSnack(t('Preencha os sintomas.'), true); return; }
  if (!diagnostico) { showSnack(t('Preencha o diagnostico.'), true); return; }
  if (!tratamento) { showSnack(t('Preencha o tratamento.'), true); return; }

  try {
    const result = await window.api.updateProntuario({
      id: prontuarioId,
      data: { sintomas, diagnostico, tratamento, observacoes: observacoes || '', data_nascimento: dataNascimento || '', contato: contato || '', historico_clinico: historicoClin || '', anamnese: anamnese || '', prescricoes: prescricoes || '', cid10_codigo: cid10Codigo || '', cid10_descricao: cid10Descricao || '' },
    });
    if (result.success) {
      showSnack(t('Prontuario atualizado com sucesso!'));
      // Go back to search results for this patient
      const content = document.getElementById('content-area');
      showProntuarioMain(content);
      document.getElementById('prontuario-patient-search').value = patientId;
      await searchProntuarioPatient();
    } else {
      showSnack(t('Erro ao atualizar prontuario.'), true);
    }
  } catch (e) {
    showSnack(t('Erro de Conexão'), true);
  }
}

async function editProntuario(prontuarioId, patientId) {
  try {
    const result = await window.api.getProntuarios({ patientId });
    console.log('[EDIT] getProntuarios result:', result);
    console.log('[EDIT] Looking for prontuarioId:', prontuarioId);
    if (result.success && result.data) {
      console.log('[EDIT] Available IDs:', result.data.map(p => p.id));
      const pront = result.data.find(p => p.id === prontuarioId);
      console.log('[EDIT] Found pront:', pront);
      if (pront) {
        showProntuarioForm(patientId, pront.patient_name, pront);
        return;
      }
    }
    showSnack(t('Prontuario nao encontrado.'), true);
  } catch (e) {
    showSnack(t('Erro de Conexão'), true);
  }
}

// Prontuarios cannot be deleted (LGPD / legal compliance)
async function deleteProntuarioConfirm() {
  showSnack(t('Prontuarios nao podem ser excluidos.'), true);
}
async function deleteProntuarioExecute() {
  showSnack(t('Prontuarios nao podem ser excluidos.'), true);
}


// --- Exames Section ---
async function showExamesSection(prontuarioId) {
  const container = document.getElementById('content-area');
  container.innerHTML = '<div class="loading-spinner"></div>';
  try {
    const result = await window.api.listExames({ prontuarioId });
    const exames = (result.success && result.data) ? result.data : [];
    container.innerHTML = `
      <div class="prontuario-container fade-in">
        <div class="prontuario-header">
          <div class="prontuario-title"><span class="material-icons-round">biotech</span> ${t('EXAMES')}</div>
          <div style="display:flex;gap:8px;">
            <button class="btn-prontuario btn-sm" id="btn-add-exame"><span class="material-icons-round">add</span> ${t('ADICIONAR EXAME')}</button>
            <button class="btn-prontuario btn-secondary btn-sm" id="btn-back-exames"><span class="material-icons-round">arrow_back</span> ${t('VOLTAR')}</button>
          </div>
        </div>
        <div id="exames-list"></div>
        <div id="exame-form-area" style="display:none;margin-top:16px;">
          <div class="prontuario-form">
            <div class="prontuario-form-group">
              <label class="prontuario-form-label">${t('TIPO DE EXAME')}</label>
              <select class="prontuario-form-input" id="exame-tipo" style="padding:10px;">
                <option value="">-- ${t('TIPO DE EXAME')} --</option>
                <option value="Hemograma">Hemograma</option>
                <option value="Glicemia">Glicemia</option>
                <option value="Colesterol">Colesterol Total</option>
                <option value="Triglicerideos">Triglicerideos</option>
                <option value="TSH">TSH</option>
                <option value="T4 Livre">T4 Livre</option>
                <option value="Ureia">Ureia</option>
                <option value="Creatinina">Creatinina</option>
                <option value="TGO/AST">TGO/AST</option>
                <option value="TGP/ALT">TGP/ALT</option>
                <option value="Acido Urico">Acido Urico</option>
                <option value="PSA">PSA</option>
                <option value="Raio-X">Raio-X</option>
                <option value="Ultrassonografia">Ultrassonografia</option>
                <option value="Tomografia">Tomografia</option>
                <option value="Ressonancia Magnetica">Ressonancia Magnetica</option>
                <option value="ECG">ECG (Eletrocardiograma)</option>
                <option value="Ecocardiograma">Ecocardiograma</option>
                <option value="Endoscopia">Endoscopia</option>
                <option value="Colonoscopia">Colonoscopia</option>
                <option value="Mamografia">Mamografia</option>
                <option value="Papanicolau">Papanicolau</option>
                <option value="Densitometria">Densitometria Ossea</option>
                <option value="Exame de Urina">Exame de Urina (EAS)</option>
                <option value="Outro">Outro</option>
              </select>
            </div>
            <div class="prontuario-form-group">
              <label class="prontuario-form-label">${t('DESCRICAO DO EXAME')}</label>
              <textarea class="prontuario-form-textarea" id="exame-descricao" placeholder="${t('Descricao ou interpretacao do exame')}"></textarea>
            </div>
            <div class="prontuario-form-row">
              <div class="prontuario-form-group">
                <label class="prontuario-form-label">${t('DATA DO EXAME')}</label>
                <input type="date" class="prontuario-form-input" id="exame-data" value="${new Date().toISOString().split('T')[0]}" />
              </div>
              <div class="prontuario-form-group">
                <label class="prontuario-form-label">${t('PROFISSIONAL RESPONSAVEL')}</label>
                <input type="text" class="prontuario-form-input" id="exame-profissional" value="${escapeHtml(localStorage.getItem('user_email') || '')}" />
              </div>
            </div>
            <div class="prontuario-form-actions">
              <button class="btn-prontuario" id="btn-save-exame"><span class="material-icons-round">save</span> ${t('SALVAR PRONTUARIO')}</button>
              <button class="btn-prontuario btn-secondary" id="btn-cancel-exame"><span class="material-icons-round">cancel</span> ${t('CANCELAR')}</button>
            </div>
          </div>
        </div>
      </div>
    `;

    const listDiv = document.getElementById('exames-list');
    if (exames.length === 0) {
      listDiv.innerHTML = `<p style="color:var(--text-muted);text-align:center;padding:20px;">${t('Nenhum exame registrado.')}</p>`;
    } else {
      exames.forEach(ex => {
        const d = ex.data_exame || ex.created_at || '';
        const dateStr = d ? new Date(d).toLocaleDateString('pt-BR') : '-';
        const item = document.createElement('div');
        item.className = 'prontuario-card';
        item.style.marginBottom = '8px';
        item.innerHTML = `
          <div class="prontuario-card-header"><div class="prontuario-card-date">${dateStr}</div><div class="prontuario-card-badge">${escapeHtml(ex.tipo_exame || '')}</div></div>
          <div class="prontuario-card-field"><div class="prontuario-card-label">${t('DESCRICAO DO EXAME')}</div><div class="prontuario-card-value">${escapeHtml(ex.descricao || '-')}</div></div>
          <div class="prontuario-card-field"><div class="prontuario-card-label">${t('PROFISSIONAL RESPONSAVEL')}</div><div class="prontuario-card-value">${escapeHtml(ex.profissional_responsavel || '-')}</div></div>
        `;
        listDiv.appendChild(item);
      });
    }

    document.getElementById('btn-back-exames').addEventListener('click', () => showScreen(6));
    document.getElementById('btn-add-exame').addEventListener('click', () => {
      document.getElementById('exame-form-area').style.display = 'block';
    });
    document.getElementById('btn-cancel-exame').addEventListener('click', () => {
      document.getElementById('exame-form-area').style.display = 'none';
    });
    document.getElementById('btn-save-exame').addEventListener('click', async () => {
      const tipo = document.getElementById('exame-tipo').value;
      const descricao = document.getElementById('exame-descricao').value.trim();
      const dataExame = document.getElementById('exame-data').value;
      const profissional = document.getElementById('exame-profissional').value.trim();
      if (!tipo) { showSnack(t('TIPO DE EXAME'), true); return; }
      try {
        const res = await window.api.createExame({ prontuarioId, data: { tipo_exame: tipo, descricao, data_exame: dataExame, profissional_responsavel: profissional } });
        if (res.success) { showSnack(t('Exame salvo com sucesso!')); showExamesSection(prontuarioId); }
        else showSnack(t('Erro ao salvar exame.'), true);
      } catch (e) { showSnack(t('Erro de Conexão'), true); }
    });
  } catch (e) {
    showSnack(t('Erro de Conexão'), true);
  }
}

// --- Evolucoes Timeline ---
async function showEvolucoesTimeline(prontuarioId) {
  const container = document.getElementById('content-area');
  container.innerHTML = '<div class="loading-spinner"></div>';
  try {
    const result = await window.api.listEvolucoes({ prontuarioId });
    const evolucoes = (result.success && result.data) ? result.data : [];
    container.innerHTML = `
      <div class="prontuario-container fade-in">
        <div class="prontuario-header">
          <div class="prontuario-title"><span class="material-icons-round">timeline</span> ${t('EVOLUCOES')}</div>
          <div style="display:flex;gap:8px;">
            <button class="btn-prontuario btn-sm" id="btn-add-evolucao"><span class="material-icons-round">add</span> ${t('ADICIONAR EVOLUCAO')}</button>
            <button class="btn-prontuario btn-secondary btn-sm" id="btn-back-evolucoes"><span class="material-icons-round">arrow_back</span> ${t('VOLTAR')}</button>
          </div>
        </div>
        <div id="evolucao-form-area" style="display:none;margin-bottom:16px;">
          <div class="prontuario-form">
            <div class="prontuario-form-group">
              <label class="prontuario-form-label">${t('ADICIONAR EVOLUCAO')}</label>
              <textarea class="prontuario-form-textarea" id="evolucao-texto" placeholder="${t('Texto da evolucao')}"></textarea>
            </div>
            <div class="prontuario-form-actions">
              <button class="btn-prontuario" id="btn-save-evolucao"><span class="material-icons-round">save</span> ${t('SALVAR PRONTUARIO')}</button>
              <button class="btn-prontuario btn-secondary" id="btn-cancel-evolucao"><span class="material-icons-round">cancel</span> ${t('CANCELAR')}</button>
            </div>
          </div>
        </div>
        <div id="evolucoes-timeline" style="border-left:3px solid var(--gold);padding-left:20px;margin-left:10px;"></div>
      </div>
    `;

    const timeline = document.getElementById('evolucoes-timeline');
    if (evolucoes.length === 0) {
      timeline.innerHTML = `<p style="color:var(--text-muted);text-align:center;padding:20px;">${t('Nenhuma evolucao registrada.')}</p>`;
    } else {
      evolucoes.forEach(ev => {
        const d = ev.created_at ? parseUTCDate(ev.created_at) : null;
        const dateStr = d ? d.toLocaleDateString('pt-BR') + ' ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '-';
        const item = document.createElement('div');
        item.style.cssText = 'position:relative;margin-bottom:16px;padding:12px;background:var(--bg-secondary);border-radius:8px;border:1px solid rgba(255,255,255,0.05);';
        item.innerHTML = `
          <div style="position:absolute;left:-29px;top:14px;width:12px;height:12px;background:var(--gold);border-radius:50%;border:2px solid var(--bg-primary);"></div>
          <div style="font-size:11px;color:var(--text-muted);margin-bottom:6px;font-family:monospace;">${dateStr} - ${escapeHtml(ev.created_by || '')}</div>
          <div style="color:var(--text-primary);font-size:13px;line-height:1.5;">${escapeHtml(ev.texto || '')}</div>
        `;
        timeline.appendChild(item);
      });
    }

    document.getElementById('btn-back-evolucoes').addEventListener('click', () => showScreen(6));
    document.getElementById('btn-add-evolucao').addEventListener('click', () => {
      document.getElementById('evolucao-form-area').style.display = 'block';
    });
    document.getElementById('btn-cancel-evolucao').addEventListener('click', () => {
      document.getElementById('evolucao-form-area').style.display = 'none';
    });
    document.getElementById('btn-save-evolucao').addEventListener('click', async () => {
      const texto = document.getElementById('evolucao-texto').value.trim();
      if (!texto) return;
      try {
        const res = await window.api.createEvolucao({ prontuarioId, data: { texto, tipo: 'evolucao' } });
        if (res.success) { showSnack(t('Evolucao salva com sucesso!')); showEvolucoesTimeline(prontuarioId); }
        else showSnack(t('Erro ao salvar evolucao.'), true);
      } catch (e) { showSnack(t('Erro de Conexão'), true); }
    });
  } catch (e) {
    showSnack(t('Erro de Conexão'), true);
  }
}

// --- Retificacao Form (for locked records) ---
async function showRetificacaoForm(prontuarioId) {
  const container = document.getElementById('content-area');
  const campos = ['sintomas', 'diagnostico', 'tratamento', 'observacoes', 'historico_clinico', 'anamnese', 'prescricoes'];
  container.innerHTML = `
    <div class="prontuario-container fade-in">
      <div class="prontuario-header">
        <div class="prontuario-title"><span class="material-icons-round">history</span> ${t('RETIFICAR PRONTUARIO')}</div>
        <button class="btn-prontuario btn-secondary btn-sm" id="btn-back-retificacao"><span class="material-icons-round">arrow_back</span> ${t('VOLTAR')}</button>
      </div>
      <div class="prontuario-form">
        <div class="prontuario-form-group">
          <label class="prontuario-form-label">${t('MOTIVO DA RETIFICACAO')}</label>
          <textarea class="prontuario-form-textarea" id="retificacao-motivo" placeholder="${t('Descreva o motivo da correcao')}"></textarea>
        </div>
        <div class="prontuario-form-group">
          <label class="prontuario-form-label">${t('CAMPO A RETIFICAR')}</label>
          <select class="prontuario-form-input" id="retificacao-campo" style="padding:10px;">
            ${campos.map(c => `<option value="${c}">${c}</option>`).join('')}
          </select>
        </div>
        <div class="prontuario-form-group">
          <label class="prontuario-form-label">${t('VALOR CORRIGIDO')}</label>
          <textarea class="prontuario-form-textarea" id="retificacao-valor" placeholder="${t('Novo valor correto para o campo')}"></textarea>
        </div>
        <div class="prontuario-form-actions">
          <button class="btn-prontuario" id="btn-save-retificacao"><span class="material-icons-round">save</span> ${t('SALVAR PRONTUARIO')}</button>
          <button class="btn-prontuario btn-secondary" id="btn-cancel-retificacao"><span class="material-icons-round">cancel</span> ${t('CANCELAR')}</button>
        </div>
      </div>
    </div>
  `;
  document.getElementById('btn-back-retificacao').addEventListener('click', () => showScreen(6));
  document.getElementById('btn-cancel-retificacao').addEventListener('click', () => showScreen(6));
  document.getElementById('btn-save-retificacao').addEventListener('click', async () => {
    const motivo = document.getElementById('retificacao-motivo').value.trim();
    const campo = document.getElementById('retificacao-campo').value;
    const valor = document.getElementById('retificacao-valor').value.trim();
    if (!motivo || !valor) { showSnack(t('Preencha os campos obrigatórios.'), true); return; }
    try {
      const res = await window.api.createRetificacao({ prontuarioId, data: { motivo, campo, valor_corrigido: valor } });
      if (res.success) { showSnack(t('Retificacao salva com sucesso!')); showScreen(6); }
      else showSnack(t('Erro ao salvar retificacao.'), true);
    } catch (e) { showSnack(t('Erro de Conexão'), true); }
  });
}

// --- Verify Prontuario Integrity ---
async function verifyProntuarioIntegrity(prontuarioId) {
  try {
    const result = await window.api.verifyProntuario({ prontuarioId });
    console.log('[VERIFY] Result:', result);
    console.log('[VERIFY] result.data:', result.data);
    console.log('[VERIFY] result.data.integrity_valid:', result.data?.integrity_valid);
    if (result.success && result.data && result.data.integrity_valid) {
      showSnack(t('Integridade verificada com sucesso!'));
    } else {
      showSnack(t('Falha na verificacao de integridade!'), true);
    }
  } catch (e) {
    console.error('[VERIFY] Error:', e);
    showSnack(t('Erro de Conexão'), true);
  }
}

async function viewAnexos(prontuarioId) {
  const container = document.getElementById('content-area');
  container.innerHTML = '<div class="loading-spinner"></div>';

  try {
    const result = await window.api.listAnexos({ prontuarioId });
    const anexos = (result.success && result.data) ? result.data : [];

    container.innerHTML = `
      <div class="prontuario-container fade-in">
        <div class="prontuario-header">
          <div class="prontuario-title">
            <span class="material-icons-round">attach_file</span>
            ${t('ANEXOS DO PRONTUARIO')}
          </div>
          <button class="btn-prontuario btn-secondary btn-sm" id="btn-back-anexos">
            <span class="material-icons-round">arrow_back</span> ${t('VOLTAR')}
          </button>
        </div>
        <div class="file-upload-area" id="upload-area">
          <span class="material-icons-round">cloud_upload</span>
          <div class="file-upload-text">${t('Clique para enviar exame ou documento (max 10MB)')}</div>
          <input type="file" id="file-input" class="file-upload-input" accept="image/*,.pdf,.doc,.docx,.txt" />
        </div>
        <div class="anexo-list" id="anexo-list"></div>
      </div>
    `;

    // Add event listeners for back and upload area buttons
    document.getElementById('btn-back-anexos').addEventListener('click', () => showScreen(6));
    document.getElementById('upload-area').addEventListener('click', () => document.getElementById('file-input').click());

    // Render existing anexos
    const anexoList = document.getElementById('anexo-list');
    if (anexos.length === 0) {
      anexoList.innerHTML = `<div class="prontuario-empty" style="padding:30px;"><span class="material-icons-round">folder_open</span><div class="prontuario-empty-text">${t('Nenhum anexo encontrado.')}</div></div>`;
    } else {
      anexos.forEach(a => {
        const sizeStr = a.size > 1024 * 1024 ? (a.size / 1024 / 1024).toFixed(1) + ' MB' : (a.size / 1024).toFixed(0) + ' KB';
        const item = document.createElement('div');
        item.className = 'anexo-item';
        item.innerHTML = `
          <span class="material-icons-round">${a.content_type?.startsWith('image') ? 'image' : 'insert_drive_file'}</span>
          <span class="anexo-item-name">${escapeHtml(a.filename)}</span>
          <span class="anexo-item-size">${sizeStr}</span>
          ${a.descricao ? `<span style="color:var(--text-muted);font-size:11px;">${escapeHtml(a.descricao)}</span>` : ''}
          <button class="btn-prontuario btn-sm btn-secondary btn-download-anexo" style="height:28px;padding:0 10px;">
            <span class="material-icons-round" style="font-size:14px;">download</span>
          </button>
          <button class="btn-prontuario btn-sm btn-danger btn-delete-anexo" style="height:28px;padding:0 10px;">
            <span class="material-icons-round" style="font-size:14px;">delete</span>
          </button>
        `;
        item.querySelector('.btn-download-anexo').addEventListener('click', () => downloadAnexo(a.id));
        item.querySelector('.btn-delete-anexo').addEventListener('click', () => deleteAnexoConfirm(a.id, prontuarioId));
        anexoList.appendChild(item);
      });
    }

    // File upload handler
    document.getElementById('file-input').addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      if (file.size > 10 * 1024 * 1024) {
        showSnack(t('Arquivo muito grande (max 10MB).'), true);
        return;
      }
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result.split(',')[1];
        showSnack(t('Enviando arquivo...'));
        try {
          const result = await window.api.uploadAnexo({
            prontuarioId,
            fileData: base64,
            fileName: file.name,
            contentType: file.type,
            descricao: '',
          });
          if (result.success) {
            showSnack(t('Arquivo enviado com sucesso!'));
            viewAnexos(prontuarioId);
          } else {
            showSnack(t('Erro ao enviar arquivo.'), true);
          }
        } catch (err) {
          showSnack(t('Erro de Conexão'), true);
        }
      };
      reader.readAsDataURL(file);
    });
  } catch (e) {
    container.innerHTML = `<div class="prontuario-empty"><span class="material-icons-round">error</span><div class="prontuario-empty-text">${t('Erro de Conexão')}</div></div>`;
  }
}

async function downloadAnexo(anexoId) {
  try {
    showSnack(t('Baixando arquivo...'));
    const result = await window.api.getAnexo({ anexoId });
    if (result.success && result.data) {
      // Create download via data URL
      const blob = new Blob([Uint8Array.from(atob(result.data), c => c.charCodeAt(0))], { type: result.contentType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = result.fileName || 'arquivo';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } else {
      showSnack(t('Erro ao baixar arquivo.'), true);
    }
  } catch (e) {
    showSnack(t('Erro de Conexão'), true);
  }
}

async function deleteAnexoConfirm(anexoId, prontuarioId) {
  if (confirm(t('Deseja excluir este anexo?'))) {
    try {
      const result = await window.api.deleteAnexo({ anexoId });
      if (result.success) {
        showSnack(t('Anexo excluido com sucesso.'));
        viewAnexos(prontuarioId);
      } else {
        showSnack(t('Erro ao excluir anexo.'), true);
      }
    } catch (e) {
      showSnack(t('Erro de Conexão'), true);
    }
  }
}

async function printProntuarios(patientId) {
  try {
    const result = await window.api.getProntuarios({ patientId });
    if (!result.success || !result.data || result.data.length === 0) {
      showSnack(t('Nenhum prontuario para imprimir.'), true);
      return;
    }

    const prontuarios = result.data;
    const patientName = prontuarios[0]?.patient_name || patientId;
    const userEmail = localStorage.getItem('user_email') || '';

    let html = `
      <!DOCTYPE html>
      <html><head><meta charset="UTF-8">
      <title>${t('PRONTUARIO')} - ${escapeHtml(patientName)}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 40px; color: #333; }
        .header { text-align: center; border-bottom: 3px solid #d4af37; padding-bottom: 16px; margin-bottom: 24px; }
        .header h1 { color: #d4af37; font-size: 24px; margin: 0; }
        .header p { color: #666; font-size: 13px; margin: 4px 0; }
        .patient-info { background: #f9f9f9; padding: 16px; border-radius: 8px; margin-bottom: 20px; }
        .patient-info h2 { margin: 0 0 8px; font-size: 16px; }
        .record { border: 1px solid #ddd; border-radius: 8px; padding: 16px; margin-bottom: 16px; page-break-inside: avoid; }
        .record-date { font-size: 12px; color: #888; margin-bottom: 12px; font-family: monospace; }
        .field { margin-bottom: 10px; }
        .field-label { font-size: 11px; font-weight: 700; color: #d4af37; text-transform: uppercase; letter-spacing: 1px; }
        .field-value { font-size: 13px; line-height: 1.6; margin-top: 2px; }
        .footer { margin-top: 40px; text-align: center; border-top: 1px solid #ddd; padding-top: 20px; }
        .signature { margin-top: 60px; text-align: center; }
        .signature-line { width: 300px; border-top: 1px solid #333; margin: 0 auto; padding-top: 8px; font-size: 13px; }
        @media print { body { margin: 20px; } }
      </style></head><body>
      <div class="header">
        <h1>MEDICAL SAFE GOLD</h1>
        <p>${t('PRONTUARIO ELETRONICO')}</p>
      </div>
      <div class="patient-info">
        <h2>${escapeHtml(patientName)}</h2>
        <p><strong>CPF/ID:</strong> ${escapeHtml(patientId)}</p>
        <p><strong>${t('MEDICO')}:</strong> ${escapeHtml(userEmail)}</p>
        <p><strong>${t('DATA DE IMPRESSAO')}:</strong> ${new Date().toLocaleDateString('pt-BR')} ${new Date().toLocaleTimeString('pt-BR')}</p>
      </div>
    `;

    prontuarios.forEach((p, i) => {
      const dateObj = p.created_at ? parseUTCDate(p.created_at) : null;
      const date = dateObj ? dateObj.toLocaleDateString('pt-BR') : '-';
      const time = dateObj ? dateObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '';
      html += `
        <div class="record">
          <div class="record-date">#${i + 1} - ${date} ${time}${p.integrity_hash ? ' | Hash: ' + escapeHtml(p.integrity_hash.substring(0, 16)) + '...' : ''}</div>
          ${p.data_nascimento ? `<div class="field"><div class="field-label">${t('DATA DE NASCIMENTO')}</div><div class="field-value">${escapeHtml(p.data_nascimento)}</div></div>` : ''}
          ${p.contato ? `<div class="field"><div class="field-label">${t('CONTATO')}</div><div class="field-value">${escapeHtml(p.contato)}</div></div>` : ''}
          ${p.historico_clinico ? `<div class="field"><div class="field-label">${t('HISTORICO CLINICO')}</div><div class="field-value">${escapeHtml(p.historico_clinico)}</div></div>` : ''}
          ${p.anamnese ? `<div class="field"><div class="field-label">${t('ANAMNESE')}</div><div class="field-value">${escapeHtml(p.anamnese)}</div></div>` : ''}
          ${p.cid10_codigo ? `<div class="field"><div class="field-label">${t('CID-10')}</div><div class="field-value">${escapeHtml(p.cid10_codigo)}${p.cid10_descricao ? ' - ' + escapeHtml(p.cid10_descricao) : ''}</div></div>` : ''}
          <div class="field"><div class="field-label">${t('SINTOMAS')}</div><div class="field-value">${escapeHtml(p.sintomas) || '-'}</div></div>
          <div class="field"><div class="field-label">${t('DIAGNOSTICO')}</div><div class="field-value">${escapeHtml(p.diagnostico) || '-'}</div></div>
          <div class="field"><div class="field-label">${t('TRATAMENTO')}</div><div class="field-value">${escapeHtml(p.tratamento) || '-'}</div></div>
          ${p.prescricoes ? `<div class="field"><div class="field-label">${t('PRESCRICOES')}</div><div class="field-value">${escapeHtml(p.prescricoes)}</div></div>` : ''}
          ${p.observacoes ? `<div class="field"><div class="field-label">${t('OBSERVACOES')}</div><div class="field-value">${escapeHtml(p.observacoes)}</div></div>` : ''}
        </div>
      `;
    });

    html += `
      <div class="signature">
        <div class="signature-line">${escapeHtml(userEmail)}<br><small>${t('MEDICO RESPONSAVEL')}</small></div>
      </div>
      <div class="footer">
        <small>${t('DOCUMENTO GERADO POR MEDICAL SAFE GOLD')} - ${t('PROTEGIDO POR LGPD')}</small>
      </div>
      </body></html>
    `;

    // Open print window
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (!printWindow) {
      showSnack(t('Erro ao abrir janela de impressão.'), true);
      return;
    }
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => printWindow.print(), 500);
  } catch (e) {
    showSnack(t('Erro de Conexão'), true);
  }
}
