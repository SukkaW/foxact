const arrayMap: Record<number, readonly unknown[]> = {};

export const createFixedArray = (length: number): readonly unknown[] => {
  arrayMap[length] ||= arrayMap[length] || Array.from(Array(length).keys());
  return arrayMap[length];
};
