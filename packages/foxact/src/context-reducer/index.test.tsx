import { describe, it } from 'mocha';
import { expect } from 'earl';

import { act, renderHook } from '@testing-library/react';
import { createContextReducer } from '.';
import { createContextReducer as createContextReducerAlias } from '../create-context-reducer';

interface State { count: number }
type Action = { type: 'inc' } | { type: 'dec' };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'inc': return { count: state.count + 1 };
    case 'dec': return { count: state.count - 1 };
    default: return state;
  }
}

describe('createContextReducer', () => {
  it('option 1: provides the initial state and dispatches through the reducer', () => {
    const [Provider, useValue, useDispatch] = createContextReducer(reducer, { count: 0 });

    const { result } = renderHook(() => [useValue(), useDispatch()] as const, { wrapper: Provider });

    expect(result.current[0]).toEqual({ count: 0 });

    act(() => result.current[1]({ type: 'inc' }));
    expect(result.current[0]).toEqual({ count: 1 });

    act(() => result.current[1]({ type: 'dec' }));
    act(() => result.current[1]({ type: 'dec' }));
    expect(result.current[0]).toEqual({ count: -1 });
  });

  it('option 2: applies the init function to initialArg (3-arg useReducer semantics)', () => {
    const [Provider, useValue, useDispatch] = createContextReducer(reducer, 10, (n: number) => ({ count: n }));

    const { result } = renderHook(() => [useValue(), useDispatch()] as const, { wrapper: Provider });

    expect(result.current[0]).toEqual({ count: 10 });

    act(() => result.current[1]({ type: 'inc' }));
    expect(result.current[0]).toEqual({ count: 11 });
  });

  it('option 3: accepts initialArg and init from the Provider', () => {
    const [Provider, useValue] = createContextReducer<State, Action, number>(reducer);

    const { result } = renderHook(() => useValue(), {
      wrapper: ({ children }) => (
        <Provider initialArg={10} init={(n) => ({ count: n })}>
          {children}
        </Provider>
      )
    });

    expect(result.current).toEqual({ count: 10 });
  });

  it('prefers Provider props over create-time initialArg and init', () => {
    const [Provider, useValue] = createContextReducer(reducer, 1, (n: number) => ({ count: n }));

    const { result } = renderHook(() => useValue(), {
      wrapper: ({ children }) => (
        <Provider initialArg={5} init={(n: number) => ({ count: n * 2 })}>
          {children}
        </Provider>
      )
    });

    expect(result.current).toEqual({ count: 10 });
  });

  it('returns a stable dispatch across re-renders', () => {
    const [Provider, , useDispatch] = createContextReducer(reducer, { count: 0 });

    const { result, rerender } = renderHook(() => useDispatch(), { wrapper: Provider });
    const dispatch = result.current;

    rerender();

    expect(result.current).toExactlyEqual(dispatch);
  });

  it('falls back to the create-time initial state outside of the Provider', () => {
    const [, useValue, useDispatch] = createContextReducer(reducer, 7, (n: number) => ({ count: n }));

    const { result } = renderHook(() => [useValue(), useDispatch()] as const);

    // init is applied at create time for the context default value
    expect(result.current[0]).toEqual({ count: 7 });
    // dispatch outside of the Provider is a noop and must not throw
    act(() => result.current[1]({ type: 'inc' }));
    expect(result.current[0]).toEqual({ count: 7 });
  });

  it('exposes the StateContext as the 4th element', () => {
    const contextReducer = createContextReducer(reducer, { count: 3 });
    const Provider = contextReducer[0];
    const StateContext = contextReducer[3];

    const { result } = renderHook(() => StateContext, { wrapper: Provider });

    expect(result.current).toExactlyEqual(StateContext);
  });

  it('is also exported from foxact/create-context-reducer', () => {
    expect(createContextReducerAlias).toExactlyEqual(createContextReducer);
  });
});
