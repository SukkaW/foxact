# 0.2.37

**Core Changes**

- `foxact/rem` now also exports converter factory function
- `foxact/rem` now supports customize html font size

# 0.2.36

**Core Changes**

- Add `foxact/types`
- `createFixedArray` now supports GC-friendly array creation when `WeakRef` is available
  - Created array will be garbage-collected if not used (e.g. all components that use the array are unmounted)

# 0.2.35

**Misc Changes**

- Improve the types of `useLocalStorage` and `useSessionStorage`.

# 0.2.34

**Core Changes**

- Add `useMediaQuery`
- `useCompositionInput` now supports `<textarea />`

    ```tsx
    export const Example2 = () => {
      const textareaProps = useCompositionInput<HTMLTextAreaElement>(useCallback((value: string) => {
        // Do something with the value
      }, []));

      return (
        <textarea
          {...textareaProps}
          // useCompositionInput is uncontrolled, so you might need to provide defaultValue
          defaultValue={defaultValue}
        />
      );
    }
    ```

# 0.2.33

**Core Changes**

- Add `useAbortableEffect`

# 0.2.32

**Core Changes**

- Make `no-ssr` digest configurable
- Change default digest of `no-ssr` to the Next.js latest digest

# 0.2.31

**Core Changes**

- Add `unstable_useNextLink`

# 0.2.30

**Breaking Changes**

- `<CurrentYear />` component change from default export to named export

# 0.2.29

**Core Changes**

- `rem` and `em` functions now accepts multiple values
- `invariant` function now accepts custom error message
- Add `<CurrentYear />` component

**Misc Changes**

- Improve error messages

# 0.2.28

**Core Changes**

- Add `invariant` function
- Add `nullthrow` function
- Re-implement `unstable_useUrlHashState`

# 0.2.27

**Core Changes**

- Add `useSessionStorage`
- Improve performance of `noSSR`

# 0.2.26

**Core Changes**

- Allow the `deserializer` of `useLocalStorage` to return an un-memoized value

# 0.2.25

**Core Changes**

- Allow customize `useLocalStorage`'s `serializer` and `deserializer`

# 0.2.24

**Core Changes**

- Make `noSSR` only throw on the server

# 0.2.23

**Core Changes**

- Add `unstable_useUrlHashState`
- Add `useLocalStorage`
- Add `noSSR`

# 0.2.22

**Core Changes**

- Remove leaking `dependencies`

# 0.2.21

**Core Changes**

- Add `rem` and `em` CSS units converter
- Disallow `useDebouncedValue` a function

# 0.2.20

**Core Changes**

- Add `composeContextProvider`

# 0.2.19

**Core Changes**

- Change `createFixedArray`'s return types

# 0.2.18

**Core Changes**

- Add `forceSetValue` to `useDebouncedState`
- Add `createFixedArray`

# 0.2.17

**Core Changes**

- Fix `useNextPathname` to work with Next.js
- Add `useSingleton`

**Misc Changes**

- Refactor `useCompositionInput` to use `useSingleton`
- Refactor `useUncontrolled`, remove the memoization of the inline reducer

# 0.2.16

**Core Changes**

- Add `useNextPathname`

# 0.2.15

**Core Changes**

- Add `useIsClient`
- Make `useErrorBoundary`'s parameter optional

# 0.2.14

**Core Changes**

- Make the 2nd parameter of `useReactRouterIsMatch` optional
- Add invariant type check for `NavigationContext` in `useReactRouterEnableConcurrentNavigation`

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
