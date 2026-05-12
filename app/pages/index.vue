<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <!-- Admin Verwaltung Card -->
        <NuxtLink
          to="/admin"
          class="bg-white rounded-lg shadow-md hover:shadow-lg transition p-6 border-l-4 border-[color:var(--color-lime-vivid)] cursor-pointer group"
        >
          <div class="flex items-start">
            <div>
              <h2
                class="text-xl font-semibold text-ink-900 group-hover:text-[color:var(--color-lime-deep)]"
              >
                Admin Verwaltung
              </h2>
              <p class="text-gray-600 text-sm mt-1">
                Gürtelgrade, Gewichtsklassen, Gruppen, Wettkämpfe, Reisen,
                Ausstattung
              </p>
            </div>
          </div>
          <div
            class="mt-4 text-[color:var(--color-lime-deep)] font-medium group-hover:translate-x-1 transition"
          >
            Verwalten →
          </div>
        </NuxtLink>

        <!-- Athleten Card -->
        <NuxtLink
          to="/athletes"
          class="bg-white rounded-lg shadow-md hover:shadow-lg transition p-6 border-l-4 border-[color:var(--color-lime-vivid)] cursor-pointer group"
        >
          <div class="flex items-start">
            <div>
              <h2
                class="text-xl font-semibold text-ink-900 group-hover:text-[color:var(--color-lime-deep)]"
              >
                Athleten
              </h2>
              <p class="text-gray-600 text-sm mt-1">
                Athletenprofile erstellen und verwalten
              </p>
            </div>
          </div>
          <div
            class="mt-4 text-[color:var(--color-lime-deep)] font-medium group-hover:translate-x-1 transition"
          >
            Verwalten →
          </div>
        </NuxtLink>

        <!-- Statistiken Card -->
        <div
          class="bg-white rounded-lg shadow-md p-6 border-l-4 border-[color:var(--color-lime-vivid)]"
        >
          <div class="flex items-start">
            <div>
              <h2 class="text-xl font-semibold text-gray-900">Statistiken</h2>
              <div class="mt-4 space-y-2 text-sm">
                <p class="text-gray-600">
                  <span class="font-semibold text-gray-900">{{
                    stats.athletes
                  }}</span>
                  Athleten
                </p>
                <p class="text-gray-600">
                  <span class="font-semibold text-gray-900">{{
                    stats.entryFeePaid
                  }}</span>
                  Startgebühren bezahlt
                </p>
                <p class="text-gray-600">
                  <span class="font-semibold text-gray-900">{{
                    stats.overnightStays
                  }}</span>
                  Übernachtungen
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Athlete } from "~/types/models";

const { state: auth } = useAuth();
const stats = ref({
  athletes: 0,
  entryFeePaid: 0,
  overnightStays: 0,
});

const loadStats = async () => {
  try {
    const athletes = await $fetch<Athlete[]>("/api/athletes");
    stats.value.athletes = athletes.length;
    stats.value.entryFeePaid = athletes.filter((a) => a.entry_fee_paid).length;
    stats.value.overnightStays = athletes.filter(
      (a) => a.overnight_stay,
    ).length;
  } catch (err) {
    console.error("Fehler beim Laden der Statistiken:", err);
  }
};

onMounted(() => {
  if (!auth.value.isAdmin) {
    navigateTo("/login");
  }
  loadStats();
});
</script>
