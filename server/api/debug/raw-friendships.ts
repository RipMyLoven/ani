import { defineEventHandler } from 'h3';
import { getDb } from '~/server/utils/surreal';

// Helper function to extract clean ID from SurrealDB records
function extractCleanId(userId: any): string {
  if (typeof userId === 'object' && userId.id) {
    return userId.id;
  }
  
  if (typeof userId === 'string') {
    return userId.includes(':') ? userId.split(':')[1] : userId;
  }
  
  return String(userId);
}

export default defineEventHandler(async (event) => {
  try {
    const db = await getDb();
    
    // Direct raw query to see all friendship records without any filtering
    const rawFriendships = await db.query(`
      SELECT * FROM friendship
    `);
    
    // Try direct record type queries to see how SurrealDB stores references
    const referenceTest = await db.query(`
      SELECT id, type::table(id), type::thing(id), type::string("in"), type::string(out) FROM friendship
    `);
    
    // Extract the userId for gleb for direct comparison
    const userGleb = await db.query(`
      SELECT id, type::string(id) FROM user WHERE username = 'gleb'
    `);
    
    // Try multiple variations of querying with the in field
    const queryTest1 = await db.query(`SELECT * FROM friendship WHERE in = 'user:uc1g280dqteh5qxz0njf'`);
    const queryTest2 = await db.query(`SELECT * FROM friendship WHERE \`in\` = 'user:uc1g280dqteh5qxz0njf'`);
    
    return {
      rawFriendships,
      referenceTest,
      userGleb,
      queryTest1,
      queryTest2
    };
  } catch (error: any) {
    return {
      error: error.message || 'An unknown error occurred'
    };
  }
});