export interface Noop {
  (...args: any[]): any
}

export const noop: Noop = () => { /* noop */ };
