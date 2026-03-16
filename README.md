# New Nordic Studios Rebrand (Vite)

This project runs on Vite and serves a mirrored copy of [concreteclub.studio](https://concreteclub.studio/) directly at `/` for first-load parity.

## Commands

- `npm install`
- `npm run mirror:concreteclub` to refresh local mirrored files
- `npm run dev`
- `npm run build`

## How it works

- `scripts/mirror-concreteclub.mjs` pulls the live homepage and same-origin runtime assets into `public/`.
- `public/concreteclub.html` is the mirrored source snapshot.
- The script also copies that file to project `index.html`, so localhost opens the replica immediately.

## Notes

- The mirrored page relies on live data/services used by the original site.
- Re-run `npm run mirror:concreteclub` whenever the source site updates.
