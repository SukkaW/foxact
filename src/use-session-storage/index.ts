import 'client-only';
import { createStorage } from '../create-storage-hook';

export type {
  Serializer, Deserializer,
  UseStorageRawOption as UseSessionStorageRawOption,
  UseStorageParserOption as UseSessionStorageParserOption
} from '../create-storage-hook';

const useSessionStorage = createStorage('sessionStorage');

/** @see https://foxact.skk.moe/use-session-storage */
export { useSessionStorage };
