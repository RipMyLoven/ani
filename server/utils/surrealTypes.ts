export interface SurrealResponse {
  time: string;
  status: string;
  result?: any;
}

export interface SurrealResult<T = any> extends Array<SurrealResponse> {}

export interface SurrealQueryResult<T = any> {
  result: T[];
}

export function parseSurrealResult<T>(result: any): T[] {
  let parsed: T[] = [];
  
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