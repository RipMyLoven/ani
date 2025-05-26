import { Server } from 'socket.io';
import type { Server as HttpServer } from 'http';
import { parseAuthToken } from '../api/auth/utils';
import { getDb } from '../utils/surreal';
import { extractCleanId } from '../utils/helpers';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  username?: string;
}

export function initializeWebSocket(server: HttpServer) {
  console.log('[SOCKET HANDLER] Creating Socket.IO server...');
  
  if (!server) {
    throw new Error('HTTP server is required for WebSocket initialization');
  }
  
  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:3000",
      methods: ["GET", "POST"],
      credentials: true
    },
    transports: ['websocket', 'polling'],
    allowEIO3: true
  });

  console.log('[SOCKET HANDLER] Socket.IO server created, setting up handlers...');

  // Middleware для аутентификации
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      console.log('[SOCKET AUTH] Authenticating socket with token:', !!token);
      
      if (!token) {
        console.log('[SOCKET AUTH] No token provided');
        return next(new Error('Authentication token required'));
      }

      const tokenData = parseAuthToken(token);
      if (!tokenData) {
        console.log('[SOCKET AUTH] Invalid token');
        return next(new Error('Invalid authentication token'));
      }

      (socket as AuthenticatedSocket).userId = `user:${tokenData.username}`;
      (socket as AuthenticatedSocket).username = tokenData.username;
      
      console.log('[SOCKET AUTH] Socket authenticated for user:', tokenData.username);
      next();
    } catch (error) {
      console.error('[SOCKET AUTH] Authentication error:', error);
      next(new Error('Authentication failed'));
    }
  });

  io.on('connection', async (socket) => {
    const authSocket = socket as AuthenticatedSocket;
    console.log(`[SOCKET] User ${authSocket.username} connected with socket ${socket.id}`);

    try {
      const db = await getDb();
      await db.query(`
        UPSERT user_status:⟨${extractCleanId(authSocket.userId!)}\u27E9 SET 
          user_id = $userId,
          status = 'online',
          last_seen = time::now(),
          socket_id = $socketId
      `, {
        userId: authSocket.userId,
        socketId: socket.id
      });

      await joinUserChats(authSocket, db);

      socket.emit('connection_established', {
        message: 'Successfully connected to WebSocket',
        userId: authSocket.userId,
        username: authSocket.username
      });
    } catch (error) {
      console.error('[SOCKET] Error during connection setup:', error);
      socket.emit('connection_error', { message: 'Failed to setup connection' });
    }

    // Event handlers
    socket.on('join_chat', async (data) => {
      const db = await getDb();
      await handleJoinChat(authSocket, data, db);
    });

    socket.on('send_message', async (data) => {
      const db = await getDb();
      await handleSendMessage(authSocket, data, db, io);
    });

    socket.on('typing_start', (data) => {
      handleTyping(authSocket, data, io, true);
    });

    socket.on('typing_stop', (data) => {
      handleTyping(authSocket, data, io, false);
    });

    socket.on('disconnect', async () => {
      const db = await getDb();
      await handleDisconnect(authSocket, db);
    });
  });

  console.log('[SOCKET HANDLER] ✅ WebSocket handlers configured');
  return io;
}

async function joinUserChats(socket: AuthenticatedSocket, db: any) {
  try {
    const chatsResult = await db.query(`
      SELECT id FROM chat 
      WHERE $userId IN participants
    `, { userId: socket.userId });

    const chats = chatsResult[0]?.result || [];
    
    for (const chat of chats) {
      socket.join(`chat:${chat.id}`);
    }
    
    console.log(`User ${socket.username} joined ${chats.length} chats`);
  } catch (error) {
    console.error('Error joining user chats:', error);
  }
}

async function handleJoinChat(socket: AuthenticatedSocket, data: any, db: any) {
  try {
    const { chatId } = data;
    
    if (!chatId) {
      socket.emit('error', { message: 'Chat ID is required' });
      return;
    }

    const chatResult = await db.query(`
      SELECT * FROM chat:⟨${chatId}⟩ 
      WHERE $userId IN participants
    `, { userId: socket.userId });

    const chat = chatResult[0]?.result?.[0];
    if (!chat) {
      socket.emit('error', { message: 'Chat not found or access denied' });
      return;
    }

    socket.join(`chat:${chatId}`);
    socket.emit('chat_joined', { chatId });
    
  } catch (error) {
    console.error('Error joining chat:', error);
    socket.emit('error', { message: 'Failed to join chat' });
  }
}

async function handleSendMessage(socket: AuthenticatedSocket, data: any, db: any, io: Server) {
  try {
    const { chatId, content, messageType = 'text' } = data;
    
    if (!chatId || !content) {
      socket.emit('error', { message: 'Chat ID and content are required' });
      return;
    }

    const messageResult = await db.query(`
      CREATE message SET 
        chat_id = $chatId,
        sender_id = $senderId,
        content = $content,
        message_type = $messageType,
        created_at = time::now()
    `, { 
      chatId: `chat:⟨${chatId}⟩`, 
      senderId: socket.userId, 
      content, 
      messageType 
    });

    const message = messageResult[0]?.result?.[0];
    if (!message) {
      socket.emit('error', { message: 'Failed to save message' });
      return;
    }

    await db.query(`
      UPDATE chat:⟨${chatId}⟩ SET last_message_at = time::now()
    `);

    const messageData = {
      id: message.id,
      chatId,
      content,
      messageType,
      senderId: socket.userId,
      senderUsername: socket.username,
      createdAt: message.created_at
    };

    io.to(`chat:${chatId}`).emit('new_message', messageData);
    
  } catch (error) {
    console.error('Error sending message:', error);
    socket.emit('error', { message: 'Failed to send message' });
  }
}

function handleTyping(socket: AuthenticatedSocket, data: any, io: Server, isTyping: boolean) {
  const { chatId } = data;
  
  if (!chatId) return;

  socket.to(`chat:${chatId}`).emit('user_typing', {
    userId: socket.userId,
    username: socket.username,
    isTyping
  });
}

async function handleDisconnect(socket: AuthenticatedSocket, db: any) {
  try {
    console.log(`User ${socket.username} disconnected`);
    
    await db.query(`
      UPDATE user_status:⟨${extractCleanId(socket.userId!)}⟩ SET 
        status = 'offline',
        last_seen = time::now(),
        socket_id = NULL
    `);
    
  } catch (error) {
    console.error('Error during disconnect:', error);
  }
}