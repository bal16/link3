import { linkService } from '@/service';
import { Elysia, NotFoundError, t } from 'elysia';
import {
  CreateLinkRequest,
  CreateLinkResponse,
  GetLinkResponse,
} from '@/model';
import { jwt } from '@elysiajs/jwt';

export const controller = new Elysia()
  .use(
    jwt({
      name: 'jwt',
      secret: process.env.JWT_SECRET!,
      exp: '1 year',
      schema: t.Object({
        apiKey: t.String(),
      }),
    }),
  )
  .post(
    '/links',
    async ({ jwt, error, body, headers }) => {
      const key = headers.authorization!.split(' ')[1];
      const verified = await jwt.verify(key);
      if (!verified) {
        return error(401, {
          errors: true,
          message: 'Unauthorized',
        });
      }
      return await linkService.create(body);
    },
    {
      body: CreateLinkRequest,
      headers: t.Object({
        authorization: t.String({
          pattern: 'Bearer <JWT>',
        }),
      }),
      detail: {
        tags: ['Links'],
        security: [{ jwt: [] }],
        responses: {
          200: {
            description: 'Link created',
            content: {
              'application/json': {
                schema: t.Object({
                  message: t.String(),
                  errors: t.Boolean(),
                  data: CreateLinkResponse,
                }),
              },
            },
          },
          400: {
            description: 'Bad request',
            content: {
              'application/json': {
                schema: t.Object({
                  message: t.String(),
                  errors: t.Boolean(),
                }),
              },
            },
          },
          401: {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: t.Object({
                  message: t.String(),
                  errors: t.Boolean(),
                }),
              },
            },
          },
        },
        description: 'Create a short link',
      },
    },
  )
  .get(
    '/',
    ({ redirect }) => {
      return redirect('/ui');
    },
    {
      detail: {
        hide: true,
      },
    },
  )
  .get(
    '/links',
    async ({ query }) => {
      const { page, perpage, search } = query;
      return linkService.list(page, perpage, search);
    },
    {
      query: t.Object({
        page: t.Optional(t.Number()),
        perpage: t.Optional(t.Number()),
        search: t.Optional(t.String()),
      }),
      detail: {
        tags: ['Links'],
        responses: {
          200: {
            description: 'List of Links',
            content: {
              'application/json': {
                schema: t.Object({
                  message: t.String(),
                  errors: t.Boolean(),
                  data: GetLinkResponse,
                }),
              },
            },
          },
        },
      },
    },
  )
  .delete(
    '/links/:id',
    async ({ params }) => {
      return linkService.destroy(params.id);
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      detail: {
        tags: ['Links'],
        responses: {
          200: {
            description: 'Link deleted',
            content: {
              'application/json': {
                schema: t.Object({
                  message: t.String(),
                  errors: t.Boolean(),
                }),
              },
            },
          },
          404: {
            description: 'Link not found',
            content: {
              'application/json': {
                schema: t.Object({
                  message: t.String(),
                  errors: t.Boolean(),
                }),
              },
            },
          },
        },
      },
    },
  )
  .get(
    '/:slug',
    async ({ params, redirect }) => {
      const url = await linkService.getURL(params.slug);

      if (!url) {
        throw new NotFoundError('link not found');
      }
      return redirect(url);
    },
    {
      params: t.Object({
        slug: t.String(),
      }),
      detail: {
        tags: ['Links'],
        responses: {
          302: {
            description: 'Redirected',
            headers: {
              location: t.String(),
            },
          },
          404: {
            description: 'Url Not found',
            content: {
              'application/json': {
                schema: t.Object({
                  message: t.String(),
                  errors: t.Boolean(),
                }),
              },
            },
          },
        },
        description: 'Redirect to source link',
      },
    },
  )
  .onError(({ code, error }) => {
    const res = {
      errors: true,
      message: 'Unhandled error',
      data: {},
    };
    if (code === 'NOT_FOUND') {
      res.message = error.message;
      return res;
    }
    if (code === 401) {
      res.message = String(error.response);
      return res;
    }
    if (code === 'VALIDATION') {
      res.message = error.name;
      res.data = error.all;
      return res;
    }
  });
