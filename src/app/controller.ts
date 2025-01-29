import { linkService } from '@/service';
import Elysia, { NotFoundError, t } from 'elysia';
import {
  CreateLinkRequest,
  CreateLinkResponse,
  GetLinkResponse,
} from '@/model';

export const controller = new Elysia()
  .post(
    '/links/create',
    async ({ body }) => {
      return linkService.create(body);
    },
    {
      body: CreateLinkRequest,
      detail: {
        tags: ['Links'],
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
          301: {
            description: 'Redirected',
          },
          404: {
            description: 'Url Not found',
          },
        },
        description: 'Create a short link',
      },
    },
  )
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
    //  else if (code === 'VALIDATION'){
    //   res.message = error.message;
    //   res.data = error.stack
    //   return res;
    // }
  });
