// js/loader.js — loading screen + scroll progress
// Defensive: the loader ALWAYS hides itself (via CSS max-timeout as fallback
// and via JS as soon as DOMContentLoaded). Even if other scripts fail, the
// site remains visible.
(() => {
  'use strict';

  const hideLoader = () => {
    const loader = document.getElementById('loader');
    if (loader && !loader.classList.contains('hidden')) {
      loader.classList.add('hidden');
    }
    document.body.classList.remove('loading');
  };

  // Hide ASAP. The loader CSS has a transition; this lets it fade out smoothly.
  if (document.readyState === 'loading') {
    // Wait for DOM but not for all resources
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(hideLoader, 200);
    }, { once: true });
  } else {
    setTimeout(hideLoader, 200);
  }

  // Hard timeout: never keep the loader more than 2.5s
  setTimeout(hideLoader, 2500);

  // Also hide on window load (for cases when DOMContentLoaded already fired)
  window.addEventListener('load', () => setTimeout(hideLoader, 100), { once: true });

  // Scroll progress bar (rAF throttled)
  const progress = document.querySelector('.scroll-progress');
  if (progress) {
    let ticking = false;
    const update = () => {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      const pct = max > 0 ? (h.scrollTop / max) * 100 : 0;
      progress.style.setProperty('--progress', pct + '%');
      ticking = false;
    };
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(update);
        ticking = true;
      }
    }, { passive: true });
    update();
  }
})();
