import { defineEventHandler } from 'h3';
import { getDb } from '~/server/utils/surreal';

export default defineEventHandler(async (event) => {
  try {
    const db = await getDb();
    
    // Query all friendships to see what's happening
    const allFriendships = await db.query(`
      SELECT * FROM friendship
    `);
    
    return {
      allFriendships
    };
  } catch (error: any) {
    return {
      error: error.message,
      stack: error.stack
    };
  }
});