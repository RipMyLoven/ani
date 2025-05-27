import { defineEventHandler, createError, getQuery, getMethod, readBody } from 'h3';
import { getDb } from '~/server/utils/surreal';
import { getSession } from '~/server/utils/session';
import { parseSurrealResult } from '~/server/utils/surrealTypes';
import type { User } from '~/server/types/auth'; // Импортируйте ваш тип User

export default defineEventHandler(async (event) => {
  const method = getMethod(event);
  
  if (method === 'GET') {
    // Получение сообщений
    const query = getQuery(event);
    const chatId = query.chatId as string;
    
    if (!chatId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Chat ID is required'
      });
    }
    
    try {
      const db = await getDb();
      const messagesResult = await db.query(`
        SELECT 
          id,
          chat_id,
          sender_id,
          content,
          message_type,
          created_at,
          is_read,
          is_edited,
          (SELECT username FROM user WHERE id = $parent.sender_id)[0].username AS sender_username
        FROM message 
        WHERE chat_id = $chatId 
        ORDER BY created_at ASC
      `, { chatId: `chat:${chatId}` });
      
      const messages = parseSurrealResult(messagesResult);
      
      return {
        messages: messages || [],
        hasMore: false
      };
    } catch (error) {
      console.error('[MESSAGES API] Error fetching messages:', error);
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to fetch messages'
      });
    }
  }
  
  if (method === 'POST') {
    // Отправка сообщения
    const session = await getSession(event);
    if (!session || !session.user) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Authentication required'
      });
    }
    const user = session.user as User;
    const userId = typeof user.id === 'string' ? user.id : (user.id as any).id;
    
    const body = await readBody(event);
    const { chatId, content, messageType = 'text' } = body;
    
    if (!chatId || !content?.trim()) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Chat ID and content are required'
      });
    }
    
    try {
      const db = await getDb();
      
      console.log('[CREATE MESSAGE]', {
        chatId,
        senderId: userId,
        content,
        messageType
      });
      
      const messageResult = await db.query(
        `CREATE message SET 
          chat_id = $chatId,
          sender_id = $senderId,
          content = $content,
          message_type = $messageType,
          created_at = time::now(),
          is_read = false,
          is_edited = false`,
        {
          chatId: `chat:${chatId.replace(/^chat:/, '')}`,
          senderId: `user:${userId.replace(/^user:/, '')}`,
          content: content.trim(),
          messageType
        }
      );
      const message = parseSurrealResult(messageResult)[0];
      if (!message) throw createError({ statusCode: 500, statusMessage: 'Failed to create message' });
      
      console.log('[MESSAGES API] Created message:', message);
      
      // Обновляем last_message_at в чате
      await db.query(
        `UPDATE chat:${chatId} SET last_message_at = time::now()`
      );
      
      return { 
        success: true, 
        message 
      };
      
    } catch (error) {
      console.error('[MESSAGES API] Error creating message:', error);
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to create message'
      });
    }
  }
  
  throw createError({
    statusCode: 405,
    statusMessage: 'Method not allowed'
  });
});