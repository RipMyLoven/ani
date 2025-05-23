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
    
    // Находим точное совпадение пользователя (нечувствительно к регистру)
    const result = await db.query(`
      SELECT id, username, email FROM user 
      WHERE string::lowercase(username) = string::lowercase($username)
      LIMIT 1
    `, { username }) as SurrealResult<UserResult>;
    
    let user = null;
    
    // Добавляем логирование для отладки
    console.log(`Exact match query for "${username}"`, JSON.stringify(result));
    
    // Исправленный парсинг результатов SurrealDB
    if (Array.isArray(result) && result.length > 0) {
      const firstItem = result[0] as any;
      
      if (firstItem && firstItem.result && Array.isArray(firstItem.result) && firstItem.result.length > 0) {
        user = firstItem.result[0];
      } else if (Array.isArray(firstItem) && firstItem.length > 0) {
        user = firstItem[0];
      }
    }
    
    // Добавляем логирование найденного пользователя
    console.log(`User found for "${username}":`, user ? "yes" : "no");
    
    return { user };
  } catch (error: any) {
    console.error('User exact match search error:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to find user',
      data: { message: error.message }
    });
  }
});