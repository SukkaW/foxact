const arrayMap = new Map<number, readonly number[]>();

let finalizationRegistry: FinalizationRegistry<number> | undefined;
if (typeof FinalizationRegistry === 'function') {
  finalizationRegistry = new FinalizationRegistry((length: number) => {
    arrayMap.delete(length);
  });
}

export const createFixedArray = (length: number): readonly number[] => {
  if (arrayMap.has(length)) {
    return arrayMap.get(length)!;
  }

  const arr = Array.from(new Array(length).keys());
  if (process.env.NODE_ENV === 'development') {
    Object.freeze(arr);
  }

  if (finalizationRegistry) {
    finalizationRegistry.register(arr, length);
  }

  arrayMap.set(length, arr);

  return arr;
};
