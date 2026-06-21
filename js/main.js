// js/main.js — orchestrator: assign track indices to releases, init
(() => {
  'use strict';

  const init = () => {
    // Add data-track index to each release row
    const releases = document.querySelectorAll('.releases .rel');
    releases.forEach((rel, i) => {
      rel.dataset.track = String(i);
      rel.setAttribute('role', 'button');
      rel.setAttribute('tabindex', '0');
      const title = rel.querySelector('.title');
      rel.setAttribute('aria-label', `Play ${title ? title.textContent : 'track'}`);
    });

    // Enter / Space on release = trigger click
    releases.forEach((rel) => {
      rel.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          rel.click();
        }
      });
    });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
