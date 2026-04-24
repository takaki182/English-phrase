import { readFileSync, writeFileSync } from 'fs';

const phrases = readFileSync('phrases_data.json', 'utf8');

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
    html { height: 100%; }
    body {
      height: 100%;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #f8fafc;
      color: #1e293b;
      overflow: hidden;
    }

    /* ── Screens ── */
    .screen {
      position: fixed;
      inset: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 24px 20px;
      padding-top: max(env(safe-area-inset-top, 0px), 24px);
      padding-bottom: max(env(safe-area-inset-bottom, 0px), 24px);
    }
    .screen.hidden { display: none; }

    /* ── Study screen ── */
    .study-inner {
      width: 100%; max-width: 420px;
      display: flex; flex-direction: column; align-items: center;
    }

    .top-bar {
      width: 100%;
      display: flex; align-items: center; justify-content: space-between;
      margin-bottom: 18px;
    }
    .icon-btn {
      background: none; border: none; font-size: 22px;
      cursor: pointer; padding: 6px; line-height: 1;
      -webkit-tap-highlight-color: transparent;
    }
    .count-pill {
      font-size: 13px; font-weight: 600; color: #64748b;
      background: #f1f5f9; padding: 5px 14px; border-radius: 99px;
    }

    .progress-track {
      width: 100%; height: 5px; background: #e2e8f0;
      border-radius: 3px; margin-bottom: 26px; overflow: hidden;
    }
    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #6366f1, #818cf8);
      border-radius: 3px;
      transition: width .4s cubic-bezier(.4,0,.2,1);
    }

    /* Card */
    .card-area { width: 100%; position: relative; margin-bottom: 24px; }

    .card {
      width: 100%; min-height: 230px;
      background: white;
      border-radius: 24px;
      box-shadow: 0 2px 24px rgba(0,0,0,.07), 0 1px 4px rgba(0,0,0,.04);
      padding: 36px 28px;
      cursor: pointer;
      display: flex; flex-direction: column;
      align-items: center; justify-content: center; text-align: center;
      -webkit-tap-highlight-color: transparent;
      touch-action: pan-y;
      will-change: transform;
      user-select: none;
    }
    .card.no-transition { transition: none !important; }

    @keyframes flyRight { to { transform: translateX(130%) rotate(15deg); opacity: 0; } }
    @keyframes flyLeft  { to { transform: translateX(-130%) rotate(-15deg); opacity: 0; } }
    @keyframes popIn    { from { transform: scale(.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }

    .card.fly-right { animation: flyRight .28s ease-in forwards; }
    .card.fly-left  { animation: flyLeft  .28s ease-in forwards; }
    .card.pop-in    { animation: popIn    .22s ease-out; }

    .card-phrase {
      font-size: clamp(17px, 4.5vw, 22px);
      font-weight: 700; line-height: 1.55; color: #0f172a;
    }
    .card-divider {
      width: 36px; height: 2px; background: #e2e8f0;
      border-radius: 1px; margin: 18px auto;
    }
    .card-meaning { font-size: 15px; color: #475569; line-height: 1.6; }
    .card-example {
      font-size: 14px; color: #94a3b8; line-height: 1.6;
      margin-top: 10px; font-style: italic;
    }
    .card-tap-hint { font-size: 12px; color: #cbd5e1; margin-top: 18px; letter-spacing: .3px; }

    /* Swipe labels */
    .swipe-label {
      position: absolute; top: 50%; transform: translateY(-50%);
      font-size: 13px; font-weight: 800; letter-spacing: .8px;
      padding: 6px 14px; border-radius: 8px;
      opacity: 0; pointer-events: none; border: 2px solid;
    }
    .swipe-label.got   { right: 10px; color: #16a34a; background: #dcfce7; border-color: #16a34a; }
    .swipe-label.again { left: 10px;  color: #dc2626; background: #fee2e2; border-color: #dc2626; }

    /* Buttons */
    .action-btns { width: 100%; display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .action-btn {
      padding: 18px 12px; border: none; border-radius: 16px;
      font-size: 15px; font-weight: 700; cursor: pointer;
      display: flex; flex-direction: column; align-items: center; gap: 4px;
      -webkit-tap-highlight-color: transparent; transition: transform .1s;
    }
    .action-btn:active { transform: scale(.96); }
    .btn-again { background: #fff1f2; color: #e11d48; }
    .btn-got   { background: #f0fdf4; color: #16a34a; }
    .btn-icon  { font-size: 20px; }
    .btn-text  { font-size: 13px; }

    /* ── Complete screen ── */
    .complete-emoji { font-size: 72px; margin-bottom: 14px; }
    .complete-title { font-size: 26px; font-weight: 800; margin-bottom: 8px; }
    .complete-desc  { color: #64748b; font-size: 15px; margin-bottom: 36px; text-align: center; }

    .stats-row { display: flex; gap: 16px; margin-bottom: 36px; }
    .stat-box {
      text-align: center; background: white;
      border-radius: 16px; padding: 16px 28px;
      box-shadow: 0 1px 8px rgba(0,0,0,.06);
    }
    .stat-num   { font-size: 30px; font-weight: 800; color: #6366f1; }
    .stat-label { font-size: 12px; color: #94a3b8; margin-top: 2px; }

    .complete-actions { width: 100%; max-width: 320px; display: flex; flex-direction: column; gap: 10px; }
    .btn-block {
      width: 100%; padding: 16px; border: none; border-radius: 14px;
      font-size: 16px; font-weight: 700; cursor: pointer;
      -webkit-tap-highlight-color: transparent; transition: transform .1s;
    }
    .btn-block:active { transform: scale(.97); }
    .btn-primary   { background: #6366f1; color: white; }
    .btn-secondary { background: #f1f5f9; color: #334155; }

    /* ── Menu overlay ── */
    .overlay {
      position: fixed; inset: 0; background: rgba(0,0,0,.4);
      display: flex; align-items: flex-end; justify-content: center;
      padding: 20px; z-index: 100;
    }
    .overlay.hidden { display: none; }
    .menu-sheet {
      background: white; border-radius: 20px; padding: 20px;
      width: 100%; max-width: 420px;
    }
    .menu-title { font-size: 13px; font-weight: 600; color: #94a3b8; margin-bottom: 12px; text-transform: uppercase; letter-spacing: .5px; }
    .menu-item {
      width: 100%; padding: 14px 16px; border: none; border-radius: 12px;
      background: #f8fafc; font-size: 15px; font-weight: 600; color: #1e293b;
      cursor: pointer; text-align: left; margin-bottom: 8px;
      -webkit-tap-highlight-color: transparent;
    }
    .menu-item:last-child { margin-bottom: 0; }
    .menu-item.danger { color: #e11d48; background: #fff1f2; }
    .menu-cancel {
      width: 100%; padding: 14px; border: none; border-radius: 12px;
      background: #f1f5f9; font-size: 15px; font-weight: 700; color: #64748b;
      cursor: pointer; margin-top: 8px;
      -webkit-tap-highlight-color: transparent;
    }
  </style>
</head>
<body>

<!-- ══ STUDY ══ -->
<div class="screen" id="study-screen">
  <div class="study-inner">
    <div class="top-bar">
      <button class="icon-btn" id="menu-btn" title="Menu">⋯</button>
      <div class="count-pill" id="count-pill">0 / 0</div>
      <div style="width:34px"></div>
    </div>

    <div class="progress-track">
      <div class="progress-fill" id="progress-fill" style="width:0%"></div>
    </div>

    <div class="card-area">
      <div class="card" id="card">
        <div class="card-phrase" id="card-phrase"></div>
        <div id="back-slot"></div>
        <div class="card-tap-hint" id="tap-hint">tap to reveal</div>
      </div>
      <div class="swipe-label got"   id="label-got">GOT IT ✓</div>
      <div class="swipe-label again" id="label-again">AGAIN ✗</div>
    </div>

    <div class="action-btns">
      <button class="action-btn btn-again" id="btn-again">
        <span class="btn-icon">↩</span>
        <span class="btn-text">Again</span>
      </button>
      <button class="action-btn btn-got" id="btn-got">
        <span class="btn-icon">✓</span>
        <span class="btn-text">Got it</span>
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
    <button class="btn-block btn-primary" id="btn-restart">Study again</button>
  </div>
</div>

<!-- ══ MENU OVERLAY ══ -->
<div class="overlay hidden" id="overlay">
  <div class="menu-sheet">
    <div class="menu-title">Options</div>
    <button class="menu-item" id="menu-shuffle">🔀 Shuffle & restart</button>
    <button class="menu-item" id="menu-review-again">↩ Review "Again" cards only</button>
    <button class="menu-cancel" id="menu-cancel">Cancel</button>
  </div>
</div>

<script>
'use strict';

const ALL_PHRASES = ${phrases};

// ── State ──────────────────────────────────────────
let deck    = [];
let learned = [];
let current = 0;
let showingBack = false;
let busy = false;

// ── Init ──────────────────────────────────────────
function init() {
  const raw = localStorage.getItem('pc_session');
  if (raw) {
    try {
      const s = JSON.parse(raw);
      // Validate indices still match phrase count
      if (s.total === ALL_PHRASES.length) {
        deck    = s.deck;
        learned = s.learned;
        if (deck.length === 0) { showComplete(); return; }
        current = 0;
        renderCard();
        return;
      }
    } catch { /* fall through */ }
  }
  startFresh();
}

function startFresh() {
  deck    = shuffle(ALL_PHRASES.map((_, i) => i));
  learned = [];
  current = 0;
  saveSession();
  showScreen('study');
  renderCard();
}

function saveSession() {
  localStorage.setItem('pc_session', JSON.stringify({
    deck, learned, total: ALL_PHRASES.length
  }));
}

// ── Render card ───────────────────────────────────
function renderCard() {
  const p = ALL_PHRASES[deck[current]];
  document.getElementById('card-phrase').textContent = p.english;
  document.getElementById('back-slot').innerHTML = '';
  showingBack = false;

  const hint = document.getElementById('tap-hint');
  hint.textContent = 'tap to reveal';
  hint.style.display = '';

  const total = deck.length + learned.length;
  const done  = learned.length;
  document.getElementById('count-pill').textContent = done + ' / ' + total;
  document.getElementById('progress-fill').style.width =
    (total > 0 ? (done / total * 100) : 0) + '%';
}

function toggleBack() {
  if (showingBack) return; // don't re-hide once shown
  showingBack = true;

  const p = ALL_PHRASES[deck[current]];
  const hint = document.getElementById('tap-hint');
  hint.style.display = 'none';

  let html = '<div class="card-divider"></div>';
  if (p.meaning) {
    html += '<div class="card-meaning">' + esc(p.meaning) + '</div>';
  }
  if (p.example) {
    html += '<div class="card-example">"' + esc(p.example) + '"</div>';
  }
  document.getElementById('back-slot').innerHTML = html;
}

function esc(s) {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

// ── Animate & advance ─────────────────────────────
function advance(dir) {
  if (busy) return;
  busy = true;

  const card = document.getElementById('card');
  card.classList.add(dir === 'right' ? 'fly-right' : 'fly-left');

  setTimeout(() => {
    card.classList.remove('fly-right', 'fly-left');

    if (dir === 'right') {
      learned.push(deck.splice(current, 1)[0]);
    } else {
      const removed = deck.splice(current, 1)[0];
      const lo = current + 1;
      const hi = deck.length;
      const pos = lo + Math.floor(Math.random() * Math.max(hi - lo + 1, 1));
      deck.splice(Math.min(pos, deck.length), 0, removed);
    }
    if (current >= deck.length && deck.length > 0) current = 0;
    saveSession();

    if (deck.length === 0) { showComplete(); busy = false; return; }

    renderCard();
    card.classList.add('pop-in');
    setTimeout(() => { card.classList.remove('pop-in'); busy = false; }, 220);
  }, 280);
}

document.getElementById('btn-got').addEventListener('click',   () => advance('right'));
document.getElementById('btn-again').addEventListener('click', () => advance('left'));
document.getElementById('card').addEventListener('click', toggleBack);

// ── Swipe ─────────────────────────────────────────
let touchX0 = 0, touchY0 = 0, dragging = false;
const cardEl     = document.getElementById('card');
const labelGot   = document.getElementById('label-got');
const labelAgain = document.getElementById('label-again');

cardEl.addEventListener('touchstart', e => {
  if (busy) return;
  touchX0 = e.touches[0].clientX;
  touchY0 = e.touches[0].clientY;
  dragging = false;
  cardEl.classList.add('no-transition');
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

// ── Menu ──────────────────────────────────────────
const overlay = document.getElementById('overlay');

document.getElementById('menu-btn').addEventListener('click', () => {
  overlay.classList.remove('hidden');
});
document.getElementById('menu-cancel').addEventListener('click', () => {
  overlay.classList.add('hidden');
});
overlay.addEventListener('click', e => {
  if (e.target === overlay) overlay.classList.add('hidden');
});

document.getElementById('menu-shuffle').addEventListener('click', () => {
  overlay.classList.add('hidden');
  localStorage.removeItem('pc_session');
  startFresh();
});

document.getElementById('menu-review-again').addEventListener('click', () => {
  overlay.classList.add('hidden');
  // Review only cards still in deck (not yet learned this session)
  deck = shuffle(deck);
  learned = [];
  current = 0;
  saveSession();
  showScreen('study');
  renderCard();
});

// ── Complete ──────────────────────────────────────
function showComplete() {
  const total = ALL_PHRASES.length;
  const got   = learned.length;
  document.getElementById('stat-total').textContent = total;
  document.getElementById('stat-got').textContent   = got;
  document.getElementById('complete-desc').textContent =
    'You reviewed all ' + total + ' phrases.';
  showScreen('complete');
}

document.getElementById('btn-restart').addEventListener('click', () => {
  localStorage.removeItem('pc_session');
  startFresh();
});

// ── Utils ─────────────────────────────────────────
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function showScreen(name) {
  ['study', 'complete'].forEach(s => {
    document.getElementById(s + '-screen').classList.toggle('hidden', s !== name);
  });
}

// ── Service Worker ────────────────────────────────
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js').catch(() => {});
}

init();
</script>
</body>
</html>`;

writeFileSync('index.html', html);
console.log('index.html written, size:', html.length, 'bytes');
