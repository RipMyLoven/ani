export interface SurrealResponse<T = any> {
  time?: string;
  status?: string;
  result?: T[];
  detail?: string;
  [key: string]: any;
}

export type SurrealResult<T = any> = SurrealResponse<T>[] | any[];

export interface SurrealQueryResult<T = any> {
  [0]: SurrealResponse<T> | T[] | any;
}