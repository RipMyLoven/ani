import { defineEventHandler, readBody, getQuery, createError } from 'h3';
import { getDb } from '~/server/utils/surreal';
import { getAuthenticatedUser } from '../auth/utils';
import { parseSurrealResult } from '~/server/utils/surrealTypes';

export default defineEventHandler(async (event) => {
  const method = event.method;

  if (method === 'GET') {
    // Получить чат по id
    const query = getQuery(event);
    const chatId = query.chatId as string | undefined;
    if (chatId) {
      const db = await getDb();
      const chatResult = await db.query(
        `SELECT * FROM chat WHERE id = $chatId AND is_active = true`,
        { chatId: `chat:${chatId.replace(/^chat:/, '')}` }
      );
      const chat = parseSurrealResult(chatResult)[0];
      if (!chat) throw createError({ statusCode: 404, statusMessage: 'Chat not found' });
      return { chat };
    }
    // Получить все чаты пользователя
    return await handleGetChats(event);
  }

  if (method === 'POST') {
    return await handleCreateChat(event);
  }

  throw createError({ statusCode: 405, statusMessage: 'Method not allowed' });
});

async function handleGetChats(event: any) {
  const user = await getAuthenticatedUser(event);
  const db = await getDb();
  const chatsResult = await db.query(
    `SELECT * FROM chat WHERE $userId IN participants AND is_active = true ORDER BY last_message_at DESC`,
    { userId: user.id }
  );
  const chats = parseSurrealResult(chatsResult);
  return { chats };
}

async function handleCreateChat(event: any) {
  const user = await getAuthenticatedUser(event);
  const body = await readBody(event);
  const { participantId, chatType = 'private' } = body;

  if (!participantId) {
    throw createError({ statusCode: 400, statusMessage: 'Participant ID is required' });
  }

  const db = await getDb();
  const cleanParticipantId = participantId.replace(/^user:/, '');
  const fullParticipantId = `user:${cleanParticipantId}`;
  const currentUserId = String(user.id).replace(/^user:/, '');
  const fullCurrentUserId = `user:${currentUserId}`;

  console.log('[CREATE CHAT] Looking for existing chat between:', {
    currentUserId: fullCurrentUserId,
    participantId: fullParticipantId
  });

  // Исправленный запрос для поиска существующего чата
  const existingChatResult = await db.query(
    `SELECT * FROM chat 
     WHERE chat_type = $chatType 
       AND array::len(participants) = 2
       AND is_active = true
       AND (
         (participants[0] = type::thing('user', $currentUserId) AND participants[1] = type::thing('user', $participantUserId)) OR
         (participants[0] = type::thing('user', $participantUserId) AND participants[1] = type::thing('user', $currentUserId))
       )`,
    {
      chatType,
      currentUserId: currentUserId,
      participantUserId: cleanParticipantId
    }
  );

  const existingChats = parseSurrealResult(existingChatResult);
  
  if (existingChats.length > 0) {
    console.log('[CREATE CHAT] Found existing chat:', existingChats[0]);
    return { chat: existingChats[0], existing: true };
  }

  console.log('[CREATE CHAT] Creating new chat');

  // Создаём новый чат с правильным форматом participants
  const sortedParticipantIds = [currentUserId, cleanParticipantId].sort();
  
  const chatResult = await db.query(
    `CREATE chat SET 
      participants = [type::thing('user', $participant1), type::thing('user', $participant2)],
      chat_type = $chatType,
      created_at = time::now(),
      last_message_at = time::now(),
      is_active = true`,
    {
      participant1: sortedParticipantIds[0],
      participant2: sortedParticipantIds[1],
      chatType
    }
  );

  const createdChats = parseSurrealResult(chatResult);
  const chat = createdChats[0];
  
  if (!chat) throw createError({ statusCode: 500, statusMessage: 'Failed to create chat' });
  
  console.log('[CREATE CHAT] Created new chat:', chat);
  return { chat, existing: false };
}