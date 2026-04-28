import 'client-only';

import { createStorageStateFactory } from '../create-storage-state-factory';

/**
 * @see https://foxact.skk.moe/create-session-storage-state
 *
 * @example
 * ```ts
 * ```ts
 * const [useOpenState, useOpen, useSetOpen] = createSessionStorageState(
 *   'open', // storage key
 *   false, // server default value
 *   { raw: false } // options
 * );
 *
 * const [open, setOpen] = useOpenState();
 * const open = useOpen();
 * const setOpen = useSetOpen();
 * ```
 */
export const createSessionStorageState = createStorageStateFactory('sessionStorage');
