import 'client-only';
// useState is only available in the React Client Components.

import { useState } from 'react';

type ErrorLike = Error | undefined | null | boolean;

function isTruthy(value: ErrorLike): value is Error {
  return !(value === false || value == null);
}

/** @see https://foxact.skk.moe/use-error-boundary */
export function useErrorBoundary(givenError: ErrorLike = false) {
  const [error, setError] = useState<ErrorLike>(false);

  if (isTruthy(givenError)) throw givenError;
  if (isTruthy(error)) throw error;
  return setError;
}
