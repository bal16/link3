import { Elysia } from 'elysia';
import { swagger } from '@elysiajs/swagger';
import { controller } from '@/controller';
import { BASE_URL } from '../const';

const app = new Elysia()
  .use(
    swagger({
      documentation: {
        info: {
          title: 'Link3 API Spec',
          description:
            'Link3 is a simple link shortener built with Bun, Elysia, Prisma, and PostgreSQL.',
          version: '1.0.0',
        },
        servers: [{ url: BASE_URL }],
        tags: [{ name: 'Links', description: 'Links' }],
        components: {
          securitySchemes: {
            jwt: {
              type: 'http',
              scheme: 'bearer',
              bearerFormat: 'JWT',
            },
          },
        },
      },
      path: '/ui',
      swaggerOptions: {},
      scalarConfig: {
        defaultHttpClient: {
          targetKey: 'js' as 'javascript',
          clientKey: 'axios',
        },
        layout: 'classic',
      },
    }),
  )
  .use(controller)
  .onError(({ code, error }) => {
    const res = {
      errors: true,
      message: 'Unhandled error',
      data: null,
    };
    if (code === 'NOT_FOUND') {
      res.message = error.message;
      return res;
    }
    if (code === 401) {
      res.message = `${error.response}`;
      return res;
    }
  });

export default app;
