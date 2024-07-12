export namespace Foxact {
  export type PropsWithRef<P> = Readonly<React.PropsWithRef<P>>;
  export type PropsWithoutRef<P> = Readonly<React.PropsWithoutRef<P>>;
  export type PropsWithChildren<P = unknown> = Readonly<React.PropsWithChildren<P>>;
  export type ComponentProps<T extends keyof React.JSX.IntrinsicElements | React.JSXElementConstructor<any>> = Readonly<React.ComponentProps<T>>;
  export type CustomComponentProps<T extends React.ComponentType> = Readonly<React.ComponentProps<T>>;
  export type ComponentPropsWithRef<T extends React.ElementType> = Readonly<React.ComponentPropsWithRef<T>>;
  export type CustomComponentPropsWithRef<T extends React.ComponentType> = Readonly<React.ComponentPropsWithRef<T>>;
  export type ComponentPropsWithoutRef<T extends React.ElementType> = Readonly<React.ComponentPropsWithoutRef<T>>;
  export type CustomComponentPropsWithoutRef<T extends React.ElementType> = Readonly<React.ComponentPropsWithoutRef<T>>;
}
