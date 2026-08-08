/* ============================================================
   School of Freelancing — main.js
   ============================================================ */

'use strict';

/* ---------- Matrix Rain Canvas ---------- */
function initMatrix() {
  const canvas = document.getElementById('matrix-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;

  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789$@#%&freelancing>_<{}[]';
  const fontSize = 13;
  const columns = Math.floor(canvas.width / fontSize);
  const drops = Array(columns).fill(1);

  function draw() {
    if (document.hidden) return;
    ctx.fillStyle = 'rgba(0, 36, 237, 0.05)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#ffffff';
    ctx.font = fontSize + 'px Share Tech Mono, monospace';

    for (let i = 0; i < drops.length; i++) {
      const text = chars[Math.floor(Math.random() * chars.length)];
      ctx.fillText(text, i * fontSize, drops[i] * fontSize);
      if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) drops[i] = 0;
      drops[i]++;
    }
  }

  setInterval(draw, 45);

  window.addEventListener('resize', () => {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  });
}

/* ---------- Navbar Scroll ---------- */
function initNavbar() {
  const navbar = document.querySelector('.navbar');
  if (!navbar) return;

  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
  });

  // Active link (site uses clean trailing-slash URLs, e.g. /training/)
  const links = document.querySelectorAll('.nav-links a');
  const path = location.pathname;
  links.forEach(a => {
    const href = a.getAttribute('href');
    const isActive = href === '/' ? path === '/' : path.startsWith(href);
    a.classList.toggle('active', isActive);
  });
}

/* ---------- Mobile Menu ---------- */
function initMobileMenu() {
  const toggle  = document.querySelector('.nav-toggle');
  const links   = document.querySelector('.nav-links');
  const overlay = document.querySelector('.nav-overlay');
  if (!toggle || !links) return;

  function closeMenu(returnFocus) {
    toggle.classList.remove('open');
    links.classList.remove('open');
    if (overlay) overlay.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    if (returnFocus) toggle.focus();
  }

  function openMenu() {
    toggle.classList.add('open');
    links.classList.add('open');
    if (overlay) overlay.classList.add('open');
    toggle.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
    const firstLink = links.querySelector('a');
    if (firstLink) firstLink.focus();
  }

  toggle.addEventListener('click', () => {
    if (links.classList.contains('open')) closeMenu(false); else openMenu();
  });

  if (overlay) overlay.addEventListener('click', () => closeMenu(false));

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && links.classList.contains('open')) closeMenu(true);
  });

  links.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => closeMenu(false));
  });
}

/* ---------- Terminal Typewriter ---------- */
function initTypewriter() {
  const lines = document.querySelectorAll('[data-typewriter]');
  if (!lines.length) return;

  lines.forEach((el, i) => {
    const text = el.getAttribute('data-typewriter');
    const speed = parseInt(el.getAttribute('data-speed') || '60');
    const delay = parseInt(el.getAttribute('data-delay') || '0') + i * 400;
    el.textContent = '';

    setTimeout(() => {
      let j = 0;
      const timer = setInterval(() => {
        if (j < text.length) {
          el.textContent += text[j++];
        } else {
          clearInterval(timer);
        }
      }, speed);
    }, delay);
  });
}

/* ---------- Scroll Reveal ---------- */
function initScrollReveal() {
  const els = document.querySelectorAll('[data-reveal]');
  if (!els.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  els.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    const delay = el.getAttribute('data-delay') || '0';
    el.style.transitionDelay = delay + 'ms';
    observer.observe(el);
  });
}

/* ---------- Counter Animation ---------- */
function initCounters() {
  const counters = document.querySelectorAll('[data-count]');
  if (!counters.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el     = entry.target;
        const target = parseFloat(el.getAttribute('data-count'));
        const suffix = el.getAttribute('data-suffix') || '';
        const prefix = el.getAttribute('data-prefix') || '';
        const duration = 2000;
        const step = target / (duration / 16);
        let current = 0;

        const timer = setInterval(() => {
          current += step;
          if (current >= target) {
            current = target;
            clearInterval(timer);
          }
          el.textContent = prefix + (Number.isInteger(target) ? Math.floor(current) : current.toFixed(1)) + suffix;
        }, 16);

        observer.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(c => observer.observe(c));
}

/* ---------- Skill Bars ---------- */
function initSkillBars() {
  const bars = document.querySelectorAll('.skill-fill');
  if (!bars.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        el.style.width = el.getAttribute('data-width') || '0%';
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.3 });

  bars.forEach(b => { b.style.width = '0%'; observer.observe(b); });
}

/* ---------- FAQ Accordion ---------- */
function initFAQ() {
  const items = document.querySelectorAll('.faq-item');
  if (!items.length) return;

  items.forEach(item => {
    const btn = item.querySelector('.faq-question');
    btn.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      items.forEach(i => i.classList.remove('open'));
      if (!isOpen) item.classList.add('open');
    });
  });
}

/* ---------- Training Option Select ---------- */
function initTrainingOptions() {
  const options = document.querySelectorAll('.training-option');
  if (!options.length) return;

  options.forEach(opt => {
    opt.addEventListener('click', () => {
      options.forEach(o => o.classList.remove('selected'));
      opt.classList.add('selected');
      const radio = opt.querySelector('input[type="radio"]');
      if (radio) radio.checked = true;
    });
  });
}

/* ---------- Contact Form ---------- */
function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = form.querySelector('[type="submit"]');
    btn.textContent = 'Sending...';
    btn.disabled = true;

    setTimeout(() => {
      form.innerHTML = `
        <div class="success-screen" style="display:block">
          <span class="success-icon">✅</span>
          <h2>Message Sent!</h2>
          <p>Thanks for reaching out. We'll get back to you within 24 hours.</p>
          <a href="index.html" class="btn btn-outline mt-4" style="margin-top:24px;display:inline-flex">← Back to Home</a>
        </div>`;
    }, 1800);
  });
}

/* ---------- Enrollment Form ---------- */
function initEnrollmentForm() {
  const form = document.getElementById('enrollment-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = form.querySelector('[type="submit"]');
    btn.textContent = '⏳ Processing...';
    btn.disabled = true;

    setTimeout(() => {
      document.getElementById('enrollment-form-wrap').style.display = 'none';
      const success = document.getElementById('enrollment-success');
      if (success) success.style.display = 'block';
    }, 2200);
  });
}

/* ---------- Payment Confirmation Form ---------- */
function initPaymentForm() {
  const form = document.getElementById('payment-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!form.reportValidity()) return;

    const name = form.name.value.trim();
    const email = form.email.value.trim();
    const program = form.program.value;
    const method = form.method.value;
    const txn = form.txn.value.trim();

    const message =
      `New Payment Confirmation\n` +
      `Name: ${name}\n` +
      `Email: ${email}\n` +
      `Paid For: ${program}\n` +
      `Payment Method: ${method}\n` +
      `Transaction ID/Reference: ${txn}`;

    const url = `https://wa.me/8801748973769?text=${encodeURIComponent(message)}`;

    const btn = form.querySelector('[type="submit"]');
    btn.textContent = 'Opening WhatsApp...';
    btn.disabled = true;

    window.open(url, '_blank', 'noopener');

    setTimeout(() => {
      btn.textContent = '✅ Confirm Payment via WhatsApp';
      btn.disabled = false;
    }, 2000);
  });
}

/* ---------- Smooth Scroll ---------- */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const href = a.getAttribute('href');
      if (href.length < 2) return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
        target.focus({ preventScroll: true });
        history.pushState(null, '', href);
      }
    });
  });
}

/* ---------- Blog Search ---------- */
function initBlogSearch() {
  const input = document.getElementById('blog-search');
  if (!input) return;

  input.addEventListener('input', () => {
    const q = input.value.toLowerCase();
    document.querySelectorAll('.blog-card').forEach(card => {
      const text = card.textContent.toLowerCase();
      card.style.display = text.includes(q) ? '' : 'none';
    });
  });
}

/* ---------- Category Filter (training/services hub pages) ---------- */
function initCategoryFilter() {
  const buttons = document.querySelectorAll('.filter-btn[data-filter]');
  if (!buttons.length) return;

  const cards = document.querySelectorAll('.training-card[data-category]');

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.getAttribute('data-filter');

      buttons.forEach(b => {
        const active = b === btn;
        b.classList.toggle('btn-primary', active);
        b.classList.toggle('btn-secondary', !active);
        b.setAttribute('aria-pressed', String(active));
      });

      cards.forEach(card => {
        const show = filter === 'all' || card.getAttribute('data-category') === filter;
        card.style.display = show ? '' : 'none';
        if (show) {
          // cards hidden before their reveal animation fired stay invisible — force them visible
          card.style.opacity = '1';
          card.style.transform = 'translateY(0)';
        }
      });
    });
  });
}

/* ---------- Init All ---------- */
document.addEventListener('DOMContentLoaded', () => {
  // Purely decorative canvas animation: start once the browser is idle
  // (or after a short fallback delay) so it doesn't compete with the
  // critical rendering path during initial page load.
  if ('requestIdleCallback' in window) {
    requestIdleCallback(initMatrix, { timeout: 2000 });
  } else {
    setTimeout(initMatrix, 200);
  }
  initNavbar();
  initMobileMenu();
  initTypewriter();
  initScrollReveal();
  initCounters();
  initSkillBars();
  initFAQ();
  initTrainingOptions();
  initContactForm();
  initEnrollmentForm();
  initPaymentForm();
  initSmoothScroll();
  initBlogSearch();
  initCategoryFilter();
});
