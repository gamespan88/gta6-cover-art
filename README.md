[![make.fun — Make GTA 6 Cover Art](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/competitions/gta6-cover-art-01)
[![Entry rank](https://make.fun/badge/gta6-cover-art-01/gamespan88/gta6-cover-art/rank.svg)](https://make.fun/competitions/gta6-cover-art-01)
[![Entry reward](https://make.fun/badge/gta6-cover-art-01/gamespan88/gta6-cover-art/reward.svg)](https://make.fun/competitions/gta6-cover-art-01)

# Vice Frame — Cover Lab

An offline web app that turns your own photos and a caption into bold, multi-panel cover art in the
GTA poster tradition — a collage of photo panels with white gutters, a Vice City sunset or neon colour
grade, hand-drawn palm and skyline ornaments, and a big condensed headline — then exports it as a PNG
ready to post. It runs entirely in a desktop browser from its own static files: your photos are read on
your own machine and never uploaded anywhere.

Built for the make.fun bounty [Make GTA 6 Cover Art](https://make.fun/competitions/gta6-cover-art-01).

## What it does

- **Six cover layouts** — the Classic Collage (a seven-panel grid with a tall hero panel), the Hero
  Five (a hero panel with a four-panel grid beside it), the Grid Nine (a dense three-by-three grid),
  the Duo Split (two big portraits side by side), the Quad Four (four bold quarters) and the Strip
  Poster (cinematic horizontal bands, columns in portrait).
- **Any photos, a different one in every panel** — pick files or drag and drop them onto the cover;
  every photo waits in a tray. Click a panel to place the chosen photo there, double-click to swap
  it, drag inside a panel to reposition it, scroll or use the slider to zoom — each panel keeps its
  own photo, crop and grade. Or fill the whole collage from one photo in a click, each panel getting
  its own crop of it.
- **Seven colour grades** — Sunset (warm orange-pink light), Neon Nights (teal and magenta), the
  Heatwave and Ultraviolet gradient maps (the photo recoloured through a full colour ramp), Duotone
  Ink (a posterized two-tone print look), Halftone Print (the photo redrawn as ink dots on paper)
  and Raw (a light touch). A panel can override the cover's grade.
- **Three title styles** — Block (solid letters, a heavy outline and a hard offset shadow in the hot
  accent), Gradient (a sunset gradient fill over a halftone-dot band) and Script + Badge (a gradient
  headline with a tilted EST. 2026 sticker badge and the subtitle as a glowing neon script line).
- **Original cover art** — empty panels are painted by the app itself: a graded sky, a retro sun disc, a
  lit skyline and palm silhouettes, all drawn in canvas code. Panels are finished with ink keylines,
  print grain and a vignette. The headline is lettered in Anton and the script line in Yellowtail
  (both SIL Open Font License, vendored in `app/fonts/` with their licenses). No Rockstar Games logo,
  artwork or font is used anywhere.
- **One-step exports** — PNG downloads at the common post sizes, 1080 × 1080, 1080 × 1350 and
  1920 × 1080, rendered offscreen at full size; a live preview follows the size you pick.

## Run it

Serve `app/` with any static file server and open it in a desktop browser — or use the kit's server:

```sh
node serve.ts        # then open http://localhost:8080
```

Five sample photos are bundled in `app/samples/` (made with an image model, free to use) so a first
cover is one click away. Fixed screenshot scenes are available through the query string, e.g.
`?shot=cover&photo=pier&caption=Sunset%20Heist` and `?shot=editor&photo=boulevard`; a comma list in
`photo` (as in `photo=neon,boulevard,pier`) deals a different photo into each panel, and `template`,
`grade` and `title` params restyle the scene.

## Hand it in

`main.ts` (Node 22, standard library only) copies `app/` and `screenshots/` to the output directory,
checks the screenshots against the gate's size caps, and writes `dossier.json` with the vendored
make.fun library:

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

## License

MIT (see `LICENSE`). The Anton and Yellowtail fonts are licensed separately under the SIL Open Font
License 1.1 (`app/fonts/OFL.txt` and `app/fonts/OFL-Yellowtail.txt`).
