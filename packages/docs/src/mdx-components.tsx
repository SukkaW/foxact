import { useMDXComponents as getDocsMDXComponents } from 'nextra-theme-docs';
import type { UseMDXComponents } from 'nextra/mdx-components';

// Get the default MDX components
const docsComponents = getDocsMDXComponents();

// Merge components
export const useMDXComponents: UseMDXComponents<typeof docsComponents> = <T,>(components?: T) => ({
  ...docsComponents,
  ...components
});
