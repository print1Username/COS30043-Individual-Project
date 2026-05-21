import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createVuetify } from 'vuetify'
import { aliases, mdi } from 'vuetify/iconsets/mdi'

import App from './App.vue'
import router from './router'

import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css'

const vuetify = createVuetify({
  theme: {
    defaultTheme: 'vueDark',
    themes: {
      vueDark: {
        dark: true,
        colors: {
          background: '#101613',
          surface: '#18211d',
          'surface-bright': '#23342c',
          'surface-variant': '#2a3d34',
          primary: '#42b883',
          'primary-darken-1': '#33a06f',
          secondary: '#35495e',
          error: '#ff6b6b',
          info: '#64b5f6',
          success: '#42b883',
          warning: '#ffc857',
        },
      },
    },
  },
  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: {
      mdi,
    },
  },
})

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(vuetify)

app.mount('#app')
