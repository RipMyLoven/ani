import { initializeWebSocket } from '../websocket/socketHandler';

export default async function websocketPlugin(nitro: any) {
  nitro.hooks.hook('listen', (server: any) => {
    console.log('Initializing WebSocket server...');
    const io = initializeWebSocket(server);
    console.log('WebSocket server initialized successfully');
  });
}