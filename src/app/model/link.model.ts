import { t } from 'elysia';

export const CreateLinkRequest = t.Object({
  source: t.String({
    minLength: 5,
  }),
  slug: t.Optional(t.String()),
});

export const CreateLinkResponse = t.Object({
  id: t.String(),
  source: t.String(),
  slug: t.String(),
  result: t.String(),
});

export type CreateLinkRequest = typeof CreateLinkRequest.static;
export type CreateLinkResponse = typeof CreateLinkResponse.static;
