import { defineEventHandler, readBody, createError, setCookie } from 'h3';
import { getDb } from '~/server/utils/surreal';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import type { User } from '~/server/stores/auth';

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
    
    let users: ExtendedUser[] = [];
    
    if (Array.isArray(allUsers) && allUsers.length > 0 && Array.isArray(allUsers[0])) {
      users = allUsers[0] as ExtendedUser[];
    }
    
    const trimmedUsername = username.trim().toLowerCase();
    const user = users.find(u => 
      u && u.username && u.username.toLowerCase() === trimmedUsername
    );
    
    if (!user) {
      throw createError({ statusCode: 401, statusMessage: 'Invalid username or password' });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      console.log(`Invalid password for user: ${user.username}`);
      throw createError({ statusCode: 401, statusMessage: 'Invalid username or password' });
    }

    const sessionToken = crypto.randomUUID();
    
    await db.query(`
      UPDATE $id SET 
        sessionToken = $sessionToken
    `, { 
      id: user.id,
      sessionToken 
    });

    const token = Buffer.from(`${user.username}:${sessionToken}:${Date.now()}`).toString('base64');
    setCookie(event, 'token', token, { 
      httpOnly: true, 
      path: '/', 
      maxAge: 60 * 60 * 24 * 30, 
      sameSite: 'strict'
    });

    return { 
      ok: true, 
      user: { 
        id: user.id, 
        username: user.username, 
        email: user.email,
        sessionToken 
      } 
    };
  } catch (error: any) {
    console.error('Login error:', error);
    
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