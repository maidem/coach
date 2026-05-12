<template>
  <div class="min-h-screen bg-gray-50 flex flex-col">
    <Header />

    <main class="flex-1">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
const Header = defineAsyncComponent(() => import("~/components/Header.vue"));
</script>
