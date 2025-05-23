import { getCookie, setCookie, H3Event, createError } from 'h3';
import { getDb } from '~/server/utils/surreal';
import { SurrealResult } from '~/server/utils/surrealTypes';
import crypto from 'crypto';

interface UserResult {
  id: string;
  username: string;
  email: string;
  sessionToken?: string;
  password?: string;
}

export function parseSurrealResult<T>(result: any): T[] {
  let parsed: T[] = [];
  
  if (Array.isArray(result) && result.length > 0) {
    const firstItem = result[0];
    
    if (firstItem && firstItem.result && Array.isArray(firstItem.result)) {
      parsed = firstItem.result || [];
    } else if (Array.isArray(firstItem)) {
      parsed = firstItem;
    } else {
      try {
        const flatData = JSON.stringify(result);
        const parsedData = JSON.parse(flatData);
        parsed = Array.isArray(parsedData) ? parsedData.flat(3).filter(Boolean) : [parsedData];
      } catch (err) {
      }
    }
  }
  
  return parsed;
}

export function createAuthToken(event: H3Event, user: UserResult, sessionToken: string): string {
  const token = Buffer.from(`${user.username}:${sessionToken}:${Date.now()}`).toString('base64');
  
  setCookie(event, 'token', token, { 
    httpOnly: true, 
    path: '/', 
    maxAge: 60 * 60 * 24 * 30, 
    sameSite: 'strict'
  });
  
  return token;
}

export function generateSessionToken(): string {
  return crypto.randomUUID();
}

export function parseAuthToken(token: string): { username: string, sessionToken: string, timestamp: number } | null {
  try {
    const tokenParts = Buffer.from(token, 'base64').toString().split(':');
    if (tokenParts.length < 3) return null;
    
    return {
      username: tokenParts[0],
      sessionToken: tokenParts[1],
      timestamp: parseInt(tokenParts[2]) || 0
    };
  } catch (error) {
    return null;
  }
}

export async function getUserByUsername(db: any, username: string): Promise<UserResult | null> {
  const userResult = await db.query(`
    SELECT * FROM user WHERE username = $username
  `, { username }) as SurrealResult<UserResult>;
  
  const users = parseSurrealResult<UserResult>(userResult);
  return users.length > 0 ? users[0] : null;
}

export async function checkUserExists(db: any, username: string, email: string): Promise<{exists: boolean, emailExists: boolean, usernameExists: boolean}> {
  const existingUsersQuery = await db.query(`
    SELECT * FROM user WHERE username = $username OR email = $email
  `, { username, email });
  
  const existingUsers = parseSurrealResult<UserResult>(existingUsersQuery);
  
  const emailExists = existingUsers.some(user => user.email === email);
  const usernameExists = existingUsers.some(user => user.username === username);
  
  return {
    exists: existingUsers.length > 0,
    emailExists,
    usernameExists
  };
}

export async function getAuthenticatedUser(event: H3Event): Promise<UserResult> {
  const token = getCookie(event, 'token');
  if (!token) {
    throw createError({ statusCode: 401, statusMessage: 'Not authenticated' });
  }

  const tokenData = parseAuthToken(token);
  if (!tokenData || !tokenData.username || !tokenData.sessionToken) {
    throw createError({ statusCode: 401, statusMessage: 'Invalid token format' });
  }
  
  const db = await getDb();
  const user = await getUserByUsername(db, tokenData.username);
  
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'User not found or session expired' });
  }
  
  if (user.sessionToken && user.sessionToken !== tokenData.sessionToken) {
    throw createError({ statusCode: 401, statusMessage: 'Invalid session token' });
  }
  
  return user;
}