# Gym Tracker App Plan

This document outlines the plan for building a simple, free, and locally-accessible gym tracker.

## Approach for Hosting and Accessibility
To meet your requirements of accessing it at the gym from your Android phone without spending money, we will build a **Progressive Web App (PWA)** that stores data entirely locally on your phone using your browser's local storage. This means:
1. **100% Free**: No servers or databases to pay for.
2. **Offline Capable**: It will work inside the gym even if you have bad reception.
3. **App-like Experience**: You can use Chrome on your Android phone to "Add to Home Screen," and it will look and feel exactly like a native app.
4. **Hosting**: We will set it up so you can host it for free on Vercel, Netlify, or GitHub Pages. Once loaded once, it works entirely offline.

## Proposed Changes

### Tech Stack
- **Framework**: React with Vite
- **Styling**: Tailwind CSS for a premium, mobile-first design.
- **State/Storage**: **SQLite WebAssembly (WASM) with Origin Private File System (OPFS)**. This brings a full, persistent relational database directly into the browser.
- **PWA**: `vite-plugin-pwa` for offline support and Android app installability.

### Core Features
- **Database Abstraction Layer (DAL)**: All database interactions (saving workouts, querying history) will be routed through an abstracted API service interface (e.g., `WorkoutRepository` and `WorkoutService`), mirroring Java Spring's architecture. The initial implementation will inject a `SqliteWorkoutRepository` using SQLite WASM + OPFS, allowing it to be seamlessly swapped with a `CloudApiWorkoutRepository` later without touching the UI components or Business Logic Services.
- **Body Part & Exercise Selection**: Categorized selection (Chest, Back, Biceps, Triceps, Legs).
- **Progressive Overload Tracking**: When you select an exercise, query the repository to immediately show you the last weight and reps you lifted, and how many days ago it was.
- **Session Logging**: Easily log new sets as you work out, securely routed through the DAL.
- **Data Portability**: Added an 'Export/Import' setting to download your SQLite database file securely so you can easily move it to another device or backup without losing progress.

## User Review Required
> [!IMPORTANT]
> Since the data is stored locally on your device, clearing your browser's site data would delete your workout history. Are you okay with an export/import feature for backups, or would you prefer a free cloud database like Firebase/Supabase (which would require a quick setup of a free account on your end)? For now, the plan uses local storage for zero-setup simplicity. Let me know if you approve this plan!
