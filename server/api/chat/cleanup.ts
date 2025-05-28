import { defineEventHandler, createError } from 'h3';
import { getDb } from '~/server/utils/surreal';
import { parseSurrealResult } from '~/server/utils/surrealTypes';
import type { Chat } from '~/types/chat';

export default defineEventHandler(async (event) => {
  if (event.method !== 'POST') {
    throw createError({ statusCode: 405, statusMessage: 'Method not allowed' });
  }

  try {
    const db = await getDb();
    
    // Найти все дублирующиеся чаты
    const allChatsResult = await db.query(`
      SELECT * FROM chat 
      WHERE chat_type = 'private' AND is_active = true
      ORDER BY created_at ASC
    `);
    
    const allChats = parseSurrealResult(allChatsResult) as Chat[];
    const seenParticipants = new Map<string, string>();
    const duplicateChats: string[] = [];
    
    for (const chat of allChats) {
      // Создаем ключ из отсортированных участников
      const sortedParticipants = [...chat.participants].sort().join(',');
      
      if (seenParticipants.has(sortedParticipants)) {
        // Это дубликат, помечаем на удаление
        duplicateChats.push(chat.id.toString().replace(/^chat:/, ''));
        console.log('[CLEANUP] Duplicate chat found:', {
          chatId: chat.id,
          participants: chat.participants,
          sortedKey: sortedParticipants
        });
      } else {
        // Первый чат с такими участниками
        seenParticipants.set(sortedParticipants, chat.id);
        console.log('[CLEANUP] Keeping chat:', {
          chatId: chat.id,
          participants: chat.participants,
          sortedKey: sortedParticipants
        });
      }
    }
    
    console.log('[CLEANUP] Found duplicate chats:', duplicateChats);
    
    // Удаляем дублирующиеся чаты
    for (const chatId of duplicateChats) {
      await db.query(`UPDATE chat:${chatId} SET is_active = false`);
      console.log('[CLEANUP] Deactivated chat:', chatId);
    }
    
    return { 
      success: true, 
      cleanedChats: duplicateChats.length,
      duplicateIds: duplicateChats,
      message: `Deactivated ${duplicateChats.length} duplicate chats`
    };
    
  } catch (error: any) {
    console.error('[CLEANUP] Error:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to cleanup chats'
    });
  }
});