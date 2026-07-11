# Lane Logic

## Getting started

This sandbox can't reach the npm registry, so dependencies aren't installed yet — `package.json` lists the pinned versions from our setup conversation. On your machine:

```bash
npm install
npx expo start
```

## What's wired up

- **Expo Router** — file-based routing under `app/`, with a `(tabs)` group for Home / Scoring / Analytics / Profile and a `game/[gameId]` detail route.
- **NativeWind v4** — `babel.config.js` adds the `nativewind` JSX import source and babel plugin; `metro.config.js` wraps the default Metro config with `withNativeWind`, pointed at `global.css`; `tailwind.config.js` scans `app/` and `src/` for class names and defines the `brand` color palette. `global.css` is imported once, in `app/_layout.tsx`.
- **Feature-based structure** — `src/features/{scoring,analytics,profile}` each have `components/`, `hooks/`, `store/`, `types/`, and an `index.ts` barrel file that should be the only public surface other code imports from.
- **Shared infra** — `src/components/{ui,layout}` for shared dumb components, `src/lib/{storage,api,constants}` for cross-feature infrastructure, `src/theme` for design tokens.

## Next steps

Once you can run `npm install` locally, sanity-check the wiring with:

```bash
npx tsc --noEmit
npx expo start
```

Then send over the bowling scoring algorithm's expected inputs/outputs so we can scaffold `src/features/scoring` properly.
