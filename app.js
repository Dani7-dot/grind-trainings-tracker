'use strict';

/* ============================================================
   CONFIG
============================================================ */
const ICONS = {
  pushups:  '<svg viewBox="0 0 24 24" fill="none"><path d="M2 16h20M6 16v-5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v5M9 9V7M15 9V7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  dumbbell: '<svg viewBox="0 0 24 24" fill="none"><path d="M7 12h10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><rect x="3.2" y="8.5" width="3.2" height="7" rx="1" stroke="currentColor" stroke-width="1.6"/><rect x="17.6" y="8.5" width="3.2" height="7" rx="1" stroke="currentColor" stroke-width="1.6"/><path d="M2 10.5v3M22 10.5v3" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>',
  squats:   '<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="4.3" r="1.9" fill="currentColor"/><path d="M12 7v4.5l-4 6.5M12 11.5l4 6.5M7.5 12.5h9" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  situps:   '<svg viewBox="0 0 24 24" fill="none"><path d="M3 17.5h3.5l2.7-6 4 2 2.6-4.5H20" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><circle cx="4.5" cy="14" r="1.4" fill="currentColor"/></svg>',
  joggen:   '<svg viewBox="0 0 24 24" fill="none"><circle cx="14.5" cy="4.6" r="1.8" fill="currentColor"/><path d="M8.5 21l2.7-5.3-2-2.2 1-4.2 3.3 2.1 3-1.1 2.2 3.1M7.7 12.4l3.1-1.6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  fahrrad:  '<svg viewBox="0 0 24 24" fill="none"><circle cx="5.5" cy="17.5" r="3.2" stroke="currentColor" stroke-width="1.7"/><circle cx="18.5" cy="17.5" r="3.2" stroke="currentColor" stroke-width="1.7"/><path d="M5.5 17.5 9.5 9h5l3.5 8.5M9.5 9 8 6.5h-2M9.5 9l3 5h5.5" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  water:    '<svg viewBox="0 0 24 24" fill="none"><path d="M12 3s6 6.5 6 11a6 6 0 1 1-12 0c0-4.5 6-11 6-11Z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/></svg>',
  custom:   '<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.7"/><path d="M12 8v8M8 12h8" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>',
};
const ICON_KEYS = ['pushups', 'dumbbell', 'squats', 'situps', 'joggen', 'fahrrad', 'water', 'custom'];

const DEFAULT_EXERCISES = [
  { id: 'pushups',  name: 'Liegestütze',    type: 'strength', hasTarget: true,  sets: 3, reps: 10, unit: 'Wdh.', icon: 'pushups' },
  { id: 'dumbbell', name: 'Kurzhanteln',    type: 'strength', hasTarget: true,  sets: 3, reps: 15, unit: 'Wdh.', icon: 'dumbbell' },
  { id: 'squats',   name: 'Kniebeuge',      type: 'strength', hasTarget: true,  sets: 3, reps: 20, unit: 'Wdh.', icon: 'squats' },
  { id: 'situps',   name: 'Situps',         type: 'strength', hasTarget: true,  sets: 3, reps: 15, unit: 'Wdh.', icon: 'situps' },
  { id: 'joggen',   name: 'Joggen',         type: 'cardio',   hasTarget: false, unit: 'km', step: 0.1, icon: 'joggen' },
  { id: 'fahrrad',  name: 'Fahrrad fahren', type: 'cardio',   hasTarget: false, unit: 'km', step: 0.1, icon: 'fahrrad' },
];

const WATER_QUICK_AMOUNTS = [200, 330, 500, 750, 1000];

const WEEKDAYS = ['Sonntag','Montag','Dienstag','Mittwoch','Donnerstag','Freitag','Samstag'];
const WEEKDAYS_SHORT = ['So','Mo','Di','Mi','Do','Fr','Sa'];
const MONTHS = ['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember'];

/* ============================================================
   STORAGE
============================================================ */
const LOGS_KEY = 'grind_logs_v1';
const SETTINGS_KEY = 'grind_settings_v1';
const EXERCISES_KEY = 'grind_exercises_v1';
const WATER_KEY = 'grind_water_v1';

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

function loadWater() {
  try { return JSON.parse(localStorage.getItem(WATER_KEY)) || {}; }
  catch { return {}; }
}
function saveWater(w) { localStorage.setItem(WATER_KEY, JSON.stringify(w)); }

function recalcTargets(list) {
  list.forEach(ex => { if (ex.hasTarget) ex.target = ex.sets * ex.reps; });
  return list;
}

function loadExercises() {
  let list;
  try { list = JSON.parse(localStorage.getItem(EXERCISES_KEY)); }
  catch { list = null; }
  if (!Array.isArray(list) || !list.length) {
    list = DEFAULT_EXERCISES.map(e => ({ ...e }));
    // one-time migration from an earlier version that stored per-exercise overrides in settings
    try {
      const legacy = JSON.parse(localStorage.getItem(SETTINGS_KEY));
      if (legacy && legacy.targets) {
        list.forEach(ex => {
          const t = legacy.targets[ex.id];
          if (t && ex.hasTarget) { ex.sets = t.sets; ex.reps = t.reps; }
        });
      }
    } catch { /* no legacy settings to migrate */ }
  }
  return recalcTargets(list);
}
function saveExercises(list) { localStorage.setItem(EXERCISES_KEY, JSON.stringify(list)); }

function loadSettings() {
  let s;
  try { s = JSON.parse(localStorage.getItem(SETTINGS_KEY)) || {}; }
  catch { s = {}; }
  const merged = {
    reminderEnabled: false,
    reminderTimes: ['19:00'],
    weeklyReminder: { enabled: false, weekday: 0, time: '19:00' },
    theme: 'dark',
    waterGoal: 2000,
    ...s,
  };
  if (s.reminderTime && (!Array.isArray(s.reminderTimes) || !s.reminderTimes.length)) {
    merged.reminderTimes = [s.reminderTime];
  }
  if (!Array.isArray(merged.reminderTimes) || !merged.reminderTimes.length) merged.reminderTimes = ['19:00'];
  if (!merged.weeklyReminder) merged.weeklyReminder = { enabled: false, weekday: 0, time: '19:00' };
  delete merged.targets;
  delete merged.reminderTime;
  return merged;
}
function saveSettings(s) { localStorage.setItem(SETTINGS_KEY, JSON.stringify(s)); }

let EXERCISES = loadExercises();
saveExercises(EXERCISES);
let LOGS = loadLogs();
let WATER = loadWater();
let SETTINGS = loadSettings();

function goalExercises() { return EXERCISES.filter(e => e.hasTarget); }
function extraExercises() { return EXERCISES.filter(e => !e.hasTarget); }
function iconFor(ex) { return ICONS[ex.icon] || ICONS.custom; }

function fmtNum(n) {
  if (!isFinite(n)) return '0';
  const r = Math.round(n * 100) / 100;
  return String(r);
}

function getVal(dateKey, exId) {
  return (LOGS[dateKey] && LOGS[dateKey][exId]) || 0;
}
function setVal(dateKey, exId, val) {
  val = Math.max(0, Math.round(val * 100) / 100);
  if (!LOGS[dateKey]) LOGS[dateKey] = {};
  LOGS[dateKey][exId] = val;
  saveLogs(LOGS);
}
function dayRatio(dateKey, ex) {
  return getVal(dateKey, ex.id) / ex.target;
}
function dayPercent(dateKey) {
  const list = goalExercises();
  if (!list.length) return 0;
  const ratios = list.map(ex => dayRatio(dateKey, ex));
  return (ratios.reduce((a, b) => a + b, 0) / ratios.length) * 100;
}
function dayComplete(dateKey) {
  const list = goalExercises();
  if (!list.length) return false;
  return list.every(ex => dayRatio(dateKey, ex) >= 1);
}
function hasEntry(dateKey) {
  return !!LOGS[dateKey] && Object.values(LOGS[dateKey]).some(v => v > 0);
}

function waterTotal(dateKey) {
  return (WATER[dateKey] || []).reduce((s, e) => s + e.amount, 0);
}
function nowTimeString() {
  const d = new Date();
  return pad2(d.getHours()) + ':' + pad2(d.getMinutes());
}
function addWaterEntry(dateKey, amount) {
  if (!WATER[dateKey]) WATER[dateKey] = [];
  WATER[dateKey].push({ id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6), time: nowTimeString(), amount });
  saveWater(WATER);
}
function removeWaterEntry(dateKey, id) {
  if (!WATER[dateKey]) return;
  WATER[dateKey] = WATER[dateKey].filter(e => e.id !== id);
  saveWater(WATER);
}

/* ============================================================
   DATE HELPERS
============================================================ */
const pad2 = n => (n < 10 ? '0' + n : '' + n);
function dateKeyOf(d) { return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`; }
function keyToDate(key) { const [y, m, d] = key.split('-').map(Number); return new Date(y, m - 1, d); }
function todayKey() { return dateKeyOf(new Date()); }
function addDays(d, n) { const r = new Date(d); r.setDate(r.getDate() + n); return r; }
function rangeKeys(n) {
  const arr = [];
  for (let i = n - 1; i >= 0; i--) arr.push(dateKeyOf(addDays(new Date(), -i)));
  return arr;
}

/* ============================================================
   DOM HELPERS
============================================================ */
const $ = sel => document.querySelector(sel);
const $$ = sel => Array.from(document.querySelectorAll(sel));
const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };

/* ============================================================
   THEME
============================================================ */
function applyTheme() {
  document.documentElement.dataset.theme = SETTINGS.theme === 'light' ? 'light' : 'dark';
}

/* ============================================================
   TODAY VIEW — GOAL & EXTRA CARDS
============================================================ */
let saveToastTimer = null;
function flashSaved() {
  const toast = $('#saveToast');
  toast.classList.add('show');
  clearTimeout(saveToastTimer);
  saveToastTimer = setTimeout(() => toast.classList.remove('show'), 1100);
}

function stepAmount(ex) { return ex.hasTarget ? ex.reps : (ex.step || 1); }

function promptSetValue(ex, dateKey) {
  const key = dateKey || todayKey();
  const current = getVal(key, ex.id);
  const label = key === todayKey() ? 'heute' : `am ${keyToDate(key).getDate()}.${keyToDate(key).getMonth() + 1}.`;
  const input = prompt(`${ex.name} — Wert für ${label} eingeben (${ex.unit}):`, fmtNum(current));
  if (input === null) return;
  const num = parseFloat(String(input).replace(',', '.'));
  if (isNaN(num) || num < 0) { alert('Bitte eine gültige, positive Zahl eingeben.'); return; }
  setVal(key, ex.id, num);
  refreshAll();
  if (key !== todayKey()) { renderDayDetailBody(); renderDayWaterBody(); }
}

function renderExerciseCards() {
  const key = todayKey();
  const wrap = $('#exerciseCards');
  wrap.innerHTML = '';
  goalExercises().forEach(ex => {
    const val = getVal(key, ex.id);
    const ratio = val / ex.target;
    const pct = Math.round(ratio * 100);
    const card = el('div', 'card');
    const targetLabel = `Ziel: ${ex.sets}× ${ex.reps} (${ex.target} Wdh.)`;
    card.innerHTML = `
      <div class="card-top">
        <div style="display:flex; gap:12px; align-items:flex-start;">
          <div class="card-icon">${iconFor(ex)}</div>
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
          <div class="step-value" data-act="set"><b>${fmtNum(val)}</b><small>${ex.unit}</small></div>
          <button class="step-btn" data-act="plus" aria-label="Mehr">+</button>
        </div>
      </div>
      <div class="bar"><div class="bar-fill ${pct >= 100 ? 'over' : ''}" style="width:${Math.min(pct, 100)}%"></div></div>
    `;
    card.querySelector('[data-act="plus"]').addEventListener('click', () => bump(ex, stepAmount(ex)));
    card.querySelector('[data-act="minus"]').addEventListener('click', () => bump(ex, -stepAmount(ex)));
    card.querySelector('[data-act="set"]').addEventListener('click', () => promptSetValue(ex));
    wrap.appendChild(card);
  });
}

function renderExtraCards() {
  const key = todayKey();
  const wrap = $('#extraCards');
  wrap.innerHTML = '';
  extraExercises().forEach(ex => {
    const val = getVal(key, ex.id);
    const card = el('div', 'card is-cardio is-extra');
    card.innerHTML = `
      <div class="card-top">
        <div style="display:flex; gap:12px; align-items:flex-start;">
          <div class="card-icon">${iconFor(ex)}</div>
          <div>
            <div class="card-name">${ex.name}</div>
            <div class="card-target">Kein Tagesziel — nur getrackt</div>
          </div>
        </div>
      </div>
      <div class="card-mid">
        <div class="stepper">
          <button class="step-btn" data-act="minus" aria-label="Weniger">−</button>
          <div class="step-value" data-act="set"><b>${fmtNum(val)}</b><small>${ex.unit}</small></div>
          <button class="step-btn" data-act="plus" aria-label="Mehr">+</button>
        </div>
      </div>
    `;
    card.querySelector('[data-act="plus"]').addEventListener('click', () => bump(ex, stepAmount(ex)));
    card.querySelector('[data-act="minus"]').addEventListener('click', () => bump(ex, -stepAmount(ex)));
    card.querySelector('[data-act="set"]').addEventListener('click', () => promptSetValue(ex));
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
   WATER — TODAY
============================================================ */
function renderWaterQuickButtons() {
  const wrap = $('#waterQuick');
  wrap.innerHTML = '';
  WATER_QUICK_AMOUNTS.forEach(a => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = a >= 1000 ? `+${fmtNum(a / 1000)} L` : `+${a} ml`;
    btn.addEventListener('click', () => {
      addWaterEntry(todayKey(), a);
      renderWaterToday();
      renderHistory();
      renderAnalysis();
      flashSaved();
    });
    wrap.appendChild(btn);
  });
}

function renderWaterToday() {
  const key = todayKey();
  const entries = (WATER[key] || []).slice().sort((a, b) => (a.time < b.time ? 1 : -1));
  const total = waterTotal(key);
  $('#waterTotalVal').textContent = total;
  $('#waterBarFill').style.width = Math.min(100, (total / (SETTINGS.waterGoal || 2000)) * 100) + '%';
  $('#waterLast').textContent = entries.length ? `Letztes: ${entries[0].time} Uhr` : 'Noch nichts getrunken';
  const log = $('#waterLog');
  log.innerHTML = '';
  if (!entries.length) { log.innerHTML = '<div class="water-log-empty">Noch keine Einträge heute</div>'; return; }
  entries.forEach(e => {
    const row = el('div', 'water-log-row', `<span>${e.time} Uhr · ${e.amount} ml</span>`);
    const btn = document.createElement('button');
    btn.type = 'button'; btn.textContent = '×';
    btn.addEventListener('click', () => { removeWaterEntry(key, e.id); renderWaterToday(); renderHistory(); renderAnalysis(); });
    row.appendChild(btn);
    log.appendChild(row);
  });
}

/* ============================================================
   HISTORY VIEW
============================================================ */
function renderHistory() {
  const keys = Object.keys(LOGS).filter(hasEntry).sort((a, b) => b.localeCompare(a));
  const list = $('#historyList');
  list.innerHTML = '';
  $('#historyEmpty').hidden = keys.length > 0;

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
    const dots = goalExercises().map(ex => {
      const r = dayRatio(key, ex);
      const cls = r >= 1.5 ? 'over' : r >= 1 ? 'hit' : r > 0 ? 'partial' : '';
      return `<span class="dot ${cls}"></span>`;
    }).join('');
    const water = waterTotal(key);
    row.innerHTML = `
      <div class="history-date"><b>${d.getDate()}.</b><span>${WEEKDAYS_SHORT[d.getDay()]}</span></div>
      <div class="history-dots">${dots}</div>
      ${water ? `<div class="history-water">💧${(water / 1000).toFixed(1)}L</div>` : ''}
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
  let current = 0;
  let cursor = new Date();
  const tKey = todayKey();
  if (!(set.has(tKey) && dayComplete(tKey))) {
    cursor = addDays(cursor, -1);
  }
  while (true) {
    const k = dateKeyOf(cursor);
    if (set.has(k) && dayComplete(k)) { current++; cursor = addDays(cursor, -1); }
    else break;
  }
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
   DAY DETAIL MODAL
============================================================ */
let activeDayKey = null;
function openDayDetail(key) {
  activeDayKey = key;
  const d = keyToDate(key);
  $('#dayTitle').textContent = `${WEEKDAYS[d.getDay()]}, ${d.getDate()}. ${MONTHS[d.getMonth()]}`;
  renderDayDetailBody();
  renderDayWaterBody();
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
        <div class="dv ${pct !== null && pct >= 100 ? 'over' : ''}" data-act="set" style="min-width:54px;text-align:center;cursor:pointer;">${fmtNum(val)}<small style="display:block;font-family:var(--font-body);font-size:9px;color:var(--text-faint);">${ex.unit}</small></div>
        <button class="step-btn" data-act="plus">+</button>
      </div>
    `;
    row.querySelector('[data-act="plus"]').addEventListener('click', () => { setVal(key, ex.id, getVal(key, ex.id) + stepAmount(ex)); renderDayDetailBody(); refreshAll(); });
    row.querySelector('[data-act="minus"]').addEventListener('click', () => { setVal(key, ex.id, getVal(key, ex.id) - stepAmount(ex)); renderDayDetailBody(); refreshAll(); });
    row.querySelector('[data-act="set"]').addEventListener('click', () => promptSetValue(ex, key));
    body.appendChild(row);
  });
}
function renderDayWaterBody() {
  const key = activeDayKey;
  const wrap = $('#dayWaterBody');
  const entries = (WATER[key] || []).slice().sort((a, b) => (a.time < b.time ? 1 : -1));
  const total = waterTotal(key);
  wrap.innerHTML = `<h3 class="day-water-title">💧 Wasser — ${total} ml</h3>`;
  const log = el('div', 'water-log');
  if (!entries.length) {
    log.innerHTML = '<div class="water-log-empty">Keine Einträge</div>';
  } else {
    entries.forEach(e => {
      const row = el('div', 'water-log-row', `<span>${e.time} Uhr · ${e.amount} ml</span>`);
      const btn = document.createElement('button');
      btn.type = 'button'; btn.textContent = '×';
      btn.addEventListener('click', () => { removeWaterEntry(key, e.id); renderDayWaterBody(); refreshAll(); });
      row.appendChild(btn);
      log.appendChild(row);
    });
  }
  wrap.appendChild(log);
}

/* ============================================================
   ANALYSIS VIEW
============================================================ */
function renderAnalysis() {
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
  renderWaterStats();
  renderWaterChart();
  renderBestStats();
  renderOverachieve(overDays);
}

function renderDailyChart() {
  const days = rangeKeys(14);
  const data = days.map(k => ({ key: k, pct: hasEntry(k) ? dayPercent(k) : 0 }));
  const w = 320, h = 150, padB = 20, padT = 10;
  const barW = (w / data.length) * 0.62;
  const gap = (w / data.length);
  const maxScale = Math.max(100, ...data.map(d => d.pct || 0)) * 1.05 || 100;

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
  const guideY = h - padB - (100 / maxScale) * (h - padB - padT);
  bars += `<line x1="0" y1="${guideY.toFixed(1)}" x2="${w}" y2="${guideY.toFixed(1)}" stroke="#3a3d44" stroke-width="1" stroke-dasharray="3,3"/>`;

  $('#chartDaily').innerHTML = `<svg viewBox="0 0 ${w} ${h}" style="width:100%; height:150px; display:block;">${bars}</svg>`;
}

function renderPerExercise() {
  const week = rangeKeys(7);
  const wrap = $('#perExercise');
  wrap.innerHTML = '';
  goalExercises().forEach(ex => {
    const total = week.reduce((s, k) => s + getVal(k, ex.id), 0);
    const targetWeek = ex.target * 7;
    const pct = Math.min(100, Math.round((total / targetWeek) * 100));
    const row = el('div', 'pe-row');
    row.innerHTML = `
      <div class="pe-head"><b>${ex.name}</b><span>${fmtNum(total)} / ${targetWeek} ${ex.unit}</span></div>
      <div class="pe-bar"><i style="width:${pct}%"></i></div>
    `;
    wrap.appendChild(row);
  });
}

function renderExtraStats() {
  const week = rangeKeys(7);
  const month = rangeKeys(30);
  const wrap = $('#extraStats');
  wrap.innerHTML = '';
  extraExercises().forEach(ex => {
    const weekTotal = week.reduce((s, k) => s + getVal(k, ex.id), 0);
    const monthTotal = month.reduce((s, k) => s + getVal(k, ex.id), 0);
    const row = el('div', 'pe-row');
    row.innerHTML = `<div class="pe-head"><b>${ex.name}</b><span>${fmtNum(weekTotal)} ${ex.unit} diese Woche · ${fmtNum(monthTotal)} ${ex.unit} (30 Tage)</span></div>`;
    wrap.appendChild(row);
  });
  if (!extraExercises().length) wrap.innerHTML = '<div class="oa-empty">Keine Extra-Aktivitäten angelegt.</div>';
}

function renderWaterStats() {
  const week = rangeKeys(7);
  const month = rangeKeys(30);
  const weekAvg = Math.round(week.reduce((s, k) => s + waterTotal(k), 0) / 7);
  const monthAvg = Math.round(month.reduce((s, k) => s + waterTotal(k), 0) / 30);
  const goal = SETTINGS.waterGoal || 2000;
  $('#waterStats').innerHTML = `<div class="pe-row"><div class="pe-head"><b>Ø pro Tag</b><span>${weekAvg} ml (7T) · ${monthAvg} ml (30T) · Ziel ${goal} ml</span></div></div>`;
}

function renderWaterChart() {
  const days = rangeKeys(14);
  const data = days.map(k => ({ key: k, val: waterTotal(k) }));
  const goal = SETTINGS.waterGoal || 2000;
  const w = 320, h = 150, padB = 20, padT = 10;
  const barW = (w / data.length) * 0.62;
  const gap = (w / data.length);
  const maxScale = Math.max(goal, ...data.map(d => d.val)) * 1.05 || 1;

  let bars = '';
  data.forEach((d, i) => {
    const x = i * gap + (gap - barW) / 2;
    const barH = Math.max(2, (Math.min(d.val, maxScale) / maxScale) * (h - padB - padT));
    const y = h - padB - barH;
    const color = d.val >= goal ? 'var(--water)' : d.val > 0 ? 'var(--water-dim)' : '#26292f';
    const dd = keyToDate(d.key);
    bars += `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${barW.toFixed(1)}" height="${barH.toFixed(1)}" rx="3" fill="${color}"/>`;
    bars += `<text x="${(x + barW / 2).toFixed(1)}" y="${h - 5}" font-size="8" fill="#5c6067" text-anchor="middle">${WEEKDAYS_SHORT[dd.getDay()][0]}</text>`;
  });
  const guideY = h - padB - (goal / maxScale) * (h - padB - padT);
  bars += `<line x1="0" y1="${guideY.toFixed(1)}" x2="${w}" y2="${guideY.toFixed(1)}" stroke="#3a3d44" stroke-width="1" stroke-dasharray="3,3"/>`;

  $('#chartWater').innerHTML = `<svg viewBox="0 0 ${w} ${h}" style="width:100%; height:150px; display:block;">${bars}</svg>`;
}

function renderBestStats() {
  const keys = Object.keys(LOGS).filter(hasEntry);
  const wrap = $('#bestStats');
  if (!keys.length) { wrap.innerHTML = '<div class="oa-empty">Noch keine Daten für Bestleistungen.</div>'; return; }
  const rows = [];
  let bestDayKey = null, bestDayPct = -1;
  keys.forEach(k => { const p = dayPercent(k); if (p > bestDayPct) { bestDayPct = p; bestDayKey = k; } });
  if (bestDayKey) {
    const d = keyToDate(bestDayKey);
    rows.push(`<div class="oa-row"><span>Bester Tag gesamt</span><b>${Math.round(bestDayPct)}% <small style="font-family:var(--font-body);font-weight:500;color:var(--text-faint);">· ${d.getDate()}.${d.getMonth() + 1}.</small></b></div>`);
  }
  EXERCISES.forEach(ex => {
    let best = 0, bestKey = null;
    keys.forEach(k => { const v = getVal(k, ex.id); if (v > best) { best = v; bestKey = k; } });
    if (best > 0) {
      const d = keyToDate(bestKey);
      rows.push(`<div class="oa-row"><span>${ex.name}</span><b>${fmtNum(best)} ${ex.unit} <small style="font-family:var(--font-body);font-weight:500;color:var(--text-faint);">· ${d.getDate()}.${d.getMonth() + 1}.</small></b></div>`);
    }
  });
  wrap.innerHTML = rows.join('') || '<div class="oa-empty">Noch keine Daten für Bestleistungen.</div>';
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
  renderWaterToday();
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
  if (confirm('Wirklich ALLE Trainings- und Wasserdaten unwiderruflich löschen?')) {
    LOGS = {};
    WATER = {};
    saveLogs(LOGS);
    saveWater(WATER);
    refreshAll();
    closeSheet('#settingsBackdrop');
  }
});

/* ============================================================
   THEME TOGGLE
============================================================ */
$('#themeToggle').addEventListener('change', e => {
  SETTINGS.theme = e.target.checked ? 'light' : 'dark';
  saveSettings(SETTINGS);
  applyTheme();
});

/* ============================================================
   WATER GOAL
============================================================ */
function renderWaterGoalUI() {
  $('#waterGoalVal').innerHTML = `${SETTINGS.waterGoal}<small>ml / Tag</small>`;
}
$('#waterGoalMinus').addEventListener('click', () => changeWaterGoal(-250));
$('#waterGoalPlus').addEventListener('click', () => changeWaterGoal(250));
function changeWaterGoal(delta) {
  SETTINGS.waterGoal = Math.max(250, (SETTINGS.waterGoal || 2000) + delta);
  saveSettings(SETTINGS);
  renderWaterGoalUI();
  renderWaterToday();
}

/* ============================================================
   EXERCISE MANAGER
============================================================ */
function renderExerciseManager() {
  const wrap = $('#exerciseManager');
  wrap.innerHTML = '';
  EXERCISES.forEach(ex => {
    const row = el('div', 'exercise-row');
    const sub = ex.hasTarget ? `${ex.sets}× ${ex.reps} Wdh.` : `frei · Schritt ${fmtNum(ex.step || 1)} ${ex.unit}`;
    row.innerHTML = `
      <div class="exercise-row-icon">${iconFor(ex)}</div>
      <div class="exercise-row-info">
        <div class="exercise-row-name">${ex.name}</div>
        <div class="exercise-row-sub">${sub}</div>
      </div>
    `;
    const editBtn = el('button', 'icon-btn-sm', '✎');
    editBtn.type = 'button';
    editBtn.addEventListener('click', () => openExerciseForm(ex));
    const delBtn = el('button', 'icon-btn-sm danger', '🗑');
    delBtn.type = 'button';
    delBtn.addEventListener('click', () => deleteExercise(ex));
    row.appendChild(editBtn);
    row.appendChild(delBtn);
    wrap.appendChild(row);
  });
}
function deleteExercise(ex) {
  if (EXERCISES.length <= 1) { alert('Mindestens eine Übung muss übrig bleiben.'); return; }
  if (!confirm(`"${ex.name}" wirklich entfernen? Bereits erfasste Werte bleiben im Verlauf gespeichert, zählen aber nicht mehr mit.`)) return;
  EXERCISES = EXERCISES.filter(e => e.id !== ex.id);
  saveExercises(EXERCISES);
  renderExerciseManager();
  refreshAll();
}
$('#addExerciseBtn').addEventListener('click', () => openExerciseForm(null));
$('#resetTargets').addEventListener('click', () => {
  if (!confirm('Alle Übungen auf die Standard-Liste zurücksetzen? Eigene Übungen werden entfernt (erfasste Verlaufsdaten bleiben gespeichert).')) return;
  EXERCISES = recalcTargets(DEFAULT_EXERCISES.map(e => ({ ...e })));
  saveExercises(EXERCISES);
  renderExerciseManager();
  refreshAll();
});

let editingExerciseId = null;
let formType = 'goal';
let formIcon = 'custom';
let formSets = 3, formReps = 10;

function openExerciseForm(ex) {
  editingExerciseId = ex ? ex.id : null;
  $('#exerciseFormTitle').textContent = ex ? 'Übung bearbeiten' : 'Neue Übung';
  $('#exName').value = ex ? ex.name : '';
  setFormType(ex ? (ex.hasTarget ? 'goal' : 'free') : 'goal');
  formSets = ex && ex.hasTarget ? ex.sets : 3;
  formReps = ex && ex.hasTarget ? ex.reps : 10;
  updateGoalFieldsUI();
  $('#exUnit').value = ex && !ex.hasTarget ? ex.unit : 'km';
  $('#exStep').value = ex && !ex.hasTarget ? (ex.step || 1) : 1;
  formIcon = ex ? (ex.icon || 'custom') : 'custom';
  renderIconPicker();
  openSheet('#exerciseFormBackdrop');
}
function setFormType(type) {
  formType = type;
  $$('#exTypeSegmented button').forEach(b => b.classList.toggle('seg-active', b.dataset.type === type));
  $('#exGoalFields').hidden = type !== 'goal';
  $('#exFreeFields').hidden = type !== 'free';
}
$$('#exTypeSegmented button').forEach(b => b.addEventListener('click', () => setFormType(b.dataset.type)));

function updateGoalFieldsUI() {
  $('#exSetsVal').innerHTML = `${formSets}<small>Sätze</small>`;
  $('#exRepsVal').innerHTML = `${formReps}<small>Wdh./Satz</small>`;
}
$('#exGoalFields [data-act="sets-minus"]').addEventListener('click', () => { formSets = Math.max(1, formSets - 1); updateGoalFieldsUI(); });
$('#exGoalFields [data-act="sets-plus"]').addEventListener('click', () => { formSets = formSets + 1; updateGoalFieldsUI(); });
$('#exGoalFields [data-act="reps-minus"]').addEventListener('click', () => { formReps = Math.max(1, formReps - 1); updateGoalFieldsUI(); });
$('#exGoalFields [data-act="reps-plus"]').addEventListener('click', () => { formReps = formReps + 1; updateGoalFieldsUI(); });

function renderIconPicker() {
  const wrap = $('#iconPicker');
  wrap.innerHTML = '';
  ICON_KEYS.forEach(key => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.innerHTML = ICONS[key];
    btn.classList.toggle('icon-active', key === formIcon);
    btn.addEventListener('click', () => { formIcon = key; renderIconPicker(); });
    wrap.appendChild(btn);
  });
}

$('#cancelExerciseForm').addEventListener('click', () => closeSheet('#exerciseFormBackdrop'));
$('#exerciseFormBackdrop').addEventListener('click', e => { if (e.target.id === 'exerciseFormBackdrop') closeSheet('#exerciseFormBackdrop'); });

function slugify(name) {
  return 'ex_' + name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '').slice(0, 24) + '_' + Math.random().toString(36).slice(2, 6);
}
function upsertExercise(payload) {
  if (editingExerciseId) {
    const idx = EXERCISES.findIndex(e => e.id === editingExerciseId);
    if (idx >= 0) EXERCISES[idx] = { ...EXERCISES[idx], ...payload };
  } else {
    EXERCISES.push({ id: slugify(payload.name), ...payload });
  }
  saveExercises(EXERCISES);
}
$('#saveExerciseBtn').addEventListener('click', () => {
  const name = $('#exName').value.trim();
  if (!name) { alert('Bitte einen Namen eingeben.'); return; }
  if (formType === 'goal') {
    upsertExercise({ name, hasTarget: true, type: 'strength', sets: formSets, reps: formReps, unit: 'Wdh.', icon: formIcon, target: formSets * formReps });
  } else {
    const unit = $('#exUnit').value.trim() || 'Stk.';
    const step = Math.max(0.01, parseFloat($('#exStep').value) || 1);
    upsertExercise({ name, hasTarget: false, type: 'cardio', unit, step, icon: formIcon });
  }
  closeSheet('#exerciseFormBackdrop');
  renderExerciseManager();
  refreshAll();
});

/* ============================================================
   BACKUP: EXPORT / IMPORT
============================================================ */
$('#exportBtn').addEventListener('click', () => {
  const payload = { exportedAt: new Date().toISOString(), logs: LOGS, settings: SETTINGS, exercises: EXERCISES, water: WATER };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `grind-backup-${todayKey()}.json`;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  URL.revokeObjectURL(url);
});
$('#importBtn').addEventListener('click', () => $('#importFile').click());
$('#importFile').addEventListener('change', e => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(reader.result);
      if (!confirm('Backup importieren? Das überschreibt alle aktuellen Daten auf diesem Gerät.')) return;
      if (data.logs) { LOGS = data.logs; saveLogs(LOGS); }
      if (data.water) { WATER = data.water; saveWater(WATER); }
      if (data.exercises) { EXERCISES = recalcTargets(data.exercises); saveExercises(EXERCISES); }
      if (data.settings) { SETTINGS = { ...SETTINGS, ...data.settings }; saveSettings(SETTINGS); }
      alert('Import erfolgreich!');
      location.reload();
    } catch (err) {
      alert('Diese Datei konnte nicht gelesen werden.');
    }
  };
  reader.readAsText(file);
  e.target.value = '';
});

/* ============================================================
   REMINDER / NOTIFICATIONS
============================================================ */
function syncSettingsUI() {
  $('#themeToggle').checked = SETTINGS.theme === 'light';

  $('#reminderToggle').checked = SETTINGS.reminderEnabled;
  $('#reminderTimesBlock').hidden = !SETTINGS.reminderEnabled;
  renderReminderTimes();

  $('#weeklyToggle').checked = SETTINGS.weeklyReminder.enabled;
  $('#weeklyRow').hidden = !SETTINGS.weeklyReminder.enabled;
  $('#weeklyWeekday').value = String(SETTINGS.weeklyReminder.weekday);
  $('#weeklyTime').value = SETTINGS.weeklyReminder.time;

  renderWaterGoalUI();
  renderExerciseManager();
  updateNotifNote();
}

function renderReminderTimes() {
  const wrap = $('#reminderTimesList');
  wrap.innerHTML = '';
  (SETTINGS.reminderTimes || []).forEach(t => {
    const chip = el('div', 'time-chip', `<span>${t}</span>`);
    const btn = document.createElement('button');
    btn.type = 'button'; btn.textContent = '×';
    btn.addEventListener('click', () => {
      SETTINGS.reminderTimes = SETTINGS.reminderTimes.filter(x => x !== t);
      saveSettings(SETTINGS);
      renderReminderTimes();
      scheduleAllReminders();
    });
    chip.appendChild(btn);
    wrap.appendChild(chip);
  });
}
$('#addReminderTime').addEventListener('click', () => {
  const v = $('#newReminderTime').value;
  if (!v) return;
  if (!SETTINGS.reminderTimes.includes(v)) {
    SETTINGS.reminderTimes.push(v);
    SETTINGS.reminderTimes.sort();
    saveSettings(SETTINGS);
    renderReminderTimes();
    scheduleAllReminders();
  }
});

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
    scheduleAllReminders();
    tryPeriodicSync();
  } else {
    SETTINGS.reminderEnabled = false;
    saveSettings(SETTINGS);
    clearReminderTimers();
  }
  $('#reminderTimesBlock').hidden = !SETTINGS.reminderEnabled;
  updateNotifNote();
});

$('#weeklyToggle').addEventListener('change', async e => {
  if (e.target.checked) {
    if ('Notification' in window && Notification.permission !== 'granted') {
      const perm = await Notification.requestPermission();
      if (perm !== 'granted') { e.target.checked = false; return; }
    }
    SETTINGS.weeklyReminder.enabled = true;
  } else {
    SETTINGS.weeklyReminder.enabled = false;
    clearTimeout(weeklyTimer);
  }
  saveSettings(SETTINGS);
  $('#weeklyRow').hidden = !SETTINGS.weeklyReminder.enabled;
  scheduleWeeklyReminder();
});
$('#weeklyWeekday').addEventListener('change', e => {
  SETTINGS.weeklyReminder.weekday = Number(e.target.value);
  saveSettings(SETTINGS);
  scheduleWeeklyReminder();
});
$('#weeklyTime').addEventListener('change', e => {
  SETTINGS.weeklyReminder.time = e.target.value;
  saveSettings(SETTINGS);
  scheduleWeeklyReminder();
});

let reminderTimers = [];
function clearReminderTimers() { reminderTimers.forEach(t => clearTimeout(t)); reminderTimers = []; }
function scheduleAllReminders() {
  clearReminderTimers();
  if (!SETTINGS.reminderEnabled) return;
  (SETTINGS.reminderTimes || []).forEach(t => scheduleSingleReminder(t));
}
function scheduleSingleReminder(timeStr) {
  const [hh, mm] = timeStr.split(':').map(Number);
  const now = new Date();
  let target = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hh, mm, 0, 0);
  if (target <= now) target = addDays(target, 1);
  const ms = target - now;
  const timer = setTimeout(() => {
    if (SETTINGS.reminderEnabled && !dayComplete(todayKey())) {
      notifyLocal('GRIND — Training nicht vergessen', 'Du hast dein Tagesziel noch nicht erreicht — Zeit für ein paar Übungen! 💪');
    }
    scheduleSingleReminder(timeStr);
  }, ms);
  reminderTimers.push(timer);
}

let weeklyTimer = null;
function scheduleWeeklyReminder() {
  clearTimeout(weeklyTimer);
  const w = SETTINGS.weeklyReminder;
  if (!w || !w.enabled) return;
  const [hh, mm] = w.time.split(':').map(Number);
  const now = new Date();
  let target = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hh, mm, 0, 0);
  const diff = (Number(w.weekday) - target.getDay() + 7) % 7;
  target = addDays(target, diff);
  if (target <= now) target = addDays(target, 7);
  const ms = target - now;
  weeklyTimer = setTimeout(() => {
    notifyLocal('GRIND — Wochenrückblick', buildWeeklySummaryText());
    scheduleWeeklyReminder();
  }, ms);
}
function buildWeeklySummaryText() {
  const week = rangeKeys(7);
  const metDays = week.filter(k => hasEntry(k) && dayComplete(k)).length;
  const extraParts = extraExercises().map(ex => `${ex.name} ${fmtNum(week.reduce((s, k) => s + getVal(k, ex.id), 0))} ${ex.unit}`);
  const waterAvg = Math.round(week.reduce((s, k) => s + waterTotal(k), 0) / 7);
  let txt = `${metDays}/7 Tage Ziel erreicht.`;
  if (extraParts.length) txt += ` ${extraParts.join(', ')}.`;
  txt += ` Ø Wasser ${waterAvg} ml/Tag.`;
  return txt;
}

function notifyLocal(title, body) {
  if (navigator.serviceWorker && navigator.serviceWorker.controller) {
    navigator.serviceWorker.ready.then(reg => reg.showNotification(title, {
      body, icon: 'icons/icon-192.png', badge: 'icons/icon-192.png', tag: 'grind-notify'
    }));
  } else if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(title, { body, icon: 'icons/icon-192.png' });
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
applyTheme();
renderTodayHeader();
renderWaterQuickButtons();
refreshAll();
syncSettingsUI();
if (SETTINGS.reminderEnabled && 'Notification' in window && Notification.permission === 'granted') {
  scheduleAllReminders();
  tryPeriodicSync();
}
if (SETTINGS.weeklyReminder && SETTINGS.weeklyReminder.enabled && 'Notification' in window && Notification.permission === 'granted') {
  scheduleWeeklyReminder();
}
