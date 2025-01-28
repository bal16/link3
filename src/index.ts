import { Elysia } from 'elysia';
import app from '@/server';
import node from '@elysiajs/node';
import swagger from '@elysiajs/swagger';
import { BASE_URL } from './const';

new Elysia({ adapter: node() })
  .use(app)
  .use(
    swagger({
      documentation: {
        info: {
          title: 'Link3 API Spec',
          description:
            'Link3 is a simple link shortener built with Bun, Elysia, Prisma, and PostgreSQL.',
          version: '1.0.0',
        },
        tags: [{ name: 'Links', description: 'Links' }],
      },
      path: '/ui',
      scalarConfig: {
        defaultHttpClient: {
          targetKey: 'js' as 'javascript',
          clientKey: 'axios',
        },
      },
    }),
  )
  .listen(3000, ({ port }) => {
    console.log(`🦊 Elysia is running at http://${BASE_URL}:${port}`);
  });
