import { defineEventHandler, readBody, createError, getCookie } from 'h3';
import { getDb } from '~/server/utils/surreal';
import { getUserIdFromToken, findFriendship, cleanUserId, checkFriendshipPermissions } from './utils';

interface FriendshipResult {
  id: string;
  in: string;
  out: string;
  status: string;
}

export default defineEventHandler(async (event) => {
  const method = event.method;
  const friendshipId = event.context.params?.id;
  
  if (!friendshipId) {
    throw createError({ statusCode: 400, statusMessage: 'Friendship ID is required' });
  }
  
  const token = getCookie(event, 'token');
  if (!token) {
    throw createError({ statusCode: 401, statusMessage: 'Not authenticated' });
  }
  
  try {
    const db = await getDb();
    
    const userId = await getUserIdFromToken(token, db);
    if (!userId) {
      throw createError({ statusCode: 404, statusMessage: 'User not found' });
    }
    
    const cleanId = friendshipId.toString().replace(/^friendship:/, '');
    
    const friendship = await findFriendship(db, cleanId);
    if (!friendship) {
      throw createError({ statusCode: 404, statusMessage: 'Friendship not found' });
    }

    const isPartOfFriendship = checkFriendshipPermissions(userId, friendship);
    if (!isPartOfFriendship) {
      throw createError({ statusCode: 403, statusMessage: 'You are not part of this friendship' });
    }
    
    if (method === 'PUT') {
      const body = await readBody(event);
      const { status } = body;
      
      if (!status || !['accepted', 'rejected'].includes(status)) {
        throw createError({ statusCode: 400, statusMessage: 'Invalid status' });
      }
      
      const userIdClean = cleanUserId(userId);
      const inIdClean = cleanUserId(friendship.in);
      const inIdStr = friendship.in?.toString() || '';
      const userIdStr = userId?.toString() || '';
      
      const isRecipient = 
        inIdClean === userIdClean || 
        inIdStr === userIdStr ||
        `user:${userIdClean}` === inIdStr;
      
      if (!isRecipient) {
        throw createError({ 
          statusCode: 403, 
          statusMessage: 'Only the recipient can accept or reject friend requests' 
        });
      }
      
      try {
        await db.query(`
          UPDATE friendship:${cleanId} SET status = $status
          RETURN AFTER
        `, { status });
        
        return { success: true };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        throw createError({ 
          statusCode: 500, 
          statusMessage: 'Failed to update friendship status', 
          data: { message: errorMessage } 
        });
      }
    }
    
    if (method === 'DELETE') {
      try {
        await db.query(`
          DELETE friendship:${cleanId}
          RETURN BEFORE
        `);
        
        return { success: true };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        throw createError({ 
          statusCode: 500, 
          statusMessage: 'Failed to delete friendship', 
          data: { message: errorMessage } 
        });
      }
    }
    
    throw createError({ statusCode: 405, statusMessage: 'Method not allowed' });
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || `Failed to ${method === 'PUT' ? 'update' : 'delete'} friendship`,
      data: { message: error.message }
    });
  }
});