import Elysia from 'elysia';
import swagger from '@elysiajs/swagger';
import { controller } from '@/controller';

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
        tags: [{ name: 'Links', description: 'Links' }],
      },
      path: '/ui',
      swaggerOptions: {},
      scalarConfig:{
        defaultHttpClient: {
          targetKey: 'js' as 'javascript',
          clientKey: 'axios',
        }
      }
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
  });

export default app;
