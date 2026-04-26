import { readFileSync, writeFileSync } from 'fs';

const takakiPhrases = readFileSync('takaki_phrases.json', 'utf8');
const slangPhrases  = readFileSync('slang_phrases.json', 'utf8');
const dramaPhrases  = readFileSync('drama_phrases.json', 'utf8');
const judyPhrases   = readFileSync('judy_phrases.json', 'utf8');
const adjPhrases    = readFileSync('adj_phrases.json', 'utf8');

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
  <meta name="apple-mobile-web-app-title" content="Phrase Cards">
  <meta name="theme-color" content="#6366f1">
  <title>Phrase Cards</title>
  <link rel="manifest" href="manifest.json">
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html, body { height: 100%; overflow: hidden; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', 'Segoe UI', sans-serif;
      background: #f0e8d8; color: #0a0a0a;
    }

    .screen {
      position: fixed; inset: 0;
      display: flex; flex-direction: column;
      align-items: center; justify-content: center;
      padding: 24px 20px;
      padding-top: max(env(safe-area-inset-top, 0px), 24px);
      padding-bottom: max(env(safe-area-inset-bottom, 0px), 24px);
    }
    .screen.hidden { display: none; }

    /* ── Home ── */
    .home-logo  { font-size: 36px; margin-bottom: 16px; }
    .home-title {
      font-size: 34px; font-weight: 900; letter-spacing: -1.5px;
      margin-bottom: 6px; color: #0a0a0a;
    }
    .home-sub   { font-size: 14px; color: #6b6457; margin-bottom: 44px; letter-spacing: .2px; }

    .deck-grid { width: 100%; max-width: 380px; display: flex; flex-direction: column; gap: 10px; }
    .deck-card {
      width: 100%; padding: 20px 20px; border: none; border-radius: 14px;
      cursor: pointer; text-align: left; display: flex; align-items: center; gap: 14px;
      transition: transform .1s;
      -webkit-tap-highlight-color: transparent;
    }
    .deck-card:active { transform: scale(.97); }
    .deck-card.indigo { background: #1844c8; color: white; }
    .deck-card.orange { background: #d93d1c; color: white; }
    .deck-card.rose   { background: #c0930a; color: white; }
    .deck-card.teal   { background: #0a8f7a; color: white; }
    .deck-card.violet { background: #6409c4; color: white; }
    .deck-icon { font-size: 26px; flex-shrink: 0; }
    .deck-info { flex: 1; }
    .deck-name  { font-size: 16px; font-weight: 800; margin-bottom: 2px; letter-spacing: -.2px; }
    .deck-count { font-size: 12px; opacity: .7; }

    /* ── Study ── */
    .study-inner {
      width: 100%; max-width: 420px;
      display: flex; flex-direction: column; align-items: center;
    }
    .top-bar {
      width: 100%; display: flex; align-items: center;
      justify-content: space-between; margin-bottom: 18px;
    }
    .icon-btn {
      background: none; border: none; font-size: 22px;
      cursor: pointer; padding: 6px; line-height: 1;
      -webkit-tap-highlight-color: transparent; color: #0a0a0a;
    }
    .count-pill {
      font-size: 12px; font-weight: 700; color: #6b6457;
      background: rgba(0,0,0,.07); padding: 5px 14px; border-radius: 99px;
      letter-spacing: .3px;
    }
    .progress-track {
      width: 100%; height: 4px; background: rgba(0,0,0,.12);
      border-radius: 2px; margin-bottom: 22px; overflow: hidden;
    }
    .progress-fill {
      height: 100%; border-radius: 2px;
      transition: width .4s cubic-bezier(.4,0,.2,1);
    }
    .fill-indigo { background: #1844c8; }
    .fill-orange { background: #d93d1c; }
    .fill-rose   { background: #c0930a; }
    .fill-teal   { background: #0a8f7a; }
    .fill-violet { background: #6409c4; }

    /* Stage dots */
    .stage-dots { display: flex; gap: 6px; margin-bottom: 20px; min-height: 19px; }
    .dot {
      width: 6px; height: 6px; border-radius: 50%;
      background: rgba(0,0,0,.15); transition: background .2s;
    }
    .dot.active-indigo { background: #1844c8; }
    .dot.active-orange { background: #d93d1c; }
    .dot.active-rose   { background: #c0930a; }
    .dot.active-teal   { background: #0a8f7a; }
    .dot.active-violet { background: #6409c4; }

    /* Card */
    .card-area { width: 100%; position: relative; margin-bottom: 22px; }
    .card {
      width: 100%; min-height: 250px; background: #ffffff;
      border-radius: 18px;
      box-shadow: 0 4px 32px rgba(0,0,0,.10);
      padding: 32px 28px; cursor: pointer;
      display: flex; flex-direction: column;
      align-items: center; justify-content: center; text-align: center;
      -webkit-tap-highlight-color: transparent;
      touch-action: pan-y; will-change: transform; user-select: none;
    }
    .card.no-transition { transition: none !important; }

    @keyframes flyRight { to { transform: translateX(130%) rotate(15deg); opacity: 0; } }
    @keyframes flyLeft  { to { transform: translateX(-130%) rotate(-15deg); opacity: 0; } }
    @keyframes popIn    { from { transform: scale(.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }
    .card.fly-right { animation: flyRight .28s ease-in forwards; }
    .card.fly-left  { animation: flyLeft  .28s ease-in forwards; }
    .card.pop-in    { animation: popIn .22s ease-out; }

    .card-label {
      font-size: 10px; font-weight: 800; letter-spacing: 1.5px;
      text-transform: uppercase; margin-bottom: 12px;
    }
    .label-indigo { color: #1844c8; }
    .label-orange { color: #d93d1c; }
    .label-rose   { color: #c0930a; }
    .label-teal   { color: #0a8f7a; }
    .label-violet { color: #6409c4; }

    .card-situation { font-size: clamp(14px, 3.8vw, 17px); color: #5a5040; line-height: 1.7; }
    .card-phrase    { font-size: clamp(18px, 4.5vw, 23px); font-weight: 900; line-height: 1.4; color: #0a0a0a; letter-spacing: -.3px; }
    .card-meaning   { font-size: 14px; color: #6b6457; line-height: 1.7; }
    .card-divider   { width: 28px; height: 2px; background: #e8dece; border-radius: 1px; margin: 14px auto; }
    .card-tap-hint  { font-size: 11px; color: #b8ac9c; margin-top: 20px; letter-spacing: .5px; }
    .card-example   { font-size: 13px; color: #8a7e6e; line-height: 1.65; margin-top: 10px; font-style: italic; }

    /* Swipe labels */
    .swipe-label {
      position: absolute; top: 50%; transform: translateY(-50%);
      font-size: 11px; font-weight: 900; letter-spacing: 1.2px;
      padding: 6px 14px; border-radius: 6px;
      opacity: 0; pointer-events: none; border: 2px solid;
      text-transform: uppercase;
    }
    .swipe-label.got   { right: 10px; color: #0a7c40; background: #d4f5e0; border-color: #0a7c40; }
    .swipe-label.again { left: 10px;  color: #c01818; background: #fde8e8; border-color: #c01818; }

    /* Buttons */
    .action-btns { width: 100%; display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; }
    .action-btn {
      padding: 15px 8px; border: none; border-radius: 12px;
      font-size: 15px; font-weight: 700; cursor: pointer;
      display: flex; flex-direction: column; align-items: center; gap: 4px;
      -webkit-tap-highlight-color: transparent; transition: transform .1s;
    }
    .action-btn:active { transform: scale(.96); }
    .btn-again { background: #0a0a0a; color: #ffffff; }
    .btn-got   { background: #1844c8; color: #ffffff; }
    .btn-save  { background: #e8dece; color: #5a4a28; }
    .btn-save.saved { background: #f5d978; color: #3a2a00; }
    .btn-icon  { font-size: 18px; }
    .btn-text  { font-size: 11px; font-weight: 800; letter-spacing: .4px; }

    /* ── Complete ── */
    .complete-emoji { font-size: 64px; margin-bottom: 16px; }
    .complete-title { font-size: 30px; font-weight: 900; margin-bottom: 8px; letter-spacing: -1px; color: #0a0a0a; }
    .complete-desc  { color: #6b6457; font-size: 14px; margin-bottom: 36px; text-align: center; }
    .stats-row { display: flex; gap: 14px; margin-bottom: 36px; }
    .stat-box {
      text-align: center; background: white; border-radius: 14px;
      padding: 16px 28px; box-shadow: 0 2px 16px rgba(0,0,0,.07);
    }
    .stat-num   { font-size: 32px; font-weight: 900; color: #1844c8; letter-spacing: -1px; }
    .stat-label { font-size: 11px; color: #9a8e80; margin-top: 2px; letter-spacing: .5px; text-transform: uppercase; font-weight: 700; }
    .complete-actions { width: 100%; max-width: 320px; display: flex; flex-direction: column; gap: 10px; }
    .btn-block {
      width: 100%; padding: 16px; border: none; border-radius: 12px;
      font-size: 15px; font-weight: 800; cursor: pointer; letter-spacing: -.1px;
      -webkit-tap-highlight-color: transparent; transition: transform .1s;
    }
    .btn-block:active { transform: scale(.97); }
    .btn-primary   { background: #0a0a0a; color: white; }
    .btn-secondary { background: #e8dece; color: #3a3028; }

    /* ── Menu ── */
    .overlay {
      position: fixed; inset: 0; background: rgba(10,10,10,.5);
      display: flex; align-items: flex-end; justify-content: center;
      padding: 20px; z-index: 100;
    }
    .overlay.hidden { display: none; }
    .menu-sheet { background: #f0e8d8; border-radius: 18px; padding: 20px; width: 100%; max-width: 420px; }
    .menu-title {
      font-size: 10px; font-weight: 800; color: #9a8e80;
      margin-bottom: 12px; text-transform: uppercase; letter-spacing: 1px;
    }
    .menu-item {
      width: 100%; padding: 14px 16px; border: none; border-radius: 10px;
      background: #ffffff; font-size: 15px; font-weight: 700; color: #0a0a0a;
      cursor: pointer; text-align: left; margin-bottom: 8px;
      -webkit-tap-highlight-color: transparent;
    }
    .menu-cancel {
      width: 100%; padding: 14px; border: none; border-radius: 10px;
      background: #e8dece; font-size: 14px; font-weight: 800; color: #6b6457;
      cursor: pointer; margin-top: 8px; -webkit-tap-highlight-color: transparent;
      letter-spacing: .2px;
    }
  </style>
</head>
<body>

<!-- ══ HOME ══ -->
<div class="screen" id="home-screen">
  <div class="home-logo">📖</div>
  <div class="home-title">Phrase Cards</div>
  <div class="home-sub">Choose your deck</div>
  <div class="deck-grid">
    <button class="deck-card indigo" id="deck-takaki">
      <span class="deck-icon">⭐</span>
      <div class="deck-info">
        <div class="deck-name">Takaki Selected</div>
        <div class="deck-count">451 phrases · 3 stages</div>
      </div>
    </button>
    <button class="deck-card orange" id="deck-slang">
      <span class="deck-icon">🔥</span>
      <div class="deck-info">
        <div class="deck-name">Slang &amp; Class</div>
        <div class="deck-count">222 phrases · 2 stages</div>
      </div>
    </button>
    <button class="deck-card rose" id="deck-drama">
      <span class="deck-icon">🎭</span>
      <div class="deck-info">
        <div class="deck-name">Drama English</div>
        <div class="deck-count">26 phrases · 2 stages</div>
      </div>
    </button>
    <button class="deck-card teal" id="deck-judy">
      <span class="deck-icon">🎙️</span>
      <div class="deck-info">
        <div class="deck-name">Judy &amp; Jesse</div>
        <div class="deck-count">10 phrases · 2 stages</div>
      </div>
    </button>
    <button class="deck-card violet" id="deck-adj">
      <span class="deck-icon">✏️</span>
      <div class="deck-info">
        <div class="deck-name">Daily Adjective</div>
        <div class="deck-count">147 words · 3 stages</div>
      </div>
    </button>
  </div>
</div>

<!-- ══ STUDY ══ -->
<div class="screen hidden" id="study-screen">
  <div class="study-inner">
    <div class="top-bar">
      <button class="icon-btn" id="menu-btn">⋯</button>
      <div class="count-pill" id="count-pill">0 / 0</div>
      <button class="icon-btn" id="home-btn">⌂</button>
    </div>
    <div class="progress-track">
      <div class="progress-fill" id="progress-fill" style="width:0%"></div>
    </div>
    <div class="stage-dots" id="stage-dots"></div>
    <div class="card-area">
      <div class="card" id="card">
        <div id="card-content"></div>
        <div class="card-tap-hint" id="tap-hint"></div>
      </div>
      <div class="swipe-label got"   id="label-got">GOT IT ✓</div>
      <div class="swipe-label again" id="label-again">AGAIN ✗</div>
    </div>
    <div class="action-btns">
      <button class="action-btn btn-again" id="btn-again">
        <span class="btn-icon">↩</span><span class="btn-text">Again</span>
      </button>
      <button class="action-btn btn-save" id="btn-save">
        <span class="btn-icon">🔖</span><span class="btn-text">Save</span>
      </button>
      <button class="action-btn btn-got" id="btn-got">
        <span class="btn-icon">✓</span><span class="btn-text">Got it</span>
      </button>
    </div>
  </div>
</div>

<!-- ══ COMPLETE ══ -->
<div class="screen hidden" id="complete-screen">
  <div class="complete-emoji">🎉</div>
  <div class="complete-title">Session Complete!</div>
  <div class="complete-desc" id="complete-desc"></div>
  <div class="stats-row">
    <div class="stat-box">
      <div class="stat-num" id="stat-total">0</div>
      <div class="stat-label">Total</div>
    </div>
    <div class="stat-box">
      <div class="stat-num" id="stat-got">0</div>
      <div class="stat-label">Got it</div>
    </div>
  </div>
  <div class="complete-actions">
    <button class="btn-block btn-primary"   id="btn-restart">Study again</button>
    <button class="btn-block btn-secondary" id="btn-back-home">Back to home</button>
  </div>
</div>

<!-- ══ MENU ══ -->
<div class="overlay hidden" id="overlay">
  <div class="menu-sheet">
    <div class="menu-title">Options</div>
    <button class="menu-item" id="menu-shuffle">🔀 Shuffle &amp; restart</button>
    <button class="menu-item" id="menu-saved">🔖 Review saved (<span id="saved-count">0</span>)</button>
    <button class="menu-cancel" id="menu-cancel">Cancel</button>
  </div>
</div>

<script>
'use strict';

const DECKS = {
  takaki: {
    color: 'indigo',
    stages: 3,
    phrases: ${takakiPhrases}
  },
  slang: {
    color: 'orange',
    stages: 2,
    phrases: ${slangPhrases}
  },
  drama: {
    color: 'rose',
    stages: 2,
    phrases: ${dramaPhrases}
  },
  judy: {
    color: 'teal',
    stages: 2,
    phrases: ${judyPhrases}
  },
  adj: {
    color: 'violet',
    stages: 3,
    type: 'adj',
    phrases: ${adjPhrases}
  }
};

// ── State ──
let activeDeckId  = null;
let deck_cfg      = null;
let phrases       = [];
let deck          = [];
let learned       = [];
let saved         = new Set(); // indices of saved cards for this deck
let current       = 0;
let stage         = 0;
let busy          = false;
let savedReview   = false;    // true when reviewing saved cards only

// ── Home ──
document.getElementById('deck-takaki').addEventListener('click', () => startDeck('takaki'));
document.getElementById('deck-slang').addEventListener('click',  () => startDeck('slang'));
document.getElementById('deck-drama').addEventListener('click',  () => startDeck('drama'));
document.getElementById('deck-judy').addEventListener('click',   () => startDeck('judy'));
document.getElementById('deck-adj').addEventListener('click',    () => startDeck('adj'));

function startDeck(id) {
  activeDeckId = id;
  deck_cfg  = DECKS[id];
  phrases   = deck_cfg.phrases;

  // Style progress bar
  const fill = document.getElementById('progress-fill');
  fill.className = 'progress-fill fill-' + deck_cfg.color;

  // Load saved set
  const rawSaved = localStorage.getItem('pc_saved_' + id);
  saved = rawSaved ? new Set(JSON.parse(rawSaved)) : new Set();
  savedReview = false;

  const raw = localStorage.getItem('pc_session_' + id);
  if (raw) {
    try {
      const s = JSON.parse(raw);
      if (s.total === phrases.length) {
        deck = s.deck; learned = s.learned;
        if (deck.length === 0) { showComplete(); return; }
        current = 0; stage = 0;
        showScreen('study'); renderCard(); return;
      }
    } catch {}
  }
  startFresh();
}

function startFresh() {
  deck    = shuffle(phrases.map((_, i) => i));
  learned = []; current = 0; stage = 0;
  saveSession();
  showScreen('study');
  renderCard();
}

function saveSession() {
  localStorage.setItem('pc_session_' + activeDeckId,
    JSON.stringify({ deck, learned, total: phrases.length }));
}

function persistSaved() {
  localStorage.setItem('pc_saved_' + activeDeckId, JSON.stringify([...saved]));
}

// ── Dots ──
function buildDots() {
  const container = document.getElementById('stage-dots');
  container.innerHTML = '';
  for (let i = 0; i < deck_cfg.stages; i++) {
    const d = document.createElement('div');
    d.className = 'dot';
    d.id = 'dot-' + i;
    container.appendChild(d);
  }
}

function updateDots() {
  for (let i = 0; i < deck_cfg.stages; i++) {
    const d = document.getElementById('dot-' + i);
    if (d) d.className = 'dot' + (i <= stage ? ' active-' + deck_cfg.color : '');
  }
}

// ── Render ──
function renderCard() {
  stage = 0;
  buildDots();
  updateDots();
  updateProgress();
  updateSaveBtn();

  const p    = phrases[deck[current]];
  const hint = document.getElementById('tap-hint');
  const col  = deck_cfg.color;

  if (deck_cfg.type === 'adj') {
    // Meaning first
    document.getElementById('card-content').innerHTML =
      '<div class="card-label label-' + col + '">Meaning</div>' +
      '<div class="card-situation">' + esc(p.meaning) + '</div>';
    hint.textContent = 'tap to reveal word';
  } else if (deck_cfg.stages === 3) {
    // Situation only
    document.getElementById('card-content').innerHTML =
      '<div class="card-label label-' + col + '">Situation</div>' +
      '<div class="card-situation">' + esc(p.situation) + '</div>';
    hint.textContent = 'tap to reveal phrase';
  } else {
    // Phrase only
    document.getElementById('card-content').innerHTML =
      '<div class="card-label label-' + col + '">Phrase</div>' +
      '<div class="card-phrase">' + esc(p.phrase) + '</div>';
    hint.textContent = 'tap to reveal meaning';
  }
  hint.style.display = '';
}

function revealNext() {
  const p   = phrases[deck[current]];
  const col = deck_cfg.color;
  const hint = document.getElementById('tap-hint');

  if (deck_cfg.type === 'adj') {
    if (stage === 0) {
      stage = 1;
      document.getElementById('card-content').innerHTML =
        '<div class="card-label label-' + col + '">Meaning</div>' +
        '<div class="card-situation">' + esc(p.meaning) + '</div>' +
        '<div class="card-divider"></div>' +
        '<div class="card-phrase">' + esc(p.word) + '</div>';
      hint.textContent = 'tap to reveal example';
    } else if (stage === 1) {
      stage = 2;
      document.getElementById('card-content').innerHTML =
        '<div class="card-label label-' + col + '">Meaning</div>' +
        '<div class="card-situation">' + esc(p.meaning) + '</div>' +
        '<div class="card-divider"></div>' +
        '<div class="card-phrase">' + esc(p.word) + '</div>' +
        (p.example ? '<div class="card-divider"></div><div class="card-meaning">"' + esc(p.example) + '"</div>' : '');
      hint.style.display = 'none';
    }
  } else if (deck_cfg.stages === 3) {
    if (stage === 0) {
      stage = 1;
      document.getElementById('card-content').innerHTML =
        '<div class="card-label label-' + col + '">Situation</div>' +
        '<div class="card-situation">' + esc(p.situation) + '</div>' +
        '<div class="card-divider"></div>' +
        '<div class="card-phrase">' + esc(p.phrase) + '</div>';
      hint.textContent = 'tap to reveal meaning';
    } else if (stage === 1) {
      stage = 2;
      document.getElementById('card-content').innerHTML =
        '<div class="card-label label-' + col + '">Situation</div>' +
        '<div class="card-situation">' + esc(p.situation) + '</div>' +
        '<div class="card-divider"></div>' +
        '<div class="card-phrase">' + esc(p.phrase) + '</div>' +
        '<div class="card-divider"></div>' +
        '<div class="card-meaning">' + esc(p.meaning) + '</div>' +
        (p.example ? '<div class="card-example">\u201c' + esc(p.example) + '\u201d</div>' : '');
      hint.style.display = 'none';
    }
  } else {
    if (stage === 0) {
      stage = 1;
      document.getElementById('card-content').innerHTML =
        '<div class="card-label label-' + col + '">Phrase</div>' +
        '<div class="card-phrase">' + esc(p.phrase) + '</div>' +
        '<div class="card-divider"></div>' +
        '<div class="card-meaning">' + esc(p.meaning) + '</div>';
      hint.style.display = 'none';
    }
  }
  updateDots();
}

document.getElementById('card').addEventListener('click', () => {
  if (busy || stage >= deck_cfg.stages - 1) return;
  revealNext();
});

function updateSaveBtn() {
  const idx = deck[current];
  const btn = document.getElementById('btn-save');
  const isSaved = saved.has(idx);
  btn.classList.toggle('saved', isSaved);
  btn.querySelector('.btn-icon').textContent = isSaved ? '🔖' : '🔖';
  btn.querySelector('.btn-text').textContent  = isSaved ? 'Saved' : 'Save';
}

function toggleSave() {
  const idx = deck[current];
  if (saved.has(idx)) saved.delete(idx);
  else saved.add(idx);
  persistSaved();
  updateSaveBtn();
  // brief pulse animation
  const btn = document.getElementById('btn-save');
  btn.style.transform = 'scale(0.93)';
  setTimeout(() => { btn.style.transform = ''; }, 120);
}

function updateProgress() {
  const total = deck.length + learned.length;
  const done  = learned.length;
  document.getElementById('count-pill').textContent = done + ' / ' + total;
  document.getElementById('progress-fill').style.width =
    (total > 0 ? (done / total * 100) : 0) + '%';
}

// ── Advance ──
function advance(dir) {
  if (busy) return;
  busy = true;
  const card = document.getElementById('card');
  card.classList.add(dir === 'right' ? 'fly-right' : 'fly-left');

  setTimeout(() => {
    card.classList.remove('fly-right', 'fly-left');
    if (dir === 'right') {
      const idx = deck.splice(current, 1)[0];
      learned.push(idx);
      // In saved review: Got it = unsave
      if (savedReview) { saved.delete(idx); persistSaved(); }
    } else {
      const removed = deck.splice(current, 1)[0];
      const lo = current + 1, hi = deck.length;
      const pos = lo + Math.floor(Math.random() * Math.max(hi - lo + 1, 1));
      deck.splice(Math.min(pos, deck.length), 0, removed);
    }
    if (current >= deck.length && deck.length > 0) current = 0;
    if (!savedReview) saveSession();
    if (deck.length === 0) { showComplete(); busy = false; return; }
    renderCard();
    card.classList.add('pop-in');
    setTimeout(() => { card.classList.remove('pop-in'); busy = false; }, 220);
  }, 280);
}

document.getElementById('btn-got').addEventListener('click',   () => advance('right'));
document.getElementById('btn-again').addEventListener('click', () => advance('left'));
document.getElementById('btn-save').addEventListener('click',  () => toggleSave());

// ── Swipe ──
let touchX0 = 0, touchY0 = 0, dragging = false;
const cardEl = document.getElementById('card');
const labelGot = document.getElementById('label-got');
const labelAgain = document.getElementById('label-again');

cardEl.addEventListener('touchstart', e => {
  if (busy) return;
  touchX0 = e.touches[0].clientX; touchY0 = e.touches[0].clientY;
  dragging = false; cardEl.classList.add('no-transition');
}, { passive: true });

cardEl.addEventListener('touchmove', e => {
  if (busy) return;
  const dx = e.touches[0].clientX - touchX0;
  const dy = e.touches[0].clientY - touchY0;
  if (!dragging && Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 8) dragging = true;
  if (!dragging) return;
  cardEl.style.transform = 'translateX(' + dx + 'px) rotate(' + (dx * 0.06) + 'deg)';
  const t = Math.min(Math.abs(dx) / 90, 1);
  labelGot.style.opacity   = dx >  15 ? t : 0;
  labelAgain.style.opacity = dx < -15 ? t : 0;
}, { passive: true });

cardEl.addEventListener('touchend', e => {
  cardEl.classList.remove('no-transition');
  labelGot.style.opacity = labelAgain.style.opacity = 0;
  if (!dragging) { cardEl.style.transform = ''; return; }
  dragging = false;
  const dx = e.changedTouches[0].clientX - touchX0;
  e.preventDefault();
  cardEl.style.transform = '';
  if      (dx >  75) advance('right');
  else if (dx < -75) advance('left');
}, { passive: false });

// ── Menu ──
const overlay = document.getElementById('overlay');
document.getElementById('menu-btn').addEventListener('click', () => {
  document.getElementById('saved-count').textContent = saved.size;
  document.getElementById('menu-saved').disabled = saved.size === 0;
  document.getElementById('menu-saved').style.opacity = saved.size === 0 ? '0.4' : '1';
  overlay.classList.remove('hidden');
});
document.getElementById('menu-cancel').addEventListener('click', () => overlay.classList.add('hidden'));
overlay.addEventListener('click', e => { if (e.target === overlay) overlay.classList.add('hidden'); });
document.getElementById('menu-shuffle').addEventListener('click', () => {
  overlay.classList.add('hidden');
  localStorage.removeItem('pc_session_' + activeDeckId);
  savedReview = false;
  startFresh();
});

document.getElementById('menu-saved').addEventListener('click', () => {
  overlay.classList.add('hidden');
  if (saved.size === 0) return;
  savedReview = true;
  deck    = shuffle([...saved]);
  learned = [];
  current = 0; stage = 0;
  showScreen('study');
  renderCard();
});
document.getElementById('home-btn').addEventListener('click', () => showScreen('home'));

// ── Complete ──
function showComplete() {
  document.getElementById('stat-total').textContent = phrases.length;
  document.getElementById('stat-got').textContent   = learned.length;
  document.getElementById('complete-desc').textContent =
    'You reviewed all ' + phrases.length + ' phrases.';
  showScreen('complete');
}
document.getElementById('btn-restart').addEventListener('click', () => {
  localStorage.removeItem('pc_session_' + activeDeckId);
  savedReview = false;
  startFresh();
});
document.getElementById('btn-back-home').addEventListener('click', () => showScreen('home'));

// ── Utils ──
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
function esc(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}
function showScreen(name) {
  ['home','study','complete'].forEach(s => {
    document.getElementById(s+'-screen').classList.toggle('hidden', s !== name);
  });
}

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js').catch(() => {});
}
</script>
</body>
</html>`;

writeFileSync('index.html', html);
console.log('Built. Size:', html.length, 'bytes');
