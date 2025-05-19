import { Surreal } from "surrealdb";

interface DbConfig {
  url: string;
  namespace: string;
  database: string;
  username: string;
  password: string;
}

const DEFAULT_CONFIG: DbConfig = {
  url: "http://127.0.0.1:8000/rpc",
  namespace: "ani",
  database: "ani",
  username: "admin",
  password: "admin"
};

export async function getDb(config: DbConfig = DEFAULT_CONFIG): Promise<Surreal> {
  const db = new Surreal();
  
  await db.connect(config.url);
  
  await db.use({
    namespace: config.namespace,
    database: config.database
  });
  
  await db.signin({
    username: config.username,
    password: config.password,
  });
  
  return db;
}