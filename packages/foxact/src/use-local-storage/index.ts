import 'client-only';
import { createStorage } from '../create-storage-hook';

export type {
  Serializer, Deserializer,
  UseStorageRawOption as UseLocalStorageRawOption,
  UseStorageParserOption as UseLocalStorageParserOption
} from '../create-storage-hook';

const { useStorage: useLocalStorage, useSetStorage: useSetLocalStorage } = createStorage('localStorage');

/** @see https://foxact.skk.moe/use-local-storage */
export { useLocalStorage, useSetLocalStorage };
