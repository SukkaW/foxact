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
