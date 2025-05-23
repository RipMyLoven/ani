import { defineEventHandler, getQuery } from 'h3';
import { getDb } from '~/server/utils/surreal';

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const userId = query.id as string;
  
  if (!userId) return { error: 'No user ID provided' };
  
  try {
    const db = await getDb();
    
    // Try different query approaches
    const directFetch = await db.query(`SELECT * FROM $userId`, { userId });
    const byIdQuery = await db.query(`SELECT * FROM user WHERE id = $userId`, { userId });
    
    // If ID contains table prefix, try querying with the type::thing function
    let thingQuery = null;
    if (userId.includes(':')) {
      const [table, id] = userId.split(':');
      thingQuery = await db.query(
        `SELECT * FROM user WHERE id = type::thing($table, $id)`, 
        { table, id }
      );
    }
    
    return {
      userId,
      directFetch,
      byIdQuery,
      thingQuery
    };
  } catch (error: any) {
    return { 
      error: error?.message || 'Unknown error occurred',
      stack: error?.stack
    };
  }
});