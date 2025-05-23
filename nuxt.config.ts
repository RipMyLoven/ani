export default defineNuxtConfig({
  components: [
    { path: '~/components/burgercomponents' },

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
})
