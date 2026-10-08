# Copilot instructions for this repository

## Project scope

This repository contains two standalone, mobile-first travel itineraries:

- `indonesia_itinerary_iphone.html` presents the Indonesia itinerary and its associated travel data.
- `bisgaard_klanen_iphone.html` presents the Bisgaard family Bali trip in Danish, with a visual destination timeline and a practical flights, boat trips, and accommodation overview.

`indonesia_itinerary.xlsx` appears to be the source spreadsheet behind the Indonesia trip and should be treated as the upstream data source when updating those travel details. The Bisgaard-Klanen page reflects the family's Bali 2027 plan; preserve uncertain travel dates as placeholders rather than inferring them from stay lengths.

Both pages keep their markup, styling, and rendering logic in one HTML file. This is not a framework-based app and does not have a backend, package manager, or compiled build pipeline.

## Build, test, and lint commands

There are no formal build, test, or lint scripts configured in this repository.

Use Python's built-in static server for local preview/validation:

```bash
cd "C:\Users\Bruger\RiderProjects\travelling"
python -m http.server 8000
```

Then open `http://localhost:8000/indonesia_itinerary_iphone.html` in a browser. Refresh the page after edits to validate layout and data rendering.

If Python is unavailable, the built-in Node.js server can serve both pages and their local PWA assets without installing dependencies:

```powershell
node -e "const http=require('http'),fs=require('fs'),path=require('path'),root=process.cwd(),types={'.html':'text/html; charset=utf-8','.webmanifest':'application/manifest+json','.js':'text/javascript; charset=utf-8','.png':'image/png','.jpg':'image/jpeg'};http.createServer((req,res)=>{const file=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}fs.stat(file,(err,stat)=>{if(err||!stat.isFile()){res.writeHead(404).end();return;}res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream'});fs.createReadStream(file).pipe(res);});}).listen(8000,'127.0.0.1')"
```

There is no automated unit-test runner or single-test command in this repo. Any validation is browser-level and manual.

Copilot CLI can use the repository-scoped Playwright MCP server configured in `.github/mcp.json` for browser verification. Start the local server above before asking Copilot to inspect the page. Project MCP configuration is loaded when Copilot CLI starts in a trusted repository.

## High-level architecture

The repository is intentionally simple and self-contained. Each itinerary page is independently usable:

- `indonesia_itinerary_iphone.html` contains embedded CSS and the Indonesia `itinerary` JavaScript array; render helpers group flight, hotel, and boat entries by day and derive summary counts and trip dates.
- `bisgaard_klanen_iphone.html` contains the Bisgaard-Klanen page's visual timeline, its separate practical overview tab, and CSS reveal animations. `manifest.webmanifest` and `service-worker.js` make this page installable and cache its page shell, icons, and destination photos for offline use; local photos under `images/` include nearby Wikimedia Commons author and license credits.
- The travel pages share a lightweight, iPhone-oriented visual style but are separate documents; keep each page's travel data and derived display in sync with its own source itinerary.

Because each app is self-contained, its behavior and data model are maintained in its own HTML file rather than shared modules.

## Key conventions

- Prefer plain HTML, CSS, and JavaScript; do not introduce a framework or build setup unless there is a clear, repo-specific requirement.
- Treat each itinerary HTML file as the source of truth for its rendered page. They are standalone documents, not a component library.
- Preserve the existing mobile-first layout and iPhone-style app aesthetic; visual changes should remain lightweight and readable without extra dependencies.
- Dates in the itinerary data should remain consistent and machine-friendly (for example, ISO-like date strings used in the existing JS data).
- Follow the established item taxonomy: `Flight`, `Hotel`, and `Boat` are the only route types used for styling and grouping.
- When editing the itinerary, keep derived values aligned with the data model: day counts, trip dates, hero summary stats, and the countdown text should all reflect the same underlying records.
- On the Bisgaard-Klanen page, keep the visual timeline and logistics-tab details consistent; use explicit dates only when the family plan confirms them, preserve unknown flight and boat details as placeholders, and retain image attribution links and license labels.
- The Bisgaard-Klanen service worker fetches the page and static assets from the network first, refreshing their offline copies; it falls back to cached responses while offline. Add new offline assets to its precache list and increment the cache version when changing the app shell.
- Keep edits surgical. This repo is intentionally compact; broad rewrites are unnecessary unless the user explicitly asks for a structural redesign.

## Working style for future sessions

- If a change affects travel data, update the relevant entries in the itinerary data and verify the rendered day cards still match the intended schedule.
- If a change affects styling, keep the document self-contained and avoid introducing external assets or CSS build tooling.
- There are no repository-specific linting or test gates beyond manual browser verification in a local static server.
