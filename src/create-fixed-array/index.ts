const arrayMap: Record<number, readonly number[]> = {};

export const createFixedArray = (length: number): readonly number[] => {
  arrayMap[length] ||= arrayMap[length] || Array.from(Array(length).keys());
  return arrayMap[length];
};
