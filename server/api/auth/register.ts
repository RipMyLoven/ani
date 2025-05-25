import { defineEventHandler, readBody, createError } from 'h3';
import { getDb } from '~/server/utils/surreal';
import bcrypt from 'bcryptjs';
import type { User } from '~/server/types/auth'; // Изменен импорт
import { checkUserExists, parseSurrealResult, generateSessionToken, createAuthToken } from './utils';

interface ExtendedUser extends User {
  password: string;
  created_at?: string;
}

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { username, email, password } = body;

  if (!username || !email || !password) {
    throw createError({ statusCode: 400, statusMessage: 'Missing fields' });
  }

  const db = await getDb();

  try {
    const { exists, emailExists, usernameExists } = await checkUserExists(db, username, email);
    
    if (exists) {
      if (emailExists) {
        throw createError({ statusCode: 409, statusMessage: 'Email already in use' });
      }
      if (usernameExists) {
        throw createError({ statusCode: 409, statusMessage: 'Username already in use' });
      }
      throw createError({ statusCode: 409, statusMessage: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const sessionToken = generateSessionToken();

    // Create user in database
    const created = await db.query(`
      CREATE user SET 
        username = $username, 
        email = $email, 
        password = $hashedPassword, 
        created_at = time::now(),
        sessionToken = $sessionToken
    `, { username, email, hashedPassword, sessionToken });
    
    let user = null;
    const parsedUsers = parseSurrealResult<ExtendedUser>(created);
    
    if (parsedUsers.length > 0) {
      user = parsedUsers[0];
    }

    if (!user) {
      const userQuery = await db.query(`
        SELECT * FROM user WHERE username = $username
      `, { username });
      
      const foundUsers = parseSurrealResult<ExtendedUser>(userQuery);
      if (foundUsers.length > 0) {
        user = foundUsers[0];
      }
    }

    if (!user) {
      throw createError({ statusCode: 500, statusMessage: 'Failed to create user' });
    }

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
    } else if (error.message?.includes('user_email already contains')) {
      throw createError({ statusCode: 409, statusMessage: 'Email already in use' });
    } else if (error.message?.includes('user_username already contains')) {
      throw createError({ statusCode: 409, statusMessage: 'Username already in use' });
    } else {
      throw createError({ 
        statusCode: 500, 
        statusMessage: 'Registration failed',
        data: { message: error.message }
      });
    }
  }
});