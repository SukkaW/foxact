export default {
  '*': {
    theme: {
      breadcrumb: false
    }
  },
  index: {
    display: 'hidden',
    type: 'page',
    title: 'Home',
    theme: {
      copyPage: false,
      breadcrumb: false,
      footer: true,
      sidebar: false,
      toc: false,
      pagination: false
    }
  },
  '-- docs': {
    title: 'Docs',
    type: 'page',
    href: '/getting-started'
  },
  'change-log': {
    title: 'Change Log',
    href: 'https://github.com/sukkaw/foxact/releases',
    type: 'page'
  },
  '-- separator guide': {
    type: 'separator',
    title: 'Guide'
  },
  'getting-started': 'Getting Started',
  'best-practice': 'Best Practice',
  'where-is': 'Where is ...?',
  '-- separator hooks': {
    type: 'separator',
    title: 'Hooks'
  },
  'use-abortable-effect': {},
  'use-clipboard': {},
  'use-component-will-receive-update': {},
  'use-composition-input': {},
  'use-debounced-state': {},
  'use-debounced-value': {},
  'use-error-boundary': {},
  'use-fast-click': {},
  'use-intersection': {},
  'use-is-client': {},
  'use-is-online': {},
  'use-isomorphic-layout-effect': {},
  'use-local-storage': {},
  'use-media-query': {},
  'use-page-visibility': {},
  'use-retimer': {},
  'use-session-storage': {},
  'use-singleton': {},
  'use-stable-handler-only-when-you-know-what-you-are-doing-or-you-will-be-fired': {
    title: 'useStableHandler'
  },
  'use-typescript-happy-callback': {},
  'use-uncontrolled': {},
  '-- separator components': {
    type: 'separator',
    title: 'Components'
  },
  'compose-context-provider': {},
  'current-year': {},
  '-- separator utilities': {
    type: 'separator',
    title: 'Utilities'
  },
  'context-reducer': {},
  'context-state': {},
  'create-local-storage-state': {},
  'create-session-storage-state': {},
  'create-fixed-array': {},
  'fetch-jsonp': {},
  'invariant-nullthrow': {},
  'magic-portal': {},
  'merge-refs': {},
  noop: {},
  'no-ssr': {},
  rem: {},
  'request-idle-callback': {},
  'typescript-happy-forward-ref': {},
  'is-safari': {}
};
