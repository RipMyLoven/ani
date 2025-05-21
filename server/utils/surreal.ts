import { Surreal } from "surrealdb";

interface DbConfig {
  url: string;
  namespace: string;
  database: string;
  username: string;
  password: string;
}

const DEFAULT_CONFIG: DbConfig = {
  url: "",
  namespace: "ani",
  database: "ani",
  username: "admin",
  password: "admin"
};

export async function getDb(config: DbConfig = DEFAULT_CONFIG): Promise<Surreal> {
  const db = new Surreal();
  
  try {
    
    await db.connect(config.url, {
      namespace: config.namespace,
      database: config.database,
      auth: {
        username: config.username,
        password: config.password
      }
    });
    
    return db;
  } catch (error) {
    throw error;
  }
}