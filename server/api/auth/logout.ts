import { defineEventHandler, setCookie, getCookie } from 'h3';
import { getDb } from '~/server/utils/surreal';
import { parseAuthToken } from './utils';

export default defineEventHandler(async (event) => {
  const token = getCookie(event, 'token');
  
  if (token) {
    try {
      const tokenData = parseAuthToken(token);
      
      if (tokenData) {
        const { username, sessionToken } = tokenData;
        
        if (username && sessionToken) {
          const db = await getDb();
          await db.query(`
            UPDATE user SET sessionToken = "" 
            WHERE username = $username AND sessionToken = $sessionToken
          `, { username, sessionToken });
        }
      }
    } catch (error) {
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