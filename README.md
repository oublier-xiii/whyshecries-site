# WhySheCries — Electronic Press Kit & Artist Site

A cinematic, dark-themed single-page artist site for WhySheCries (alternative techno, Berlin · Lisbon). Built with vanilla HTML, CSS and JavaScript, featuring:

- A GSAP-free animation pipeline (CSS + IntersectionObserver)
- An audio player with wavesurfer.js for live track playback
- A custom ticker, hero marquee with letter-by-letter reveal
- A defensive loading screen and accessibility-first reduced-motion handling
- Zero build step, deploys directly to Vercel

## Local development

This is a static site — no build required. To preview locally:

```bash
# Python 3
python -m http.server 8000

# Or Node
npx serve .
```

Open http://localhost:8000

## Project structure

```
site/
├── index.html              # Single-page site (markup, CSS, all sections)
├── assets/
│   ├── cover-art.jpeg      # About section artwork
│   ├── logo.png             # Site logo
│   ├── ref-*.jpg           # Section background images
│   └── tracks/              # Placeholder audio (replace with real MP3s)
├── js/
│   ├── loader.js            # Loading screen + scroll progress
│   ├── animations.js         # Reveal animations + parallax + ticker speed-up
│   ├── player.js            # Wavesurfer.js audio player
│   ├── main.js              # Orchestrator (links releases to track IDs)
│   └── cursor.js            # Stub (custom cursor disabled)
└── vercel.json              # Headers (security, cache control)
```

## Replacing placeholder audio

The `assets/tracks/` directory contains 6 placeholder WAV files (simple tones). Replace with real MP3s and update the `tracks-data` JSON block in `index.html`:

```json
{
  "id": "01-in-nature",
  "title": "In Nature There's No Tragedy",
  "year": 2026,
  "url": "assets/tracks/01-in-nature.mp3"
}
```

## Deployment

Connected to Vercel — every push to `main` triggers an automatic production deploy.

URL: https://whyshecries-site.vercel.app

## Browser support

Modern browsers (Chrome 90+, Firefox 90+, Safari 15+, Edge 90+).

## Accessibility

- Keyboard navigable (Tab, Enter, Space on releases, Space/M/[ ]/Esc on player)
- `prefers-reduced-motion` respected (decorative loops preserved, transitions killed)
- `aria-label` on all interactive elements
- Skip link for screen readers
- Semantic HTML throughout
- Color contrast meets WCAG AA on body text
