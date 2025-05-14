export default defineNuxtConfig({
  components: [
    { path: '~/components/UI' },
    '~/components' 
  ],
  build: {
    transpile: ['trpc-nuxt']
  },
  modules: [
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt', 
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

  app: {
    head: {
      script: [
        {
          src: 'https://telegram.org/js/telegram-web-app.js',
          async: true,
          defer: true
        }
      ],
      meta: [
        {
          name: 'viewport',
          content: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no'
        }
      ]
    }
  }
})