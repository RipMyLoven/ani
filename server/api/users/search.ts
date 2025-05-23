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
  const term = query.term as string;

  if (!term || term.length < 3) {
    return { users: [] };
  }

  try {
    const db = await getDb();
    
    // Поиск пользователей с именем, содержащим поисковый запрос
    const result = await db.query(`
      SELECT id, username, email FROM user 
      WHERE string::lowercase(username) CONTAINS string::lowercase($term)
      LIMIT 10
    `, { term }) as SurrealResult<UserResult>;
    
    // Добавляем логирование для отладки
    console.log(`Search query for "${term}"`, JSON.stringify(result));
    
    // Инициализируем как пустой массив
    let users: UserResult[] = [];
    
    // Исправленный парсинг результатов SurrealDB
    if (Array.isArray(result) && result.length > 0) {
      const firstItem = result[0] as any;
      
      if (firstItem && firstItem.result && Array.isArray(firstItem.result)) {
        users = firstItem.result;
      } else if (Array.isArray(firstItem)) {
        users = firstItem;
      }
    }
    
    // Логируем количество найденных пользователей
    console.log(`Found ${users.length} users matching "${term}"`);
    
    return { users };
  } catch (error: any) {
    console.error('User search error:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to search users',
      data: { message: error.message }
    });
  }
});