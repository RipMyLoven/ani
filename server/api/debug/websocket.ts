export default defineEventHandler(async (event) => {
  const io = (globalThis as any).__socket_io__;
  
  // Emergency initialization if WebSocket not found
  if (!io) {
    console.log('[DEBUG API] WebSocket not initialized, attempting emergency initialization...');
    
    const server = event.node.req.socket?.server;
    if (server) {
      try {
        const { initializeWebSocket } = await import('../../websocket/socketHandler');
        const newIo = initializeWebSocket(server);
        (globalThis as any).__socket_io__ = newIo;
        console.log('[DEBUG API] ✅ Emergency initialization successful');
        
        return {
          websocketInitialized: true,
          emergencyInit: true,
          websocketConnections: newIo.engine?.clientsCount || 0,
          timestamp: new Date().toISOString(),
          message: 'WebSocket initialized via emergency initialization'
        };
      } catch (error) {
        console.error('[DEBUG API] ❌ Emergency initialization failed:', error);
        return {
          websocketInitialized: false,
          emergencyInit: false,
          error: error.message,
          timestamp: new Date().toISOString()
        };
      }
    } else {
      return {
        websocketInitialized: false,
        emergencyInit: false,
        error: 'No HTTP server available for initialization',
        timestamp: new Date().toISOString()
      };
    }
  }
  
  return {
    websocketInitialized: true,
    emergencyInit: false,
    websocketConnections: io.engine?.clientsCount || 0,
    socketStatus: io ? 'active' : 'inactive',
    timestamp: new Date().toISOString(),
    message: 'WebSocket is running normally'
  };
});