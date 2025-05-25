export default defineEventHandler(async (event) => {
  try {
    const db = await getDb();
    
    console.log('[DEBUG] Testing database connection...');
    
    // Test basic connectivity
    const versionResult = await db.query('SELECT * FROM $version');
    console.log('[DEBUG] Database version:', versionResult);
    
    // Test user table existence and structure
    const tableInfoResult = await db.query('INFO FOR TABLE user');
    console.log('[DEBUG] User table info:', tableInfoResult);
    
    // Get users with different query approaches
    const queries = [
      { name: 'Basic SELECT *', query: 'SELECT * FROM user' },
      { name: 'SELECT specific fields', query: 'SELECT id, username, email FROM user' },
      { name: 'COUNT users', query: 'SELECT COUNT(*) as total FROM user' },
      { name: 'LIMIT 5', query: 'SELECT * FROM user LIMIT 5' }
    ];
    
    const results = {};
    
    for (const { name, query } of queries) {
      try {
        console.log(`[DEBUG] Executing: ${query}`);
        const result = await db.query(query);
        console.log(`[DEBUG] Result for ${name}:`, JSON.stringify(result, null, 2));
        results[name] = {
          raw: result,
          processed: result[0]?.result || []
        };
      } catch (queryError) {
        console.error(`[DEBUG] Query failed: ${query}`, queryError);
        results[name] = { error: queryError.message };
      }
    }
    
    // Try to find specific user
    const targetId = 'qqum9byg7wa71hxpy7fu';
    const userSearchQueries = [
      `SELECT * FROM user:${targetId}`,
      `SELECT * FROM user WHERE id = 'user:${targetId}'`,
      `SELECT * FROM user WHERE id CONTAINS '${targetId}'`
    ];
    
    for (const query of userSearchQueries) {
      try {
        console.log(`[DEBUG] User search: ${query}`);
        const result = await db.query(query);
        console.log(`[DEBUG] User search result:`, result);
        results[`userSearch_${query}`] = result[0]?.result || [];
      } catch (error) {
        console.error(`[DEBUG] User search failed: ${query}`, error);
        results[`userSearch_${query}`] = { error: error.message };
      }
    }
    
    return {
      message: 'Database debug information',
      results,
      timestamp: new Date().toISOString()
    };
    
  } catch (error: any) {
    console.error('[DEBUG] Main error:', error);
    return {
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    };
  }
});