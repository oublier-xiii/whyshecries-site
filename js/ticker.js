// js/ticker.js — Ticker animation (rAF-driven, no reset on hover)
(() => {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const init = () => {
    const ticker = document.querySelector('.ticker');
    const track = document.querySelector('.ticker .track');
    if (!ticker || !track) return;

    // Reduced motion: just show static
    if (prefersReducedMotion) return;

    // We need the track to contain 2x its content for a seamless loop.
    // The HTML already has duplicated content for this purpose.
    // We measure the width of the first half (one full cycle) by
    // measuring the offsetLeft of the second half's first child.
    const children = Array.from(track.children);
    if (children.length < 2) return;

    // Find the index where the duplication starts
    const halfCount = children.length / 2;
    if (Math.floor(halfCount) !== halfCount) {
      console.warn('[ticker] Content is not duplicated. Looping may not be seamless.');
    }

    // Measure the width of one full cycle (= the width of the first half)
    const measureCycle = () => {
      // We clone the first half, position absolute, and measure its width
      const firstHalfWidth = children.slice(0, halfCount).reduce((sum, el) => {
        const rect = el.getBoundingClientRect();
        return sum + rect.width;
      }, 0);
      // Add gaps between first-half children
      const styles = getComputedStyle(track);
      const gap = parseFloat(styles.gap) || 0;
      return firstHalfWidth + gap * (halfCount - 1);
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

    // Base speed: 50 pixels per second (feels cinematic, not frantic)
    const baseSpeed = 50; // px/s
    const hoverMultiplier = 2.5; // 2.5x faster on hover

    // Position state
    let x = 0;
    let lastTime = performance.now();
    let speedMultiplier = 1; // can be modified by hover
    let targetMultiplier = 1;
    let rafId = null;
    let isHovering = false;

    const tick = (now) => {
      const dt = (now - lastTime) / 1000; // seconds
      lastTime = now;

      // Smoothly interpolate speed multiplier
      speedMultiplier += (targetMultiplier - speedMultiplier) * 0.05;

      // Move
      x -= baseSpeed * speedMultiplier * dt;

      // Loop seamlessly: when we've moved one full cycle, reset by one cycle
      if (cycleWidth > 0) {
        if (-x >= cycleWidth) {
          x += cycleWidth; // jump forward by one cycle (invisible because content is duplicated)
        }
      }

      track.style.transform = `translate3d(${x}px, 0, 0)`;
      rafId = requestAnimationFrame(tick);
    };

    // Hover handlers
    const setHover = (hovering) => {
      isHovering = hovering;
      targetMultiplier = hovering ? hoverMultiplier : 1;
    };

    ticker.addEventListener('mouseenter', () => setHover(true));
    ticker.addEventListener('mouseleave', () => setHover(false));

    // Pause when off-screen for battery
    let isVisible = true;
    if ('IntersectionObserver' in window) {
      const visIO = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          isVisible = entry.isIntersecting;
          if (isVisible && !rafId) {
            lastTime = performance.now();
            rafId = requestAnimationFrame(tick);
          } else if (!isVisible && rafId) {
            cancelAnimationFrame(rafId);
            rafId = null;
          }
        });
      }, { threshold: 0 });
      visIO.observe(ticker);
    }

    // Click on ticker: pause for a moment
    ticker.addEventListener('click', () => {
      targetMultiplier = 0;
      setTimeout(() => {
        targetMultiplier = isHovering ? hoverMultiplier : 1;
      }, 1500);
    });

    // Start
    lastTime = performance.now();
    rafId = requestAnimationFrame(tick);
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
