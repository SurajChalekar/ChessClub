<template>
  <div id="app">
    <!-- ✅ Navbar Control -->
    <template v-if="route.meta.specialNavbar">
      <!-- Desktop → show SpecialNavbar -->
      <SpecialNavbar v-show="route.meta.specialNavbar && !isMobile" />
      <NavigationMenu v-show="!route.meta.specialNavbar || isMobile" />

    </template>

    <!-- Normal routes -->
    <template v-else>
      <NavigationMenu />
    </template>

    <main class="main-content">
      <RouterView />
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import NavigationMenu from './components/NavigationMenu.vue'
import SpecialNavbar from './components/NavigationPuzzle.vue'

const route = useRoute()
const isMobile = ref(window.innerWidth <= 768)

const handleResize = () => {
  isMobile.value = window.innerWidth <= 768
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
})
onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>


<style>
#app {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  margin: 0;
  padding: 0;
}

.main-content {
  padding-top: 76px; /* Space for fixed navbar */
  min-height: calc(100vh - 76px);
}

/* Global dark theme */
body {
  background-color: #0f1419;
  color: #ffffff;
}

html {
  scroll-behavior: smooth;
}
</style>
