<template>
  <header
    class="sticky top-0 z-30 backdrop-blur-md bg-white/70 border-b border-ink-200 shadow-sm"
  >
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-16">
        <!-- Logo/Title -->
        <div class="flex items-center gap-4">
          <NuxtLink
            to="/"
            class="flex items-center gap-2 hover:opacity-80 transition"
          >
            <img
              src="~/assets/images/logo_axel_mueller_taekwondo_schwarz_transparent.webp"
              alt="Taekwondo Müller Logo"
              class="h-12 w-auto"
            />
          </NuxtLink>
        </div>

        <!-- Navigation -->
        <nav class="flex items-center gap-1 sm:gap-2">
          <NuxtLink
            to="/admin"
            :class="[
              'px-3 py-2 rounded-xl text-sm font-medium transition-all duration-150',
              isActive('/admin')
                ? 'bg-ink-900 text-white'
                : 'text-ink-700 hover:bg-ink-100',
            ]"
          >
            <span class="hidden sm:inline">Admin</span>
            <span class="sm:hidden">⚙️</span>
          </NuxtLink>

          <NuxtLink
            to="/athletes"
            :class="[
              'px-3 py-2 rounded-xl text-sm font-medium transition-all duration-150',
              isActive('/athletes')
                ? 'bg-ink-900 text-white'
                : 'text-ink-700 hover:bg-ink-100',
            ]"
          >
            <span class="hidden sm:inline">Athleten</span>
            <span class="sm:hidden">👥</span>
          </NuxtLink>

          <NuxtLink
            to="/"
            :class="[
              'px-3 py-2 rounded-xl text-sm font-medium transition-all duration-150',
              isActive('/')
                ? 'bg-ink-900 text-white'
                : 'text-ink-700 hover:bg-ink-100',
            ]"
          >
            <span class="hidden sm:inline">Übersicht</span>
            <span class="sm:hidden">📊</span>
          </NuxtLink>

          <button @click="logout" class="btn-ghost text-sm ml-2">
            <span class="hidden sm:inline">Logout</span>
            <span class="sm:hidden">🚪</span>
          </button>
        </nav>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
const router = useRouter();

const isActive = (path: string) => {
  return router.currentRoute.value.path === path;
};

const logout = async () => {
  try {
    await $fetch("/api/auth/logout", { method: "POST" });
    await navigateTo("/login");
  } catch (err) {
    console.error("Logout fehler:", err);
  }
};
</script>
