export interface Chat {
  id: string;
  participants: string[];
  chat_type: 'private' | 'group';
  created_at: string;
  last_message_at: string;
  is_active: boolean;
  other_participants?: Array<{
    id: string;
    username: string;
  }>;
  last_message?: {
    content: string;
    created_at: string;
    sender_id: string;
  };
}

export interface Message {
  id: string;
  chat_id: string;
  sender_id: string;
  content: string;
  message_type: 'text' | 'image' | 'file' | 'system';
  created_at: string;
  is_read: boolean;
  is_edited: boolean;
  edited_at?: string;
  sender_username?: string;
}

export interface CreateChatRequest {
  participantId: string;
  chatType?: 'private' | 'group';
}

export interface CreateChatResponse {
  chat: Chat;
  existing: boolean;
}