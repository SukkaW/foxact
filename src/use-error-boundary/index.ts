import 'client-only';
// useState is only available in the React Client Components.

import { useState } from 'react';

type ErrorLike = Error | undefined | null | boolean;

const isTruthy = (value: ErrorLike): boolean => {
  if (value === false) return false;
  if (value === undefined) return false;
  if (value === null) return false;

  return true;
};

export const useErrorBoundary = (givenError: ErrorLike) => {
  const [error, setError] = useState<ErrorLike>(false);

  if (isTruthy(givenError)) throw givenError;
  if (isTruthy(error)) throw error;
  return setError;
};