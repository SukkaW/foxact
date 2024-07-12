import 'client-only';
// useState is only available in the React Client Components.

import { useState } from 'react';

type ErrorLike = Error | undefined | null | boolean;

const isTruthy = (value: ErrorLike): value is Error => {
  if (value === false) return false;
  if (value == null) return false;

  return true;
};

/** @see https://foxact.skk.moe/use-error-boundary */
export const useErrorBoundary = (givenError: ErrorLike = false) => {
  const [error, setError] = useState<ErrorLike>(false);

  if (isTruthy(givenError)) throw givenError;
  if (isTruthy(error)) throw error;
  return setError;
};
