# Expense Tracker

Single-user, offline-first expense tracking app built with Expo Router and React Native Paper.

## Repo Layout

- `apps/mobile`: The app you run.
- `packages/contracts`: Shared Zod schemas and DTOs used by the mobile app.

The old backend has been removed. This repo is now focused on the offline mobile app only.

## Offline Features

- No login or backend setup required.
- Data is persisted locally inside the app with a lightweight JSON store.
- Dashboard, categories, expense CRUD, and search all run offline.
- Settings includes CSV export and full backup file export.

## Getting Started

1. Install dependencies:

```bash
corepack pnpm install
```

2. Start the app:

```bash
corepack pnpm dev
```

3. Build an Android APK:

Use your normal Expo Android build flow, for example `eas build -p android` or a local Android release build after prebuild.

## Quality Checks

```bash
corepack pnpm lint
corepack pnpm typecheck
corepack pnpm test
```
