import { describe, it } from 'mocha';
import { expect } from 'earl';

import { use } from 'react';
import { act, render, renderHook } from '@testing-library/react';
import { createContextState } from '.';
import { createContextState as createContextStateAlias } from '../create-context-state';

describe('createContextState', () => {
  it('provides the initial state through useValue', () => {
    const [Provider, useValue] = createContextState('foo');

    const { result } = renderHook(() => useValue(), { wrapper: Provider });

    expect(result.current).toEqual('foo');
  });

  it('updates the state through useSetValue, with functional update support', () => {
    const [Provider, useValue, useSetValue] = createContextState(0);

    const { result } = renderHook(() => [useValue(), useSetValue()] as const, { wrapper: Provider });

    act(() => result.current[1](42));
    expect(result.current[0]).toEqual(42);

    // the documented useToggle-ish pattern relies on functional updates
    act(() => result.current[1]((prev) => prev + 1));
    expect(result.current[0]).toEqual(43);
  });

  it('returns a stable setter that can be safely added to dependency arrays', () => {
    const [Provider, , useSetValue] = createContextState(0);

    const { result, rerender } = renderHook(() => useSetValue(), { wrapper: Provider });
    const setter = result.current;

    rerender();

    expect(result.current).toExactlyEqual(setter);
  });

  it('accepts the initial state from the Provider within the React tree', () => {
    // re-pick the option 2 overload: the Provider accepts an optional initialState prop
    const [Provider, useValue] = createContextState<boolean>(false) as ReturnType<typeof createContextState<boolean>>;

    const { result } = renderHook(() => useValue(), {
      wrapper: ({ children }) => <Provider initialState>{children}</Provider>
    });

    expect(result.current).toEqual(true);
  });

  it('falls back to the create-time initial state outside of the Provider', () => {
    const [, useValue, useSetValue] = createContextState('default');

    const { result } = renderHook(() => [useValue(), useSetValue()] as const);

    expect(result.current[0]).toEqual('default');
    // setter outside of the Provider is a noop and must not throw
    act(() => result.current[1]('changed'));
    expect(result.current[0]).toEqual('default');
  });

  it('only re-renders components that read the state', () => {
    const [Provider, useValue, useSetValue] = createContextState(0);

    let valueRenders = 0;
    let setterRenders = 0;
    let setValue: ReturnType<typeof useSetValue>;

    function ValueConsumer() {
      valueRenders++;
      useValue();
      return null;
    }
    function SetterConsumer() {
      setterRenders++;
      setValue = useSetValue();
      return null;
    }

    render(
      <Provider>
        <ValueConsumer />
        <SetterConsumer />
      </Provider>
    );

    expect(valueRenders).toEqual(1);
    expect(setterRenders).toEqual(1);

    act(() => setValue(1));

    // Only the value consumer re-renders, the setter-only consumer does not
    expect(valueRenders).toEqual(2);
    expect(setterRenders).toEqual(1);
  });

  it('exposes the StateContext for conditional reads via React.use', () => {
    const [Provider, , useSetValue, StateContext] = createContextState('conditional');

    const { result } = renderHook(() => {
      // reading context with `use` is allowed conditionally; useSetValue just
      // proves both hooks come from the same pair of contexts
      const value = use(StateContext);
      useSetValue();
      return value;
    }, { wrapper: Provider });

    expect(result.current).toEqual('conditional');
  });

  it('is also exported from foxact/create-context-state', () => {
    expect(createContextStateAlias).toExactlyEqual(createContextState);
  });
});
