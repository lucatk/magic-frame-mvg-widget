# magic-frame-mvg-widget

<img width="495" height="248" alt="Screenshot 2026-06-07 at 01 27 04" src="https://github.com/user-attachments/assets/a032c873-d5a0-436b-9347-ee5c945dcbe3" />

Widget module for [Magic Frame](https://github.com/jeremiaa/magic-frame) that shows
live MVG departure boards for one or more Munich public-transport stops.

## Install

Grab `module.json` and `bundle.js` from the
[latest release](../../releases/latest), then in Magic Frame go to
**Modules → Custome modules** and pick both files.

## Configuration

In the editor inspector, fill `Haltestellen` with one stop per line. Each line
is `<stop>[;<TYPE>,<TYPE>,…]`.

- `<stop>` — station name (`Universität`) or global ID (`de:09162:70`).
- Optional types filter: `UBAHN`, `SBAHN`, `TRAM`, `BUS`, `REGIONAL_BUS`,
  `BAHN`, `SCHIFF`, `SEV`.

Check with [MVG Fahrplanauskunft](https://www.mvg.de/verbindungen.html) for the exact stop name or ID.

Examples:

```
Universität
Marienplatz;UBAHN,SBAHN
de:09162:70;BUS,TRAM
```

## Development

```bash
npm install
npm run build      # bundles + pushes to local magic-frame DB (magic-frame needs to be setup in an adjacent directory locally)
npm run typecheck
```

`npm run build` calls `../magic-frame/scripts/build-module.mjs` and then
`scripts/upload-module.mjs`, which reads `DATABASE_URL` from
`../magic-frame/.env` and upserts the `custom:mvg` row in the local Postgres.

