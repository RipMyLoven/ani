import { createServer } from 'http';

// This will be called by Nitro when the server starts
export default async function (nitroApp: any) {
  console.log('[SERVER INDEX] Server initialization function called');
  
  // Hook into the server creation process
  nitroApp.hooks.hook('listen', async (server: any) => {
    console.log('[SERVER INDEX] Listen hook in index.ts');
    
    if (server) {
      try {
        const { initializeWebSocket } = await import('./websocket/socketHandler');
        const io = initializeWebSocket(server);
        (globalThis as any).__socket_io__ = io;
        console.log('[SERVER INDEX] ✅ WebSocket initialized from index.ts');
      } catch (error) {
        console.error('[SERVER INDEX] ❌ WebSocket initialization failed:', error);
      }
    }
  });
}

