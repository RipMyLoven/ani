import type { Server as HTTPServer } from 'http'

declare module 'nitropack' {
  interface NitroRuntimeHooks {
    listen: (server: HTTPServer) => void
  }
}
