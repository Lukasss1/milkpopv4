/* MILK POP brand stylesheet — tokens taken 1:1 from the brandbook.
   Typeface: the brandbook specifies "Unageo" (geometric sans, Bold + Light).
   Unageo is not on Google Fonts; if you own the files, drop them in /public/fonts
   and the @font-face rules below will pick them up automatically. Until then the
   site falls back to Poppins — the closest geometric sans on Google Fonts. */
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;700&display=swap');
@import "tailwindcss";

@font-face {
  font-family: 'Unageo';
  src: url('/fonts/Unageo-Bold.woff2') format('woff2'), url('/fonts/Unageo-Bold.otf') format('opentype');
  font-weight: 600 800;
  font-display: swap;
}
@font-face {
  font-family: 'Unageo';
  src: url('/fonts/Unageo-Light.woff2') format('woff2'), url('/fonts/Unageo-Light.otf') format('opentype');
  font-weight: 300 500;
  font-display: swap;
}

@theme {
  --font-sans: "Unageo", "Poppins", ui-sans-serif, system-ui, sans-serif;
  --font-display: "Unageo", "Poppins", sans-serif;
  --font-mono: "JetBrains Mono", monospace;

  /* Brandbook palette — Фирменные цвета */
  --color-caramel: #BD783A;      /* RGB 189 120 58 · Pantone 287C */
  --color-caramel-dark: #A5642B;
  --color-milkblue: #7CC0C7;     /* RGB 124 192 199 · Pantone 285C */
  --color-milkblue-dark: #5FA9B1;
  --color-ink: #2E2A26;
  --color-milk: #FFFFFF;
  --color-cream: #F7EFE6;
  --color-warmline: #EBDECE;
}

body {
  background-color: #FFFFFF;
  color: #2E2A26;
  font-family: var(--font-sans);
  font-weight: 300; /* brandbook: body copy is set in the Light cut */
}

/* Brandbook typography rule of 50%: body 14 → subheads 18 (bold) → headings 34 (bold) */
h1, h2, h3, h4, h5, h6, strong, b { font-weight: 700; }

/* Custom Scrollbar suppression */
.scrollbar-none::-webkit-scrollbar { display: none; }
.scrollbar-none { -ms-overflow-style: none; scrollbar-width: none; }

/* Gentle float for mascot/sticker accents */
@keyframes mp-float {
  0%, 100% { transform: translateY(0) rotate(var(--mp-tilt, 0deg)); }
  50% { transform: translateY(-10px) rotate(var(--mp-tilt, 0deg)); }
}
.mp-float { animation: mp-float 5s ease-in-out infinite; }
@media (prefers-reduced-motion: reduce) {
  .mp-float { animation: none; }
}

/* ============================================================
   MOTION SYSTEM — Apple-style physics and micro-interactions
   ============================================================ */

/* Mascot: gentle breathing bob for the whole body */
@keyframes mp-bob {
  0%, 100% { transform: translateY(0) rotate(-1deg); }
  50% { transform: translateY(-14px) rotate(1deg); }
}
.mp-bob { animation: mp-bob 4.5s ease-in-out infinite; transform-origin: 50% 90%; }

/* Mascot: waving — an enthusiastic hello every few seconds */
@keyframes mp-wave {
  0%, 52%, 100% { transform: rotate(0deg) scale(1); }
  56% { transform: rotate(-6deg) scale(1.015); }
  61% { transform: rotate(5deg) scale(1.02); }
  66% { transform: rotate(-6deg) scale(1.015); }
  71% { transform: rotate(4deg) scale(1.01); }
  76% { transform: rotate(-3deg) scale(1.005); }
  82% { transform: rotate(0deg) scale(1); }
}
.mp-wave { animation: mp-wave 4.6s ease-in-out infinite; transform-origin: 52% 88%; }

/* Slow ambient drift for background stickers */
@keyframes mp-drift {
  0%, 100% { transform: translate(0, 0) rotate(var(--mp-tilt, 0deg)); }
  33% { transform: translate(6px, -12px) rotate(calc(var(--mp-tilt, 0deg) + 3deg)); }
  66% { transform: translate(-5px, -6px) rotate(calc(var(--mp-tilt, 0deg) - 2deg)); }
}
.mp-drift { animation: mp-drift 9s ease-in-out infinite; }

/* Soft entrance used by scroll reveals as a CSS fallback */
@keyframes mp-rise {
  from { opacity: 0; transform: translateY(28px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Apple-style frosted glass surface */
.mp-glass {
  background: rgba(255, 255, 255, 0.72);
  backdrop-filter: saturate(180%) blur(20px);
  -webkit-backdrop-filter: saturate(180%) blur(20px);
}

/* Buttery hover lift for interactive cards */
.mp-lift {
  transition: transform 0.5s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.5s cubic-bezier(0.22, 1, 0.36, 1);
}
.mp-lift:hover {
  transform: translateY(-6px) scale(1.015);
  box-shadow: 0 24px 48px -16px rgba(46, 42, 38, 0.18);
}

/* Smooth page scrolling */
html { scroll-behavior: smooth; }

@media (prefers-reduced-motion: reduce) {
  .mp-bob, .mp-wave, .mp-drift { animation: none; }
  .mp-lift, .mp-lift:hover { transition: none; transform: none; }
  html { scroll-behavior: auto; }
}
