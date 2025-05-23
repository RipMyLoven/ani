import { defineEventHandler, readBody, createError, getCookie } from 'h3';
import { getDb } from '~/server/utils/surreal';
import { SurrealResult, SurrealQueryResult } from '~/server/utils/surrealTypes';

// User interface
interface UserResult {
  id: string;
  username: string;
  email: string;
}

// Friendship interface 
interface FriendshipResult {
  id: string;
  status: string;
  created_at?: string;
  friend_id: string;
  username: string;
  email: string;
  request_type: 'sent' | 'received';
}

// Get all friends for the current user
export default defineEventHandler(async (event) => {
  const method = event.method;

  // GET - Fetch friends list
  if (method === 'GET') {
    const token = getCookie(event, 'token');
    if (!token) {
      throw createError({ statusCode: 401, statusMessage: 'Not authenticated' });
    }

    try {
      const tokenParts = Buffer.from(token, 'base64').toString().split(':');
      const username = tokenParts[0];
      
      console.log('Token parts length:', tokenParts.length);
      console.log('Username from token:', username);
      
      const db = await getDb();
      
      // Direct query for the specific user
      const userResult: SurrealResult<UserResult> = await db.query(`
        SELECT id FROM user WHERE username = $username
      `, { username });
      
      console.log('User query result:', JSON.stringify(userResult));
      
      // Extract user ID from the result using improved parsing
      let userId: string | null = null;
      
      // Handle different possible response structures from SurrealDB
      if (Array.isArray(userResult) && userResult.length > 0) {
        const firstItem = userResult[0] as any;
        
        if (firstItem && firstItem.result && Array.isArray(firstItem.result) && firstItem.result[0]?.id) {
          userId = firstItem.result[0].id;
        } else if (firstItem && Array.isArray(firstItem) && firstItem[0]?.id) {
          userId = firstItem[0].id;
        } else {
          // Try to parse a flattened structure
          const flatResult = Array.isArray(firstItem) ? firstItem : userResult;
          const user = flatResult.find((item: any) => 
            item && typeof item === 'object' && item.id && item.username === username
          );
          if (user) {
            userId = user.id;
          }
        }
      }
      
      console.log('Found userId:', userId);
      
      if (!userId) {
        throw createError({ statusCode: 404, statusMessage: 'User not found' });
      }
      
      // Добавим отладочную информацию
      console.log('Executing friendship queries for user ID:', userId);
      
      // Query 1: Get outgoing friendship records - с лучшим экранированием
      const outgoingQuery = `
        SELECT id, status, created_at, \`in\` AS friend_id, out
        FROM friendship
        WHERE out = $userId
      `;
      console.log('Outgoing query:', outgoingQuery);
      const outgoingFriendships: SurrealResult = await db.query(outgoingQuery, { userId });
      console.log('Outgoing friendships raw result:', JSON.stringify(outgoingFriendships));
      
      // Query 2: Get incoming friendship records
      const incomingQuery = `
        SELECT id, status, created_at, out AS friend_id, \`in\` AS recipient_id
        FROM friendship
        WHERE \`in\` = 'user:${extractCleanId(userId)}'
        `;
      console.log('Incoming query:', incomingQuery);
      const incomingFriendships: SurrealResult = await db.query(incomingQuery);
      
      // Add more detailed logging
      console.log('Incoming friendships query parameters:', { userId: userId.toString() });
      console.log('Incoming friendships raw result (full):', JSON.stringify(incomingFriendships));
      console.log('Incoming query structure:', 
        Array.isArray(incomingFriendships), 
        incomingFriendships.length, 
        incomingFriendships[0] ? typeof incomingFriendships[0] : 'none'
      );

      let incomingFriendships_parsed: any[] = [];

      if (Array.isArray(incomingFriendships) && incomingFriendships.length > 0) {
        const firstItem = incomingFriendships[0];
        if (firstItem && Array.isArray(firstItem)) {
          incomingFriendships_parsed = firstItem;
        } else if (firstItem && firstItem.result && Array.isArray(firstItem.result)) {
          incomingFriendships_parsed = firstItem.result;
        }
        console.log('Parsed incoming structure:', incomingFriendships_parsed);
      }
      
      // Parse and combine friendship records
      let outgoingFriendships_parsed: any[] = [];
      
      if (Array.isArray(outgoingFriendships) && outgoingFriendships.length > 0) {
        const firstItem = outgoingFriendships[0] as any;
        if (firstItem && firstItem.result) {
          outgoingFriendships_parsed = firstItem.result || [];
        } else if (Array.isArray(firstItem)) {
          outgoingFriendships_parsed = firstItem;
        }
      }
      
      console.log('Parsed outgoing friendships:', outgoingFriendships_parsed.length);
      console.log('Parsed incoming friendships:', incomingFriendships_parsed.length);
      
      // Get all friend IDs to fetch their user info
      const friendIds = [
        ...outgoingFriendships_parsed.map(f => extractCleanId(f.friend_id)),
        ...incomingFriendships_parsed.map(f => extractCleanId(f.friend_id))
      ];

      console.log('Friend IDs to fetch:', friendIds);
      
      let friendUsersMap: Record<string, any> = {};
      
      if (friendIds.length > 0) {
        // Always work with string IDs
        const userPromises = friendIds.map(friendId => {
          const cleanId = extractCleanId(friendId);
          return db.query(
            `SELECT id, username, email FROM user WHERE id = type::thing('user', $cleanId)`,
            { cleanId }
          );
        });
        
        const userResults = await Promise.all(userPromises);
        
        // Process results and build the user map
        userResults.forEach((result, index) => {
          if (Array.isArray(result) && result.length > 0) {
            const firstItem = result[0] as any;
            let userData = null;
            
            if (
              firstItem &&
              typeof firstItem === 'object' &&
              'result' in firstItem &&
              Array.isArray(firstItem.result) &&
              firstItem.result.length > 0
            ) {
              userData = firstItem.result[0];
            } else if (Array.isArray(firstItem) && firstItem.length > 0) {
              userData = firstItem[0];
            }
            
            if (userData) {
              // Получаем clean ID - он нам понадобится для идентификации пользователя
              const friendId = friendIds[index];
              const cleanId = extractCleanId(friendId);
              
              // Добавляем пользователя под разными возможными ключами для надежного поиска
              friendUsersMap[friendId] = userData;
              friendUsersMap[cleanId] = userData;
              friendUsersMap[`user:${cleanId}`] = userData;
              
              console.log(`Сохраняем пользователя в карту: ${userData.username} под ключами:`, 
                friendId, cleanId, `user:${cleanId}`);
            }
          }
        });
        
        console.log('Карта пользователей:', Object.keys(friendUsersMap));
      }
      
      // Create final friend lists with complete info
      const outgoingFriends = outgoingFriendships_parsed.map(friendship => {
        const friendId = extractCleanId(friendship.friend_id);
        const userData = friendUsersMap[friendId] || friendUsersMap[`user:${friendId}`] || {};
        
        return {
          id: friendship.id,
          status: friendship.status,
          friend_id: friendship.friend_id,
          request_type: 'sent',
          created_at: friendship.created_at,
          username: userData.username || null,
          email: userData.email || null
        };
      });
      
      const incomingFriends = incomingFriendships_parsed.map(friendship => {
        const friendId = extractCleanId(friendship.friend_id);
        const userData = friendUsersMap[friendId] || friendUsersMap[`user:${friendId}`] || {};
        
        return {
          id: friendship.id,
          status: friendship.status,
          friend_id: friendship.friend_id,
          request_type: 'received',
          created_at: friendship.created_at,
          username: userData.username || null,
          email: userData.email || null
        };
      });
      
      console.log('Информация о друзьях на выходе:', 
        outgoingFriends.map(f => ({id: f.id, username: f.username})),
        incomingFriends.map(f => ({id: f.id, username: f.username}))
      );

      return {
        friends: [...outgoingFriends, ...incomingFriends],
      };
    } catch (error: any) {
      console.error('Friends list error:', error);
      throw createError({
        statusCode: error.statusCode || 500,
        statusMessage: error.statusMessage || 'Failed to retrieve friends',
        data: { message: error.message }
      });
    }
  }
  
  // POST - Send friend request (this part remains unchanged)
  if (method === 'POST') {
    const body = await readBody(event);
    const { friendId } = body;
    
    const token = getCookie(event, 'token');
    if (!token) {
      throw createError({ statusCode: 401, statusMessage: 'Not authenticated' });
    }

    if (!friendId) {
      throw createError({ statusCode: 400, statusMessage: 'Friend ID is required' });
    }

    try {
      const tokenParts = Buffer.from(token, 'base64').toString().split(':');
      const username = tokenParts[0];
      
      const db = await getDb();
      
      // Find current user with improved query
      const userResult: SurrealResult<UserResult> = await db.query(`
        SELECT id FROM user WHERE username = $username
      `, { username });
      
      // Extract user ID with better parsing
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
      
      // Improved check for adding yourself
      if (userId === friendId || userId.toString() === friendId.toString()) {
        throw createError({ 
          statusCode: 400, 
          statusMessage: "You can't add yourself as a friend" 
        });
      }
      
      // Check if friendship already exists
      const existingFriendship: SurrealResult = await db.query(`
        SELECT * FROM friendship 
        WHERE (in = $userId AND out = $friendId) OR (in = $friendId AND out = $userId)
      `, { userId, friendId });
      
      // Better parsing of results to check if friendship exists
      let friendshipExists = false;
      
      if (Array.isArray(existingFriendship) && existingFriendship.length > 0) {
        const firstItem = existingFriendship[0] as any;
        
        if (firstItem && firstItem.result && Array.isArray(firstItem.result) && firstItem.result.length > 0) {
          friendshipExists = true;
        } else if (firstItem && Array.isArray(firstItem) && firstItem.length > 0) {
          friendshipExists = true;
        }
      }
      
      if (friendshipExists) {
        throw createError({ statusCode: 409, statusMessage: 'Friendship already exists' });
      }
      
      // Create the friendship
      const result: SurrealResult = await db.query(`
        CREATE friendship SET 
          status = 'pending',
          created_at = time::now(),
          in = $friendId,
          out = $userId
      `, { userId, friendId });
      
      // Better parsing of creation result
      let createdFriendship: any = null;
      
      if (Array.isArray(result) && result.length > 0) {
        const firstItem = result[0] as any;
        
        if (firstItem && typeof firstItem === 'object' && 'result' in firstItem && Array.isArray(firstItem.result) && firstItem.result[0]) {
          createdFriendship = firstItem.result[0];
        } else if (firstItem && Array.isArray(firstItem) && firstItem.length > 0) {
          createdFriendship = firstItem[0];
        }
      }
      
      return { 
        success: true, 
        friendship: createdFriendship || { 
          id: null,
          status: 'pending',
          created_at: new Date().toISOString(),
          in: friendId,
          out: userId 
        } 
      };
    } catch (error: any) {
      console.error('Send friend request error:', error);
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to send friend request',
        data: { message: error.message }
      });
    }
  }
});

// Helper function to safely extract a clean ID from SurrealDB records
function extractCleanId(userId: any): string {
  if (!userId) return '';
  if (typeof userId === 'object' && userId.id) return userId.id.toString();
  const userIdStr = userId.toString();
  return userIdStr.includes(':') ? userIdStr.split(':')[1] : userIdStr;
}