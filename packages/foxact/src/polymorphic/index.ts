import { isValidElement, cloneElement, createElement } from 'react';

/** @see https://foxact.skk.moe/polymorphic */
export type PolymorphicComponentProps<
  PropName extends string,
  Component extends React.ElementType,
  OwnProps extends Record<string, any> = object
> =
  & OwnProps
  // eslint-disable-next-line @typescript-eslint/no-restricted-types -- ReactElement is intentional for the cloneElement path
  & { [K in PropName]?: Component | React.ReactElement }
  & Omit<React.ComponentPropsWithRef<Component>, keyof OwnProps | PropName>;

/** @see https://foxact.skk.moe/polymorphic */
export type PolymorphicRef<Component extends React.ElementType> =
  React.ComponentPropsWithRef<Component>['ref'];

interface RenderPolymorphicOptions {
  props: Record<string, any>,
  defaultComponent: React.ElementType,
  ref?: React.Ref<any>
}

/** @see https://foxact.skk.moe/polymorphic */
export function createPolymorphic<PropName extends string>(propName: PropName) {
  function renderPolymorphic(options: RenderPolymorphicOptions): React.ReactNode {
    const {
      props,
      defaultComponent,
      ref
    } = options;

    const {
      // eslint-disable-next-line sukka/unicorn/no-unreadable-object-destructuring -- prop name is user-controlled
      [propName]: componentProp,
      ...restProps
    } = props;

    if (ref != null) {
      (restProps as Record<string, any>).ref = ref;
    }

    if (isValidElement(componentProp)) {
      // eslint-disable-next-line @eslint-react/no-clone-element -- intentional for polymorphic composition
      return cloneElement(componentProp, restProps);
    }

    return createElement(
      (componentProp ?? defaultComponent) as React.ElementType,
      restProps
    );
  }

  return { propName, renderPolymorphic } as const;
}
