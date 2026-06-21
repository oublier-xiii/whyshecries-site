# Changelog

All notable changes to this project.

## v3.4 (current)

**Bug fix: ticker and decorative loops now run regardless of `prefers-reduced-motion`.**

The previous `prefers-reduced-motion` rule killed all animations including
non-essential decorative loops (ticker, hero marquee, logo pulse). Now only
transitions and reveal animations are killed, while loop animations keep
running.

- `.ticker .track` marquee runs continuously
- `.hero .marquee` letter-by-letter reveal still happens
- `.hero .logo-wrap img` pulse still cycles
- `.scroll-cue` arrow still drifts
- `.mantra .em-italic` flicker still cycles
- `.live h2` glow oscillation still cycles

Transitions (hover effects, smooth scroll, etc.) and reveal animations
(stagger, fade-in) still respect `prefers-reduced-motion: reduce`.

## v3.3

Initial visual polish release. Major additions:

- 20+ hover effects: card lift, quote slide, button shine sweep, image
  scale + saturation, underline grow on nav and socials, focus rings
- Hero letter-by-letter reveal using CSS @keyframes (no GSAP)
- Ticker hover speed-up (2x)
- Section h2 underline animation
- Continuous animations: logo pulse, scroll cue drift, mantra flicker,
  live h2 text-glow oscillation
- Mini-player slide-in entrance
- Custom selection color
- Focus rings with ember outline

## v3.2

**Bug fix: mobile menu was visible on desktop covering all content.**

The selector `.mobile-menu[data-open]` matched when the attribute existed
in any form. The HTML had `data-open="false"` so it was always visible.
Changed to `.mobile-menu[data-open="true"]` so the menu only shows when
explicitly opened. Added `visibility: hidden` for extra safety.

## v3.1

Major refactor to remove GSAP after a series of cascading bugs:

- Removed GSAP + ScrollTrigger (saved 60KB+ of CDN dependencies)
- Removed custom cursor (caused visibility issues with `mix-blend-mode`)
- Replaced DOM-replacement hero animation with CSS-only approach
- All reveal animations now use IntersectionObserver + CSS transitions
- Safety net: if IO fails, all content reveals after 1s
- Default state: all content visible (only hidden when JS adds `.reveal-pending`)
- Loader always hides within 2.5s (CSS + JS fallback)

## v3.0

Initial v3 release with audio player and cinematic animations:

- Wavesurfer.js audio player with waveform
- 6 placeholder tracks (replace with real MP3s)
- Loading screen with pulsing logo
- Mini-player with play/pause, volume, close
- Custom scrollbar
- Scroll progress bar
- Atajos de teclado (Space, M, [, ], Esc)
- GSAP + ScrollTrigger for scroll animations

## v2

Site deployed to Vercel with SEO, a11y, responsiveness:

- Open Graph, Twitter Card, JSON-LD
- Skip link, aria labels, semantic HTML
- prefers-reduced-motion support
- Mobile hamburger menu
- Responsive media queries (900px, 480px)
- Vercel security headers (HSTS, Permissions-Policy, X-Content-Type-Options)
- Print styles
- Custom scrollbar

## v1

Initial HTML site (no animations, no audio).
