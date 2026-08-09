'use strict';

/* ============================================================
   CONFIG
============================================================ */
const EXERCISES = [
  { id: 'pushups',  name: 'Liegestütze',    type: 'strength', hasTarget: true,  sets: 3, reps: 10, unit: 'Wdh.' },
  { id: 'dumbbell', name: 'Kurzhanteln',    type: 'strength', hasTarget: true,  sets: 3, reps: 15, unit: 'Wdh.' },
  { id: 'squats',   name: 'Kniebeuge',      type: 'strength', hasTarget: true,  sets: 3, reps: 20, unit: 'Wdh.' },
  { id: 'situps',   name: 'Situps',         type: 'strength', hasTarget: true,  sets: 3, reps: 15, unit: 'Wdh.' },
  { id: 'joggen',   name: 'Joggen',         type: 'cardio',   hasTarget: false, unit: 'km' },
  { id: 'fahrrad',  name: 'Fahrrad fahren', type: 'cardio',   hasTarget: false, unit: 'km' },
];
EXERCISES.forEach(e => { e.target = e.hasTarget ? e.sets * e.reps : undefined; });
const GOAL_EXERCISES = EXERCISES.filter(e => e.hasTarget);
const EXTRA_EXERCISES = EXERCISES.filter(e => !e.hasTarget);

const ICONS = {
  pushups:  '<svg viewBox="0 0 24 24" fill="none"><path d="M2 16h20M6 16v-5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v5M9 9V7M15 9V7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  dumbbell: '<svg viewBox="0 0 24 24" fill="none"><path d="M7 12h10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><rect x="3.2" y="8.5" width="3.2" height="7" rx="1" stroke="currentColor" stroke-width="1.6"/><rect x="17.6" y="8.5" width="3.2" height="7" rx="1" stroke="currentColor" stroke-width="1.6"/><path d="M2 10.5v3M22 10.5v3" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>',
  squats:   '<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="4.3" r="1.9" fill="currentColor"/><path d="M12 7v4.5l-4 6.5M12 11.5l4 6.5M7.5 12.5h9" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  situps:   '<svg viewBox="0 0 24 24" fill="none"><path d="M3 17.5h3.5l2.7-6 4 2 2.6-4.5H20" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><circle cx="4.5" cy="14" r="1.4" fill="currentColor"/></svg>',
  joggen:   '<svg viewBox="0 0 24 24" fill="none"><circle cx="14.5" cy="4.6" r="1.8" fill="currentColor"/><path d="M8.5 21l2.7-5.3-2-2.2 1-4.2 3.3 2.1 3-1.1 2.2 3.1M7.7 12.4l3.1-1.6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  fahrrad:  '<svg viewBox="0 0 24 24" fill="none"><circle cx="5.5" cy="17.5" r="3.2" stroke="currentColor" stroke-width="1.7"/><circle cx="18.5" cy="17.5" r="3.2" stroke="currentColor" stroke-width="1.7"/><path d="M5.5 17.5 9.5 9h5l3.5 8.5M9.5 9 8 6.5h-2M9.5 9l3 5h5.5" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>',
};

const WEEKDAYS = ['Sonntag','Montag','Dienstag','Mittwoch','Donnerstag','Freitag','Samstag'];
const WEEKDAYS_SHORT = ['So','Mo','Di','Mi','Do','Fr','Sa'];
const MONTHS = ['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember'];

/* ============================================================
   STORAGE
============================================================ */
const LOGS_KEY = 'grind_logs_v1';
const SETTINGS_KEY = 'grind_settings_v1';

function loadLogs() {
  let logs;
  try { logs = JSON.parse(localStorage.getItem(LOGS_KEY)) || {}; }
  catch { logs = {}; }
  // migrate old 'running' entries (pre-rename) to 'joggen'
  Object.values(logs).forEach(day => {
    if (day && day.running != null && day.joggen == null) { day.joggen = day.running; delete day.running; }
  });
  return logs;
}
function saveLogs(logs) { localStorage.setItem(LOGS_KEY, JSON.stringify(logs)); }

function loadSettings() {
  try { return { reminderEnabled: false, reminderTime: '19:00', ...(JSON.parse(localStorage.getItem(SETTINGS_KEY)) || {}) }; }
  catch { return { reminderEnabled: false, reminderTime: '19:00' }; }
}
function saveSettings(s) { localStorage.setItem(SETTINGS_KEY, JSON.stringify(s)); }

let LOGS = loadLogs();
let SETTINGS = loadSettings();

function getVal(dateKey, exId) {
  return (LOGS[dateKey] && LOGS[dateKey][exId]) || 0;
}
function setVal(dateKey, exId, val) {
  val = Math.max(0, val);
  if (!LOGS[dateKey]) LOGS[dateKey] = {};
  LOGS[dateKey][exId] = val;
  saveLogs(LOGS);
}
function dayRatio(dateKey, ex) {
  return getVal(dateKey, ex.id) / ex.target;
}
function dayPercent(dateKey) {
  const ratios = GOAL_EXERCISES.map(ex => dayRatio(dateKey, ex));
  return (ratios.reduce((a, b) => a + b, 0) / ratios.length) * 100;
}
function dayComplete(dateKey) {
  return GOAL_EXERCISES.every(ex => dayRatio(dateKey, ex) >= 1);
}
function hasEntry(dateKey) {
  return !!LOGS[dateKey] && Object.values(LOGS[dateKey]).some(v => v > 0);
}

/* ============================================================
   DATE HELPERS
============================================================ */
const pad2 = n => (n < 10 ? '0' + n : '' + n);
function dateKeyOf(d) { return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`; }
function keyToDate(key) { const [y, m, d] = key.split('-').map(Number); return new Date(y, m - 1, d); }
function todayKey() { return dateKeyOf(new Date()); }
function addDays(d, n) { const r = new Date(d); r.setDate(r.getDate() + n); return r; }

/* ============================================================
   DOM HELPERS
============================================================ */
const $ = sel => document.querySelector(sel);
const $$ = sel => Array.from(document.querySelectorAll(sel));
const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };

/* ============================================================
   TODAY VIEW
============================================================ */
let saveToastTimer = null;
function flashSaved() {
  const toast = $('#saveToast');
  toast.classList.add('show');
  clearTimeout(saveToastTimer);
  saveToastTimer = setTimeout(() => toast.classList.remove('show'), 1100);
}

function stepAmount(ex) { return ex.type === 'strength' ? ex.reps : 1; }

function renderExerciseCards() {
  const key = todayKey();
  const wrap = $('#exerciseCards');
  wrap.innerHTML = '';
  GOAL_EXERCISES.forEach(ex => {
    const val = getVal(key, ex.id);
    const ratio = val / ex.target;
    const pct = Math.round(ratio * 100);
    const card = el('div', 'card');
    const targetLabel = `Ziel: ${ex.sets}× ${ex.reps} (${ex.target} Wdh.)`;
    card.innerHTML = `
      <div class="card-top">
        <div style="display:flex; gap:12px; align-items:flex-start;">
          <div class="card-icon">${ICONS[ex.id]}</div>
          <div>
            <div class="card-name">${ex.name}</div>
            <div class="card-target">${targetLabel}</div>
          </div>
        </div>
        <div class="card-pct ${pct >= 100 ? 'over' : ''}">${pct}%</div>
      </div>
      <div class="card-mid">
        <div class="stepper">
          <button class="step-btn" data-act="minus" aria-label="Weniger">−</button>
          <div class="step-value"><b>${val}</b><small>${ex.unit}</small></div>
          <button class="step-btn" data-act="plus" aria-label="Mehr">+</button>
        </div>
      </div>
      <div class="bar"><div class="bar-fill ${pct >= 100 ? 'over' : ''}" style="width:${Math.min(pct, 100)}%"></div></div>
    `;
    card.querySelector('[data-act="plus"]').addEventListener('click', () => bump(ex, stepAmount(ex)));
    card.querySelector('[data-act="minus"]').addEventListener('click', () => bump(ex, -stepAmount(ex)));
    wrap.appendChild(card);
  });
}

function renderExtraCards() {
  const key = todayKey();
  const wrap = $('#extraCards');
  wrap.innerHTML = '';
  EXTRA_EXERCISES.forEach(ex => {
    const val = getVal(key, ex.id);
    const card = el('div', 'card is-cardio is-extra');
    card.innerHTML = `
      <div class="card-top">
        <div style="display:flex; gap:12px; align-items:flex-start;">
          <div class="card-icon">${ICONS[ex.id]}</div>
          <div>
            <div class="card-name">${ex.name}</div>
            <div class="card-target">Kein Tagesziel — nur getrackt</div>
          </div>
        </div>
      </div>
      <div class="card-mid">
        <div class="stepper">
          <button class="step-btn" data-act="minus" aria-label="Weniger">−</button>
          <div class="step-value"><b>${val}</b><small>${ex.unit}</small></div>
          <button class="step-btn" data-act="plus" aria-label="Mehr">+</button>
        </div>
      </div>
    `;
    card.querySelector('[data-act="plus"]').addEventListener('click', () => bump(ex, stepAmount(ex)));
    card.querySelector('[data-act="minus"]').addEventListener('click', () => bump(ex, -stepAmount(ex)));
    wrap.appendChild(card);
  });
}

function bump(ex, delta) {
  const key = todayKey();
  const cur = getVal(key, ex.id);
  setVal(key, ex.id, cur + delta);
  renderExerciseCards();
  renderExtraCards();
  updateRing();
  flashSaved();
}

function updateRing() {
  const key = todayKey();
  const pct = dayPercent(key);
  const circumference = 326.7;
  const capped = Math.min(Math.max(pct, 0), 100);
  const offset = circumference * (1 - capped / 100);
  const ring = $('#ringProgress');
  ring.style.strokeDashoffset = offset;
  ring.style.stroke = pct >= 100 ? '#fff7c2' : 'var(--lime)';
  $('#ringPercent').textContent = Math.round(pct) + '%';
}

function renderTodayHeader() {
  const now = new Date();
  $('#todayDate').textContent = `${WEEKDAYS[now.getDay()]}, ${now.getDate()}. ${MONTHS[now.getMonth()]}`;
}

/* ============================================================
   HISTORY VIEW
============================================================ */
function renderHistory() {
  const keys = Object.keys(LOGS).filter(hasEntry).sort((a, b) => b.localeCompare(a));
  const list = $('#historyList');
  list.innerHTML = '';
  $('#historyEmpty').hidden = keys.length > 0;

  // stat row: total days logged, current streak, best streak
  const { current, best } = computeStreaks();
  $('#historyStatRow').innerHTML = statBox(keys.length, 'Tage geloggt') + statBox(current, 'Streak (Tage)') + statBox(best, 'Beste Streak');

  let lastMonth = null;
  keys.forEach(key => {
    const d = keyToDate(key);
    const monthLabel = `${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
    if (monthLabel !== lastMonth) {
      list.appendChild(el('div', 'history-month', monthLabel));
      lastMonth = monthLabel;
    }
    const pct = Math.round(dayPercent(key));
    const row = el('div', 'history-row');
    const dots = GOAL_EXERCISES.map(ex => {
      const r = dayRatio(key, ex);
      const cls = r >= 1.5 ? 'over' : r >= 1 ? 'hit' : r > 0 ? 'partial' : '';
      return `<span class="dot ${cls}"></span>`;
    }).join('');
    row.innerHTML = `
      <div class="history-date"><b>${d.getDate()}.</b><span>${WEEKDAYS_SHORT[d.getDay()]}</span></div>
      <div class="history-dots">${dots}</div>
      <div class="history-total ${pct >= 100 ? 'full' : ''}">${pct}%</div>
    `;
    row.addEventListener('click', () => openDayDetail(key));
    list.appendChild(row);
  });
}

function statBox(value, label) {
  return `<div class="stat-box"><b>${value}</b><span>${label}</span></div>`;
}

function computeStreaks() {
  const keys = Object.keys(LOGS).filter(hasEntry);
  const set = new Set(keys);
  // current streak
  let current = 0;
  let cursor = new Date();
  const tKey = todayKey();
  if (!(set.has(tKey) && dayComplete(tKey))) {
    cursor = addDays(cursor, -1); // grace: today not finished yet, start from yesterday
  }
  while (true) {
    const k = dateKeyOf(cursor);
    if (set.has(k) && dayComplete(k)) { current++; cursor = addDays(cursor, -1); }
    else break;
  }
  // best streak over all history
  const sortedKeys = keys.filter(k => dayComplete(k)).sort();
  let best = 0, run = 0, prev = null;
  sortedKeys.forEach(k => {
    if (prev) {
      const diff = (keyToDate(k) - keyToDate(prev)) / 86400000;
      run = diff === 1 ? run + 1 : 1;
    } else run = 1;
    best = Math.max(best, run);
    prev = k;
  });
  return { current, best: Math.max(best, current) };
}

/* ============================================================
   DAY DETAIL MODAL (view + edit any past day)
============================================================ */
let activeDayKey = null;
function openDayDetail(key) {
  activeDayKey = key;
  const d = keyToDate(key);
  $('#dayTitle').textContent = `${WEEKDAYS[d.getDay()]}, ${d.getDate()}. ${MONTHS[d.getMonth()]}`;
  renderDayDetailBody();
  openSheet('#dayBackdrop');
}
function renderDayDetailBody() {
  const key = activeDayKey;
  const body = $('#dayDetailBody');
  body.innerHTML = '';
  EXERCISES.forEach(ex => {
    const val = getVal(key, ex.id);
    const pct = ex.hasTarget ? Math.round((val / ex.target) * 100) : null;
    const detailLine = ex.hasTarget ? `${ex.sets}× ${ex.reps} Ziel · ${pct}%` : 'Kein Ziel — nur getrackt';
    const row = el('div', 'day-item');
    row.innerHTML = `
      <div>
        <div class="dn">${ex.name}</div>
        <div class="dt">${detailLine}</div>
      </div>
      <div class="stepper">
        <button class="step-btn" data-act="minus">−</button>
        <div class="dv ${pct !== null && pct >= 100 ? 'over' : ''}" style="min-width:54px;text-align:center;">${val}<small style="display:block;font-family:var(--font-body);font-size:9px;color:var(--text-faint);">${ex.unit}</small></div>
        <button class="step-btn" data-act="plus">+</button>
      </div>
    `;
    row.querySelector('[data-act="plus"]').addEventListener('click', () => { setVal(key, ex.id, getVal(key, ex.id) + stepAmount(ex)); renderDayDetailBody(); refreshAll(); });
    row.querySelector('[data-act="minus"]').addEventListener('click', () => { setVal(key, ex.id, getVal(key, ex.id) - stepAmount(ex)); renderDayDetailBody(); refreshAll(); });
    body.appendChild(row);
  });
}

/* ============================================================
   ANALYSIS VIEW
============================================================ */
function renderAnalysis() {
  const loggedKeys = Object.keys(LOGS).filter(hasEntry);
  const { current, best } = computeStreaks();
  const last30 = rangeKeys(30);
  const overDays = last30.filter(k => hasEntry(k) && dayPercent(k) > 100);
  $('#analysisStatRow').innerHTML =
    statBox(current, 'Aktuelle Streak') +
    statBox(best, 'Beste Streak') +
    statBox(overDays.length, 'Über 100% (30T)');

  renderDailyChart();
  renderPerExercise();
  renderExtraStats();
  renderOverachieve(overDays);
}

function rangeKeys(n) {
  const arr = [];
  for (let i = n - 1; i >= 0; i--) arr.push(dateKeyOf(addDays(new Date(), -i)));
  return arr;
}

function renderDailyChart() {
  const days = rangeKeys(14);
  const data = days.map(k => ({ key: k, pct: hasEntry(k) ? dayPercent(k) : 0 }));
  const w = 320, h = 150, padB = 20, padT = 10;
  const barW = (w / data.length) * 0.62;
  const gap = (w / data.length);
  const maxScale = Math.max(100, ...data.map(d => d.pct)) * 1.05;

  let bars = '';
  data.forEach((d, i) => {
    const x = i * gap + (gap - barW) / 2;
    const barH = Math.max(2, (Math.min(d.pct, maxScale) / maxScale) * (h - padB - padT));
    const y = h - padB - barH;
    const color = d.pct >= 100 ? '#fff7c2' : d.pct > 0 ? 'var(--lime)' : '#26292f';
    const dd = keyToDate(d.key);
    bars += `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${barW.toFixed(1)}" height="${barH.toFixed(1)}" rx="3" fill="${color}"/>`;
    bars += `<text x="${(x + barW / 2).toFixed(1)}" y="${h - 5}" font-size="8" fill="#5c6067" text-anchor="middle">${WEEKDAYS_SHORT[dd.getDay()][0]}</text>`;
  });
  // 100% guideline
  const guideY = h - padB - (100 / maxScale) * (h - padB - padT);
  bars += `<line x1="0" y1="${guideY.toFixed(1)}" x2="${w}" y2="${guideY.toFixed(1)}" stroke="#3a3d44" stroke-width="1" stroke-dasharray="3,3"/>`;

  $('#chartDaily').innerHTML = `<svg viewBox="0 0 ${w} ${h}" style="width:100%; height:150px; display:block;">${bars}</svg>`;
}

function renderPerExercise() {
  const week = rangeKeys(7);
  const wrap = $('#perExercise');
  wrap.innerHTML = '';
  GOAL_EXERCISES.forEach(ex => {
    const total = week.reduce((s, k) => s + getVal(k, ex.id), 0);
    const targetWeek = ex.target * 7;
    const pct = Math.min(100, Math.round((total / targetWeek) * 100));
    const row = el('div', 'pe-row');
    row.innerHTML = `
      <div class="pe-head"><b>${ex.name}</b><span>${total} / ${targetWeek} ${ex.unit}</span></div>
      <div class="pe-bar"><i style="width:${pct}%"></i></div>
    `;
    wrap.appendChild(row);
  });
}

function renderExtraStats() {
  const week = rangeKeys(7);
  const month = rangeKeys(30);
  const wrap = $('#extraStats');
  if (!wrap) return;
  wrap.innerHTML = '';
  EXTRA_EXERCISES.forEach(ex => {
    const weekTotal = week.reduce((s, k) => s + getVal(k, ex.id), 0);
    const monthTotal = month.reduce((s, k) => s + getVal(k, ex.id), 0);
    const row = el('div', 'pe-row');
    row.innerHTML = `<div class="pe-head"><b>${ex.name}</b><span>${weekTotal} ${ex.unit} diese Woche · ${monthTotal} ${ex.unit} (30 Tage)</span></div>`;
    wrap.appendChild(row);
  });
}

function renderOverachieve(overDays) {
  const wrap = $('#overachieve');
  if (!overDays.length) {
    wrap.innerHTML = '<div class="oa-empty">Noch keine Tage über 100% in den letzten 30 Tagen. Leg los! 🚀</div>';
    return;
  }
  const sorted = overDays.slice().sort((a, b) => dayPercent(b) - dayPercent(a)).slice(0, 6);
  wrap.innerHTML = sorted.map(k => {
    const d = keyToDate(k);
    return `<div class="oa-row"><span>${d.getDate()}. ${MONTHS[d.getMonth()]}</span><b>${Math.round(dayPercent(k))}%</b></div>`;
  }).join('');
}

/* ============================================================
   REFRESH / NAV
============================================================ */
function refreshAll() {
  renderExerciseCards();
  renderExtraCards();
  updateRing();
  renderHistory();
  renderAnalysis();
}

function setActiveView(target) {
  $$('.view').forEach(v => v.classList.toggle('view-active', v.dataset.view === target));
  $$('.nav-btn').forEach(b => b.classList.toggle('nav-active', b.dataset.target === target));
  if (target === 'history') renderHistory();
  if (target === 'analysis') renderAnalysis();
}

$$('.nav-btn').forEach(btn => btn.addEventListener('click', () => setActiveView(btn.dataset.target)));

/* ============================================================
   SHEETS
============================================================ */
function openSheet(sel) { $(sel).classList.add('open'); }
function closeSheet(sel) { $(sel).classList.remove('open'); }

$('#settingsBtn').addEventListener('click', () => { syncSettingsUI(); openSheet('#settingsBackdrop'); });
$('#closeSettings').addEventListener('click', () => closeSheet('#settingsBackdrop'));
$('#settingsBackdrop').addEventListener('click', e => { if (e.target.id === 'settingsBackdrop') closeSheet('#settingsBackdrop'); });

$('#closeDay').addEventListener('click', () => closeSheet('#dayBackdrop'));
$('#dayBackdrop').addEventListener('click', e => { if (e.target.id === 'dayBackdrop') closeSheet('#dayBackdrop'); });

$('#resetBtn').addEventListener('click', () => {
  if (confirm('Wirklich ALLE Trainingsdaten unwiderruflich löschen?')) {
    LOGS = {};
    saveLogs(LOGS);
    refreshAll();
    closeSheet('#settingsBackdrop');
  }
});

/* ============================================================
   REMINDER / NOTIFICATIONS
============================================================ */
function syncSettingsUI() {
  $('#reminderToggle').checked = SETTINGS.reminderEnabled;
  $('#reminderTime').value = SETTINGS.reminderTime;
  $('#reminderTimeRow').style.display = SETTINGS.reminderEnabled ? 'flex' : 'none';
  updateNotifNote();
}

function updateNotifNote() {
  const note = $('#notifNote');
  if (!('Notification' in window)) {
    note.textContent = 'Dein Browser unterstützt keine Benachrichtigungen.';
  } else if (Notification.permission === 'denied') {
    note.textContent = 'Benachrichtigungen sind blockiert. Erlaube sie in den Browser-Einstellungen dieser Seite.';
  } else if (!window.isSecureContext) {
    note.textContent = 'Für Erinnerungen muss die App über HTTPS aufgerufen werden (z. B. nach Installation von einer gehosteten Adresse).';
  } else {
    note.textContent = 'Hinweis: Erinnerungen funktionieren zuverlässig, solange dein Handy/Browser regelmäßig läuft. Für 100% sichere Erinnerung zusätzlich einen Wecker/Alarm auf deinem Handy stellen.';
  }
}

$('#reminderToggle').addEventListener('change', async e => {
  if (e.target.checked) {
    if ('Notification' in window && Notification.permission !== 'granted') {
      const perm = await Notification.requestPermission();
      if (perm !== 'granted') { e.target.checked = false; updateNotifNote(); return; }
    }
    SETTINGS.reminderEnabled = true;
    saveSettings(SETTINGS);
    scheduleReminder();
    tryPeriodicSync();
  } else {
    SETTINGS.reminderEnabled = false;
    saveSettings(SETTINGS);
  }
  $('#reminderTimeRow').style.display = SETTINGS.reminderEnabled ? 'flex' : 'none';
  updateNotifNote();
});

$('#reminderTime').addEventListener('change', e => {
  SETTINGS.reminderTime = e.target.value;
  saveSettings(SETTINGS);
  scheduleReminder();
});

let reminderTimer = null;
function scheduleReminder() {
  clearTimeout(reminderTimer);
  if (!SETTINGS.reminderEnabled) return;
  const [hh, mm] = SETTINGS.reminderTime.split(':').map(Number);
  const now = new Date();
  let target = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hh, mm, 0, 0);
  if (target <= now) target = addDays(target, 1);
  const ms = target - now;
  reminderTimer = setTimeout(fireReminderIfNeeded, ms);
}

function fireReminderIfNeeded() {
  if (SETTINGS.reminderEnabled && !dayComplete(todayKey())) {
    showLocalNotification();
  }
  scheduleReminder(); // schedule tomorrow
}

function showLocalNotification() {
  const body = 'Du hast dein Tagesziel noch nicht erreicht — Zeit für ein paar Übungen! 💪';
  if (navigator.serviceWorker && navigator.serviceWorker.controller) {
    navigator.serviceWorker.ready.then(reg => reg.showNotification('GRIND — Training nicht vergessen', {
      body, icon: 'icons/icon-192.png', badge: 'icons/icon-192.png', tag: 'grind-reminder'
    }));
  } else if ('Notification' in window && Notification.permission === 'granted') {
    new Notification('GRIND — Training nicht vergessen', { body, icon: 'icons/icon-192.png' });
  }
}

async function tryPeriodicSync() {
  try {
    const reg = await navigator.serviceWorker.ready;
    if ('periodicSync' in reg) {
      const status = await navigator.permissions.query({ name: 'periodic-background-sync' });
      if (status.state === 'granted') {
        await reg.periodicSync.register('daily-reminder', { minInterval: 24 * 60 * 60 * 1000 });
      }
    }
  } catch { /* best-effort only, ignored on unsupported browsers */ }
}

/* ============================================================
   SERVICE WORKER
============================================================ */
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  });
}

/* ============================================================
   INIT
============================================================ */
renderTodayHeader();
refreshAll();
syncSettingsUI();
if (SETTINGS.reminderEnabled && 'Notification' in window && Notification.permission === 'granted') {
  scheduleReminder();
  tryPeriodicSync();
}
