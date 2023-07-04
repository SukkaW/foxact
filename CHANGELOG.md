# 0.2.13

**Core Changes**

- Add `useReactRouterEnableConcurrentNavigation` and `<ReactRouterConcurrentNavigationProvider />`

# 0.2.12

**Core Changes**

- Add `useReactRouterIsMatch`

**Misc Changes**

- Replace `eslint-plugin-import` with `eslint-plugin-i`
  - Why you should also do `npm install -D eslint-plugin-import@npm:eslint-plugin-i@latest` in your projects:

  - https://github.com/import-js/eslint-plugin-import/pull/2812#issuecomment-1617241548
  - https://github.com/import-js/eslint-plugin-import/pull/2447

  <details>
  <summary>Screenshots</summary>

  ![](https://pic.skk.moe/misc/HdUAUWOEQFVs9Tk0MvRqq.png)
  ![](https://pic.skk.moe/misc/lO3aKLfXBo3hcAwJoGCED.jpeg)
  ![](https://pic.skk.moe/misc/4bWD1kBv65_8oYRlU7rsg.jpeg)

  </details>

# 0.2.11

**Misc Changes**

- Making `useUncontrolled` more React Concurrent Rendering resilient by avoiding a hacky workaround.

# 0.2.10

**Core Changes**

- Add `useCompositionInput`
- `createContextState` now returns a fourth value in the tuple, which is the React Context that holds the state value. It is designed to be used with `React.use`.

# 0.2.9

**Core Changes**

- Add `useDebouncedValue` and `useDebouncedValue`

# 0.2.8

**Core Changes**

- Add `onCopyError` to `useClipboard`
- Introduce `useStableHandler`

# 0.2.7

**Misc Changes**

- Documentation: https://foxact.skk.moe
- Finish TSDocs

# 0.2.6

**Misc Changes**

- Publish `sizes.json`

# 0.2.5

**Misc Changes**

- Add CI to auto publish release
- Enable npm provenance

# 0.2.4

**Core Changes**

`useArray` now supports remove by index.

# 0.2.2

**Core Changes**

`useMap`, `useSet`, `useArray` now accept an optional initial value.

# 0.2.1

**Core Changes**

- New hook: `useMap`
- New hook: `useSet`
- New hook: `useArray`
- New hook: `useErrorBoundary`
- New hook: `useUncontrolled`
- New hook: `useClipboard`
- New util: `noop`
- New util: `request-idle-callback`
- New util: `typescriptHappyForwardRef`

# 0.2.0

**Core Changes**

- New hook: `useIsomorphicLayoutEffect`
- New hook: `useIntersection`

**Misc Changes**

- Enable minify for dist build

# 0.1.1

Initial release.
