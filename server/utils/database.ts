import { getDb } from './surreal';

export const db = getDb();

export async function executeQuery(query: string, params?: any) {
  const database = await getDb();
  return await database.query(query, params);
}

export async function createRecord(table: string, data: any) {
  const database = await getDb();
  return await database.create(table, data);
}

export async function selectRecord(id: string) {
  const database = await getDb();
  return await database.select(id);
}

export async function updateRecord(id: string, data: any) {
  const database = await getDb();
  return await database.update(id, data);
}

export async function deleteRecord(id: string) {
  const database = await getDb();
  return await database.delete(id);
}