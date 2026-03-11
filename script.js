/* ═══════════════════════════════════════════════
   Evelyn & Isac · Wedding Website · script.js
   ═══════════════════════════════════════════════ */
'use strict';

const WEDDING_DATE = new Date('2026-03-21T15:00:00');
const SITE_URL     = window.location.href;

/* ─── INTRO READY — triggers CSS animations once page is loaded ── */
// Small delay lets fonts & CSS settle before animating
window.addEventListener('load', () => {
  setTimeout(() => {
    const intro = document.getElementById('intro');
    if (intro) intro.classList.add('ready');
  }, 80);
});

/* ─── CLOSE INTRO ───────────────────────────────── */
function closeIntro() {
  const el = document.getElementById('intro');
  el.classList.add('out');
  setTimeout(() => { el.style.display = 'none'; }, 940);
}

/* ═══════════════════════════════════════════════
   PARTICLES (Canvas)
   ═══════════════════════════════════════════════ */
(function initParticles() {
  const canvas = document.getElementById('particles');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const pts = [];
  const N   = 18;

  function resize() {
    canvas.width  = canvas.offsetWidth  || window.innerWidth;
    canvas.height = canvas.offsetHeight || window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize, { passive: true });

  for (let i = 0; i < N; i++) {
    pts.push({
      x:  Math.random() * (canvas.width  || 400),
      y:  Math.random() * (canvas.height || 600),
      r:  Math.random() * 1.3 + .4,
      vx: (Math.random() - .5) * .2,
      vy: -(Math.random() * .4 + .15),
      op: Math.random() * .45 + .08,
    });
  }

  function draw() {
    const w = canvas.width, h = canvas.height;
    ctx.clearRect(0, 0, w, h);
    pts.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(201,168,76,${p.op})`;
      ctx.fill();
      p.x += p.vx;
      p.y += p.vy;
      if (p.y < -4) { p.y = h + 4; p.x = Math.random() * w; }
      if (p.x < -4 || p.x > w + 4) p.x = Math.random() * w;
    });
    requestAnimationFrame(draw);
  }
  draw();
})();

/* ─── HERO PARALLAX (desktop only) ─────────────── */
if (!('ontouchstart' in window)) {
  const bg = document.querySelector('.hero-bg');
  window.addEventListener('scroll', () => {
    if (bg) bg.style.transform = `translateY(${window.scrollY * .16}px)`;
  }, { passive: true });
}

/* ═══════════════════════════════════════════════
   SCROLL REVEAL
   ═══════════════════════════════════════════════ */
const revObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      revObs.unobserve(e.target);
    }
  });
}, { threshold: .1, rootMargin: '0px 0px -24px 0px' });

document.querySelectorAll('.reveal').forEach(el => revObs.observe(el));

/* ═══════════════════════════════════════════════
   COUNTDOWN
   ═══════════════════════════════════════════════ */
const prevVals = {};

function pad(n) { return n < 10 ? '0' + n : String(n); }

function tick() {
  const diff = WEDDING_DATE - Date.now();
  const msg  = document.getElementById('cdMsg');

  if (diff <= 0) {
    ['d','h','m','s'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.textContent = '00';
    });
    if (msg) { msg.textContent = 'Hoy es el gran día'; msg.classList.add('show'); }
    return;
  }

  const days = Math.floor(diff / 86400000);
  const vals = {
    d: String(days),
    h: pad(Math.floor((diff % 86400000) / 3600000)),
    m: pad(Math.floor((diff % 3600000)  / 60000)),
    s: pad(Math.floor((diff % 60000)    / 1000)),
  };

  Object.entries(vals).forEach(([id, v]) => {
    if (prevVals[id] === v) return;
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = v;
    el.classList.remove('flip');
    void el.offsetWidth;
    el.classList.add('flip');
    prevVals[id] = v;
  });

  if (msg && days < 7 && !msg.classList.contains('show')) {
    msg.textContent = days === 0
      ? 'Mañana nos casamos'
      : `Solo faltan ${days} día${days !== 1 ? 's' : ''}`;
    msg.classList.add('show');
  }
}

tick();
setInterval(tick, 1000);

/* ═══════════════════════════════════════════════
   GALLERY — click listeners + lightbox
   ═══════════════════════════════════════════════ */
let lbIdx = 0, lbSrcs = [], lbTouchX = 0;

function buildLb() {
  lbSrcs = Array.from(document.querySelectorAll('.ph img')).map(i => i.src);
}

document.querySelectorAll('.ph').forEach(ph => {
  ph.addEventListener('click', () => {
    buildLb();
    lbIdx = parseInt(ph.dataset.idx, 10) || 0;
    showLbImg();
    document.getElementById('lb').classList.add('open');
    document.body.style.overflow = 'hidden';
  });
});

function closeLb() {
  document.getElementById('lb').classList.remove('open');
  document.body.style.overflow = '';
}

function lbNav(dir, e) {
  if (e) e.stopPropagation();
  lbIdx = (lbIdx + dir + lbSrcs.length) % lbSrcs.length;
  showLbImg();
}

function showLbImg() {
  const img = document.getElementById('lbImg');
  img.style.opacity = '0';
  setTimeout(() => { img.src = lbSrcs[lbIdx]; img.style.opacity = '1'; }, 110);
}

const lb = document.getElementById('lb');
lb.addEventListener('touchstart', e => { lbTouchX = e.changedTouches[0].screenX; }, { passive: true });
lb.addEventListener('touchend', e => {
  const d = lbTouchX - e.changedTouches[0].screenX;
  if (Math.abs(d) > 40) lbNav(d > 0 ? 1 : -1, null);
});

document.addEventListener('keydown', e => {
  if (!lb.classList.contains('open')) return;
  if (e.key === 'Escape')     closeLb();
  if (e.key === 'ArrowRight') lbNav(1, null);
  if (e.key === 'ArrowLeft')  lbNav(-1, null);
});

/* ═══════════════════════════════════════════════
   INVITATION TICKET
   Se genera automáticamente tras confirmar asistencia
   ═══════════════════════════════════════════════ */
function generateTicket(name) {
  if (!name) return;

  document.getElementById('ticketGuest').textContent = name;

  const qrEl = document.getElementById('qrcode');
  qrEl.innerHTML = '';

  try {
    new QRCode(qrEl, {
      text: `Boda Evelyn & Isac | 21.03.2026 | Salamanca GTO | ${name}`,
      width: 88, height: 88,
      colorDark: '#0f0d0a', colorLight: '#ffffff',
      correctLevel: QRCode.CorrectLevel.M,
    });
  } catch(err) {
    qrEl.innerHTML = '<p style="color:#7a6e63;font-size:.55rem;">QR</p>';
  }
}

function downloadTicket() {
  if (typeof html2canvas === 'undefined') { showToast('Cargando...'); return; }
  showToast('Generando imagen...');

  html2canvas(document.getElementById('ticket'), {
    backgroundColor: '#0f0d0a', scale: 2.5,
    useCORS: true, allowTaint: true, logging: false,
  }).then(canvas => {
    const name  = (document.getElementById('ticketGuest').textContent || 'invitado')
                  .replace(/[^a-zA-ZáéíóúüñÁÉÍÓÚÜÑ\s]/g,'').trim().replace(/\s+/g,'-');
    const a = document.createElement('a');
    a.download = `invitacion-evelyn-isac-${name}.png`;
    a.href = canvas.toDataURL('image/png');
    a.click();
    showToast('Descargada');
  }).catch(() => showToast('Error al descargar, intenta de nuevo'));
}

function shareTicket() {
  const text = 'Estoy invitado a la boda civil de Evelyn & Isac el 21 de Marzo 2026 en Salamanca, Gto.';
  if (navigator.share) {
    navigator.share({ title: 'Boda Evelyn & Isac', text, url: SITE_URL }).catch(() => {});
  } else {
    navigator.clipboard.writeText(text + '\n' + SITE_URL)
      .then(() => showToast('Enlace copiado'))
      .catch(() => showToast('Copia el enlace de tu navegador'));
  }
}

/* ═══════════════════════════════════════════════
   RSVP
   Las confirmaciones se envían a:
   https://formspree.io/f/xaqpqlkz
   (recibes un email por cada respuesta)
   También se guardan en localStorage del invitado.
   ═══════════════════════════════════════════════ */

/* Lista de nombres autorizados para recepción familiar */
const FAMILIA = new Set([
  'evelyn','azmin','rubi','fernando','melody','martin','lidia',
  'alma','ruth','maria','claudia','yolanda','marisol','david',
  'jonathan','ausencio','alicia','gerardo','diego','karen','kevin', 'belen','hannia', 'ruben', 'franco','reinaldo','oswaldo','aleida', 'jorge','eduardo','eddy','hilda', 'castillo', 'lozano' 
]);

function esFamiliar(nombreCompleto) {
  /* Toma el primer nombre, quita acentos, compara en minúsculas */
  const primero = nombreCompleto.trim().split(/\s+/)[0];
  const normalizado = primero.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  return FAMILIA.has(normalizado);
}

/* Valida en tiempo real — solo después de que el usuario ha interactuado */
(function initFamilyValidation() {
  const groupSel = document.getElementById('rsvpGroup');
  const nameIn   = document.getElementById('rsvpName');
  const msg      = document.getElementById('familyError');
  if (!groupSel || !nameIn || !msg) return;

  // Flags: only validate after user has touched each field
  let groupTouched = false;
  let nameTouched  = false;

  function check() {
    const esFam  = groupSel.value === 'Familia - 3:00 PM';
    const nombre = nameIn.value.trim();

    // Only show error if: familia selected + name typed + not in list
    if (groupTouched && esFam && nameTouched && nombre && !esFamiliar(nombre)) {
      msg.classList.add('visible');
      groupSel.classList.add('family-restricted');
    } else {
      msg.classList.remove('visible');
      groupSel.classList.remove('family-restricted');
    }
  }

  groupSel.addEventListener('change', () => { groupTouched = true; check(); });
  nameIn.addEventListener('input',    () => { nameTouched  = true; check(); });
  // Also re-check when user returns to name field after selecting familia
  nameIn.addEventListener('blur',     check);
})();

async function handleRSVP(e) {
  e.preventDefault();

  const required = ['rsvpName', 'rsvpCount', 'rsvpGroup', 'rsvpConfirm'];
  let ok = true;

  required.forEach(id => {
    const el = document.getElementById(id);
    el.classList.remove('bad');
    if (!el.value.trim()) { el.classList.add('bad'); ok = false; }
  });

  if (!ok) { showToast('Completa los campos obligatorios'); return; }

  /* Validar acceso familiar */
  const nombre = document.getElementById('rsvpName').value.trim();
  const grupo  = document.getElementById('rsvpGroup').value;

  if (grupo === 'Familia - 3:00 PM' && !esFamiliar(nombre)) {
    const errEl = document.getElementById('familyError');
    const selEl = document.getElementById('rsvpGroup');
    errEl.classList.add('visible');
    selEl.classList.add('family-restricted');
    errEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return;
  }

  const form = document.getElementById('rsvpForm');

  const payload = {
    name:    document.getElementById('rsvpName').value.trim(),
    phone:   document.getElementById('rsvpPhone').value.trim(),
    count:   document.getElementById('rsvpCount').value,
    group:   document.getElementById('rsvpGroup').value,
    confirm: document.getElementById('rsvpConfirm').value,
    message: document.getElementById('rsvpMsg').value.trim(),
    ts:      new Date().toISOString(),
  };

  /* Save locally */
  try {
    const all = JSON.parse(localStorage.getItem('ei_rsvps') || '[]');
    all.push(payload);
    localStorage.setItem('ei_rsvps', JSON.stringify(all));
    localStorage.setItem('ei_my_rsvp', JSON.stringify(payload));
  } catch(_) {}

  /* Send to Formspree */
  try {
    await fetch(form.action, {
      method: 'POST',
      body: new FormData(form),
      headers: { 'Accept': 'application/json' },
    });
  } catch(err) {
    console.warn('Formspree:', err);
    /* Still show success — data saved locally */
  }

  showSuccess(payload);
}

function showSuccess(data) {
  const grp = (data.group || '').includes('Familia')
    ? 'recepción familiar a las 3:00 PM'
    : 'recepción con amigos a las 7:00 PM';

  const msgs = {
    'Si, ahi estare':     { t: 'Gracias',       b: `Que emoción tenerte con nosotros, <b>${esc(data.name)}</b>. Te esperamos en la ${grp}.` },
    'No podre asistir':   { t: 'Lo entendemos', b: `Gracias por avisarnos, <b>${esc(data.name)}</b>. Los llevaremos en nuestro corazón ese día.` },
    'Lo confirmo pronto': { t: 'Anotado',        b: `Gracias <b>${esc(data.name)}</b>. Esperamos que puedas confirmar pronto.` },
  };

  const r = msgs[data.confirm] || msgs['Si, ahi estare'];
  document.getElementById('rsvpTitle').textContent = r.t;
  document.getElementById('rsvpBody').innerHTML    = r.b;
  document.getElementById('rsvpForm').style.display = 'none';
  document.getElementById('rsvpOk').style.display   = 'block';

  /* Mostrar invitación SOLO si va a asistir */
  const invSection = document.getElementById('invitation');
  if (data.confirm === 'Si, ahi estare') {
    invSection.classList.remove('inv-hidden');
    invSection.classList.add('inv-visible');

    // Generate ticket with the confirmed name, slight delay for section to render
    setTimeout(() => {
      generateTicket(data.name);
      invSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 450);
    showToast('Confirmación recibida · Tu invitación está lista');
  } else {
    invSection.classList.add('inv-hidden');
    invSection.classList.remove('inv-visible');
    showToast('Confirmación recibida');
  }
}

function resetRSVP() {
  localStorage.removeItem('ei_my_rsvp');
  document.getElementById('rsvpForm').style.display = 'flex';
  document.getElementById('rsvpOk').style.display   = 'none';
  ['rsvpName','rsvpPhone','rsvpCount','rsvpMsg'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  document.getElementById('rsvpGroup').value   = '';
  document.getElementById('rsvpConfirm').value = '';

  // Hide invitation section again
  const invSection = document.getElementById('invitation');
  if (invSection) {
    invSection.classList.add('inv-hidden');
    invSection.classList.remove('inv-visible');
  }
}

/* Restore previous answer on reload */
(function restore() {
  try {
    const prev = JSON.parse(localStorage.getItem('ei_my_rsvp'));
    if (prev) showSuccess(prev);
  } catch(_) {}
  // If no saved answer, make sure invitation stays hidden
  const invSection = document.getElementById('invitation');
  if (invSection && invSection.classList.contains('inv-hidden')) {
    // already hidden, nothing to do
  }
})();

/* ─── TOAST ─────────────────────────────────────── */
let _tt;
function showToast(msg) {
  const el = document.getElementById('toast');
  if (!el) return;
  clearTimeout(_tt);
  el.textContent = msg;
  el.classList.add('show');
  _tt = setTimeout(() => el.classList.remove('show'), 3000);
}

/* ─── SMOOTH SCROLL ─────────────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const t = document.querySelector(a.getAttribute('href'));
    if (!t) return;
    e.preventDefault();
    t.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

/* ─── UTIL ───────────────────────────────────────── */
function esc(s) {
  return String(s)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;');

}
