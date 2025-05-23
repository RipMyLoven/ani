import { defineEventHandler, readBody, createError, getCookie } from 'h3';
import { getDb } from '~/server/utils/surreal';
import { SurrealResult } from '~/server/utils/surrealTypes';
import { extractCleanId, getUserIdFromToken } from './utils';

interface UserResult {
  id: string;
  username: string;
  email: string;
}

interface FriendshipResult {
  id: string;
  status: string;
  created_at?: string;
  friend_id: string;
  username: string;
  email: string;
  request_type: 'sent' | 'received';
}

export default defineEventHandler(async (event) => {
  const method = event.method;

  if (method === 'GET') {
    return await handleGetFriends(event);
  }
  
  if (method === 'POST') {
    return await handleSendFriendRequest(event);
  }
  
  throw createError({ statusCode: 405, statusMessage: 'Method not allowed' });
});

async function handleGetFriends(event: any) {
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
    
    const outgoingQuery = `
      SELECT id, status, created_at, \`in\` AS friend_id, out
      FROM friendship
      WHERE out = $userId
    `;
    const outgoingFriendships: SurrealResult = await db.query(outgoingQuery, { userId });
    
    const incomingQuery = `
      SELECT id, status, created_at, out AS friend_id, \`in\` AS recipient_id
      FROM friendship
      WHERE \`in\` = 'user:${extractCleanId(userId)}'
    `;
    const incomingFriendships: SurrealResult = await db.query(incomingQuery);
    
    const outgoingFriendships_parsed = parseSurrealResult(outgoingFriendships);
    const incomingFriendships_parsed = parseSurrealResult(incomingFriendships);
    
    const friendIds = [
      ...outgoingFriendships_parsed.map(f => extractCleanId(f.friend_id)),
      ...incomingFriendships_parsed.map(f => extractCleanId(f.friend_id))
    ];
    
    const friendUsersMap = await fetchFriendsUserData(db, friendIds);
    
    const outgoingFriends = buildFriendsList(outgoingFriendships_parsed, friendUsersMap, 'sent');
    const incomingFriends = buildFriendsList(incomingFriendships_parsed, friendUsersMap, 'received');

    return {
      friends: [...outgoingFriends, ...incomingFriends],
    };
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Failed to retrieve friends',
      data: { message: error.message }
    });
  }
}

async function handleSendFriendRequest(event: any) {
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
    const db = await getDb();
    const userId = await getUserIdFromToken(token, db);
    
    if (!userId) {
      throw createError({ statusCode: 404, statusMessage: 'User not found' });
    }
    
    if (userId === friendId || userId.toString() === friendId.toString()) {
      throw createError({ 
        statusCode: 400, 
        statusMessage: "You can't add yourself as a friend" 
      });
    }
    
    const existingFriendship = await checkExistingFriendship(db, userId, friendId);
    if (existingFriendship) {
      throw createError({ statusCode: 409, statusMessage: 'Friendship already exists' });
    }
    
    const createdFriendship = await createFriendship(db, userId, friendId);
    
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
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Failed to send friend request',
      data: { message: error.message }
    });
  }
}

function parseSurrealResult(result: SurrealResult): any[] {
  let parsed: any[] = [];
  
  if (Array.isArray(result) && result.length > 0) {
    const firstItem = result[0] as any;
    if (firstItem && firstItem.result && Array.isArray(firstItem.result)) {
      parsed = firstItem.result || [];
    } else if (Array.isArray(firstItem)) {
      parsed = firstItem;
    }
  }
  
  return parsed;
}

async function fetchFriendsUserData(db: any, friendIds: string[]): Promise<Record<string, any>> {
  let friendUsersMap: Record<string, any> = {};
  
  if (friendIds.length === 0) {
    return friendUsersMap;
  }
  
  const userPromises = friendIds.map(friendId => {
    const cleanId = extractCleanId(friendId);
    return db.query(
      `SELECT id, username, email FROM user WHERE id = type::thing('user', $cleanId)`,
      { cleanId }
    );
  });
  
  const userResults = await Promise.all(userPromises);
  
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
        const friendId = friendIds[index];
        const cleanId = extractCleanId(friendId);
        
        friendUsersMap[friendId] = userData;
        friendUsersMap[cleanId] = userData;
        friendUsersMap[`user:${cleanId}`] = userData;
      }
    }
  });
  
  return friendUsersMap;
}

function buildFriendsList(
  friendships: any[], 
  usersMap: Record<string, any>, 
  requestType: 'sent' | 'received'
): FriendshipResult[] {
  return friendships.map(friendship => {
    const friendId = extractCleanId(friendship.friend_id);
    const userData = usersMap[friendId] || usersMap[`user:${friendId}`] || {};
    
    return {
      id: friendship.id,
      status: friendship.status,
      friend_id: friendship.friend_id,
      request_type: requestType,
      created_at: friendship.created_at,
      username: userData.username || null,
      email: userData.email || null
    };
  });
}

async function checkExistingFriendship(db: any, userId: string, friendId: string): Promise<boolean> {
  const existingFriendship: SurrealResult = await db.query(`
    SELECT * FROM friendship 
    WHERE (in = $userId AND out = $friendId) OR (in = $friendId AND out = $userId)
  `, { userId, friendId });
  
  return !!parseSurrealResult(existingFriendship).length;
}

async function createFriendship(db: any, userId: string, friendId: string): Promise<any> {
  const result: SurrealResult = await db.query(`
    CREATE friendship SET 
      status = 'pending',
      created_at = time::now(),
      in = $friendId,
      out = $userId
  `, { userId, friendId });
  
  const parsed = parseSurrealResult(result);
  return parsed.length > 0 ? parsed[0] : null;
}