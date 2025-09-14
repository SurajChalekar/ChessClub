<template>
  <div id="app">
    <NavigationMenu />
    <main class="main-content">
      <RouterView />
    </main>
  </div>
</template>

<script setup>
import NavigationMenu from './components/NavigationMenu.vue'
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
