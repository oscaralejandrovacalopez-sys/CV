/* ═══════════════════════════════════════════════════════════
   Pirates of the Caribbean — CV  |  main.js
   Author: Óscar Alejandro Vaca López
   ═══════════════════════════════════════════════════════════ */

'use strict';

/* ──────────────────────────────────────────────────────────
   1. LOADING SCREEN
   ────────────────────────────────────────────────────────── */
(function initLoader() {
  document.body.classList.add('loading');
  const loader = document.getElementById('loader');

  window.addEventListener('load', () => {
    setTimeout(() => {
      loader.classList.add('hidden');
      document.body.classList.remove('loading');
      loader.addEventListener('transitionend', () => loader.remove(), { once: true });
    }, 1800);
  });
})();


/* ──────────────────────────────────────────────────────────
   2. CUSTOM CURSOR
   ────────────────────────────────────────────────────────── */
(function initCursor() {
  const cursor      = document.getElementById('cursor');
  const cursorTrail = document.getElementById('cursor-trail');
  if (!cursor || !cursorTrail) return;

  let mx = 0, my = 0;

  document.addEventListener('mousemove', e => {
    mx = e.clientX;
    my = e.clientY;
    cursor.style.left = mx + 'px';
    cursor.style.top  = my + 'px';

    // trail follows with slight delay (handled by CSS transition)
    cursorTrail.style.left = mx + 'px';
    cursorTrail.style.top  = my + 'px';
  });

  // enlarge cursor on interactive elements
  const interactiveSelectors = 'a, button, .btn, .skill-card, .edu-card, .tag, input, textarea, .timeline-content, .nav-link';

  document.addEventListener('mouseover', e => {
    if (e.target.closest(interactiveSelectors)) {
      document.body.classList.add('cursor-hover');
    }
  });

  document.addEventListener('mouseout', e => {
    if (e.target.closest(interactiveSelectors)) {
      document.body.classList.remove('cursor-hover');
    }
  });
})();


/* ──────────────────────────────────────────────────────────
   3. OCEAN CANVAS — animated background
   ────────────────────────────────────────────────────────── */
(function initOcean() {
  const canvas = document.getElementById('ocean-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W, H, t = 0;
  const stars = [];
  const STAR_COUNT = 120;

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  window.addEventListener('resize', resize);
  resize();

  // Generate static star field
  for (let i = 0; i < STAR_COUNT; i++) {
    stars.push({
      x: Math.random(),
      y: Math.random() * 0.6,
      r: Math.random() * 1.4 + 0.3,
      alpha: Math.random() * 0.6 + 0.2,
      twinkleSpeed: Math.random() * 0.02 + 0.005
    });
  }

  function drawStars(time) {
    stars.forEach(s => {
      const twinkle = 0.5 + 0.5 * Math.sin(time * s.twinkleSpeed * 60);
      ctx.globalAlpha = s.alpha * (0.6 + 0.4 * twinkle);
      ctx.fillStyle = '#e8c547';
      ctx.beginPath();
      ctx.arc(s.x * W, s.y * H, s.r, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;
  }

  function drawOcean(time) {
    // Sky gradient (deep navy → black at top)
    const sky = ctx.createLinearGradient(0, 0, 0, H);
    sky.addColorStop(0,   '#070e16');
    sky.addColorStop(0.5, '#0d1b2a');
    sky.addColorStop(0.7, '#0d1b2a');
    sky.addColorStop(1,   '#091318');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, W, H);
  }

  function wave(x, amp, freq, phase, speed) {
    return amp * Math.sin(freq * x + phase + t * speed);
  }

  function drawWaves() {
    // Wave layers (back to front)
    const layers = [
      { yBase: 0.72, amp: 14, freq: 0.010, phase: 0,    speed: 0.5,  color: 'rgba(13,27,42,0.9)', fill: '#091318' },
      { yBase: 0.74, amp: 11, freq: 0.013, phase: 1.2,  speed: 0.7,  color: 'rgba(26,46,69,0.85)', fill: '#0d1b2a' },
      { yBase: 0.76, amp:  9, freq: 0.016, phase: 2.5,  speed: 0.9,  color: 'rgba(30,60,85,0.9)',  fill: '#132230' },
      { yBase: 0.79, amp:  7, freq: 0.020, phase: 0.8,  speed: 1.1,  color: 'rgba(44,95,110,0.85)', fill: '#1a3040' },
      { yBase: 0.82, amp:  5, freq: 0.024, phase: 3.1,  speed: 1.3,  color: 'rgba(44,95,110,0.7)', fill: '#1e3a4a' },
    ];

    layers.forEach(layer => {
      const yBase = layer.yBase * H;
      ctx.beginPath();
      ctx.moveTo(0, H);
      for (let x = 0; x <= W; x += 2) {
        const y = yBase + wave(x, layer.amp, layer.freq, layer.phase, layer.speed);
        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.lineTo(W, H);
      ctx.closePath();

      const grad = ctx.createLinearGradient(0, yBase, 0, H);
      grad.addColorStop(0, layer.color);
      grad.addColorStop(1, layer.fill);
      ctx.fillStyle = grad;
      ctx.fill();

      // Wave crest highlight
      ctx.beginPath();
      for (let x = 0; x <= W; x += 2) {
        const y = yBase + wave(x, layer.amp, layer.freq, layer.phase, layer.speed);
        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.strokeStyle = 'rgba(201,162,39,0.04)';
      ctx.lineWidth = 1;
      ctx.stroke();
    });
  }

  function drawMoon() {
    const mx = W * 0.82;
    const my = H * 0.12;
    // Glow
    const moonGlow = ctx.createRadialGradient(mx, my, 0, mx, my, 90);
    moonGlow.addColorStop(0,   'rgba(201,162,39,0.12)');
    moonGlow.addColorStop(0.5, 'rgba(201,162,39,0.04)');
    moonGlow.addColorStop(1,   'transparent');
    ctx.fillStyle = moonGlow;
    ctx.beginPath();
    ctx.arc(mx, my, 90, 0, Math.PI * 2);
    ctx.fill();

    // Moon disc
    ctx.fillStyle = '#f0d060';
    ctx.beginPath();
    ctx.arc(mx, my, 28, 0, Math.PI * 2);
    ctx.fill();

    // Crescent shadow
    ctx.fillStyle = '#0a0f18';
    ctx.beginPath();
    ctx.arc(mx + 10, my - 4, 24, 0, Math.PI * 2);
    ctx.fill();

    // Moon reflection on water
    const ry = H * 0.78;
    const reflGrad = ctx.createLinearGradient(mx - 20, ry, mx + 20, ry + 60);
    reflGrad.addColorStop(0,   'rgba(201,162,39,0.0)');
    reflGrad.addColorStop(0.3, 'rgba(201,162,39,0.12)');
    reflGrad.addColorStop(0.7, 'rgba(201,162,39,0.08)');
    reflGrad.addColorStop(1,   'rgba(201,162,39,0.0)');
    ctx.fillStyle = reflGrad;
    ctx.fillRect(mx - 20, ry, 40, 60);
  }

  function tick(time) {
    t = time * 0.001;
    drawOcean();
    drawStars(time * 0.001);
    drawMoon();
    drawWaves();
    requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);
})();


/* ──────────────────────────────────────────────────────────
   4. FLOATING PARTICLES (gold dust / sea foam)
   ────────────────────────────────────────────────────────── */
(function initParticles() {
  const PARTICLE_COUNT = 18;
  const colors = ['rgba(201,162,39,0.6)', 'rgba(232,197,71,0.5)', 'rgba(44,95,110,0.6)', 'rgba(244,228,193,0.4)'];

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const el = document.createElement('div');
    el.className = 'particle';
    const size = Math.random() * 4 + 2;
    el.style.cssText = `
      width:  ${size}px;
      height: ${size}px;
      left:   ${Math.random() * 100}vw;
      background: ${colors[Math.floor(Math.random() * colors.length)]};
      animation-duration:  ${Math.random() * 20 + 15}s;
      animation-delay:    -${Math.random() * 20}s;
    `;
    document.body.appendChild(el);
  }
})();


/* ──────────────────────────────────────────────────────────
   5. NAVBAR — scroll behavior & mobile menu
   ────────────────────────────────────────────────────────── */
(function initNavbar() {
  const navbar    = document.getElementById('navbar');
  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.querySelector('.nav-links');

  // Scroll → add class for styled background
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 80);
    updateActiveLink();
  }, { passive: true });

  // Mobile menu toggle
  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      const open = hamburger.classList.toggle('open');
      navLinks.classList.toggle('open', open);
      document.body.style.overflow = open ? 'hidden' : '';
    });

    // Close on link click
    navLinks.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('open');
        navLinks.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }

  function updateActiveLink() {
    const sections = document.querySelectorAll('section[id], header[id]');
    const scrollY  = window.scrollY + 120;

    sections.forEach(sec => {
      const link = document.querySelector(`.nav-link[href="#${sec.id}"]`);
      if (!link) return;
      const top    = sec.offsetTop;
      const bottom = top + sec.offsetHeight;
      link.classList.toggle('active', scrollY >= top && scrollY < bottom);
    });
  }

  updateActiveLink();
})();


/* ──────────────────────────────────────────────────────────
   6. SCROLL REVEAL (Intersection Observer)
   ────────────────────────────────────────────────────────── */
(function initReveal() {
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          // stagger siblings
          const siblings = entry.target.parentElement
            ? Array.from(entry.target.parentElement.querySelectorAll('.reveal'))
            : [];
          const idx = siblings.indexOf(entry.target);
          entry.target.style.transitionDelay = (idx * 0.1) + 's';
          entry.target.classList.add('visible');
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  document.querySelectorAll('.reveal').forEach(el => io.observe(el));
})();


/* ──────────────────────────────────────────────────────────
   7. SKILL BAR ANIMATION (triggered on scroll)
   ────────────────────────────────────────────────────────── */
(function initSkillBars() {
  const skillsSection = document.getElementById('skills');
  if (!skillsSection) return;

  let animated = false;

  const observer = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting && !animated) {
      animated = true;
      document.querySelectorAll('.skill-fill').forEach(fill => {
        const level = fill.dataset.level || '0';
        fill.style.width = level + '%';
      });
    }
  }, { threshold: 0.2 });

  observer.observe(skillsSection);
})();


/* ──────────────────────────────────────────────────────────
   8. BACK TO TOP BUTTON
   ────────────────────────────────────────────────────────── */
(function initBackToTop() {
  const btn = document.createElement('button');
  btn.id = 'back-to-top';
  btn.setAttribute('aria-label', 'Volver arriba');
  btn.innerHTML = '&#9650;';
  document.body.appendChild(btn);

  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 400);
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();


/* ──────────────────────────────────────────────────────────
   9. CONTACT FORM (demo handler)
   ────────────────────────────────────────────────────────── */
(function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  form.addEventListener('submit', e => {
    e.preventDefault();
    const btnText    = form.querySelector('.btn-text');
    const btnSending = form.querySelector('.btn-sending');
    const submitBtn  = form.querySelector('[type="submit"]');

    // Validate
    const name    = form.querySelector('#name').value.trim();
    const email   = form.querySelector('#email').value.trim();
    const message = form.querySelector('#message').value.trim();

    if (!name || !email || !message) {
      showToast('Por favor completa los campos requeridos, marinero.', 'warning');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showToast('Esa no parece una paloma mensajera válida (email incorrecto).', 'warning');
      return;
    }

    // Fake sending animation
    submitBtn.disabled = true;
    btnText.style.display    = 'none';
    btnSending.style.display = 'inline';

    setTimeout(() => {
      submitBtn.disabled = false;
      btnText.style.display    = 'inline';
      btnSending.style.display = 'none';
      form.reset();
      showToast('¡Mensaje lanzado al mar! (demo — conecta un servicio real para enviarlo de verdad)', 'success');
    }, 2000);
  });
})();


/* ──────────────────────────────────────────────────────────
   10. TOAST NOTIFICATION
   ────────────────────────────────────────────────────────── */
function showToast(message, type = 'info') {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = 'toast toast-' + type;
  toast.textContent = message;
  toast.style.cssText = `
    position: fixed;
    bottom: 5rem;
    left: 50%;
    transform: translateX(-50%) translateY(20px);
    background: ${type === 'success' ? '#1a4a1a' : type === 'warning' ? '#4a3a0a' : '#0a2040'};
    border: 1px solid ${type === 'success' ? '#3a8a3a' : type === 'warning' ? '#c9a227' : '#2c5f6e'};
    color: #f4e4c1;
    padding: 1rem 2rem;
    font-family: 'Cinzel', serif;
    font-size: 0.85rem;
    letter-spacing: 0.06em;
    z-index: 9990;
    max-width: 90vw;
    text-align: center;
    opacity: 0;
    transition: opacity 0.4s ease, transform 0.4s ease;
    box-shadow: 0 4px 20px rgba(0,0,0,0.5);
  `;
  document.body.appendChild(toast);

  requestAnimationFrame(() => {
    toast.style.opacity   = '1';
    toast.style.transform = 'translateX(-50%) translateY(0)';
  });

  setTimeout(() => {
    toast.style.opacity   = '0';
    toast.style.transform = 'translateX(-50%) translateY(20px)';
    toast.addEventListener('transitionend', () => toast.remove(), { once: true });
  }, 4000);
}


/* ──────────────────────────────────────────────────────────
   11. PARALLAX — hero elements on mouse move
   ────────────────────────────────────────────────────────── */
(function initParallax() {
  const hero    = document.getElementById('hero');
  const ship    = document.querySelector('.hero-ship');
  const content = document.querySelector('.hero-content');
  if (!hero || !ship) return;

  hero.addEventListener('mousemove', e => {
    const { clientX: x, clientY: y } = e;
    const cx = window.innerWidth  / 2;
    const cy = window.innerHeight / 2;
    const dx = (x - cx) / cx;
    const dy = (y - cy) / cy;

    ship.style.transform    = `translateY(calc(-14px * ${0.5 + 0.5 * Math.sin(Date.now() * 0.001)})) rotate(${dx * 3}deg) translateX(${dx * 10}px)`;
    content.style.transform = `translate(${dx * -6}px, ${dy * -4}px)`;
  });

  hero.addEventListener('mouseleave', () => {
    ship.style.transform    = '';
    content.style.transform = '';
  });
})();


/* ──────────────────────────────────────────────────────────
   12. FOOTER — current year
   ────────────────────────────────────────────────────────── */
(function setYear() {
  const el = document.getElementById('year');
  if (el) el.textContent = new Date().getFullYear();
})();


/* ──────────────────────────────────────────────────────────
   13. COMPASS CLICK EASTER EGG
   ────────────────────────────────────────────────────────── */
(function initCompassEgg() {
  const compass = document.getElementById('nav-compass');
  if (!compass) return;

  const quotes = [
    '"No es la carga del mapa… sino el tesoro al final." — Jack Sparrow (casi)',
    '"Más que una guía… es una sugerencia." — Capitán Jack',
    '"El código, como el rum, nunca se acaba cuando más lo necesitas."',
    '"Por qué está el ron SIEMPRE vacío?"',
    '"Un buen desarrollador sabe cuándo hacer refactor y cuándo huir."',
    '"Me llamo Capitán Jack Sparrow… ¿o Óscar? Difícil de decir."',
  ];

  let idx = 0;

  compass.addEventListener('click', () => {
    showToast(quotes[idx % quotes.length], 'info');
    idx++;
    compass.style.transform = `rotate(${idx * 90}deg)`;
    compass.style.transition = 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)';
  });
})();


/* ──────────────────────────────────────────────────────────
   14. TYPING EFFECT — hero eyebrow text
   ────────────────────────────────────────────────────────── */
(function initTyping() {
  const el = document.querySelector('.hero-eyebrow');
  if (!el) return;

  const original = el.textContent.trim();
  el.textContent = '';
  el.style.opacity = '1';

  // wait for loader to finish
  setTimeout(() => {
    let i = 0;
    const interval = setInterval(() => {
      el.textContent += original[i];
      i++;
      if (i >= original.length) clearInterval(interval);
    }, 60);
  }, 2200);
})();


/* ──────────────────────────────────────────────────────────
   15. CARD TILT EFFECT — 3D hover on skill & edu cards
   ────────────────────────────────────────────────────────── */
(function initTilt() {
  const cards = document.querySelectorAll('.skill-card, .edu-card');

  cards.forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const cx = rect.width  / 2;
      const cy = rect.height / 2;
      const rotX = ((y - cy) / cy) * -8;
      const rotY = ((x - cx) / cx) *  8;
      card.style.transform = `perspective(800px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateY(-6px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
      card.style.transition = 'transform 0.5s ease';
    });

    card.addEventListener('mouseenter', () => {
      card.style.transition = 'transform 0.1s ease';
    });
  });
})();
