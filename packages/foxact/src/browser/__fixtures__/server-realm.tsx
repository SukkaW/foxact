import { Writable } from 'node:stream';
import { Suspense, use } from 'react';
import { renderToPipeableStream } from 'react-dom/server';
import { extractErrorMessage } from 'foxts/extract-error-message';
import { browser } from '..';
import type { BrowserReason } from '..';

// Runs inside the server-realm worker (see test/server-realm), where
// `typeof window === 'undefined'` natively, without any global juggling.

export interface SerializedBailoutError {
  message: string,
  hasCause: boolean,
  cause: string | null,
  digest: string | undefined,
  recoverableError: string | undefined,
  stackless: boolean
}

export interface StreamResult {
  html: string,
  shellError: string | null,
  errors: SerializedBailoutError[]
}

export interface ServerRealmFixtureResult {
  typeofWindow: string,
  status: string,
  error: SerializedBailoutError,
  withoutReason: SerializedBailoutError,
  lazyReason: SerializedBailoutError & { initializerCalls: number },
  throwingReason: SerializedBailoutError,
  inSuspense: StreamResult,
  outsideSuspense: StreamResult
}

function describeCause(cause: unknown): string | null {
  if (cause === undefined) return null;
  if (typeof cause === 'string') return cause;
  return extractErrorMessage(cause, false) ?? 'unknown cause';
}

function serializeError(error: unknown): SerializedBailoutError {
  // custom error properties don't survive the structured clone boundary, so
  // serialize what the assertions need by hand
  const e = error as Error & { digest?: string, recoverableError?: string, cause?: unknown };

  return {
    message: extractErrorMessage(e, false) ?? 'Unknown error',
    hasCause: 'cause' in e,
    cause: describeCause(e.cause),
    digest: e.digest,
    recoverableError: e.recoverableError,
    stackless: !(e.stack ?? '').includes('\n    at ')
  };
}

function Editor({ reason }: { reason?: BrowserReason }) {
  use(browser(reason));
  return <span>editor</span>;
}

function renderToStreamString(element: React.ReactNode) {
  return new Promise<StreamResult>((resolve) => {
    const chunks: Buffer[] = [];
    const errors: SerializedBailoutError[] = [];

    const writable = new Writable({
      write(chunk: Buffer, _encoding, callback) {
        chunks.push(chunk);
        callback();
      },
      final(callback) {
        resolve({ html: Buffer.concat(chunks).toString('utf8'), shellError: null, errors });
        callback();
      }
    });

    const { pipe } = renderToPipeableStream(element, {
      onAllReady() {
        pipe(writable);
      },
      onShellError(error) {
        resolve({ html: '', shellError: extractErrorMessage(error) ?? 'Unknown server rendering error', errors });
      },
      onError(error) {
        errors.push(serializeError(error));
        // what a framework does (e.g. Next.js): forward the digest so the browser
        // can tell a deliberate bailout apart from a real server error
        return (error as { digest?: string }).digest;
      }
    });
  });
}

export default async function run(): Promise<ServerRealmFixtureResult> {
  const usable = browser('The editor requires browser APIs.');

  let initializerCalls = 0;
  const lazy = browser(() => {
    initializerCalls++;
    return new Error('lazy reason');
  });

  const throwing = browser(() => {
    throw new Error('initializer exploded');
  });

  const [inSuspense, outsideSuspense] = await Promise.all([
    renderToStreamString(
      <Suspense fallback={<span>loading</span>}>
        <Editor reason="The editor requires browser APIs." />
      </Suspense>
    ),
    renderToStreamString(<Editor reason="The editor requires browser APIs." />)
  ]);

  return {
    typeofWindow: typeof window,
    status: usable.status,
    error: serializeError((usable as { reason?: unknown }).reason),
    withoutReason: serializeError((browser() as { reason?: unknown }).reason),
    lazyReason: { ...serializeError((lazy as { reason?: unknown }).reason), initializerCalls },
    throwingReason: serializeError((throwing as { reason?: unknown }).reason),
    inSuspense,
    outsideSuspense
  };
}
