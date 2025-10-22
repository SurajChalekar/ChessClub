import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

// Firebase
import { auth } from './firebase'
import { onAuthStateChanged } from 'firebase/auth'

// Import Bootstrap & FontAwesome
import '@fortawesome/fontawesome-free/css/all.css'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import 'bootstrap'
import * as bootstrap from 'bootstrap' 
window.bootstrap = bootstrap
// Only mount app after checking auth state
let app

onAuthStateChanged(auth, (user) => {
  if (!app) {
    app = createApp(App)
      .use(router)
      .mount('#app')
  }

})
