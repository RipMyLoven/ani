import { defineEventHandler, getCookie } from 'h3';
import { getDb } from '~/server/utils/surreal';

// Define an interface for the debug info object
interface DebugInfo {
  token: string;
  username?: string;
  tokenParts?: number;
  allUsers?: any;
  userResult?: any;
  userResultStructure?: {
    isArray: boolean;
    length: number;
    firstItem: string;
    resultProperty: string;
  };
  error?: string;
}

export default defineEventHandler(async (event) => {
  const token = getCookie(event, 'token');
  let debugInfo: DebugInfo = { token: "missing" };
  
  if (token) {
    try {
      const tokenParts = Buffer.from(token, 'base64').toString().split(':');
      const username = tokenParts[0];
      
      debugInfo = {
        token: token.substring(0, 10) + '...',
        username,
        tokenParts: tokenParts.length
      };
      
      const db = await getDb();
      
      // Check if user exists with raw query
      const allUsersResult = await db.query(`SELECT * FROM user`);
      const userResult = await db.query(`SELECT * FROM user WHERE username = $username`, { username });
      
      debugInfo = {
        ...debugInfo,
        allUsers: allUsersResult,
        userResult,
        userResultStructure: {
          isArray: Array.isArray(userResult),
          length: userResult ? userResult.length : 0,
          firstItem: userResult && userResult.length > 0 ? typeof userResult[0] : 'none',
          resultProperty: userResult && userResult.length > 0 && userResult[0] ? 
            ((userResult[0] as any).result ? 'exists' : 'missing') : 'none'
        }
      };
    } catch (err: any) {
      debugInfo = { ...debugInfo, error: err.message };
    }
  }
  
  return debugInfo;
});