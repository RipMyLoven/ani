import { defineEventHandler, readBody, createError } from 'h3';
import { getDb } from '~/server/utils/surreal';
import bcrypt from 'bcryptjs';
import type { User } from '~/server/types/auth'; // Изменен импорт
import { parseSurrealResult, generateSessionToken, createAuthToken } from './utils';

interface ExtendedUser extends User {
  password: string;
}

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { username, password } = body;

  if (!username || !password) {
    throw createError({ statusCode: 400, statusMessage: 'Missing fields' });
  }

  const db = await getDb();

  try {
    const allUsers = await db.query(`SELECT * FROM user`);
    const users = parseSurrealResult<ExtendedUser>(allUsers);
    
    const trimmedUsername = username.trim().toLowerCase();
    const user = users.find(u => 
      u && u.username && u.username.toLowerCase() === trimmedUsername
    );
    
    if (!user) {
      throw createError({ statusCode: 401, statusMessage: 'Invalid username or password' });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      throw createError({ statusCode: 401, statusMessage: 'Invalid username or password' });
    }

    const sessionToken = generateSessionToken();
    
    await db.query(`
      UPDATE $id SET sessionToken = $sessionToken
    `, { 
      id: user.id,
      sessionToken 
    });

    createAuthToken(event, user, sessionToken);

    return { 
      ok: true, 
      user: { 
        id: user.id, 
        username: user.username, 
        email: user.email
      } 
    };
  } catch (error: any) {
    if (error.statusCode) {
      throw error;
    } else {
      throw createError({ 
        statusCode: 500, 
        statusMessage: 'Login failed',
        data: { message: error.message }
      });
    }
  }
});