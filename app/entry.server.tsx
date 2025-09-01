import type {AppLoadContext, EntryContext} from '@shopify/remix-oxygen';
import {RemixServer} from '@remix-run/react';
import {renderToReadableStream} from 'react-dom/server';
import isbot from 'isbot';
import {createContentSecurityPolicy} from '@shopify/hydrogen';
import packageJson from 'fcecom-frontend-api-client/package.json';

const sweetAlertVersion = packageJson.dependencies['sweetalert2'] || 'latest';

export default async function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext,
  context: AppLoadContext,
) {
  // @ts-ignore
  const devMode = context.env.NODE_ENV !== 'production';

  const {nonce, header, NonceProvider} = createContentSecurityPolicy({
    shop: {
      checkoutDomain: context.env.PUBLIC_CHECKOUT_DOMAIN,
      storeDomain: context.env.PUBLIC_STORE_DOMAIN,
    },
    scriptSrc: [
      'self',
      'unsafe-inline',
      'https://cdn.shopify.com',
      'https://shopify.com',
      'https://www.google-analytics.com',
      'https://www.googletagmanager.com',
      'https://your-firstspirit-server-instance',
      'https://www.youtube.com',
      'https://www.youtube-nocookie.com',
      ...(devMode
        ? [
            'http://localhost:*',
            'https://your-domain.com:*',
          ]
        : []),
    ],
    connectSrc: [
      'self',
      'https://monorail-edge.shopifysvc.com',
      'http://localhost:*',
      'ws://localhost:*',
      'ws://127.0.0.1:*',
      'ws://*.tryhydrogen.dev:*',
      'https://your-firstspirit-server-domain',
      'https://your-firstspirit-media-server-domain',
      'https://www.youtube.com',
      'https://www.youtube-nocookie.com',
      ...(devMode
        ? [
            'http://localhost:*',
            'https://your-domain.com:*',
          ]
        : []),
    ],
    frameSrc: [
      'self',
      'https://www.youtube.com',
      'https://www.youtube-nocookie.com',
    ],
    imgSrc: [
      'self',
      'unsafe-inline',
      'data:',
      'https://cdn.shopify.com',
      'https://shopify.com',
      'https://your-firstspirit-media-server-domain',
      'https://your-firstspirit-server-domain',
      'https://www.youtube.com',
      'https://your-domain.com:*',
      ...(devMode
        ? [
            'http://localhost:*',
            'https://your-domain.com:*',
          ]
        : []),
    ],
    frameAncestors: [
      'your-firstspirit-server-domain',
      'your-domain.com',
    ],
    fontSrc: ['self'],
    styleSrc: [
      "'self'",
      "'unsafe-inline'",
      'https://cdn.shopify.com',
      'https://your-firstspirit-server-domain',
      `https://cdn.jsdelivr.net/npm/sweetalert2@${encodeURIComponent(sweetAlertVersion)}/dist/sweetalert2.min.css`,
      ...(devMode
        ? [
            'http://localhost:*',
            'https://your-domain.com:*',
          ]
        : []),
    ],
  });

  const body = await renderToReadableStream(
    <NonceProvider>
      <RemixServer context={remixContext} url={request.url} />
    </NonceProvider>,
    {
      nonce,
      signal: request.signal,
      onError(error) {
        // eslint-disable-next-line no-console
        console.error(error);
        responseStatusCode = 500;
      },
    },
  );

  if (isbot(request.headers.get('user-agent'))) {
    await body.allReady;
  }

  responseHeaders.set('Content-Type', 'text/html; charset=utf-8');
  responseHeaders.set('Content-Security-Policy', header);
  return new Response(body, {
    headers: responseHeaders,
    status: responseStatusCode,
  });
}
