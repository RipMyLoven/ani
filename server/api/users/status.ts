import { defineEventHandler, getQuery, readBody, getMethod, createError } from 'h3';
import { getDb } from '~/server/utils/surreal';
import { getSession } from '~/server/utils/session';
import { parseSurrealResult } from '~/server/utils/surrealTypes';
import type { User } from '~/server/types/auth';

export default defineEventHandler(async (event) => {
  const method = getMethod(event);

  if (method === 'GET') {
    const query = getQuery(event);
    const userId = query.userId as string;
    if (!userId) throw createError({ statusCode: 400, statusMessage: 'User ID required' });
    const db = await getDb();
    const result = await db.query(
      `SELECT * FROM user_status WHERE user_id = $userId`,
      { userId: `user:${userId.replace(/^user:/, '')}` }
    );
    const rest = parseSurrealResult(result)[0];;
    return { rest };
  }

  if (method === 'POST') {
    const session = await getSession(event);
    if (!session || !session.user) {
      throw createError({ statusCode: 401, statusMessage: 'Auth required' });
    }
    const user = session.user as User;
    const userId = user.id;
    const body = await readBody(event);
    const { status, socketId } = body;
    if (!status) throw createError({ statusCode: 400, statusMessage: 'Status required' });
    const db = await getDb();
    await db.query(
      `UPDATE user_status SET status = $status, last_seen = time::now(), socket_id = $socketId WHERE user_id = $userId`,
      {
        status,
        socketId: socketId || '',
        userId
      }
    );
    return { success: true };
  }

  throw createError({ statusCode: 405, statusMessage: 'Method not allowed' });
});