import { useState } from 'react';

/**
 * If you're using useEffect like this:
 *
 * ```js
 * const [state, setState] = useState(false)
 * useEffect(() => setState(false), [props.someProp])
 * ```
 * Don't do it. See [Adjusting some state when a prop changes](https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes)
 * It should be like this:
 * ```js
 * const [prev, setPrev] = useState(state)
 * if (prev !== state) {
 *     setPrev(state)
 *     setState(false)
 * }
 * ```
 * This hook is a helper for the above pattern.
 * ```js
 * useComponentWillReceiveUpdate(() => setState(false), [state])
 * ```
 *
 * This only applies to states of the current component.
 * Modifying states from other components causes React reporting errors.
 * You may also want to read [(Avoid) Notifying parent components about state changes](https://react.dev/learn/you-might-not-need-an-effect#notifying-parent-components-about-state-changes)
 * and [(Avoid) Passing data to the parent](https://react.dev/learn/you-might-not-need-an-effect#passing-data-to-the-parent).
 * If you really need to edit other components' states, write it like this:
 *
 * ```js
 * useComponentWillReceiveUpdate(() => {
 *     setLocalState(false)
 *     Promise.resolve().then(() => props.setParentState(false))
 * }, [state])
 * ```
 *
 * @param callback
 * @param deps
 */
export function useComponentWillReceiveUpdate(callback: () => void, deps: readonly unknown[]) {
    deps = [...deps]
    const [prev, setPrev] = useState(deps)
    let changed = deps.length !== prev.length
    for (let i = 0; i < deps.length; i += 1) {
        if (changed) break
        if (prev[i] !== deps[i]) changed = true
    }
    if (changed) {
        setPrev(deps)
        callback()
    }
}
