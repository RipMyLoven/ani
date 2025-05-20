import { defineEventHandler, readBody, createError, setCookie } from 'h3';
import { getDb } from '~/server/utils/surreal';
import bcrypt from 'bcryptjs';
import type { User } from '~/server/stores/auth';
import crypto from 'crypto';

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
    const existingUsersQuery = await db.query(`
      SELECT * FROM user WHERE username = $username OR email = $email
    `, { username, email }) as any[];
    
    console.log('Existing users check result:', JSON.stringify(existingUsersQuery));
    
    let existingUsers = [];
    if (Array.isArray(existingUsersQuery) && existingUsersQuery.length > 0) {
      if (existingUsersQuery[0] && Array.isArray(existingUsersQuery[0].result)) {
        existingUsers = existingUsersQuery[0].result;
      } else {
        existingUsers = existingUsersQuery.flatMap(item => item.result || []);
      }
    }
    
    if (existingUsers.length > 0) {
      const emailExists = existingUsers.some((user: any) => user.email === email);
      const usernameExists = existingUsers.some((user: any) => user.username === username);
      
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

    // Генерация sessionToken
    const sessionToken = crypto.randomUUID();

    const created = await db.query(`
      CREATE user SET 
        username = $username, 
        email = $email, 
        password = $hashedPassword, 
        created_at = time::now(),
        sessionToken = $sessionToken
    `, { username, email, hashedPassword, sessionToken }) as any[];
    
    console.log("Creation response:", JSON.stringify(created));

    let user = null;
    if (Array.isArray(created)) {
      if (created[0]?.result?.[0]) {
        user = created[0].result[0];
      } else if (created[0]?.[0]) {
        user = created[0][0];
      } else {
        const flatCreated = JSON.stringify(created);
        try {
          const parsed = JSON.parse(flatCreated);
          const flattened = Array.isArray(parsed) ? parsed.flat(3) : [parsed];
          user = flattened.find(item => 
            item && typeof item === 'object' && 
            item.username === username
          );
        } catch (err) {
          console.error('Error parsing created user:', err);
        }
      }
    }

    if (!user) {
      const userQuery = await db.query(`
        SELECT * FROM user WHERE username = $username
      `, { username }) as any[];
      
      if (userQuery[0]?.result?.[0]) {
        user = userQuery[0].result[0];
      }
    }

    if (!user) {
      throw createError({ statusCode: 500, statusMessage: 'Failed to create user' });
    }

    // Изменение формирования token
    const token = Buffer.from(`${user.username}:${sessionToken}:${Date.now()}`).toString('base64');
    setCookie(event, 'token', token, { httpOnly: true, path: '/', maxAge: 60 * 60 * 24 * 7 });

    return { ok: true, user: { id: user.id, username: user.username, email: user.email } };
  } catch (error: any) {
    console.error('Registration error:', error);
    
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