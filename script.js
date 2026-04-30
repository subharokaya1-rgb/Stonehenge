/* ============================================================
   STONEHENGE THROUGH TIME — Main JavaScript
   Scroll Reveal | Particles | Parallax | Nav | Page Transition
   ============================================================ */

(function () {
  'use strict';

  /* ============================================================
     1. PAGE FADE-IN TRANSITION
     ============================================================ */
  const overlay = document.querySelector('.page-transition');
  if (overlay) {
    // Fade out overlay on load
    requestAnimationFrame(() => {
      overlay.classList.add('fade-out');
      setTimeout(() => overlay.remove(), 700);
    });
  }

  // Attach fade-out to all internal links
  document.querySelectorAll('a[href]').forEach(link => {
    const href = link.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('http') || href.startsWith('mailto')) return;
    link.addEventListener('click', e => {
      e.preventDefault();
      const dest = href;
      // Create a new overlay
      const out = document.createElement('div');
      out.classList.add('page-transition');
      document.body.appendChild(out);
      requestAnimationFrame(() => {
        setTimeout(() => { window.location.href = dest; }, 600);
      });
    });
  });

  /* ============================================================
     2. NAVIGATION — scroll shadow + mobile toggle
     ============================================================ */
  const nav    = document.querySelector('.site-nav');
  const toggle = document.querySelector('.nav-toggle');
  const links  = document.querySelector('.nav-links');

  if (nav) {
    window.addEventListener('scroll', () => {
      nav.classList.toggle('scrolled', window.scrollY > 60);
    }, { passive: true });
  }

  if (toggle && links) {
    toggle.addEventListener('click', () => {
      toggle.classList.toggle('open');
      links.classList.toggle('open');
    });
    // Close on link click
    links.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        toggle.classList.remove('open');
        links.classList.remove('open');
      });
    });
  }

  /* ============================================================
     3. HERO LOADED CLASS (triggers background zoom-out)
     ============================================================ */
  const hero = document.querySelector('.hero, .phase-hero');
  if (hero) {
    window.addEventListener('load', () => hero.classList.add('loaded'));
  }

  /* ============================================================
     4. SCROLL REVEAL — IntersectionObserver
     ============================================================ */
  const revealEls = document.querySelectorAll('.reveal, .phase-entry');

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          // Stagger cards slightly
          const delay = entry.target.dataset.delay || 0;
          setTimeout(() => {
            entry.target.classList.add('visible');
          }, delay);
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  // Assign stagger delays to phase entries
  document.querySelectorAll('.phase-entry').forEach((el, i) => {
    el.dataset.delay = i * 130;
  });
  // Assign delays to generic reveal elements
  document.querySelectorAll('.reveal').forEach((el, i) => {
    if (!el.dataset.delay) el.dataset.delay = i * 100;
  });

  revealEls.forEach(el => revealObserver.observe(el));

  /* ============================================================
     5. PARALLAX EFFECT — hero background on scroll
     ============================================================ */
  const heroBg = document.querySelector('.hero-bg, .phase-hero-bg');
  if (heroBg) {
    window.addEventListener('scroll', () => {
      const scrolled = window.scrollY;
      heroBg.style.transform = `scale(1) translateY(${scrolled * 0.3}px)`;
    }, { passive: true });
  }

  /* ============================================================
     6. FLOATING PARTICLES / MIST EFFECT
     Canvas-based gold dust particles for atmosphere
     ============================================================ */
  const canvas = document.getElementById('particles-canvas');
  if (canvas) {
    const ctx    = canvas.getContext('2d');
    let W        = window.innerWidth;
    let H        = window.innerHeight;
    canvas.width = W;
    canvas.height = H;

    // Resize handler
    window.addEventListener('resize', () => {
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width  = W;
      canvas.height = H;
    });

    // Particle class
    class Particle {
      constructor() { this.reset(); }

      reset() {
        this.x     = Math.random() * W;
        this.y     = Math.random() * H + H;   // start below viewport
        this.r     = Math.random() * 1.6 + 0.4;
        this.speed = Math.random() * 0.35 + 0.08;
        this.drift = (Math.random() - 0.5) * 0.25;
        this.alpha = Math.random() * 0.45 + 0.08;
        this.fade  = Math.random() * 0.006 + 0.002;
        this.dir   = 1; // alpha direction
      }

      update() {
        this.y -= this.speed;
        this.x += this.drift;
        this.alpha += this.fade * this.dir;
        if (this.alpha >= 0.55 || this.alpha <= 0.05) this.dir *= -1;
        if (this.y < -10) this.reset();
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(201,168,76,${this.alpha})`;
        ctx.fill();
      }
    }

    // Initialise particle pool
    const PARTICLE_COUNT = 90;
    const particles = Array.from({ length: PARTICLE_COUNT }, () => {
      const p = new Particle();
      p.y = Math.random() * H; // scatter across viewport initially
      return p;
    });

    // Animation loop
    function animateParticles() {
      ctx.clearRect(0, 0, W, H);
      particles.forEach(p => { p.update(); p.draw(); });
      requestAnimationFrame(animateParticles);
    }
    animateParticles();
  }

  /* ============================================================
     7. IMAGE LAZY-LOAD — fade in images when they enter view
     ============================================================ */
  const lazyImages = document.querySelectorAll('.img-card-img[data-src]');
  if (lazyImages.length) {
    const imgObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
          img.style.opacity = '0';
          img.onload = () => {
            img.style.transition = 'opacity 0.6s ease';
            img.style.opacity = '1';
          };
          imgObserver.unobserve(img);
        }
      });
    }, { rootMargin: '0px 0px 200px 0px' });

    lazyImages.forEach(img => imgObserver.observe(img));
  }

  /* ============================================================
     8. ACTIVE NAV LINK — highlight current page
     ============================================================ */
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(a => {
    if (a.getAttribute('href') === currentPage) {
      a.classList.add('active');
    }
  });

})();
