<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Zurück Button -->
      <div class="mb-6 flex flex-wrap items-center gap-3">
        <NuxtLink
          to="/"
          class="inline-flex items-center gap-2 px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 font-medium transition text-sm"
        >
          ← Zurück
        </NuxtLink>
        <h1 class="text-xl sm:text-3xl font-bold text-gray-900">Admin – Verwaltung</h1>
      </div>
      <div class="flex flex-wrap gap-2 mb-6 overflow-x-auto">
        <button
          @click="activeTab = 'belts'"
          :class="[
            'px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-sm font-medium transition whitespace-nowrap',
            activeTab === 'belts'
              ? 'bg-ink-900 text-white'
              : 'bg-ink-100 text-ink-700 hover:bg-ink-200',
          ]"
        >
          Gürtelgrade
        </button>
        <button
          @click="activeTab = 'weight-classes'"
          :class="[
            'px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-sm font-medium transition whitespace-nowrap',
            activeTab === 'weight-classes'
              ? 'bg-ink-900 text-white'
              : 'bg-ink-100 text-ink-700 hover:bg-ink-200',
          ]"
        >
          Gewichtsklassen
        </button>
        <button
          @click="activeTab = 'groups'"
          :class="[
            'px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-sm font-medium transition whitespace-nowrap',
            activeTab === 'groups'
              ? 'bg-ink-900 text-white'
              : 'bg-ink-100 text-ink-700 hover:bg-ink-200',
          ]"
        >
          Gruppen
        </button>
        <button
          @click="activeTab = 'competitions'"
          :class="[
            'px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-sm font-medium transition whitespace-nowrap',
            activeTab === 'competitions'
              ? 'bg-ink-900 text-white'
              : 'bg-ink-100 text-ink-700 hover:bg-ink-200',
          ]"
        >
          Wettkämpfe
        </button>
        <button
          @click="activeTab = 'travel-options'"
          :class="[
            'px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-sm font-medium transition whitespace-nowrap',
            activeTab === 'travel-options'
              ? 'bg-ink-900 text-white'
              : 'bg-ink-100 text-ink-700 hover:bg-ink-200',
          ]"
        >
          Reisen
        </button>
        <button
          @click="activeTab = 'equipment'"
          :class="[
            'px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-sm font-medium transition whitespace-nowrap',
            activeTab === 'equipment'
              ? 'bg-ink-900 text-white'
              : 'bg-ink-100 text-ink-700 hover:bg-ink-200',
          ]"
        >
          Ausstattung
        </button>
      </div>

      <!-- Belts Tab -->
      <div v-if="activeTab === 'belts'" class="space-y-4">
        <AdminBelts />
      </div>

      <!-- Weight Classes Tab -->
      <div v-if="activeTab === 'weight-classes'" class="space-y-4">
        <AdminWeightClasses />
      </div>

      <!-- Groups Tab -->
      <div v-if="activeTab === 'groups'" class="space-y-4">
        <AdminGroups />
      </div>

      <!-- Competitions Tab -->
      <div v-if="activeTab === 'competitions'" class="space-y-4">
        <AdminCompetitions />
      </div>

      <!-- Travel Options Tab -->
      <div v-if="activeTab === 'travel-options'" class="space-y-4">
        <AdminTravelOptions />
      </div>

      <!-- Equipment Tab -->
      <div v-if="activeTab === 'equipment'" class="space-y-4">
        <AdminEquipment />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: "admin",
});

const activeTab = ref<
  | "belts"
  | "weight-classes"
  | "groups"
  | "competitions"
  | "travel-options"
  | "equipment"
>("belts");

const AdminBelts = defineAsyncComponent(
  () => import("~/components/admin/Belts.vue"),
);
const AdminWeightClasses = defineAsyncComponent(
  () => import("~/components/admin/WeightClasses.vue"),
);
const AdminGroups = defineAsyncComponent(
  () => import("~/components/admin/Groups.vue"),
);
const AdminCompetitions = defineAsyncComponent(
  () => import("~/components/admin/Competitions.vue"),
);
const AdminTravelOptions = defineAsyncComponent(
  () => import("~/components/admin/TravelOptions.vue"),
);
const AdminEquipment = defineAsyncComponent(
  () => import("~/components/admin/Equipment.vue"),
);
</script>
