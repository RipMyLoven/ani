export default defineEventHandler(async (event) => {
  const io = (globalThis as any).__socket_io__;
  const nitro = (globalThis as any).__nitro__;
  const nitroApp = (globalThis as any).__nitro_app__;
  
  // Try to force initialization if not done yet
  if (!io && event.node.req.socket?.server) {
    console.log('[DEBUG API] Attempting emergency WebSocket initialization');
    try {
      const { initializeWebSocket } = await import('../../websocket/socketHandler');
      const newIo = initializeWebSocket(event.node.req.socket.server);
      (globalThis as any).__socket_io__ = newIo;
      console.log('[DEBUG API] ✅ Emergency initialization successful');
    } catch (error) {
      console.error('[DEBUG API] ❌ Emergency initialization failed:', error);
    }
  }
  
  return {
    websocketInitialized: !!io,
    websocketConnections: io ? (io.engine?.clientsCount || 0) : 0,
    nitroAvailable: !!nitro,
    nitroAppAvailable: !!nitroApp,
    httpServerAvailable: !!(nitro?.httpServer),
    requestServerAvailable: !!(event.node.req.socket?.server),
    globalSocketIo: !!(globalThis as any).__socket_io__,
    timestamp: new Date().toISOString(),
    serverInfo: {
      nodeVersion: process.version,
      platform: process.platform,
      env: process.env.NODE_ENV
    }
  };
});