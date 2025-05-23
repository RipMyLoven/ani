import { defineEventHandler, getQuery, createError } from 'h3';
import { getDb } from '~/server/utils/surreal';
import { SurrealResult } from '~/server/utils/surrealTypes';

interface UserResult {
  id: string;
  username: string;
  email: string;
}

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const username = query.username as string;

  if (!username) {
    return { user: null };
  }

  try {
    const db = await getDb();
    
    // Find exact username match (case insensitive)
    const result = await db.query(`
      SELECT id, username, email FROM user 
      WHERE string::lowercase(username) = string::lowercase($username)
      LIMIT 1
    `, { username }) as SurrealResult<UserResult>;
    
    let user = null;
    
    // Parse SurrealDB result structure
    if (Array.isArray(result) && result.length > 0) {
      const firstItem = result[0] as any;
      
      if (firstItem && firstItem.result && Array.isArray(firstItem.result) && firstItem.result.length > 0) {
        user = firstItem.result[0];
      } else if (Array.isArray(firstItem) && firstItem.length > 0) {
        user = firstItem[0];
      }
    }
    
    return { user };
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to find user',
      data: { message: error.message }
    });
  }
});