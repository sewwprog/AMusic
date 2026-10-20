# AMusic Desktop

Desktop music player built with React, TypeScript and Tauri 2, inspired by Telegram Desktop.

## Features
- Local MP3/M4A playback, search, favorites, playlists, playback queue
- Minimal blue-gray theme and responsive desktop layout
- Offline-first music library
- No Spotify or YouTube integration

## Setup (Windows)

Install Node.js, Rust and Microsoft C++ Build Tools (Desktop development with C++).

```powershell
npm install
npm run tauri dev
```

For a browser preview, `npm run dev`. To build an installer: `npm run tauri build`.

Your imported music stays on your PC. No audio files are committed to this repository.
