export default defineNuxtConfig({
  components: [
    { path: '~/components/burgercomponents' },
    { path: '~/pages/chat/components' },
    { path: '~/pages/notification/components' },
    { path: '~/pages/home/components' },
    { path: '~/pages/index/components' },
    { path: '~/pages/login/components' },
    { path: '~/pages/register/components' },
    '~/components' 
  ],
  build: {
    transpile: ['trpc-nuxt']
  },
  modules: [
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt',
    '@pinia-plugin-persistedstate/nuxt' 
  ],
  
  tailwindcss: {
    configPath: '~/tailwind.config.js',
    exposeConfig: true,
    cssPath: '~/public/assets/css/tailwind.css'
  },

  css: [
    '~/public/assets/css/global.css',
  ],

  compatibilityDate: '2024-08-11',

  nitro: {
    plugins: [
      '~/server/plugins/websocket.ts'
    ],
    experimental: {
      wasm: true
    }
  },
  
  // Ensure development server setup
  devServer: {
    port: 3000
  },
  
  // Add this to ensure proper server-side handling
  runtimeConfig: {
    public: {
      socketUrl: process.env.SOCKET_URL || 'http://localhost:3000'
    }
  },

  // Pinia persistedstate configuration
  piniaPersistedstate: {
    storage: 'localStorage',
    debug: false
  },

  // SSR configuration
  ssr: true,
  
  experimental: {
    payloadExtraction: false
  }
})
