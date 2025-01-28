import { Elysia } from 'elysia';
import { controller } from './controller';

const app = new Elysia();
app.use(controller);
app.onError(({ code, error }) => {
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
