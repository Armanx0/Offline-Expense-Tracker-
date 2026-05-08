# Expense Tracker

Expense Tracker is a single-user offline-first mobile app built with Expo and React Native.

This repo is intentionally structured as one app at the project root. There is no longer a separate backend app, shared workspace package, or nested mobile project to mentally unpack before you can run it.

## What The App Does

The app lets one user manage personal expenses entirely on-device.

Main features:

- weekly dashboard by default
- monthly, yearly, and all-time dashboard filters
- recent transactions on the dashboard
- expense create, edit, delete, search, and category filtering
- expenses list with load-more pagination
- category creation and deletion
- light, dark, and system theme support
- CSV expense export
- full JSON backup export
- confirmation before export actions

## Offline-Only Behavior

The app does not use:

- a backend
- login
- tokens
- sessions
- cloud sync

All data is stored locally on the device through `expo-file-system`.

## Quick Start

Run everything from the project root:

```bash
corepack pnpm install
corepack pnpm dev
```

Useful commands:

```bash
corepack pnpm lint
corepack pnpm typecheck
corepack pnpm test
corepack pnpm run build:apk
corepack pnpm run build:aab
```

## Root Structure

Main folders:

- `app` - Expo Router routes and screen entry points
- `src` - business logic, components, hooks, stores, contracts, data layer, and utilities
- `tests` - Jest tests

Main root files:

- `package.json` - one source of truth for dependencies and scripts
- `app.json` - Expo app configuration
- `eas.json` - Android cloud build profiles
- `tsconfig.json` - TypeScript config for the whole app
- `babel.config.js` - Babel config used by Expo and Jest transforms
- `jest.config.js` - test setup
- `eslint.config.mjs` - lint rules
- `README.md` - project guide

## Why Multiple Config Files Still Exist

The repo is simplified, but some separate config files still need to exist because the toolchain expects them by name:

- `app.json` is read by Expo
- `eas.json` is read by EAS Build
- `babel.config.js` is read by Babel and Metro
- `tsconfig.json` is read by TypeScript
- `jest.config.js` is read by Jest
- `eslint.config.mjs` is read by ESLint

So the simplification here is not "one giant config file". It is:

- one app
- one root
- one `package.json`
- one README
- no backend folder
- no workspace package for app contracts

## How The App Works

Current runtime flow:

1. screens in `app` call hooks from `src/hooks`
2. hooks call the local data layer in `src/data/offline-data.ts`
3. schemas and types come from `src/contracts`
4. data is stored in JSON files under the app document directory
5. React Query refreshes screens after create, update, delete, and export actions

## Screen Flow

### Home

- opens on the dashboard
- default period is `week`
- user can switch between `week`, `month`, `year`, and `all`
- dashboard shows summary, timeline, top categories, and the 5 most recent transactions for the selected period
- add-expense action takes the user to `expense/new`

### Expenses

- shows the latest expenses first
- supports search and category filtering
- loads 20 items initially
- `Load more` fetches the next page locally
- tapping an expense opens `expense/[id]`

### Add Expense

- route: `expense/new`
- submitting saves locally
- after save, the user is returned to the Home tab
- dashboard and expense queries refresh automatically

### Edit Expense

- route: `expense/[id]`
- supports update and delete
- changes are saved locally and reflected immediately in the list and dashboard

### Settings

- theme selection: `System`, `Light`, `Dark`
- offline profile summary
- CSV export with confirmation first
- full backup export with confirmation first
- category management

### Category Create

- route: `category/new`
- saves locally and becomes available in filters and the expense form

## Local Storage

Runtime storage locations:

- `documentDirectory/expense-tracker/database.json`
- `documentDirectory/expense-tracker/ui-preferences.json`
- `documentDirectory/expense-tracker/exports/*`

Stored data:

- one offline user profile
- categories
- expenses
- theme preference
- dashboard period preference

## Files To Start With As A Developer

If you need to debug or extend the app, start here:

- `app/_layout.tsx`
- `app/(tabs)/index.tsx`
- `app/(tabs)/expenses.tsx`
- `app/(tabs)/settings.tsx`
- `src/data/offline-data.ts`
- `src/hooks/useExpenses.ts`
- `src/hooks/useCategories.ts`
- `src/hooks/useDashboard.ts`
- `src/hooks/useExports.ts`
- `src/store/user.store.ts`
- `src/store/ui.store.ts`
- `src/providers/AppProviders.tsx`
- `src/constants/theme.ts`

## Build Notes

- `build:apk` creates a direct-install Android APK
- `build:aab` creates an Android App Bundle for store distribution
- Android shrinking is enabled through `expo-build-properties`
- APK size will always be larger than the source code because it includes the React Native and Expo runtime plus native libraries

## Update Safety

Existing app data is usually preserved when installing a new APK only if:

- package name stays the same
- signing key stays the same
- Android accepts it as an in-place update

If the app is uninstalled first, local data can be lost.

Safest path before reinstalling:

- export a backup from Settings

## Verification Status

Currently working:

- `corepack pnpm install`
- `corepack pnpm lint`
- `corepack pnpm typecheck`
- Android APK builds through EAS

Known issue:

- `corepack pnpm test` still fails in this Windows + pnpm + React Native 0.79 setup because Jest is not transforming `@react-native/js-polyfills` correctly before tests run
