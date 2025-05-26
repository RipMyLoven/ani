let initialized = false;

export default defineNitroPlugin(async (nitroApp) => {
  console.log('[WEBSOCKET INIT] Plugin loaded');
  
  // Simple delayed initialization
  setTimeout(async () => {
    if (initialized) return;
    
    console.log('[WEBSOCKET INIT] Attempting delayed initialization...');
    
    // Try different ways to get the server
    const sources = [
      () => (globalThis as any).__nitro__?.httpServer,
      () => (globalThis as any).httpServer,
      () => process.server,
      () => nitroApp.httpServer
    ];
    
    for (const getServer of sources) {
      try {
        const server = getServer();
        if (server) {
          console.log('[WEBSOCKET INIT] Found server, initializing...');
          const { initializeWebSocket } = await import('../websocket/socketHandler');
          const io = initializeWebSocket(server);
          (globalThis as any).__socket_io__ = io;
          initialized = true;
          console.log('[WEBSOCKET INIT] ✅ WebSocket initialized successfully');
          return;
        }
      } catch (error) {
        // Continue to next source
      }
    }
    
    console.log('[WEBSOCKET INIT] No server found in any source');
  }, 2000);
});