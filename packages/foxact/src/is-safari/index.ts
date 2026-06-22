export function isSafari() {
  /* istanbul ignore if -- SSR-only guard, unreachable when Happy DOM registers window globally in tests */
  if (typeof window === 'undefined') {
    return false;
  }
  /* istanbul ignore if -- environment guard, Happy DOM always provides navigator */
  if (typeof navigator === 'undefined') {
    return false;
  }
  /* istanbul ignore if -- environment guard, Happy DOM always provides a string userAgent */
  if (typeof navigator.userAgent !== 'string') {
    return false;
  }
  if (/version\/[\d._].*?safari/i.test(navigator.userAgent)) {
    return true;
  }
  // eslint-disable-next-line sukka/unicorn/prefer-boolean-return -- cleaner code
  if (/mobile safari [\d._]+/i.test(navigator.userAgent)) {
    return true;
  }
  return false;
}
