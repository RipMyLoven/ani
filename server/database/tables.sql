-- Таблица чатов
DEFINE TABLE chat SCHEMAFULL;

DEFINE FIELD participants ON chat TYPE array<record>;
DEFINE FIELD chat_type ON chat TYPE string ASSERT $value IN ['private', 'group'];
DEFINE FIELD created_at ON chat TYPE datetime DEFAULT time::now();
DEFINE FIELD last_message_at ON chat TYPE datetime DEFAULT time::now();
DEFINE FIELD is_active ON chat TYPE bool DEFAULT true;

-- Индексы для чатов
DEFINE INDEX chat_participants ON chat COLUMNS participants;
DEFINE INDEX chat_created_at ON chat COLUMNS created_at;

-- Таблица сообщений
DEFINE TABLE message SCHEMAFULL;

DEFINE FIELD chat_id ON message TYPE record;
DEFINE FIELD sender_id ON message TYPE record;
DEFINE FIELD content ON message TYPE string;
DEFINE FIELD message_type ON message TYPE string ASSERT $value IN ['text', 'image', 'file', 'system'];
DEFINE FIELD created_at ON message TYPE datetime DEFAULT time::now();
DEFINE FIELD is_read ON message TYPE bool DEFAULT false;
DEFINE FIELD is_edited ON message TYPE bool DEFAULT false;
DEFINE FIELD edited_at ON message TYPE datetime;

-- Индексы для сообщений
DEFINE INDEX message_chat_id ON message COLUMNS chat_id;
DEFINE INDEX message_sender_id ON message COLUMNS sender_id;
DEFINE INDEX message_created_at ON message COLUMNS created_at;
DEFINE INDEX message_chat_created ON message COLUMNS chat_id, created_at;

-- Таблица для отслеживания онлайн статуса
DEFINE TABLE user_status SCHEMAFULL;

DEFINE FIELD user_id ON user_status TYPE record;
DEFINE FIELD status ON user_status TYPE string 
  ASSERT $value IN ['online', 'offline', 'away'];
DEFINE FIELD last_seen ON user_status TYPE datetime DEFAULT time::now();
DEFINE FIELD socket_id ON user_status TYPE string;

-- Индексы для статуса пользователей
DEFINE INDEX user_status_user_id ON user_status COLUMNS user_id UNIQUE;
DEFINE INDEX user_status_socket_id ON user_status COLUMNS socket_id;