/* eslint-disable @eslint-react/component-hook-factories -- intentional library factory pattern */
import { createStorage } from '../create-storage-hook';
import type { NotUndefined, StateHookTuple, StorageType, UseStorageParserOption, UseStorageRawOption } from '../create-storage-hook';

export type ValueHook<T> = () => T;
export type SetValueHook<T> = () => React.Dispatch<React.SetStateAction<T>>;
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
    const { useStorage: useStorageOriginal, useStorageValue: useStorageValueOriginal, useSetStorage: useSetStorageOriginal } = createStorage(type);

    const useStorage = () => useStorageOriginal<T>(key, serverValue!, options);
    const useStorageValue = () => useStorageValueOriginal<T>(key, serverValue!, options);
    const useSetStorageValue = () => useSetStorageOriginal<T>(key, options);

    return [useStorage, useStorageValue, useSetStorageValue];
  };

  return createStorageState;
}
