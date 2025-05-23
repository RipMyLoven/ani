import { defineEventHandler, getQuery } from 'h3';
import { getDb } from '~/server/utils/surreal';

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const username = query.username as string || '';
  
  try {
    const db = await getDb();
    
    // Получаем список всех пользователей
    const allUsers = await db.query(`SELECT * FROM user`);
    
    // Выполняем точный поиск по username
    const exactMatch = username ? 
      await db.query(`SELECT * FROM user WHERE username = $username`, { username }) : 
      null;
    
    // Анализируем структуру результата
    const resultAnalysis = {
      allUsersType: typeof allUsers,
      allUsersIsArray: Array.isArray(allUsers),
      allUsersLength: Array.isArray(allUsers) ? allUsers.length : 0,
      firstItemType: allUsers && Array.isArray(allUsers) && allUsers.length > 0 ? 
        typeof allUsers[0] : 'none',
      firstItemIsArray: allUsers && Array.isArray(allUsers) && allUsers.length > 0 ? 
        Array.isArray(allUsers[0]) : false,
      hasResultProperty: allUsers && Array.isArray(allUsers) && allUsers.length > 0 && 
        allUsers[0] && typeof allUsers[0] === 'object' ? 
        'result' in allUsers[0] : false,
    };
    
    return {
      allUsers,
      exactMatch,
      resultAnalysis,
      databaseInfo: {
        namespace: 'ani', // из вашего конфига
        database: 'ani'
      }
    };
  } catch (error: any) {
    return {
      error: error.message,
      stack: error.stack
    };
  }
});