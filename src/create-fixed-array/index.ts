const arrayMap = new Map<number, readonly number[]>();

const makeArray = (length: number) => {
  const arr = Array.from(new Array(length).keys());
  if (process.env.NODE_ENV === 'development') {
    Object.freeze(arr);
  }

  return arr;
};

export const createFixedArrayWithoutGC = (length: number): readonly number[] => {
  if (arrayMap.has(length)) {
    return arrayMap.get(length)!;
  }
  const arr = makeArray(length);
  arrayMap.set(length, arr);
  return arr;
};

const arrayWeakRefMap = new Map<number, WeakRef<readonly number[]>>();

export const createFixedArrayWithGC = (length: number): readonly number[] => {
  let ref: WeakRef<readonly number[]> | undefined;
  let array: readonly number[] | undefined;
  if (arrayWeakRefMap.has(length)) {
    ref = arrayWeakRefMap.get(length)!;
    array = ref.deref();
  }

  if (!array) {
    array = makeArray(length);

    // every time a new array is created, we create a new WeakRef and update map
    ref = new WeakRef(array);
    arrayWeakRefMap.set(length, ref);
  }

  return array;
};

export const createFixedArray = typeof WeakRef === 'function' ? createFixedArrayWithGC : createFixedArrayWithoutGC;
