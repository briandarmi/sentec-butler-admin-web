import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  ssr: false,
  css: ['~/assets/css/tailwind.css'],
  compatibilityDate: '2025-01-01',
  runtimeConfig: {
    public: {
      apiBaseUrl: '/api',
    },
  },
  vite: {
    plugins: [tailwindcss()],
  },
  modules: ['shadcn-nuxt', '@nuxt/fonts'],
  fonts: {
    families: [
      {
        name: 'Quicksand',
        provider: 'google',
      },
    ],
  },
  shadcn: {
    /**
     * Prefix for all the imported component.
     * @default "Ui"
     */
    prefix: '',
    /**
     * Directory that the component lives in.
     * Will respect the Nuxt aliases.
     * @link https://nuxt.com/docs/api/nuxt-config#alias
     * @default "@/components/ui"
     */
    componentDir: '@/components/ui',
  },
})