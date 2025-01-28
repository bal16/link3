import app from '@/server';

app.listen(3000);

console.log(
  `🔗🌳 Link3 API is running at http://${app.server?.hostname}:${app.server?.port}`,
);
