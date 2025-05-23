import { defineEventHandler, getCookie, createError } from 'h3';
import { getDb } from '~/server/utils/surreal';
import { SurrealResult } from '~/server/utils/surrealTypes';

interface UserResult {
  id: string;
  username: string;
  email: string;
  sessionToken?: string;
  password?: string;
}

export default defineEventHandler(async (event) => {
  const token = getCookie(event, 'token');
  if (!token) {
    throw createError({ statusCode: 401, statusMessage: 'Not authenticated' });
  }

  try {
    const tokenParts = Buffer.from(token, 'base64').toString().split(':');
    if (tokenParts.length < 2) {
      throw createError({ statusCode: 401, statusMessage: 'Invalid token format' });
    }
    
    const username = tokenParts[0];
    const sessionToken = tokenParts[1];
    
    if (!username || !sessionToken) {
      throw createError({ statusCode: 401, statusMessage: 'Invalid token data' });
    }
    
    console.log('Auth check - Username from token:', username);
    
    const db = await getDb();
    
    // Query for the specific user - use the SurrealResult type
    const userResult: SurrealResult<UserResult> = await db.query(`
      SELECT * FROM user WHERE username = $username
    `, { username });
    
    // Extract user with more robust parsing
    let user: UserResult | null = null;
    
    if (Array.isArray(userResult) && userResult.length > 0) {
      const firstItem = userResult[0] as any;
      
      if (firstItem && firstItem.result && Array.isArray(firstItem.result) && firstItem.result.length > 0) {
        user = firstItem.result[0];
      } else if (firstItem && Array.isArray(firstItem) && firstItem.length > 0) {
        user = firstItem[0];
      }
    }
    
    if (!user) {
      console.error('User not found for username:', username);
      throw createError({ statusCode: 401, statusMessage: 'User not found or session expired' });
    }
    
    // Only check sessionToken if user has one in the database
    if (user.sessionToken && user.sessionToken !== sessionToken) {
      console.error('Invalid session token for user:', username);
      throw createError({ statusCode: 401, statusMessage: 'Invalid session token' });
    }
    
    return { 
      user: { 
        id: user.id, 
        username: user.username, 
        email: user.email
      } 
    };
  } catch (error: any) {
    console.error('Authentication check error:', error);
    throw createError({ 
      statusCode: error.statusCode || 401, 
      statusMessage: error.statusMessage || 'Authentication failed' 
    });
  }
});