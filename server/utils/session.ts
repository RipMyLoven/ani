import { H3Event, createError, getCookie } from 'h3';
import { parseAuthToken } from '../api/auth/utils';
import { getDb } from './surreal';

export async function getSession(event: H3Event) {
  const token = getCookie(event, 'token');
  
  if (!token) {
    return null;
  }
  
  try {
    const tokenData = parseAuthToken(token);
    if (!tokenData) {
      return null;
    }
    
    const db = await getDb();
    const userResult = await db.query(`
      SELECT id, username, email FROM user 
      WHERE username = $username AND sessionToken = $sessionToken
    `, { 
      username: tokenData.username, 
      sessionToken: tokenData.sessionToken 
    });
    
    const user = userResult[0]?.result?.[0];
    return user || null;
  } catch (error) {
    return null;
  }
}

export async function requireAuthentication(event: H3Event) {
  const session = await getSession(event);
  
  if (!session) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Authentication required'
    });
  }
  
  return session;
}