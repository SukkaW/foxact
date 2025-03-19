export function isSafari() {
  if (typeof window === 'undefined') {
    return false;
  }
  if (typeof navigator === 'undefined') {
    return false;
  }
  if (typeof navigator.userAgent !== 'string') {
    return false;
  }
  if (/version\/[\d._].*?safari/i.test(navigator.userAgent)) {
    return true;
  }
  // eslint-disable-next-line sukka/prefer-single-boolean-return -- cleaner code
  if (/mobile safari [\d._]+/i.test(navigator.userAgent)) {
    return true;
  }
  return false;
}
