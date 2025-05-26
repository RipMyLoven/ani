import { defineEventHandler, createError } from 'h3';
import { getSession } from '~/server/utils/session'; // Use our custom getSession

export default defineEventHandler(async (event) => {
  try {
    const user = await getSession(event);
    
    if (!user) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Not authenticated'
      });
    }

    return { user };
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Authentication check failed'
    });
  }
});