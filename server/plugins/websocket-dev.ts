export default defineNitroPlugin(async (nitroApp) => {
  console.log('[WEBSOCKET DEV] Plugin loaded');
  
  // For development, we need to wait for the dev server
  if (process.dev) {
    console.log('[WEBSOCKET DEV] Development mode detected');
    
    // Try multiple initialization strategies
    const initStrategies = [
      () => tryInitFromGlobalNitro(),
      () => tryInitFromProcess(),
      () => tryInitFromTimeout()
    ];
    
    for (const strategy of initStrategies) {
      try {
        const success = await strategy();
        if (success) break;
      } catch (error) {
        console.log('[WEBSOCKET DEV] Strategy failed, trying next...');
      }
    }
  }
  
  // Regular listen hook
  nitroApp.hooks.hook('listen', async (server) => {
    if ((globalThis as any).__socket_io__) {
      console.log('[WEBSOCKET DEV] WebSocket already initialized');
      return;
    }
    
    if (server) {
      console.log('[WEBSOCKET DEV] Initializing via listen hook');
      await initializeSocket(server);
    }
  });
});

async function tryInitFromGlobalNitro() {
  console.log('[WEBSOCKET DEV] Trying init from global nitro');
  
  return new Promise((resolve) => {
    const checkNitro = () => {
      const nitro = (globalThis as any).__nitro__;
      if (nitro?.httpServer) {
        console.log('[WEBSOCKET DEV] Found nitro httpServer');
        initializeSocket(nitro.httpServer);
        resolve(true);
        return true;
      }
      return false;
    };
    
    if (checkNitro()) return;
    
    // Check every 500ms for up to 10 seconds
    const interval = setInterval(() => {
      if (checkNitro()) {
        clearInterval(interval);
      }
    }, 500);
    
    setTimeout(() => {
      clearInterval(interval);
      resolve(false);
    }, 10000);
  });
}

async function tryInitFromProcess() {
  console.log('[WEBSOCKET DEV] Trying init from process');
  
  // Check if we can access the HTTP server through process
  const server = (process as any).server;
  if (server) {
    console.log('[WEBSOCKET DEV] Found process server');
    await initializeSocket(server);
    return true;
  }
  
  return false;
}

async function tryInitFromTimeout() {
  console.log('[WEBSOCKET DEV] Trying init from timeout strategy');
  
  return new Promise((resolve) => {
    setTimeout(async () => {
      try {
        // Create our own HTTP server as fallback
        const { createServer } = await import('http');
        const server = createServer();
        
        server.listen(0, () => {
          console.log('[WEBSOCKET DEV] Created fallback server');
          initializeSocket(server);
          resolve(true);
        });
      } catch (error) {
        console.error('[WEBSOCKET DEV] Fallback server creation failed:', error);
        resolve(false);
      }
    }, 3000);
  });
}

async function initializeSocket(server: any) {
  try {
    if ((globalThis as any).__socket_io__) {
      console.log('[WEBSOCKET DEV] Socket already initialized');
      return;
    }
    
    const { initializeWebSocket } = await import('../websocket/socketHandler');
    const io = initializeWebSocket(server);
    (globalThis as any).__socket_io__ = io;
    console.log('[WEBSOCKET DEV] ✅ WebSocket initialized successfully');
  } catch (error) {
    console.error('[WEBSOCKET DEV] ❌ Socket initialization failed:', error);
  }
}