import { isSafari } from '../is-safari';

export function openInNewTab(url: string) {
  if (typeof window === 'undefined') {
    return;
  }

  if (isSafari()) {
    window.open(url, '_blank');
    return;
  }

  const a = document.createElement('a');
  a.href = url;
  a.target = '_blank';
  a.rel = 'noopener noreferrer';
  document.body.appendChild(a);
  a.click();

  Promise.resolve().finally(() => {
    a.remove();
  });
}
