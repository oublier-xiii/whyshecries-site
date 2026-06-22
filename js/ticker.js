// js/ticker.js — Ticker animation (rAF-driven, no reset on hover)
// Robust: rAF always runs, position never resets on speed change.
(() => {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const init = () => {
    const ticker = document.querySelector('.ticker');
    const track = document.querySelector('.ticker .track');
    if (!ticker || !track) return;

    // Reduced motion: skip animation entirely
    if (prefersReducedMotion) return;

    const children = Array.from(track.children);
    if (children.length < 2) return;

    // One full cycle = width of the first half of duplicated content
    const halfCount = children.length / 2;
    const measureCycle = () => {
      let w = 0;
      for (let i = 0; i < halfCount; i++) {
        w += children[i].getBoundingClientRect().width;
      }
      const styles = getComputedStyle(track);
      const gap = parseFloat(styles.gap) || 0;
      return w + gap * (halfCount - 1);
    };

    let cycleWidth = measureCycle();
    // Re-measure on resize
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        cycleWidth = measureCycle();
      }, 200);
    });

    // Base speed: 50px/s
    const baseSpeed = 50;
    const hoverMultiplier = 2.5;

    // Position state
    let x = 0;
    let lastTime = performance.now();
    let speedMultiplier = 1;
    let targetMultiplier = 1;
    let isHovering = false;

    const tick = (now) => {
      const dt = Math.min((now - lastTime) / 1000, 0.1); // clamp dt to avoid jumps on tab return
      lastTime = now;

      // Smoothly interpolate speed
      speedMultiplier += (targetMultiplier - speedMultiplier) * 0.05;

      // Move
      x -= baseSpeed * speedMultiplier * dt;

      // Loop seamlessly: when we've moved one full cycle, jump forward
      if (cycleWidth > 0) {
        if (-x >= cycleWidth) {
          x += cycleWidth;
        } else if (-x <= -cycleWidth) {
          x -= cycleWidth;
        }
      }

      track.style.transform = `translate3d(${x}px, 0, 0)`;
      requestAnimationFrame(tick);
    };

    // Hover handlers
    ticker.addEventListener('mouseenter', () => {
      isHovering = true;
      targetMultiplier = hoverMultiplier;
    });
    ticker.addEventListener('mouseleave', () => {
      isHovering = false;
      targetMultiplier = 1;
    });

    // Click on ticker: pause briefly
    ticker.addEventListener('click', () => {
      const wasHovering = isHovering;
      targetMultiplier = 0;
      setTimeout(() => {
        targetMultiplier = wasHovering ? hoverMultiplier : 1;
      }, 1500);
    });

    // Pause when off-screen (battery) — but never kill the loop permanently.
    // We just skip the transform update.
    let isVisible = true;
    if ('IntersectionObserver' in window) {
      const visIO = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          isVisible = entry.isIntersecting;
        });
      }, { threshold: 0 });
      visIO.observe(ticker);
    }

    // Wrap the tick so it only updates when visible
    const tickVisible = (now) => {
      if (isVisible) tick(now);
      else lastTime = now; // reset time to avoid huge dt when becoming visible
      requestAnimationFrame(tickVisible);
    };

    // Start
    lastTime = performance.now();
    requestAnimationFrame(tickVisible);
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
