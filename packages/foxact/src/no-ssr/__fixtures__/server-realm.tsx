import { Writable } from 'node:stream';
import { Suspense } from 'react';
import { renderToPipeableStream } from 'react-dom/server';
import { noSSR } from '..';

// Runs inside the server-realm worker (see test/server-realm), where
// `typeof window === 'undefined'` natively, without any global juggling.

function Chat() {
  noSSR();
  return <span>chat</span>;
}

function renderToStreamString(element: React.ReactNode) {
  return new Promise<string>((resolve, reject) => {
    const chunks: Buffer[] = [];
    const writable = new Writable({
      write(chunk: Buffer, _encoding, callback) {
        chunks.push(chunk);
        callback();
      },
      final(callback) {
        resolve(Buffer.concat(chunks).toString('utf8'));
        callback();
      }
    });

    const { pipe } = renderToPipeableStream(element, {
      onAllReady() {
        pipe(writable);
      },
      onShellError(error) {
        reject(error instanceof Error ? error : new Error(String(error)));
      },
      onError() {
        // the error thrown by noSSR() is expected during server rendering
      }
    });
  });
}

export default async function run() {
  // custom error properties don't survive the structured clone boundary,
  // so serialize what the assertions need by hand
  let thrown: Record<string, unknown> | null = null;
  try {
    noSSR('extra message');
  } catch (error) {
    const e = error as Error & { digest?: string, recoverableError?: string };
    thrown = {
      isError: e instanceof Error,
      message: e.message,
      digest: e.digest,
      recoverableError: e.recoverableError
    };
  }

  const html = await renderToStreamString(
    <Suspense fallback={<span>loading</span>}>
      <Chat />
    </Suspense>
  );

  return { typeofWindow: typeof window, thrown, html };
}
