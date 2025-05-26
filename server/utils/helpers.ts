export function extractCleanId(id: string): string {
  if (typeof id === 'string') {
    // Remove 'user:' prefix if present
    return id.replace(/^user:/, '');
  }
  return id;
}

export function ensureUserPrefix(id: string): string {
  if (typeof id === 'string' && !id.startsWith('user:')) {
    return `user:${id}`;
  }
  return id;
}

export function formatRecordId(table: string, id: string): string {
  const cleanId = extractCleanId(id);
  return `${table}:${cleanId}`;
}

export function parseRecordId(recordId: string): { table: string; id: string } {
  const parts = recordId.split(':');
  return {
    table: parts[0] || '',
    id: parts[1] || recordId
  };
}