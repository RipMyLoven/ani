import { defineEventHandler, createError } from 'h3';
import { getAuthenticatedUser } from './utils';

export default defineEventHandler(async (event) => {
  try {
    const user = await getAuthenticatedUser(event);
    
    return { 
      user: { 
        id: user.id, 
        username: user.username, 
        email: user.email
      } 
    };
  } catch (error: any) {
    throw createError({ 
      statusCode: error.statusCode || 401, 
      statusMessage: error.statusMessage || 'Authentication failed' 
    });
  }
});