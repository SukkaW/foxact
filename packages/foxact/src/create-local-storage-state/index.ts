import 'client-only';

import { createStorageStateFactory } from '../create-storage-state-factory';

/**
 * @see https://foxact.skk.moe/create-local-storage-state
 *
 * @example
 * ```ts
 * const [useOpenState, useOpen] = createLocalStorageState(
 *   'open', // storage key
 *   false, // server default value
 *   { raw: false } // options
 * );
 *
 * const [open, setOpen] = useOpenState();
 * const open = useOpen();
 * ```
 */
export const createLocalStorageState = createStorageStateFactory('localStorage');
