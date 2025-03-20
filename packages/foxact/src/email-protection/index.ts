'use client';

import { memo, useState } from 'react';
import { useIsomorphicLayoutEffect } from '../use-isomorphic-layout-effect';

interface EmailProtectionProps {
  /**
   * The mailbox name.
   * If the desired E-Mail addresses are "hello@example.com", then the mailbox name is "hello".
   *
   * By passing the mailbox name and domain separately, the scrapper won't be able to find the
   * mail address even if they scan JavaScript files.
   */
  mailbox: string,
  /**
   * The domain name.
   * If the desired E-Mail addresses are "hello@example.com", then the domain name is "example.com".
   *
   * By passing the mailbox name and domain separately, the scrapper won't be able to find the
   * mail address even if they scan JavaScript files.
   */
  domain: string
}

/**
 * @see https://foxact.skk.moe/email-protection
 *
 */
export const EmailProtection = memo(({ mailbox, domain }: Readonly<EmailProtectionProps>): React.ReactNode => {
  // eslint-disable-next-line sukka/unicorn/prefer-string-replace-all -- target lib es2018
  const [text, setText] = useState(() => Math.random().toString(36).slice(2) + '[at]' + domain.replace(/\./g, '[dot]'));
  useIsomorphicLayoutEffect(() => {
    // This is only allowed because it won't trigger infinite re-render and double render is intentional
    setText(mailbox + '@' + domain);
  }, [domain, mailbox]);

  return text;
});

if (process.env.NODE_ENV !== 'production') {
  EmailProtection.displayName = 'EmailProtection';
}
