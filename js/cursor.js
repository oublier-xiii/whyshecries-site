// js/cursor.js — Custom cursor (no mix-blend-mode, visible on any background)
(() => {
  'use strict';

  // Only enable on devices with a fine pointer (mouse) and not reduced motion
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const cursor = document.getElementById('cursor');
  if (!cursor) return;

  const outer = cursor.querySelector('.cursor-outer');
  const inner = cursor.querySelector('.cursor-inner');
  if (!outer || !inner) return;

  let mx = window.innerWidth / 2;
  let my = window.innerHeight / 2;
  let ox = mx, oy = my; // outer position (laggy)
  let ix = mx, iy = my; // inner position (snappy)
  let rafId = null;

  // Make cursor visible and set body class
  cursor.classList.add('is-ready');
  document.body.classList.add('has-custom-cursor');

  // Hover state via delegation
  const setState = (state) => {
    cursor.classList.remove('is-hover', 'is-button', 'is-text', 'is-click');
    if (state) cursor.classList.add(state);
  };

  // Detect which state to use based on element
  document.addEventListener('mouseover', (e) => {
    const t = e.target;
    if (t.closest('.player-btn, .player-close, .player-volume-icon, .burger, .cta, .btn, .booking-cta, .date-row .btn')) {
      setState('is-button');
    } else if (t.closest('a, button, [role="button"], .rel')) {
      setState('is-hover');
    } else if (t.closest('p, h1, h2, h3, h4, h5, h6, blockquote, li, cite')) {
      setState('is-text');
    } else {
      setState(null);
    }
  }, { passive: true });

  document.addEventListener('mousedown', () => setState('is-click'));
  document.addEventListener('mouseup', () => {
    // re-evaluate state based on current target
    document.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
  });

  // RAF loop with idle pause
  let idleTimer = null;
  const tick = () => {
    ox += (mx - ox) * 0.18;
    oy += (my - oy) * 0.18;
    outer.style.transform = `translate3d(${ox}px, ${oy}px, 0)`;
    ix += (mx - ix) * 0.45;
    iy += (my - iy) * 0.45;
    inner.style.transform = `translate3d(${ix}px, ${iy}px, 0)`;
    rafId = requestAnimationFrame(tick);
  };
  const stopLoop = () => {
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  };
  const startLoop = () => {
    if (!rafId) rafId = requestAnimationFrame(tick);
    clearTimeout(idleTimer);
    idleTimer = setTimeout(stopLoop, 2000);
  };

  window.addEventListener('mousemove', (e) => {
    mx = e.clientX;
    my = e.clientY;
    startLoop();
  }, { passive: true });

  window.addEventListener('mouseleave', stopLoop);
  window.addEventListener('mouseenter', startLoop);

  // Hide cursor when leaving the window
  document.addEventListener('mouseleave', () => { cursor.style.opacity = '0'; });
  document.addEventListener('mouseenter', () => { cursor.style.opacity = '1'; });

  startLoop();
})();
