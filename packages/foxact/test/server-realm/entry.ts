import { parentPort, workerData } from 'node:worker_threads';
import { extractErrorMessage } from 'foxts/extract-error-message';

// This file runs inside a worker thread: a pristine server realm without any
// Happy DOM globals. The fixture's default export runs here and its (structured
// clone serializable) return value is posted back to the test on the main thread.
(async () => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports -- fixture path is provided by the test
    const fixture = require(workerData.fixture as string) as { default: () => unknown };
    const value = await fixture.default();
    parentPort!.postMessage({ ok: true, value });
  } catch (error) {
    parentPort!.postMessage({
      ok: false,
      error: extractErrorMessage(error, true, false)
    });
  }
})();
