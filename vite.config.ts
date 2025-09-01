import 'core-js/proposals/promise-with-resolvers';
import {defineConfig} from 'vite';
import {hydrogen} from '@shopify/hydrogen/vite';
import {oxygen} from '@shopify/mini-oxygen/vite';
import {vitePlugin as remix} from '@remix-run/dev';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  resolve: {
    alias: {
      '@mui/styled-engine': '@mui/styled-engine-sc',
    },
  },
  plugins: [
    hydrogen(),
    oxygen({
      debug: process.env.NODE_ENV !== 'production',
    }),
    remix({
      presets: [hydrogen.preset()],
      future: {
        v3_fetcherPersist: true,
        v3_relativeSplatPath: true,
        v3_throwAbortReason: true,
        v3_lazyRouteDiscovery: true,
      },
    }),
    tsconfigPaths(),
  ],
  ssr: {
    noExternal: ['fcecom-frontend-api-client'],
    optimizeDeps: {
      include: [
        'lodash.set',
        'react-is',
        'prop-types',
        'shallowequal',
        'hoist-non-react-statics',
        'react-player',
        'react-object-view/cjs/utils/types.js',
        'typographic-base',
      ],
    },
  },
  optimizeDeps: {
    include: [
      'clsx',
      '@headlessui/react',
      'typographic-base',
      'react-intersection-observer',
      'react-use/esm/useScroll',
      'react-use/esm/useDebounce',
      'react-use/esm/useWindowScroll',
    ],
  },
  build: {
    // Allow a strict Content-Security-Policy
    // withtout inlining assets as base64:
    assetsInlineLimit: 0,
  },
  server: {
    port: 3020,
  },
});
