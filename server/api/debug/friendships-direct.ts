import { defineEventHandler } from 'h3';
import { getDb } from '~/server/utils/surreal';

export default defineEventHandler(async (event) => {
  try {
    const db = await getDb();
    
    // Напрямую выполняем запрос без экранирования
    const allFriendships = await db.query(`
      SELECT * FROM friendship
    `);
    
    // Проверяем структуру данных
    const friendshipsSchema = await db.query(`
      SELECT * FROM ::table::friendship
    `);
    
    return {
      allFriendships,
      friendshipsSchema,
      info: {
        timestamp: new Date().toISOString()
      }
    };
  } catch (error: any) {
    return {
      error: error.message,
      stack: error.stack
    };
  }
});