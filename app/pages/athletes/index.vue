<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header mit Zurück Button -->
      <div class="flex justify-between items-center mb-6 flex-wrap gap-4">
        <div class="flex items-center gap-3 flex-wrap">
          <NuxtLink
            to="/"
            class="inline-flex items-center gap-2 px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 font-medium transition text-sm"
          >
            ← Zurück
          </NuxtLink>
          <h1 class="text-xl sm:text-3xl font-bold text-gray-900">
            Athletenverwaltung
          </h1>
        </div>
        <button @click="showForm = true" class="btn-lime">Neuer Athlet</button>
      </div>
      <!-- Search/Filter -->
      <div class="mb-6 flex gap-4">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Nach Name suchen..."
          class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <!-- Loading -->
      <div v-if="loading" class="text-center py-8">
        <p class="text-gray-600">Laden...</p>
      </div>

      <!-- Athletes Grid - Mobile Responsive -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          v-for="athlete in filteredAthletes"
          :key="athlete.id"
          @click="selectAthlete(athlete)"
          class="bg-white rounded-lg shadow hover:shadow-lg cursor-pointer transition p-4 border-l-4 border-[color:var(--color-lime-vivid)]"
        >
          <div class="flex items-center gap-3">
            <img
              v-if="athlete.photo"
              :src="athlete.photo"
              class="h-10 w-10 rounded-full object-cover flex-shrink-0"
              alt=""
            />
            <div
              v-else
              class="h-10 w-10 rounded-full bg-ink-100 flex items-center justify-center text-lg flex-shrink-0"
            >
              👤
            </div>
            <h3 class="font-semibold text-lg text-ink-900">
              {{ athlete.first_name }} {{ athlete.last_name }}
            </h3>
          </div>
          <div class="mt-2 space-y-1 text-sm text-gray-600">
            <p v-if="athlete.belt_name">
              <span class="font-medium">Gürtel:</span> {{ athlete.belt_name }}
            </p>
            <p v-if="athlete.weight_class_name">
              <span class="font-medium">Gewicht:</span>
              {{ athlete.weight_class_name }}
            </p>
            <p v-if="athlete.group_name">
              <span class="font-medium">Gruppe:</span> {{ athlete.group_name }}
            </p>
            <p v-if="athlete.competition_name">
              <span class="font-medium">Wettkampf:</span>
              {{ athlete.competition_name }}
            </p>
            <div class="flex gap-4 mt-2 pt-2 border-t border-gray-200">
              <span
                :class="[
                  'px-2 py-1 rounded text-xs font-medium',
                  athlete.entry_fee_paid
                    ? 'bg-green-100 text-green-800'
                    : 'bg-yellow-100 text-yellow-800',
                ]"
              >
                Startgebühr: {{ athlete.entry_fee_paid ? "Ja" : "Nein" }}
              </span>
              <span
                :class="[
                  'px-2 py-1 rounded text-xs font-medium',
                  athlete.overnight_stay
                    ? 'bg-[color:var(--color-lime-soft)] text-[color:var(--color-lime-deep)]'
                    : 'bg-gray-100 text-gray-800',
                ]"
              >
                Übernachtung: {{ athlete.overnight_stay ? "Ja" : "Nein" }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="!loading && athletes.length === 0" class="text-center py-12">
        <p class="text-gray-500">Noch keine Athleten vorhanden</p>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <AthletesAthleteFormModal
      v-if="showForm"
      :athlete="selectedAthlete"
      @close="closeForm"
      @save="onSaveAthlete"
    />

    <!-- Detail Modal -->
    <AthletesAthleteDetailModal
      v-if="showDetail"
      :athlete="selectedAthlete"
      @close="showDetail = false"
      @edit="openEdit"
      @delete="onDeleteAthlete"
    />
  </div>
</template>

<script setup lang="ts">
import type { Athlete } from "~/types/models";

definePageMeta({
  middleware: "admin",
});

const athletes = ref<Athlete[]>([]);
const selectedAthlete = ref<Athlete | null>(null);
const showForm = ref(false);
const showDetail = ref(false);
const loading = ref(true);
const searchQuery = ref("");

const filteredAthletes = computed(() => {
  if (!searchQuery.value) return athletes.value;
  const q = searchQuery.value.toLowerCase();
  return athletes.value.filter((a) => a.name.toLowerCase().includes(q));
});

const fetchAthletes = async () => {
  try {
    loading.value = true;
    athletes.value = await $fetch("/api/athletes");
  } catch (err: any) {
    console.error("Fehler beim Laden der Athleten:", err);
  } finally {
    loading.value = false;
  }
};

const selectAthlete = (athlete: Athlete) => {
  selectedAthlete.value = athlete;
  showDetail.value = true;
};

const openEdit = () => {
  showDetail.value = false;
  showForm.value = true;
};

const closeForm = () => {
  showForm.value = false;
  selectedAthlete.value = null;
};

const onSaveAthlete = async () => {
  closeForm();
  await fetchAthletes();
};

const onDeleteAthlete = async () => {
  showDetail.value = false;
  await fetchAthletes();
};

onMounted(() => {
  fetchAthletes();
});
</script>
