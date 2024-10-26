import { createStorage } from '../create-storage-hook';
import type { NotUndefined, StateHookTuple, StorageType, UseStorageParserOption, UseStorageRawOption } from '../create-storage-hook';

const identity = (x: any) => x;

export type ValueHook<T> = () => T;
export type SetValueHook<T> = () => (value: T) => void;
export type StateHook<T> = () => StateHookTuple<T>;

export function createStorageStateFactory(type: StorageType) {
  function createStorageState<T>(
    key: string,
    serverValue: NotUndefined<T>,
    options?: UseStorageRawOption | UseStorageParserOption<T>
  ): readonly [StateHook<T>, ValueHook<T>, SetValueHook<T | null>];
  function createStorageState<T>(
    key: string,
    serverValue?: undefined,
    options?: UseStorageRawOption | UseStorageParserOption<T>
  ): readonly [StateHook<T | null>, ValueHook<T | null>, SetValueHook<T | null>];
  function createStorageState<T>(
    key: string,
    serverValue?: NotUndefined<T>,
    // eslint-disable-next-line sukka/unicorn/no-object-as-default-parameter -- two different shape of options
    options: UseStorageRawOption | UseStorageParserOption<T> = {
      raw: false,
      serializer: JSON.stringify,
      deserializer: JSON.parse
    }
  ): readonly [StateHook<T>, ValueHook<T>, SetValueHook<T | null>] | readonly [StateHook<T | null>, ValueHook<T | null>, SetValueHook<T | null>] {
    const { useStorage: useStorageOriginal, useSetStorage: useSetStorageOriginal } = createStorage(type);

    const useStorage = () => useStorageOriginal<T>(key, serverValue as any, options);
    const useStorageState = () => useStorageOriginal<T>(key, serverValue as any, options)[0];

    const useSetStorageValue = () => useSetStorageOriginal(key, options.raw ? identity : options.serializer);

    return [useStorage, useStorageState, useSetStorageValue];
  };

  return createStorageState;
}
