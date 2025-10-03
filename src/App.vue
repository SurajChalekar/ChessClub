<template>
  <div id="app">
    <!-- Show SpecialNavbar only on Puzzle route -->
    <SpecialNavbar v-if="route.meta.specialNavbar" />
    <NavigationMenu v-else />

    <main class="main-content">
      <RouterView />
    </main>
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router'
import NavigationMenu from './components/NavigationMenu.vue'
import SpecialNavbar from './components/NavigationPuzzle.vue'

const route = useRoute()
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
