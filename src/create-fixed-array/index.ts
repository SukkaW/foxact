const arrayMap: Record<number, readonly number[]> = {};

export const createFixedArray = (length: number): readonly number[] => {
  arrayMap[length] ||= arrayMap[length] || Array.from(new Array(length).keys());
  return arrayMap[length];
};
