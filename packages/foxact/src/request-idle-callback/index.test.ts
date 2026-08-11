import { describe, it } from 'mocha';
import { expect } from 'earl';

import { cancelIdleCallback, requestIdleCallback } from '.';
import { wait } from 'foxts/wait';

// Happy DOM does not implement requestIdleCallback, so these tests exercise
// the setTimeout-based polyfill branch.
describe('requestIdleCallback', () => {
  it('invokes the callback with an IdleDeadline-shaped argument', async () => {
    const deadline = await new Promise<IdleDeadline>((resolve) => {
      // eslint-disable-next-line sukka/prefer-timer-id -- awaited immediately, nothing to clean up
      requestIdleCallback(resolve);
    });

    expect(deadline.didTimeout).toEqual(false);
    const remaining = deadline.timeRemaining();
    expect(remaining).toBeGreaterThanOrEqual(0);
    expect(remaining).toBeLessThanOrEqual(50);
  });

  it('can be cancelled via cancelIdleCallback', async () => {
    let fired = false;

    const id = requestIdleCallback(() => {
      fired = true;
    });
    cancelIdleCallback(id);

    await wait(10);

    expect(fired).toEqual(false);
  });
});
