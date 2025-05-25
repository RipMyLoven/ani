import { defineEventHandler, readBody, createError } from 'h3';
import { getDb } from '~/server/utils/surreal';
import { getAuthenticatedUser } from '../auth/utils';
import type { Chat, CreateChatRequest, CreateChatResponse } from '~/types/chat';

export default defineEventHandler(async (event) => {
  const method = event.method;

  if (method === 'GET') {
    return await handleGetChats(event);
  }
  
  if (method === 'POST') {
    return await handleCreateChat(event);
  }
  
  throw createError({ statusCode: 405, statusMessage: 'Method not allowed' });
});

async function handleGetChats(event: any) {
  try {
    const user = await getAuthenticatedUser(event);
    const db = await getDb();

    const chatsResult = await db.query(`
      SELECT 
        id,
        participants,
        chat_type,
        created_at,
        last_message_at,
        (SELECT content, created_at, sender_id FROM message WHERE chat_id = $parent.id ORDER BY created_at DESC LIMIT 1)[0] AS last_message
      FROM chat 
      WHERE $userId IN participants AND is_active = true
      ORDER BY last_message_at DESC
    `, { userId: user.id });

    const chats = chatsResult[0]?.result || [];
    
    const chatsWithParticipants = await Promise.all(
      chats.map(async (chat: any) => {
        const otherParticipants = chat.participants.filter((p: string) => p !== user.id);
        
        if (otherParticipants.length > 0) {
          const participantsResult = await db.query(`
            SELECT id, username FROM user WHERE id IN $participants
          `, { participants: otherParticipants });
          
          const participants = participantsResult[0]?.result || [];
          
          return {
            ...chat,
            other_participants: participants
          };
        }
        
        return chat;
      })
    );

    return { chats: chatsWithParticipants };
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Failed to get chats',
      data: { message: error.message }
    });
  }
}

async function handleCreateChat(event: any) {
  try {
    const user = await getAuthenticatedUser(event);
    const body = await readBody(event);
    const { participantId, chatType = 'private' } = body;

    console.log('[CHAT DEBUG] Creating chat request:', { participantId, chatType, currentUser: user.id });

    if (!participantId) {
      throw createError({ statusCode: 400, statusMessage: 'Participant ID is required' });
    }

    const db = await getDb();
    
    // Clean participant ID
    const cleanParticipantId = participantId.replace(/^user:/, '');
    const fullParticipantId = `user:${cleanParticipantId}`;
    
    console.log('[CHAT DEBUG] Participant processing:', { 
      original: participantId, 
      clean: cleanParticipantId,
      full: fullParticipantId
    });

    // Get all users to debug the data structure
    const allUsersResult = await db.query('SELECT id, username, email FROM user');
    console.log('[CHAT DEBUG] All users raw result:', JSON.stringify(allUsersResult, null, 2));
    
    // Extract users from the correct structure
    let allUsers = [];
    if (Array.isArray(allUsersResult) && allUsersResult.length > 0) {
      allUsers = allUsersResult[0] || [];
    }
    
    console.log('[CHAT DEBUG] Extracted all users:', allUsers);
    
    if (allUsers.length === 0) {
      throw createError({ 
        statusCode: 500, 
        statusMessage: 'No users found in database - database connection or query issue' 
      });
    }
    
    // Find the participant user
    let foundUser = null;
    
    // Try direct ID match first
    foundUser = allUsers.find(u => u.id === fullParticipantId);
    
    if (!foundUser) {
      foundUser = allUsers.find(u => u.id === cleanParticipantId);
    }
    
    if (!foundUser) {
      foundUser = allUsers.find(u => String(u.id).includes(cleanParticipantId));
    }
    
    console.log('[CHAT DEBUG] User search results:', {
      searchedFor: fullParticipantId,
      foundUser: foundUser,
      allUserIds: allUsers.map(u => u.id)
    });

    if (!foundUser) {
      console.log('[CHAT DEBUG] Participant not found. Available users:', allUsers.map(u => ({ id: u.id, username: u.username })));
      throw createError({ statusCode: 404, statusMessage: 'Participant not found' });
    }

    console.log('[CHAT DEBUG] Found participant:', foundUser);

    // Convert RecordId objects to strings for the query
    const currentUserIdStr = String(user.id);
    const participantUserIdStr = String(foundUser.id);
    
    console.log('[CHAT DEBUG] String IDs for query:', {
      currentUserIdStr,
      participantUserIdStr
    });
    
    // Check for existing chat
    const existingChatResult = await db.query(`
      SELECT id, participants FROM chat 
      WHERE chat_type = $chatType 
        AND $currentUserId IN participants 
        AND $participantUserId IN participants
        AND array::len(participants) = 2
        AND is_active = true
    `, { 
      chatType, 
      currentUserId: currentUserIdStr, 
      participantUserId: participantUserIdStr 
    });

    // Extract existing chat with correct structure
    const existingChats = existingChatResult[0] || [];
    if (existingChats.length > 0) {
      console.log('[CHAT DEBUG] Found existing chat:', existingChats[0]);
      return {
        chat: existingChats[0],
        existing: true
      };
    }

    // Create new chat with correct record references
    const chatResult = await db.query(`
      CREATE chat SET 
        participants = [
          type::thing('user', $currentUserId),
          type::thing('user', $participantUserId)
        ],
        chat_type = $chatType,
        created_at = time::now(),
        last_message_at = time::now(),
        is_active = true
    `, {
      currentUserId: currentUserIdStr.replace(/^user:/, ''),
      participantUserId: participantUserIdStr.replace(/^user:/, ''),
      chatType
    });

    const createdChats = chatResult[0] || [];
    const chat = createdChats[0];
    
    console.log('[CHAT DEBUG] Created chat:', chat);
    
    if (!chat) {
      throw createError({ statusCode: 500, statusMessage: 'Failed to create chat - no result returned' });
    }

    // Verify participants were set correctly
    if (!chat.participants || chat.participants.length !== 2) {
      console.error('[CHAT DEBUG] Chat created but participants not set correctly:', {
        participants: chat.participants,
        expected: [currentUserIdStr, participantUserIdStr],
        participantsLength: chat.participants?.length,
        participantsType: typeof chat.participants,
        chatId: chat.id
      });
      
      throw createError({ statusCode: 500, statusMessage: 'Chat created but participants not set correctly' });
    }

    console.log('[CHAT DEBUG] Successfully created chat:', chat.id);

    return { 
      chat, 
      existing: false 
    };
    
  } catch (error: any) {
    console.error('[CHAT DEBUG] Error in handleCreateChat:', error);
    
    // Re-throw existing errors
    if (error.statusCode) {
      throw error;
    }
    
    // Wrap unexpected errors
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to create chat',
      data: { message: error.message }
    });
  }
}

// Helper function to extract clean ID
function extractCleanId(id: string): string {
  if (typeof id === 'string') {
    return id.replace(/^user:/, '');
  }
  return id;
}