# LinkHub

LinkHub is a Chrome extension built with React, TypeScript, and Vite. It helps you organize folders and links, with persistence using `chrome.storage.local`.

## Project structure

- `src/` — application source code
- `public/manifest.json` — Chrome extension manifest
- `public/index.html` — popup entry point
- `public/icons/` — extension icons
- `dist/` — production build output

## Requirements

- Node.js 18+ recommended
- npm 10+ (or yarn if preferred)
- Chrome browser

## Setup

Install dependencies:

```bash
npm install
```

### Run in development

```bash
npm run dev
```

This starts the Vite development server. You can open the extension UI via the Vite URL during development.

### Build for production

```bash
npm run build
```

The production-ready extension files are generated into the `dist/` folder.

## Load the extension in Chrome Developer mode

1. Open Chrome and go to `chrome://extensions`
2. Enable **Developer mode** in the top right
3. Click **Load unpacked**
4. Choose the `dist/` folder from this repo
5. The extension should appear with the icon from `public/icons/`

### Notes for Chrome extension mode

- The extension uses Manifest V3 and `chrome.storage.local`
- The popup entry point is defined in `public/manifest.json`
- If you change the extension files, rebuild with `npm run build`
- Reload the extension on `chrome://extensions` after rebuilding

## Useful commands

```bash
npm run dev    # start development server
npm run build  # production build output to dist/
npm run lint   # run ESLint
npm run preview # preview the production build locally
```

## Troubleshooting

- If Chrome rejects the extension, make sure you selected the `dist/` folder
- If the popup does not open, verify `manifest.json` is valid
- If persistence is not working, check that Chrome has granted the `storage` permission

## Additional information

- The app uses React Router for navigation inside the popup
- `public/manifest.json` includes permissions for `storage` and `tabs`
- Static assets from `public/` are copied into `dist/` by Vite during build