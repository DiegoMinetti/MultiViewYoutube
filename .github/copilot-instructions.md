# Copilot Instructions for MultiViewYoutube

## Project Overview
This is a Progressive Web App (PWA) for displaying a grid of YouTube videos with drag & drop reordering, selective audio, and persistent state. It is designed for live streams and works as a single-page app with no backend.

## Architecture & Key Files
- `index.html`: Main entry point. Loads YouTube IFrame API, app logic (`app.js`), and styles (`styles.css`). Contains the dropzone for adding videos and the grid for displaying them.
- `app.js`: All main logic. Handles video grid rendering, drag & drop, selection/mute logic, localStorage persistence, and UI controls. Uses YouTube IFrame API for embedded players.
- `styles.css`: UI styles for grid, drag & drop feedback, buttons, and overall layout.
- `manifest.json`: PWA manifest for installability and icons.
- `sw.js`: Service worker for offline support and asset caching.
- `.github/workflows/gh-pages.yml`: GitHub Actions workflow for automatic deployment to GitHub Pages on every push to `main`.

## Developer Workflows
- **Local Development**: Use a local server (e.g. `npx serve .`) to avoid CORS issues with YouTube embeds. Do not use `file://`.
- **Persistence**: Video list and selected audio index are stored in `localStorage`.
- **Drag & Drop**: Reordering is handled in the DOM and persisted to `localStorage`.
- **Deployment**: Push to `main` triggers GitHub Actions workflow, deploying the site to GitHub Pages. Workflow requires `id-token: write` and `pages: write` permissions.

## Patterns & Conventions
- **Video IDs**: Only YouTube video IDs are stored, not full URLs. Use `getVideoId(url)` to extract IDs.
- **Selection**: Only one video can be selected for audio at a time. Selection state is visually indicated and persisted.
- **UI Controls**: Each video has 'Seleccionar' and 'Quitar' buttons. Drag & drop is enabled for reordering.
- **PWA**: Service worker caches core assets. Manifest provides icons and theme.
- **No Frameworks**: Pure HTML, JS (ES6 modules), and CSS. No build step required.

## External Dependencies
- YouTube IFrame API (loaded via `<script src="https://www.youtube.com/iframe_api"></script>`)

## Example: Adding a Video
- Paste a YouTube link in the input box or drag a link into the dropzone. The app extracts the video ID and adds it to the grid.

## Example: Deployment
- Commit and push changes to `main`. The workflow in `.github/workflows/gh-pages.yml` will deploy the latest version to GitHub Pages automatically.

## Key Files Reference
- `index.html`, `app.js`, `styles.css`, `manifest.json`, `sw.js`, `.github/workflows/gh-pages.yml`

---
If you add new features, follow the existing modular JS and localStorage patterns. For deployment, ensure workflow permissions are correct. For UI, maintain the current style and UX conventions.
