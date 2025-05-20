import { defineEventHandler, getCookie, createError } from 'h3';
import { getDb } from '~/server/utils/surreal';

export default defineEventHandler(async (event) => {
  const token = getCookie(event, 'token');
  if (!token) {
    throw createError({ statusCode: 401, statusMessage: 'Not authenticated' });
  }

  try {
    const tokenParts = Buffer.from(token, 'base64').toString().split(':');
    const username = tokenParts[0];
    const sessionToken = tokenParts[1];
    
    if (!username || !sessionToken) {
      throw createError({ statusCode: 401, statusMessage: 'Invalid token' });
    }
    
    const db = await getDb();
    const usersQuery = await db.query(`
      SELECT * FROM user WHERE username = $username AND sessionToken = $sessionToken AND sessionToken != ""
    `, { username, sessionToken }) as any[];
    
    let user = null;
    if (Array.isArray(usersQuery) && usersQuery.length > 0) {
      if (usersQuery[0] && Array.isArray(usersQuery[0].result) && usersQuery[0].result.length > 0) {
        user = usersQuery[0].result[0];
      }
    }
    
    if (!user) {
      throw createError({ statusCode: 401, statusMessage: 'User not found or session expired' });
    }
    
    return { 
      user: { 
        id: user.id, 
        username: user.username, 
        email: user.email
      } 
    };
  } catch (error) {
    console.error('Authentication check error:', error);
    throw createError({ statusCode: 401, statusMessage: 'Authentication failed' });
  }
});