'use strict';

const APP_VERSION = '1.10.0 · 2026-09-13';

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
  weight:   '<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="13" r="8" stroke="currentColor" stroke-width="1.7"/><path d="M9 13a3 3 0 0 1 6 0M12 5V3M9.5 3.5h5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>',
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
const WEIGHT_KEY = 'grind_weight_v1';
const NOTES_KEY = 'grind_notes_v1';
const LAST_BACKUP_KEY = 'grind_last_backup_v1';
const BACKUP_REMINDER_DAYS = 14;

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

function loadWeight() {
  try { return JSON.parse(localStorage.getItem(WEIGHT_KEY)) || {}; }
  catch { return {}; }
}
function saveWeightData(w) { localStorage.setItem(WEIGHT_KEY, JSON.stringify(w)); }

function loadNotes() {
  try { return JSON.parse(localStorage.getItem(NOTES_KEY)) || {}; }
  catch { return {}; }
}
function saveNotes(n) { localStorage.setItem(NOTES_KEY, JSON.stringify(n)); }

function getLastBackup() {
  const v = localStorage.getItem(LAST_BACKUP_KEY);
  return v ? new Date(v) : null;
}
function markBackupNow() { localStorage.setItem(LAST_BACKUP_KEY, new Date().toISOString()); }
function daysSinceLastBackup() {
  const last = getLastBackup();
  if (!last) return null;
  return Math.floor((Date.now() - last.getTime()) / 86400000);
}

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
let WEIGHT = loadWeight();
let NOTES = loadNotes();
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

function weekTargetFor(ex) { return ex.target * 7; }
function weekSum(weekKey, exId) {
  return weekKeys(weekKey).reduce((s, k) => s + getVal(k, exId), 0);
}
function weekRatio(weekKey, ex) {
  return weekSum(weekKey, ex.id) / weekTargetFor(ex);
}
function weekPercent(weekKey) {
  const list = goalExercises();
  if (!list.length) return 0;
  const ratios = list.map(ex => weekRatio(weekKey, ex));
  return (ratios.reduce((a, b) => a + b, 0) / ratios.length) * 100;
}
function weekComplete(weekKey) {
  const list = goalExercises();
  if (!list.length) return false;
  return list.every(ex => weekRatio(weekKey, ex) >= 1);
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

function getWeight(dateKey) {
  return typeof WEIGHT[dateKey] === 'number' ? WEIGHT[dateKey] : null;
}
function setWeight(dateKey, val) {
  if (val == null) { delete WEIGHT[dateKey]; }
  else { WEIGHT[dateKey] = Math.round(Math.max(0, val) * 10) / 10; }
  saveWeightData(WEIGHT);
}
function latestWeightBefore(dateKey) {
  const keys = Object.keys(WEIGHT).filter(k => k <= dateKey).sort();
  if (!keys.length) return null;
  return WEIGHT[keys[keys.length - 1]];
}

const MOODS = [
  { key: 'great', emoji: '💪', label: 'Stark' },
  { key: 'good', emoji: '🙂', label: 'Gut' },
  { key: 'okay', emoji: '😐', label: 'Okay' },
  { key: 'tired', emoji: '😓', label: 'Müde' },
  { key: 'sore', emoji: '🤕', label: 'Schmerzen' },
];
function moodEmojiFor(moodKey) {
  const m = MOODS.find(x => x.key === moodKey);
  return m ? m.emoji : '';
}
function getNote(dateKey) { return NOTES[dateKey] || null; }
function setMood(dateKey, moodKey) {
  const entry = { ...(NOTES[dateKey] || {}) };
  if (entry.mood === moodKey || moodKey == null) delete entry.mood;
  else entry.mood = moodKey;
  if (!entry.mood && !entry.text) delete NOTES[dateKey];
  else NOTES[dateKey] = entry;
  saveNotes(NOTES);
}
function setNoteText(dateKey, text) {
  text = (text || '').trim();
  const entry = { ...(NOTES[dateKey] || {}) };
  if (text) entry.text = text; else delete entry.text;
  if (!entry.mood && !entry.text) delete NOTES[dateKey];
  else NOTES[dateKey] = entry;
  saveNotes(NOTES);
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

/* Kalenderwoche Montag–Sonntag, referenziert über den Montags-Datumskey */
function mondayOffset(d) { return (d.getDay() + 6) % 7; }
function weekStartDate(d) { return addDays(d, -mondayOffset(d)); }
function weekStartKeyOf(d) { return dateKeyOf(weekStartDate(d)); }
function weekKeys(weekKey) {
  const start = keyToDate(weekKey);
  const arr = [];
  for (let i = 0; i < 7; i++) arr.push(dateKeyOf(addDays(start, i)));
  return arr;
}
function prevWeekKey(weekKey) { return dateKeyOf(addDays(keyToDate(weekKey), -7)); }
function nextWeekKey(weekKey) { return dateKeyOf(addDays(keyToDate(weekKey), 7)); }
function currentWeekStartKey() { return weekStartKeyOf(new Date()); }

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

/* ============================================================
   ERFOLGSMOMENTE — Feier-Toast + Konfetti bei Wochenziel-Erreichen
============================================================ */
let celebrateToastTimer = null;
function celebrate(html, duration) {
  const toast = $('#celebrateToast');
  toast.innerHTML = html;
  toast.classList.remove('show');
  void toast.offsetWidth; // Reflow erzwingen, damit die Animation bei jedem Aufruf neu startet
  toast.classList.add('show');
  clearTimeout(celebrateToastTimer);
  celebrateToastTimer = setTimeout(() => toast.classList.remove('show'), duration || 2200);
}

function burstConfetti() {
  const layer = $('#confettiLayer');
  if (!layer) return;
  const pieces = ['🎉', '⚡', '✨', '💥', '🔥'];
  const count = 12;
  for (let i = 0; i < count; i++) {
    const span = document.createElement('span');
    span.className = 'confetti-piece';
    span.textContent = pieces[Math.floor(Math.random() * pieces.length)];
    const angle = (Math.PI * 2 * i) / count + (Math.random() * 0.5 - 0.25);
    const dist = 46 + Math.random() * 40;
    span.style.setProperty('--dx', (Math.cos(angle) * dist).toFixed(0) + 'px');
    span.style.setProperty('--dy', (Math.sin(angle) * dist).toFixed(0) + 'px');
    span.style.setProperty('--rot', (Math.random() * 360 - 180).toFixed(0) + 'deg');
    layer.appendChild(span);
    setTimeout(() => span.remove(), 950);
  }
}

function celebrateExerciseDone(ex) {
  celebrate(`<b>🎉 Wochenziel erreicht</b>${ex.name}`);
}
function celebrateWeekComplete(streakCount, isNewBest) {
  const streakLabel = streakCount === 1 ? '1 Woche' : `${streakCount} Wochen`;
  const bestLine = isNewBest ? '<br>🔥 Neue Bestleistung!' : '';
  celebrate(`<b>🏆 Wochenziel komplett!</b>Streak: ${streakLabel}${bestLine}`, 2600);
  burstConfetti();
}

/**
 * Speichert einen neuen Wert und erkennt dabei, ob dadurch gerade das
 * Wochenziel dieser Übung oder das gesamte Wochenziel neu erreicht wurde.
 * Gibt true zurück, wenn ein Feier-Toast gezeigt wurde (dann sollte kein
 * zusätzlicher "Gespeichert"-Toast mehr angezeigt werden).
 */
function recordValue(ex, dateKey, newVal) {
  if (!ex.hasTarget) { setVal(dateKey, ex.id, newVal); return false; }
  const wk = weekStartKeyOf(keyToDate(dateKey));
  const isCurrentWeek = wk === currentWeekStartKey();
  let prevExerciseDone = false, prevWeekDone = false, prevBest = 0;
  if (isCurrentWeek) {
    prevExerciseDone = weekRatio(wk, ex) >= 1;
    prevWeekDone = weekComplete(wk);
    prevBest = computeWeekStreaks().best;
  }
  setVal(dateKey, ex.id, newVal);
  if (!isCurrentWeek) return false;
  if (!prevWeekDone && weekComplete(wk)) {
    const streak = computeWeekStreaks();
    celebrateWeekComplete(streak.current, streak.current > prevBest);
    return true;
  }
  if (!prevExerciseDone && weekRatio(wk, ex) >= 1) {
    celebrateExerciseDone(ex);
    return true;
  }
  return false;
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
  const celebrated = recordValue(ex, key, num);
  refreshAll();
  if (key !== todayKey()) { renderDayDetailBody(); renderDayWaterBody(); }
  if (!celebrated) flashSaved();
}

function promptSetWeight(dateKey) {
  const key = dateKey || todayKey();
  const current = getWeight(key) ?? latestWeightBefore(key) ?? '';
  const label = key === todayKey() ? 'heute' : `am ${keyToDate(key).getDate()}.${keyToDate(key).getMonth() + 1}.`;
  const input = prompt(`Gewicht für ${label} eingeben (kg):`, current === '' ? '' : fmtNum(current));
  if (input === null) return;
  if (String(input).trim() === '') { setWeight(key, null); refreshAll(); if (key !== todayKey()) renderDayWeightBody(); return; }
  const num = parseFloat(String(input).replace(',', '.'));
  if (isNaN(num) || num <= 0) { alert('Bitte eine gültige, positive Zahl eingeben.'); return; }
  setWeight(key, num);
  refreshAll();
  if (key !== todayKey()) renderDayWeightBody();
}

function renderWeightToday() {
  const key = todayKey();
  const val = getWeight(key);
  $('#weightIcon').innerHTML = ICONS.weight;
  $('#weightBig').textContent = val != null ? fmtNum(val) : '—';
  const weekAgoKey = dateKeyOf(addDays(new Date(), -7));
  const prev = latestWeightBefore(weekAgoKey);
  if (val == null) {
    $('#weightTrendNote').textContent = 'Noch nicht erfasst — antippen zum Eintragen';
  } else if (prev != null) {
    const diff = Math.round((val - prev) * 10) / 10;
    const sign = diff > 0 ? '+' : '';
    $('#weightTrendNote').textContent = `${sign}${fmtNum(diff)} kg zur letzten Woche`;
  } else {
    $('#weightTrendNote').textContent = 'Antippen zum Aktualisieren';
  }
}
$('#weightValueDisplay').addEventListener('click', () => promptSetWeight());
$('#weightCard').addEventListener('click', e => { if (!e.target.closest('#weightValueDisplay')) promptSetWeight(); });

function renderNoteToday() {
  const key = todayKey();
  const note = getNote(key) || {};
  const moodRow = $('#moodRow');
  moodRow.innerHTML = '';
  MOODS.forEach(m => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'mood-btn' + (note.mood === m.key ? ' mood-active' : '');
    btn.textContent = m.emoji;
    btn.setAttribute('aria-label', m.label);
    btn.title = m.label;
    btn.addEventListener('click', () => {
      setMood(key, note.mood === m.key ? null : m.key);
      renderNoteToday();
      renderHistory();
    });
    moodRow.appendChild(btn);
  });
  const textDisplay = $('#noteTextDisplay');
  textDisplay.textContent = note.text || 'Notiz hinzufügen …';
  textDisplay.classList.toggle('has-text', !!note.text);
}
function promptSetNote(dateKey) {
  const key = dateKey || todayKey();
  const note = getNote(key) || {};
  const label = key === todayKey() ? 'heute' : `am ${keyToDate(key).getDate()}.${keyToDate(key).getMonth() + 1}.`;
  const input = prompt(`Notiz für ${label} (z. B. wie du dich gefühlt hast):`, note.text || '');
  if (input === null) return;
  setNoteText(key, input);
  renderNoteToday();
  renderHistory();
  if (key !== todayKey()) renderDayNoteBody();
}
$('#noteTextDisplay').addEventListener('click', () => promptSetNote());

function renderExerciseCards() {
  const key = todayKey();
  const wrap = $('#exerciseCards');
  wrap.innerHTML = '';
  const wk = currentWeekStartKey();
  goalExercises().forEach(ex => {
    const val = getVal(key, ex.id);
    const ratio = val / ex.target;
    const pct = Math.round(ratio * 100);
    const wSum = weekSum(wk, ex.id);
    const wTarget = weekTargetFor(ex);
    const wDone = wSum >= wTarget;
    const card = el('div', 'card');
    const targetLabel = `Ziel: ${ex.sets}× ${ex.reps} (${ex.target} Wdh.)`;
    const weekLabel = `Woche: ${fmtNum(wSum)} / ${wTarget} ${ex.unit}${wDone ? ' ✓' : ''}`;
    card.innerHTML = `
      <div class="card-top">
        <div style="display:flex; gap:12px; align-items:flex-start;">
          <div class="card-icon">${iconFor(ex)}</div>
          <div>
            <div class="card-name">${ex.name}</div>
            <div class="card-target">${targetLabel}</div>
            <div class="card-week ${wDone ? 'done' : ''}">${weekLabel}</div>
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

function quickAmountsFor(ex) {
  const base = ex.step || 1;
  const raw = [base * 10, base * 50];
  const seen = new Set();
  return raw.map(v => Math.round(v * 100) / 100).filter(v => v > base && !seen.has(v) && seen.add(v));
}

function renderExtraCards() {
  const key = todayKey();
  const wrap = $('#extraCards');
  wrap.innerHTML = '';
  extraExercises().forEach(ex => {
    const val = getVal(key, ex.id);
    const quick = quickAmountsFor(ex);
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
      ${quick.length ? `<div class="card-quick">${quick.map(v => `<button type="button" data-amt="${v}">+${fmtNum(v)} ${ex.unit}</button>`).join('')}<button type="button" data-act="edit">✎ eingeben</button></div>` : ''}
    `;
    card.querySelector('[data-act="plus"]').addEventListener('click', () => bump(ex, stepAmount(ex)));
    card.querySelector('[data-act="minus"]').addEventListener('click', () => bump(ex, -stepAmount(ex)));
    card.querySelector('[data-act="set"]').addEventListener('click', () => promptSetValue(ex));
    const editBtn = card.querySelector('[data-act="edit"]');
    if (editBtn) editBtn.addEventListener('click', () => promptSetValue(ex));
    card.querySelectorAll('[data-amt]').forEach(btn => {
      btn.addEventListener('click', () => bump(ex, parseFloat(btn.dataset.amt)));
    });
    wrap.appendChild(card);
  });
}

function bump(ex, delta) {
  const key = todayKey();
  const cur = getVal(key, ex.id);
  const celebrated = recordValue(ex, key, cur + delta);
  renderExerciseCards();
  renderExtraCards();
  updateRing();
  if (!celebrated) flashSaved();
}

function updateRing() {
  const pct = weekPercent(currentWeekStartKey());
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

  const { current, best } = computeWeekStreaks();
  $('#historyStatRow').innerHTML = statBox(keys.length, 'Tage geloggt') + statBox(current, 'Streak (Wochen)') + statBox(best, 'Beste Streak (Wochen)');

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
    const note = getNote(key);
    row.innerHTML = `
      <div class="history-date"><b>${d.getDate()}.</b><span>${WEEKDAYS_SHORT[d.getDay()]}</span></div>
      <div class="history-dots">${dots}</div>
      ${note && note.mood ? `<div class="history-mood">${moodEmojiFor(note.mood)}</div>` : ''}
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

function computeWeekStreaks() {
  const todayW = currentWeekStartKey();
  let current = 0;
  let cursor = todayW;
  if (weekComplete(todayW)) { current++; cursor = prevWeekKey(cursor); }
  else { cursor = prevWeekKey(cursor); }
  while (weekComplete(cursor)) { current++; cursor = prevWeekKey(cursor); }

  const loggedDayKeys = Object.keys(LOGS).filter(hasEntry).sort();
  if (!loggedDayKeys.length) return { current, best: current };
  let scan = weekStartKeyOf(keyToDate(loggedDayKeys[0]));
  let best = 0, run = 0;
  while (scan <= todayW) {
    if (weekComplete(scan)) { run++; best = Math.max(best, run); }
    else { run = 0; }
    scan = nextWeekKey(scan);
  }
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
  renderDayWeightBody();
  renderDayNoteBody();
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
    row.querySelector('[data-act="plus"]').addEventListener('click', () => {
      const celebrated = recordValue(ex, key, getVal(key, ex.id) + stepAmount(ex));
      renderDayDetailBody(); refreshAll();
      if (!celebrated) flashSaved();
    });
    row.querySelector('[data-act="minus"]').addEventListener('click', () => {
      recordValue(ex, key, getVal(key, ex.id) - stepAmount(ex));
      renderDayDetailBody(); refreshAll();
    });
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
function renderDayWeightBody() {
  const key = activeDayKey;
  const wrap = $('#dayWeightBody');
  const val = getWeight(key);
  wrap.innerHTML = `
    <h3 class="day-weight-title">⚖️ Gewicht — ${val != null ? fmtNum(val) + ' kg' : 'nicht erfasst'}</h3>
    <div class="day-item">
      <div>
        <div class="dn">Gewicht bearbeiten</div>
        <div class="dt">Tippen zum Eintragen oder Löschen</div>
      </div>
      <div class="dv" data-act="editWeight" style="cursor:pointer;">${val != null ? fmtNum(val) : '—'}<small style="display:block;font-family:var(--font-body);font-size:9px;color:var(--text-faint);">kg</small></div>
    </div>
  `;
  wrap.querySelector('[data-act="editWeight"]').addEventListener('click', () => promptSetWeight(key));
}
function renderDayNoteBody() {
  const key = activeDayKey;
  const wrap = $('#dayNoteBody');
  const note = getNote(key) || {};
  wrap.innerHTML = `<h3 class="day-note-title">📝 Notiz &amp; Stimmung</h3>`;
  const moodRow = el('div', 'mood-row');
  moodRow.style.marginBottom = '10px';
  MOODS.forEach(m => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'mood-btn' + (note.mood === m.key ? ' mood-active' : '');
    btn.textContent = m.emoji;
    btn.setAttribute('aria-label', m.label);
    btn.title = m.label;
    btn.addEventListener('click', () => {
      setMood(key, note.mood === m.key ? null : m.key);
      renderDayNoteBody();
      refreshAll();
    });
    moodRow.appendChild(btn);
  });
  wrap.appendChild(moodRow);
  const row = el('div', 'day-item');
  row.innerHTML = `
    <div>
      <div class="dn">Notiz bearbeiten</div>
      <div class="dt">${note.text ? note.text : 'Tippen zum Eintragen'}</div>
    </div>
    <div class="dv" data-act="editNote" style="cursor:pointer;">✎</div>
  `;
  row.querySelector('[data-act="editNote"]').addEventListener('click', () => promptSetNote(key));
  wrap.appendChild(row);
}

/* ============================================================
   ANALYSIS VIEW
============================================================ */
function renderAnalysis() {
  const { current, best } = computeWeekStreaks();
  const last30 = rangeKeys(30);
  const overDays = last30.filter(k => hasEntry(k) && dayPercent(k) > 100);
  $('#analysisStatRow').innerHTML =
    statBox(current, 'Aktuelle Streak (Wochen)') +
    statBox(best, 'Beste Streak (Wochen)') +
    statBox(overDays.length, 'Über 100% (30T)');

  renderHeatmap();
  renderDailyChart();
  renderExerciseTrend();
  renderPerExercise();
  renderExtraStats();
  renderWaterStats();
  renderWaterChart();
  renderWeightStats();
  renderWeightChart();
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

/* ---- generic line/trend chart, used for per-exercise trend and weight ---- */
function buildLineChartSVG(points, opts) {
  opts = opts || {};
  const color = opts.color || 'var(--lime)';
  const zeroBased = opts.zeroBased !== false;
  const unit = opts.unit || '';
  const valued = points.map((p, i) => ({ ...p, i })).filter(p => p.val != null);
  if (!valued.length) {
    return '<div class="oa-empty">Noch keine Daten für diesen Zeitraum.</div>';
  }
  const w = 320, h = 140, padL = 8, padR = 8, padT = 14, padB = 10;
  const vals = valued.map(p => p.val);
  let minV = zeroBased ? 0 : Math.min(...vals);
  let maxV = Math.max(...vals);
  if (maxV === minV) maxV = minV + 1;
  if (zeroBased) {
    maxV = maxV * 1.12;
  } else {
    const pad = (maxV - minV) * 0.18 || 1;
    minV -= pad; maxV += pad;
  }
  const n = points.length;
  const stepX = n > 1 ? (w - padL - padR) / (n - 1) : 0;
  const xFor = i => padL + i * stepX;
  const yFor = v => padT + (1 - (v - minV) / (maxV - minV)) * (h - padT - padB);

  const segments = [];
  let cur = [];
  points.forEach((p, i) => {
    if (p.val == null) { if (cur.length) { segments.push(cur); cur = []; } return; }
    cur.push([xFor(i), yFor(p.val)]);
  });
  if (cur.length) segments.push(cur);
  const pathStr = segments.map(seg => 'M' + seg.map(pt => pt[0].toFixed(1) + ',' + pt[1].toFixed(1)).join('L')).join(' ');
  const dots = valued.map(p => `<circle cx="${xFor(p.i).toFixed(1)}" cy="${yFor(p.val).toFixed(1)}" r="2.6" fill="${color}"/>`).join('');

  const first = valued[0].val, last = valued[valued.length - 1].val;
  const svg = `<svg viewBox="0 0 ${w} ${h}" style="width:100%; height:140px; display:block;">
    <path d="${pathStr}" fill="none" stroke="${color}" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round"/>
    ${dots}
  </svg>`;
  const footer = `<div class="trend-footer"><span>Start: ${fmtNum(first)} ${unit}</span><span>Aktuell: ${fmtNum(last)} ${unit}</span></div>`;
  return svg + footer;
}

let selectedTrendExId = null;
function renderExerciseTrend() {
  const list = goalExercises();
  const tabsWrap = $('#exerciseTrendTabs');
  const chartWrap = $('#exerciseTrendChart');
  if (!list.length) {
    tabsWrap.innerHTML = '';
    chartWrap.innerHTML = '<div class="oa-empty">Keine Zielübungen vorhanden.</div>';
    return;
  }
  if (!selectedTrendExId || !list.find(e => e.id === selectedTrendExId)) selectedTrendExId = list[0].id;
  tabsWrap.innerHTML = list.map(ex =>
    `<button type="button" class="trend-tab ${ex.id === selectedTrendExId ? 'trend-tab-active' : ''}" data-id="${ex.id}">${ex.name}</button>`
  ).join('');
  tabsWrap.querySelectorAll('button').forEach(b => {
    b.addEventListener('click', () => { selectedTrendExId = b.dataset.id; renderExerciseTrend(); });
  });
  const ex = list.find(e => e.id === selectedTrendExId);
  const days = rangeKeys(30);
  const points = days.map(k => ({ key: k, val: hasEntry(k) && getVal(k, ex.id) > 0 ? getVal(k, ex.id) : null }));
  chartWrap.innerHTML = buildLineChartSVG(points, { color: 'var(--lime)', unit: ex.unit, zeroBased: true });
}

function renderWeightStats() {
  const wrap = $('#weightStats');
  const keys = Object.keys(WEIGHT).sort();
  if (!keys.length) { wrap.innerHTML = '<div class="oa-empty">Noch kein Gewicht erfasst.</div>'; return; }
  const latestKey = keys[keys.length - 1];
  const latest = WEIGHT[latestKey];
  const weekAgo = latestWeightBefore(dateKeyOf(addDays(new Date(), -7)));
  const monthAgo = latestWeightBefore(dateKeyOf(addDays(new Date(), -30)));
  const parts = [`Aktuell: ${fmtNum(latest)} kg`];
  if (weekAgo != null) parts.push(`7T: ${latest - weekAgo >= 0 ? '+' : ''}${fmtNum(Math.round((latest - weekAgo) * 10) / 10)} kg`);
  if (monthAgo != null) parts.push(`30T: ${latest - monthAgo >= 0 ? '+' : ''}${fmtNum(Math.round((latest - monthAgo) * 10) / 10)} kg`);
  wrap.innerHTML = `<div class="pe-row"><div class="pe-head"><b>Gewichtsverlauf</b><span>${parts.join(' · ')}</span></div></div>`;
}

function renderWeightChart() {
  const days = rangeKeys(30);
  const points = days.map(k => ({ key: k, val: getWeight(k) }));
  $('#weightChart').innerHTML = buildLineChartSVG(points, { color: 'var(--weight)', unit: 'kg', zeroBased: false });
}

/* ---- calendar heatmap ---- */
let heatmapMonthOffset = 0;
function renderHeatmap() {
  const base = new Date();
  const viewDate = new Date(base.getFullYear(), base.getMonth() + heatmapMonthOffset, 1);
  const year = viewDate.getFullYear(), month = viewDate.getMonth();
  $('#heatmapLabel').textContent = `${MONTHS[month]} ${year}`;
  $('#heatmapNext').disabled = heatmapMonthOffset >= 0;

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstWeekday = (new Date(year, month, 1).getDay() + 6) % 7; // Monday = 0
  const wd = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
  let html = wd.map(w => `<div class="hm-head">${w}</div>`).join('');
  for (let i = 0; i < firstWeekday; i++) html += '<div class="hm-cell hm-empty"></div>';
  const todayK = todayKey();
  for (let d = 1; d <= daysInMonth; d++) {
    const key = `${year}-${pad2(month + 1)}-${pad2(d)}`;
    const isFuture = key > todayK;
    let cls = '';
    if (!isFuture) {
      const pct = hasEntry(key) ? dayPercent(key) : 0;
      cls = pct >= 100 ? 'hm-full' : pct >= 40 ? 'hm-mid' : pct > 0 ? 'hm-low' : '';
    }
    const extra = [isFuture ? 'hm-future' : '', key === todayK ? 'hm-today' : ''].join(' ');
    html += `<div class="hm-cell ${cls} ${extra}" data-key="${key}" title="${d}.${month + 1}. — ${hasEntry(key) ? Math.round(dayPercent(key)) + '%' : 'keine Daten'}">${d}</div>`;
  }
  $('#heatmapGrid').innerHTML = html;
  $$('#heatmapGrid .hm-cell[data-key]').forEach(c => {
    if (c.classList.contains('hm-future')) return;
    c.addEventListener('click', () => openDayDetail(c.dataset.key));
  });
}
$('#heatmapPrev').addEventListener('click', () => { heatmapMonthOffset--; renderHeatmap(); });
$('#heatmapNext').addEventListener('click', () => { if (heatmapMonthOffset < 0) { heatmapMonthOffset++; renderHeatmap(); } });

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
  renderWeightToday();
  renderNoteToday();
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
  if (confirm('Wirklich ALLE Trainings-, Wasser-, Gewichts- und Notizdaten unwiderruflich löschen?')) {
    LOGS = {};
    WATER = {};
    WEIGHT = {};
    NOTES = {};
    saveLogs(LOGS);
    saveWater(WATER);
    saveWeightData(WEIGHT);
    saveNotes(NOTES);
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
   APP-UPDATES: MANUELL NACH NEUER VERSION SUCHEN
============================================================ */
const UPDATE_CHECK_KEY = 'grind_update_check_prev_v1';

$('#checkUpdateBtn').addEventListener('click', async () => {
  const btn = $('#checkUpdateBtn');
  const note = $('#updateCheckNote');
  btn.disabled = true;
  note.textContent = 'Suche nach Updates …';
  try {
    if ('serviceWorker' in navigator) {
      const regs = await navigator.serviceWorker.getRegistrations();
      await Promise.all(regs.map(r => r.update()));
    }
    if ('caches' in window) {
      const keys = await caches.keys();
      await Promise.all(keys.map(k => caches.delete(k)));
    }
  } catch { /* best-effort — auch ohne Service Worker/Cache API soll der Reload greifen */ }
  sessionStorage.setItem(UPDATE_CHECK_KEY, APP_VERSION);
  location.href = location.pathname + '?refresh=' + Date.now();
});

function reportUpdateCheckResult() {
  const prevVersion = sessionStorage.getItem(UPDATE_CHECK_KEY);
  if (!prevVersion) return;
  sessionStorage.removeItem(UPDATE_CHECK_KEY);
  const updated = prevVersion !== APP_VERSION;
  setTimeout(() => {
    celebrate(updated ? `<b>✅ Aktualisiert</b>Jetzt auf v${APP_VERSION}` : `<b>✓ Bereits aktuell</b>v${APP_VERSION} ist die neueste Version`, 2600);
  }, 400);
}

/* ============================================================
   BACKUP: EXPORT / IMPORT
============================================================ */
$('#exportBtn').addEventListener('click', () => {
  const payload = { exportedAt: new Date().toISOString(), logs: LOGS, settings: SETTINGS, exercises: EXERCISES, water: WATER, weight: WEIGHT, notes: NOTES };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `grind-backup-${todayKey()}.json`;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  URL.revokeObjectURL(url);
  markBackupNow();
  renderBackupStatus();
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
      if (data.weight) { WEIGHT = data.weight; saveWeightData(WEIGHT); }
      if (data.notes) { NOTES = data.notes; saveNotes(NOTES); }
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
  $('#appVersion').textContent = `GRIND · v${APP_VERSION}`;
  $('#checkUpdateBtn').disabled = false;
  $('#updateCheckNote').textContent = '';
  renderBackupStatus();
}

function renderBackupStatus() {
  const note = $('#backupStatusNote');
  const days = daysSinceLastBackup();
  const stale = days === null || days >= BACKUP_REMINDER_DAYS;
  note.classList.toggle('warning', stale);
  if (days === null) {
    note.textContent = '⚠️ Noch kein Backup erstellt — deine Daten liegen bisher nur auf diesem Gerät.';
  } else if (days === 0) {
    note.textContent = 'Letztes Backup: heute ✓';
  } else {
    const suffix = stale ? ' — ein neues Backup wird empfohlen.' : '';
    note.textContent = `Letztes Backup: vor ${days} Tag${days === 1 ? '' : 'en'}${suffix}`;
  }
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
    if (SETTINGS.reminderEnabled && !weekComplete(currentWeekStartKey())) {
      notifyLocal('GRIND — Training nicht vergessen', 'Du hast dein Wochenziel noch nicht erreicht — Zeit für ein paar Übungen! 💪');
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
  const backupDays = daysSinceLastBackup();
  if (backupDays === null || backupDays >= BACKUP_REMINDER_DAYS) {
    txt += backupDays === null
      ? ' 💾 Noch kein Backup erstellt — in den Einstellungen exportieren.'
      : ` 💾 Letztes Backup vor ${backupDays} Tagen — Export empfohlen.`;
  }
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
reportUpdateCheckResult();
