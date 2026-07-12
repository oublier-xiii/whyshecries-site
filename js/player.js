// js/player.js — Wavesurfer.js audio player
// Defensive: if WaveSurfer never loads (CDN fail, offline, blocked), the
// play buttons still work as <a> links to the raw audio file.
(() => {
  'use strict';

  // Wait for WaveSurfer + DOM
  let wsReady = false;
  const tryInit = () => {
    if (typeof WaveSurfer !== 'undefined') wsReady = true;
    if (wsReady && document.readyState !== 'loading') init();
  };

  // Poll for WaveSurfer (CDN with `defer` may not be ready at script run)
  const wsInterval = setInterval(() => {
    if (typeof WaveSurfer !== 'undefined') {
      clearInterval(wsInterval);
      tryInit();
    }
  }, 50);

  // Fallback: after 4s, give up on wavesurfer and let the <a> links work natively
  setTimeout(() => {
    if (!wsReady) {
      clearInterval(wsInterval);
      console.warn('[player] WaveSurfer not loaded; play buttons will open audio natively.');
    }
  }, 4000);

  function init() {
    if (document.getElementById('player-initialized')) return;
    document.getElementById('player')?.setAttribute('data-init', 'true');
    document.body.setAttribute('id', 'player-initialized');

    const dataEl = document.getElementById('tracks-data');
    if (!dataEl) return;
    let data;
    try { data = JSON.parse(dataEl.textContent); } catch (e) { return; }
    const tracks = data.tracks;

    const player = document.getElementById('player');
    if (!player) return;

    const btn = player.querySelector('.player-btn');
    const iconPlay = btn.querySelector('.icon-play');
    const iconPause = btn.querySelector('.icon-pause');
    const titleEl = player.querySelector('.player-title');
    const closeBtn = player.querySelector('.player-close');
    const waveformEl = player.querySelector('.player-waveform');
    const currentEl = player.querySelector('.player-current');
    const durationEl = player.querySelector('.player-duration');
    const volIcon = player.querySelector('.player-volume-icon');
    const iconVolUp = volIcon.querySelector('.icon-vol-up');
    const iconVolMute = volIcon.querySelector('.icon-vol-mute');
    const volSlider = player.querySelector('.player-volume input[type=range]');

    let ws = null;
    let currentIndex = -1;
    let isMuted = false;
    let prevVolume = 0.8;
    let shouldAutoplay = false;

    const fmt = (sec) => {
      if (!isFinite(sec)) return '0:00';
      const m = Math.floor(sec / 60);
      const s = Math.floor(sec % 60);
      return `${m}:${String(s).padStart(2, '0')}`;
    };

    const setPlayingUI = (playing) => {
      player.classList.toggle('is-playing', playing);
      iconPlay.style.display = playing ? 'none' : '';
      iconPause.style.display = playing ? '' : 'none';
      btn.setAttribute('aria-label', playing ? 'Pause' : 'Play');
    };

    const setLoading = (loading) => {
      player.classList.toggle('is-loading', loading);
    };

    const updateReleaseState = () => {
      document.querySelectorAll('.rel').forEach((rel) => {
        const idx = parseInt(rel.dataset.track, 10);
        rel.classList.toggle('is-current', idx === currentIndex);
      });
    };

    const createWaveSurfer = () => {
      if (ws) {
        ws.destroy();
      }
      ws = WaveSurfer.create({
        container: waveformEl,
        waveColor: 'rgba(236, 224, 203, 0.35)',
        progressColor: 'rgba(196, 30, 34, 0.95)',
        cursorColor: 'rgba(236, 224, 203, 0.9)',
        cursorWidth: 1,
        barWidth: 2,
        barGap: 2,
        barRadius: 1,
        height: 28,
        normalize: true,
        interact: true,
        hideScrollbar: true,
        backend: 'WebAudio',
      });

      // Re-attach event listeners
      ws.on('play', () => {
        setPlayingUI(true);
        updateReleaseState();
        document.body.classList.add('is-playing');
      });
      
      ws.on('pause', () => {
        setPlayingUI(false);
        updateReleaseState();
        document.body.classList.remove('is-playing');
      });
      
      ws.on('finish', () => {
        setPlayingUI(false);
        document.body.classList.remove('is-playing');
        const next = (currentIndex + 1) % tracks.length;
        loadTrack(next, true);
      });
      
      ws.on('audioprocess', () => { 
        currentEl.textContent = fmt(ws.getCurrentTime()); 
      });
      
      ws.on('ready', () => {
        durationEl.textContent = fmt(ws.getDuration());
        currentEl.textContent = fmt(0);
        setLoading(false);
        
        if (shouldAutoplay) {
          ws.play();
        }
      });
      
      ws.on('error', (err) => {
        console.error('Wavesurfer error:', err);
        setLoading(false);
      });
      
      ws.on('seeking', () => { 
        currentEl.textContent = fmt(ws.getCurrentTime()); 
      });
    };

    const loadTrack = (index, autoplay = true) => {
      if (index < 0 || index >= tracks.length) return;
      const track = tracks[index];
      
      currentIndex = index;
      titleEl.textContent = track.title;
      shouldAutoplay = autoplay;
      player.classList.add('is-open');
      setLoading(true);
      
      // Crear nueva instancia de WaveSurfer para cancelar cualquier carga anterior
      createWaveSurfer();
      
      // Cargar el nuevo track
      ws.load(track.url);
      updateReleaseState();
    };

    btn.addEventListener('click', () => {
      if (currentIndex === -1) {
        loadTrack(0, true);
        return;
      }
      if (ws) ws.playPause();
    });

    closeBtn.addEventListener('click', () => {
      if (ws) ws.pause();
      player.classList.remove('is-open');
      currentIndex = -1;
      titleEl.textContent = '—';
      currentEl.textContent = '0:00';
      durationEl.textContent = '0:00';
      document.querySelectorAll('.rel').forEach((rel) => rel.classList.remove('is-current'));
    });

    volSlider.addEventListener('input', () => {
      const v = parseInt(volSlider.value, 10) / 100;
      if (ws) ws.setVolume(v);
      if (v > 0) {
        isMuted = false;
        prevVolume = v;
        iconVolUp.style.display = '';
        iconVolMute.style.display = 'none';
      }
    });

    volIcon.addEventListener('click', () => {
      isMuted = !isMuted;
      if (isMuted) {
        prevVolume = parseInt(volSlider.value, 10) / 100 || 0.8;
        if (ws) ws.setVolume(0);
        volSlider.value = 0;
        iconVolUp.style.display = 'none';
        iconVolMute.style.display = '';
      } else {
        if (ws) ws.setVolume(prevVolume);
        volSlider.value = Math.round(prevVolume * 100);
        iconVolUp.style.display = '';
        iconVolMute.style.display = 'none';
      }
    });

    // Release row clicks
    document.querySelectorAll('.rel').forEach((rel) => {
      rel.addEventListener('click', (e) => {
        e.preventDefault();
        const idx = parseInt(rel.dataset.track, 10);
        if (!isNaN(idx)) {
          if (currentIndex === idx && ws && ws.isPlaying()) {
            ws.pause();
          } else {
            loadTrack(idx, true);
          }
        }
      });
    });

    // Keyboard shortcuts
    const isTyping = () => {
      const t = document.activeElement;
      return t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable);
    };
    document.addEventListener('keydown', (e) => {
      if (isTyping()) return;
      if (player.classList.contains('is-open') && currentIndex !== -1) {
        if (e.key === ' ' || e.code === 'Space') {
          e.preventDefault();
          if (ws) ws.playPause();
        } else if (e.key === 'm' || e.key === 'M') {
          volIcon.click();
        } else if (e.key === '[') {
          loadTrack((currentIndex - 1 + tracks.length) % tracks.length, true);
        } else if (e.key === ']') {
          loadTrack((currentIndex + 1) % tracks.length, true);
        } else if (e.key === 'Escape') {
          closeBtn.click();
        }
      }
    });
  }
})();
