# AERIX — 3D Shoe Slider

A recreation of Pixxelex's "Advanced 3D Slider Animation in Figma" — built twice from one recipe:
as a **website** (this repo) and as a **native Figma/FigCraft design** with a working Smart Animate prototype.

**Live site:** https://ashfanansari.github.io/aerix-3d-slider/ (served from `/docs`)

## The trick (no real 3D)
1. One state per slide; the animation library interpolates matched layers between states.
2. All 5 shoes live in every state on one ellipse — active centre/full size, neighbours parked at the
   orbit edges, far shoes at scale 0 (invisible but animatable).
3. Price + model name are clipped vertical strips shifted one row per slide (odometer roll).
4. The stage is two ellipses: a giant soft-light glow + a thin stroked orbit ring.
5. The headline's sheen is a duplicate masked by a brand slash at soft-light blend, behind the shoe.

Web stack: React 19 + Vite + Tailwind 4 + Motion, easing cubic-bezier(0.85, 0, 0.15, 1) at 0.8s —
the tutorial's exact Smart Animate settings. Controls: arrows, ←/→ keys, swipe.

## Run locally
`run-locally.bat` (installs deps once, then Vite dev server) or `npm install && npm run dev`.

## Assets
One generated master shoe recoloured into 5 colourways (hue-shift weighted by a blurred
saturation field + tight-threshold flood-fill cutouts) — `public/shoes/`.
