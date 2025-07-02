import { getDb } from '@/drizzle/db';
import { auth } from '@/lib/auth/auth';

function toNextJsHandler() {
  const handler = async (request: Request) => {
    const db = await auth(getDb);
    return db.handler(request);
  };
  return {
    GET: handler,
    POST: handler,
  };
}

export const { POST, GET } = toNextJsHandler();
