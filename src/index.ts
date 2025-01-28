import app from '@/server';

app.listen({ hostname: '127.0.0.1', port: 3000 }, ({ hostname, port }) => {
  console.log(`🐯 Elysia running at http://${hostname}:${port}`);
});

export default app.fetch;
