import { defineEventHandler, getQuery } from 'h3';
import { getDb } from '~/server/utils/surreal';

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const userId = query.userId as string || '';
  
  try {
    const db = await getDb();
    
    // Direct query for all friendships
    const allFriendships = await db.query(`SELECT * FROM friendship`);
    
    // Query specifically for incoming friendships for this user
    const incomingFriendships = userId ? 
      await db.query(`SELECT * FROM friendship WHERE \`in\` = $userId`, { userId }) : 
      null;
    
    // Query specifically for outgoing friendships for this user
    const outgoingFriendships = userId ? 
      await db.query(`SELECT * FROM friendship WHERE out = $userId`, { userId }) : 
      null;
    
    return {
      allFriendships,
      incomingFriendships,
      outgoingFriendships,
      rawQuery: `SELECT * FROM friendship WHERE \`in\` = '${userId}'`
    };
  } catch (error: any) {
    return {
      error: error.message,
      stack: error.stack
    };
  }
});