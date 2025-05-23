import { SurrealResult } from '~/server/utils/surrealTypes';

interface FriendshipResult {
  id: string;
  in: string;
  out: string;
  status: string;
}

export async function getUserIdFromToken(token: string, db: any): Promise<string | null> {
  const tokenParts = Buffer.from(token, 'base64').toString().split(':');
  const username = tokenParts[0];
  
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
  
  return userId;
}

export async function findFriendship(db: any, cleanId: string): Promise<FriendshipResult | null> {
  // Try primary lookup
  const friendshipResult = await db.query(`
    SELECT * FROM friendship 
    WHERE id = type::thing('friendship', $cleanId)
  `, { cleanId }) as SurrealResult<FriendshipResult>;

  let friendship = null;
  if (Array.isArray(friendshipResult) && friendshipResult.length > 0) {
    const firstItem = friendshipResult[0] as any;
    
    if (firstItem && firstItem.result && Array.isArray(firstItem.result) && firstItem.result.length > 0) {
      friendship = firstItem.result[0];
    } else if (Array.isArray(firstItem) && firstItem.length > 0) {
      friendship = firstItem[0];
    }
  }

  if (!friendship) {
    const altQuery = await db.query(`
      SELECT * FROM friendship 
      WHERE id CONTAINS $cleanId
    `, { cleanId });
    
    if (Array.isArray(altQuery) && altQuery.length > 0) {
      const firstItem = altQuery[0] as any;
      
      if (firstItem && firstItem.result && Array.isArray(firstItem.result) && firstItem.result.length > 0) {
        friendship = firstItem.result[0];
      } else if (Array.isArray(firstItem) && firstItem.length > 0) {
        friendship = firstItem[0];
      }
    }
  }
  
  return friendship;
}

export function cleanUserId(userId: any): string {
  if (typeof userId === 'string') {
    return userId.replace(/^user:/, '');
  } else if (userId && typeof userId === 'object') {
    const id = (userId as any).id?.toString() || (userId as any).toString();
    return id.replace(/^user:/, '');
  }
  return '';
}

export function checkFriendshipPermissions(userId: string, friendship: FriendshipResult): boolean {
  const userIdClean = cleanUserId(userId);
  const inIdClean = cleanUserId(friendship.in);
  const outIdClean = cleanUserId(friendship.out);
  
  // Use multiple comparison methods for compatibility
  const userIdStr = userId?.toString() || '';
  const inIdStr = friendship.in?.toString() || '';
  const outIdStr = friendship.out?.toString() || '';
  
  return (
    userIdClean === inIdClean || 
    userIdClean === outIdClean ||
    userIdStr === inIdStr ||
    userIdStr === outIdStr ||
    `user:${userIdClean}` === inIdStr ||
    `user:${userIdClean}` === outIdStr
  );
}

export function extractCleanId(userId: any): string {
  if (!userId) return '';
  if (typeof userId === 'object' && userId.id) return userId.id.toString();
  const userIdStr = userId.toString();
  return userIdStr.includes(':') ? userIdStr.split(':')[1] : userIdStr;
}