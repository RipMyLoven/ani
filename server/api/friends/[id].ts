import { defineEventHandler, readBody, createError, getCookie } from 'h3';
import { getDb } from '~/server/utils/surreal';
import { SurrealResult } from '~/server/utils/surrealTypes';

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
    const tokenParts = Buffer.from(token, 'base64').toString().split(':');
    const username = tokenParts[0];
    
    const db = await getDb();
    
    // Find current user
    const userResult = await db.query(`
      SELECT id FROM user WHERE username = $username
    `, { username }) as SurrealResult;
    
    let userId: string | null = null;
    if (Array.isArray(userResult) && userResult.length > 0) {
      const firstItem = userResult[0] as any;
      if (firstItem && firstItem.result && Array.isArray(firstItem.result) && firstItem.result[0]?.id) {
        userId = firstItem.result[0].id;
      } else if (firstItem && Array.isArray(firstItem) && firstItem[0]?.id) {
        userId = firstItem[0].id;
      }
    }
    
    if (!userId) {
      throw createError({ statusCode: 404, statusMessage: 'User not found' });
    }
    
    // Check friendship exists and user is part of it
    const cleanId = friendshipId.toString().replace(/^friendship:/, '');
    const fullId = friendshipId.toString().startsWith('friendship:') 
      ? friendshipId.toString() 
      : `friendship:${cleanId}`;

    // Debug logging to help trace the issue
    console.log('Looking for friendship with IDs:', { cleanId, fullId, friendshipId });
        
    // Упрощенный запрос без использования string::split
    const friendshipResult = await db.query(`
      SELECT * FROM friendship 
      WHERE id = type::thing('friendship', $cleanId)
    `, { cleanId }) as SurrealResult<FriendshipResult>;

    // Debug the query result
    console.log('Friendship query result:', JSON.stringify(friendshipResult));

    // Более надежный парсинг результатов
    let friendship = null;
    if (Array.isArray(friendshipResult) && friendshipResult.length > 0) {
      const firstItem = friendshipResult[0] as any;
      
      if (firstItem && firstItem.result && Array.isArray(firstItem.result) && firstItem.result.length > 0) {
        friendship = firstItem.result[0];
      } else if (Array.isArray(firstItem) && firstItem.length > 0) {
        friendship = firstItem[0];
      }
    }

    console.log('Parsed friendship:', friendship);

    if (!friendship) {
      // Попробуем поиск по другим полям в случае неудачи
      console.log('Trying alternative lookup by recipient/sender');
      
      // Пробуем найти по отношениям
      const altQuery = await db.query(`
        SELECT * FROM friendship 
        WHERE id CONTAINS $cleanId
      `, { cleanId });
      
      console.log('Alternative query result:', JSON.stringify(altQuery));
      
      // Парсим результат альтернативного запроса
      if (Array.isArray(altQuery) && altQuery.length > 0) {
        const firstItem = altQuery[0] as any;
        
        if (firstItem && firstItem.result && Array.isArray(firstItem.result) && firstItem.result.length > 0) {
          friendship = firstItem.result[0];
        } else if (Array.isArray(firstItem) && firstItem.length > 0) {
          friendship = firstItem[0];
        }
        
        console.log('Alternative parsed friendship:', friendship);
      }
      
      if (!friendship) {
        throw createError({ statusCode: 404, statusMessage: 'Friendship not found' });
      }
    }

    // Extract clean user IDs for comparison (remove "user:" prefix if present)
    const userIdClean = typeof userId === 'string' 
      ? userId.replace(/^user:/, '') 
      : (userId && typeof userId === 'object' 
          ? ((userId as any).id?.toString() || (userId as any).toString().replace(/^user:/, '')) 
          : '');

    const inIdClean = typeof friendship.in === 'string'
      ? friendship.in.replace(/^user:/, '')
      : (friendship.in && typeof friendship.in === 'object' 
          ? ((friendship.in as any).id?.toString() || (friendship.in as any).toString()) 
          : '');

    const outIdClean = typeof friendship.out === 'string'
      ? friendship.out.replace(/^user:/, '')
      : (friendship.out && typeof friendship.out === 'object' 
          ? ((friendship.out as any).id?.toString() || (friendship.out as any).toString()) 
          : '');

    console.log('Сравниваем ID пользователей (строки):', { 
      userIdClean, 
      inIdClean, 
      outIdClean,
      userId: typeof userId === 'object' ? JSON.stringify(userId) : userId,
      inId: typeof friendship.in === 'object' ? JSON.stringify(friendship.in) : friendship.in,
      outId: typeof friendship.out === 'object' ? JSON.stringify(friendship.out) : friendship.out
    });

    // Проверка на принадлежность к дружеской связи (более надежная)
    const userIdStr = userId?.toString() || '';
    const inIdStr = friendship.in?.toString() || '';
    const outIdStr = friendship.out?.toString() || '';
    
    const isPartOfFriendship = 
      userIdClean === inIdClean || 
      userIdClean === outIdClean ||
      userIdStr === inIdStr ||
      userIdStr === outIdStr ||
      `user:${userIdClean}` === inIdStr ||
      `user:${userIdClean}` === outIdStr;
    
    if (!isPartOfFriendship) {
      throw createError({ statusCode: 403, statusMessage: 'You are not part of this friendship' });
    }
    
    // PUT - Accept/reject friend request
    if (method === 'PUT') {
      const body = await readBody(event);
      const { status } = body;
      
      if (!status || !['accepted', 'rejected'].includes(status)) {
        throw createError({ statusCode: 400, statusMessage: 'Invalid status' });
      }
      
      // Улучшенная проверка на возможность принятия запроса
      const isRecipient = 
        inIdClean === userIdClean || 
        inIdStr === userIdStr ||
        `user:${userIdClean}` === inIdStr;
      
      console.log('Проверка получателя:', { isRecipient, inIdClean, userIdClean, inIdStr, userIdStr });
      
      if (!isRecipient) {
        throw createError({ 
          statusCode: 403, 
          statusMessage: 'Only the recipient can accept or reject friend requests' 
        });
      }
      
      console.log(`Обновляем запись friendship:${cleanId} со статусом: ${status}`);
      
      try {
        const updateResult = await db.query(`
          UPDATE friendship:${cleanId} SET status = $status
          RETURN AFTER
        `, { status });
        
        console.log('Результат обновления:', JSON.stringify(updateResult));
        return { success: true };
      } catch (err) {
        console.error('Ошибка при обновлении:', err);
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        throw createError({ 
          statusCode: 500, 
          statusMessage: 'Failed to update friendship status', 
          data: { message: errorMessage } 
        });
      }
    }
    
    // DELETE - Remove friendship
    if (method === 'DELETE') {
      console.log(`Удаляем запись friendship:${cleanId}`);
      
      try {
        const deleteResult = await db.query(`
          DELETE friendship:${cleanId}
          RETURN BEFORE
        `);
        
        console.log('Результат удаления:', JSON.stringify(deleteResult));
        return { success: true };
      } catch (err) {
        console.error('Ошибка при удалении:', err);
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
    console.error(`Friend request ${method} error:`, error);
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to ${method === 'PUT' ? 'update' : 'delete'} friendship`,
      data: { message: error.message }
    });
  }
});