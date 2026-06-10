import { describe, it } from 'mocha';
import { expect } from 'earl';

import { Component } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { useErrorBoundary } from '.';

interface BoundaryState {
  error: Error | null
}

class Boundary extends Component<React.PropsWithChildren, BoundaryState> {
  public state: BoundaryState = { error: null };

  static getDerivedStateFromError(this: void, error: Error): BoundaryState {
    return { error };
  }

  render() {
    if (this.state.error) {
      return <span data-testid="boundary-state">caught: {this.state.error.message}</span>;
    }
    return this.props.children;
  }
}

function silencingReactErrorReporting<T>(fn: () => T): T {
  /* eslint-disable no-console -- React reports boundary-caught errors via console.error */
  const originalConsoleError = console.error;
  console.error = () => { /* noop */ };
  try {
    return fn();
  } finally {
    console.error = originalConsoleError;
  }
  /* eslint-enable no-console */
}

describe('useErrorBoundary', () => {
  it('does not throw by default', () => {
    let setError: ((error: Error) => void) | null = null;

    function Probe() {
      setError = useErrorBoundary();
      return <span data-testid="probe-state">fine</span>;
    }

    render(<Boundary><Probe /></Boundary>);

    expect(screen.getByTestId('probe-state').textContent).toEqual('fine');
    expect(setError).not.toBeNullish();
  });

  it('throws to the closest error boundary from an event handler', () => {
    // the documented use case: errors thrown inside event handlers (or async
    // callbacks) are NOT caught by error boundaries, the setter re-throws them
    // during render so the boundary can catch them
    function Probe() {
      const setError = useErrorBoundary();
      return (
        <button type="button" onClick={() => setError(new Error('event handler error'))}>
          fail
        </button>
      );
    }

    render(<Boundary><Probe /></Boundary>);

    silencingReactErrorReporting(() => {
      fireEvent.click(screen.getByRole('button'));
    });

    expect(screen.getByTestId('boundary-state').textContent).toEqual('caught: event handler error');
  });

  it('throws the given error immediately', () => {
    function Probe({ error }: { error?: Error }) {
      useErrorBoundary(error);
      return <span data-testid="probe-state">fine</span>;
    }

    silencingReactErrorReporting(() => render(
      <Boundary>
        <Probe error={new Error('given error')} />
      </Boundary>
    ));

    expect(screen.getByTestId('boundary-state').textContent).toEqual('caught: given error');
  });

  it('treats false, null and undefined as no error', () => {
    function Probe() {
      useErrorBoundary(false);
      useErrorBoundary(null);
      // eslint-disable-next-line sukka/no-undefined-optional-parameters -- explicit undefined is the documented ErrorLike
      useErrorBoundary(undefined);
      return <span data-testid="probe-state">fine</span>;
    }

    render(<Boundary><Probe /></Boundary>);

    expect(screen.getByTestId('probe-state').textContent).toEqual('fine');
  });
});
