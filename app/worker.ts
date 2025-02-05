import { DurableObjectNamespace } from '@cloudflare/workers-types';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { createStaticHandler, createStaticRouter, StaticRouterProvider } from 'react-router-dom/server';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}
import { LlamaCoordinator } from './lib/core/llamacoordinator';
import { routes } from './routes';

interface Env {
    LLAMA_COORDINATOR: DurableObjectNamespace;
  }
  

export { LlamaCoordinator };

export default {
  async fetch(request: Request, env: Env) {
    const handler = createStaticHandler(routes);
    const context = await handler.query(request, {
      requestContext: {
        env
      }
    });

    if (context instanceof Response) {
      return context;
    }

    const router = createStaticRouter(routes, context);
    const html = renderToString(
      <StaticRouterProvider router={router} context={context} />
    );

    return new Response(
      `<!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width,initial-scale=1">
          <title>LlamaFile Manager</title>
          <script type="module" src="/entry.client.js"></script>
        </head>
        <body>
          <div id="app">${html}</div>
        </body>
      </html>`,
      {
        headers: { 'Content-Type': 'text/html' },
      }
    );
  },
};