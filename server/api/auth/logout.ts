import { defineEventHandler, setCookie, getCookie } from 'h3';
import { getDb } from '~/server/utils/surreal';

export default defineEventHandler(async (event) => {
  const token = getCookie(event, 'token');
  
  if (token) {
    try {
      const tokenParts = Buffer.from(token, 'base64').toString().split(':');
      const username = tokenParts[0];
      const sessionToken = tokenParts[1];
      
      if (username && sessionToken) {
        const db = await getDb();
        await db.query(`
          UPDATE user SET sessionToken = "" WHERE username = $username AND sessionToken = $sessionToken
        `, { username, sessionToken });
      }
    } catch (error) {
      console.error('Error clearing session token:', error);
    }
  }
  
  setCookie(event, 'token', '', {
    httpOnly: true,
    path: '/',
    maxAge: 0,
    sameSite: 'strict'
  });
  
  return { success: true };
});