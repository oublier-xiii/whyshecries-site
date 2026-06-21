// js/animations.js — Scroll-triggered animations + visual polish
// Uses IntersectionObserver + CSS transitions. No external libraries.
// Defensive: content is ALWAYS visible (visible by default, then animated).
(() => {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const init = () => {
    if (prefersReducedMotion) {
      // Just reveal everything
      document.querySelectorAll('.reveal, .reveal-pending').forEach((el) => {
        el.classList.remove('reveal-pending');
        el.classList.add('in');
      });
      return;
    }

    // Collect all elements that should be revealed
    const revealTargets = new Set();

    // Existing .reveal elements
    document.querySelectorAll('.reveal').forEach((el) => revealTargets.add(el));

    // Stagger groups: each child gets a delay + becomes a reveal target
    const groups = [
      { sel: '.sonic .card', stagger: 120 },
      { sel: '.releases .rel', stagger: 80 },
      { sel: '.tour .date-row', stagger: 80 },
      { sel: '.press .q', stagger: 100 },
      { sel: '.stage-vis li', stagger: 70 },
      { sel: '.contact .ent', stagger: 80 },
      { sel: '.about .meta > div', stagger: 80 },
      { sel: 'footer .socials a', stagger: 50 },
    ];
    groups.forEach((g) => {
      const els = document.querySelectorAll(g.sel);
      els.forEach((el, i) => {
        el.style.transitionDelay = (i * g.stagger) + 'ms';
        revealTargets.add(el);
        if (!el.classList.contains('reveal')) el.classList.add('reveal');
      });
    });

    // Mark all targets as .reveal-pending (hidden) before IO triggers
    revealTargets.forEach((el) => el.classList.add('reveal-pending'));

    // IntersectionObserver: when in view, swap pending -> in
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target;
            el.classList.remove('reveal-pending');
            el.classList.add('in');
            io.unobserve(el);
          }
        });
      }, { threshold: 0.05, rootMargin: '0px 0px -40px 0px' });

      revealTargets.forEach((el) => io.observe(el));
    } else {
      revealTargets.forEach((el) => {
        el.classList.remove('reveal-pending');
        el.classList.add('in');
      });
    }

    // Hero entrance: applied on page load (no observer needed)
    const hero = document.querySelector('.hero');
    if (hero) {
      setTimeout(() => hero.classList.add('hero-animate-in'), 200);
    }

    // ---------- TICKER: hover speed-up ----------
    const tickerTrack = document.querySelector('.ticker .track');
    if (tickerTrack) {
      tickerTrack.addEventListener('mouseenter', () => {
        tickerTrack.style.animationDuration = '19s'; // 2x speed
      });
      tickerTrack.addEventListener('mouseleave', () => {
        tickerTrack.style.animationDuration = '38s'; // normal
      });
    }

    // ---------- RELEASE row hover: lift + play button pulse ----------
    document.querySelectorAll('.rel').forEach((rel) => {
      const play = rel.querySelector('.play');
      rel.addEventListener('mouseenter', () => {
        if (play) play.style.color = 'var(--ember)';
      });
      rel.addEventListener('mouseleave', () => {
        if (play) play.style.color = '';
      });
    });

    // ---------- Parallax on .live background ----------
    let ticking = false;
    const updateParallax = () => {
      const live = document.querySelector('.live .full');
      if (live) {
        const rect = live.parentElement.getBoundingClientRect();
        if (rect.bottom > 0 && rect.top < window.innerHeight) {
          const offset = (window.innerHeight - rect.top) * 0.15;
          live.style.transform = `translate3d(0, ${offset}px, 0)`;
        }
      }
      ticking = false;
    };
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(updateParallax);
        ticking = true;
      }
    }, { passive: true });

    // ---------- Letter-by-letter reveal on hero marquee (CSS-based) ----------
    // Wrap each letter in <span class="hero-char"> on load.
    const marquee = document.querySelector('.hero .marquee');
    if (marquee && !marquee.dataset.split) {
      marquee.dataset.split = 'true';
      const words = ['Why', 'She', 'Cries'];
      const isAccent = [false, false, true];
      marquee.innerHTML = '';
      words.forEach((word, i) => {
        const wordEl = document.createElement('span');
        wordEl.className = 'hero-word' + (isAccent[i] ? ' em' : '');
        Array.from(word).forEach((ch, j) => {
          const charEl = document.createElement('span');
          charEl.className = 'hero-char';
          charEl.style.setProperty('--char-i', (i * 4 + j).toString());
          charEl.textContent = ch;
          wordEl.appendChild(charEl);
        });
        marquee.appendChild(wordEl);
      });
    }

    // ---------- Subtle logo pulse on hero (continuous) ----------
    const heroLogo = document.querySelector('.hero .logo-wrap img');
    if (heroLogo) {
      heroLogo.style.animation = 'pulse 4s ease-in-out infinite';
    }

    // ---------- SAFETY NET: if IO fails, force reveal after 1s ----------
    setTimeout(() => {
      document.querySelectorAll('.reveal-pending').forEach((el) => {
        el.classList.remove('reveal-pending');
        el.classList.add('in');
      });
    }, 1000);
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
