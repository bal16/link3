import app from '@/server';
import { BASE_URL } from './const';

app.listen(3000, () => {
  console.log(`🦊 Elysia is running at http://${BASE_URL}`);
});

export default app.fetch;
