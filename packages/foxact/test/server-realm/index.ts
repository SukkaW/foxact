import { Worker } from 'node:worker_threads';
import path from 'node:path';

type WorkerResult<T> =
  | { ok: true, value: T }
  | { ok: false, error: string };

/**
 * Run a fixture module's default export inside a worker thread: a true server
 * realm where `typeof window === 'undefined'` natively (Happy DOM globals are
 * registered on the main thread only and do not leak into workers).
 *
 * NOTE: code executed in the worker is invisible to nyc, so keep an in-process
 * test for line coverage and use this only to verify behaviors that depend on
 * a real server realm. The fixture's return value must be structured clone
 * serializable (rich Error objects lose custom properties across the boundary,
 * serialize them manually in the fixture).
 */
export function runOnServer<T>(fixturePath: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const worker = new Worker(path.join(__dirname, 'bootstrap.cjs'), {
      workerData: {
        swcRegister: require.resolve('@swc-node/register'),
        entry: path.join(__dirname, 'entry.ts'),
        fixture: fixturePath
      }
    });

    worker.once('message', (result: WorkerResult<T>) => {
      if (result.ok) {
        resolve(result.value);
      } else {
        reject(new Error(`[server-realm] fixture failed: ${result.error}`));
      }
      void worker.terminate();
    });
    worker.once('error', (error) => {
      reject(error);
      void worker.terminate();
    });
  });
}
