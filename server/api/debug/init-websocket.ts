export default defineEventHandler(async (event) => {
  try {
    // Check if already initialized
    const existingIo = (globalThis as any).__socket_io__;
    if (existingIo) {
      return {
        success: true,
        message: 'WebSocket already initialized',
        connections: existingIo.engine?.clientsCount || 0,
        alreadyInitialized: true
      };
    }
    
    // Get server from request
    const server = event.node.req.socket?.server;
    if (!server) {
      return {
        success: false,
        message: 'No HTTP server available for WebSocket initialization',
        error: 'SERVER_NOT_AVAILABLE'
      };
    }
    
    // Initialize WebSocket
    console.log('[INIT API] Manually initializing WebSocket...');
    const { initializeWebSocket } = await import('../../websocket/socketHandler');
    const io = initializeWebSocket(server);
    (globalThis as any).__socket_io__ = io;
    
    console.log('[INIT API] ✅ WebSocket initialized successfully');
    
    return {
      success: true,
      message: 'WebSocket initialized manually',
      connections: io.engine?.clientsCount || 0,
      alreadyInitialized: false
    };
  } catch (error) {
    console.error('[INIT API] ❌ Manual initialization failed:', error);
    return {
      success: false,
      message: 'Failed to initialize WebSocket',
      error: error.message,
      stack: error.stack
    };
  }
});