let fallbackInitialized = false;

export default defineEventHandler(async (event) => {
  // Only try once and only for the first meaningful request
  if (fallbackInitialized || event.node.req.url?.includes('_nuxt') || event.node.req.url?.includes('api')) {
    return;
  }
  
  if (event.node.req.url === '/' || event.node.req.url?.includes('chat')) {
    fallbackInitialized = true;
    
    console.log('[WEBSOCKET FALLBACK] Attempting WebSocket initialization via middleware');
    
    // Check if already initialized
    if ((globalThis as any).__socket_io__) {
      console.log('[WEBSOCKET FALLBACK] WebSocket already initialized');
      return;
    }
    
    try {
      // Try to get the HTTP server from the request
      const server = event.node.req.socket?.server;
      
      if (server) {
        console.log('[WEBSOCKET FALLBACK] Found HTTP server, initializing WebSocket');
        const { initializeWebSocket } = await import('../websocket/socketHandler');
        const io = initializeWebSocket(server);
        (globalThis as any).__socket_io__ = io;
        console.log('[WEBSOCKET FALLBACK] ✅ WebSocket initialized via fallback');
      } else {
        console.log('[WEBSOCKET FALLBACK] No HTTP server found in request');
      }
    } catch (error) {
      console.error('[WEBSOCKET FALLBACK] ❌ Fallback initialization failed:', error);
    }
  }
});