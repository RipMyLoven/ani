export interface SocketEvents {
  // Клиент -> Сервер
  join_chat: (data: { chatId: string }) => void;
  send_message: (data: { chatId: string; content: string; messageType?: string }) => void;
  typing_start: (data: { chatId: string }) => void;
  typing_stop: (data: { chatId: string }) => void;
  
  // Сервер -> Клиент
  connection_established: (data: { message: string; userId: string; username: string }) => void;
  connection_error: (data: { message: string }) => void;
  chat_joined: (data: { chatId: string }) => void;
  new_message: (data: MessageData) => void;
  user_typing: (data: { userId: string; username: string; isTyping: boolean }) => void;
  error: (data: { message: string }) => void;
}

export interface MessageData {
  id: string;
  chatId: string;
  content: string;
  messageType: string;
  senderId: string;
  senderUsername: string;
  createdAt: string;
}

export interface SocketInstance {
  connect(): Promise<void>;
  disconnect(): void;
  getInstance(): any;
  emit(event: string, data: any): void;
  on(event: string, callback: (...args: any[]) => void): void;
  off(event: string, callback?: (...args: any[]) => void): void;
}