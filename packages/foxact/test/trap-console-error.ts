/* eslint-disable no-console -- intercept console.error to catch hydration mismatches */
export function trapConsoleError() {
  const calls: unknown[] = [];
  const originalConsoleError = console.error;
  console.error = (...args: unknown[]) => { calls.push(args); };

  return {
    calls,
    restore() {
      console.error = originalConsoleError;
    }
  };
}
