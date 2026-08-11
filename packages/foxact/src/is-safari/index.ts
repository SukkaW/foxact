const RE_SAFARI = /version\/[\d._].*?safari/i;
const RE_MOBILE_SAFARI = /mobile safari [\d._]+/i;

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
  if (RE_SAFARI.test(navigator.userAgent)) {
    return true;
  }

  if (RE_MOBILE_SAFARI.test(navigator.userAgent)) {
    return true;
  }
  return false;
}
