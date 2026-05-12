<template>
  <div class="bg-white rounded-lg shadow">
    <div class="p-6 border-b border-gray-200">
      <h2 class="text-xl font-semibold text-gray-900 mb-4">Wettkämpfe</h2>
      <div class="space-y-2">
        <input
          v-model="newComp.name"
          type="text"
          placeholder="Wettkampfname"
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <input
          v-model="newComp.date"
          type="date"
          placeholder="Datum"
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <input
          v-model="newComp.tournament_link"
          type="url"
          placeholder="Link zum Turnier (optional)"
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <button @click="addCompetition" :disabled="loading" class="btn-lime">
          Hinzufügen
        </button>
      </div>
      <div v-if="error" class="mt-2 text-red-600 text-sm">{{ error }}</div>
    </div>

    <div class="divide-y divide-gray-200">
      <div
        v-for="comp in competitions"
        :key="comp.id"
        class="p-4 flex justify-between items-start hover:bg-gray-50 gap-4"
      >
        <div class="flex-1">
          <p class="font-medium text-gray-900">{{ comp.name }}</p>
          <p v-if="comp.date" class="text-sm text-gray-600">
            {{ formatDate(comp.date) }}
          </p>
          <a
            v-if="comp.tournament_link"
            :href="comp.tournament_link"
            target="_blank"
            class="text-sm text-[color:var(--color-lime-deep)] hover:underline"
          >
            Turnier Link
          </a>
        </div>
        <button
          @click="deleteCompetition(comp.id)"
          :disabled="loading"
          class="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-gray-400 text-sm transition"
        >
          Löschen
        </button>
      </div>
    </div>

    <div v-if="competitions.length === 0" class="p-6 text-center text-gray-500">
      Keine Wettkämpfe vorhanden
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Competition } from "~/types/models";

const competitions = ref<Competition[]>([]);
const newComp = ref<Partial<Competition>>({
  name: "",
  tournament_link: "",
  date: "",
});
const loading = ref(false);
const error = ref("");

const formatDate = (dateStr: string) => {
  try {
    const date = new Date(dateStr + "T00:00:00");
    return date.toLocaleDateString("de-DE", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
};

const fetchCompetitions = async () => {
  try {
    competitions.value = await $fetch("/api/competitions");
  } catch (err: any) {
    error.value = err.data?.message || "Fehler beim Laden";
  }
};

const addCompetition = async () => {
  if (!newComp.value.name?.trim()) return;

  loading.value = true;
  error.value = "";

  try {
    const created = await $fetch("/api/competitions", {
      method: "POST",
      body: {
        name: newComp.value.name,
        tournament_link: newComp.value.tournament_link || null,
        date: newComp.value.date || null,
      },
    });
    competitions.value.push(created);
    newComp.value = { name: "", tournament_link: "", date: "" };
  } catch (err: any) {
    error.value = err.data?.message || "Fehler beim Hinzufügen";
  } finally {
    loading.value = false;
  }
};

const deleteCompetition = async (id: number) => {
  if (!confirm("Möchten Sie diesen Wettkampf löschen?")) return;

  loading.value = true;
  try {
    await $fetch(`/api/competitions/${id}`, { method: "DELETE" });
    competitions.value = competitions.value.filter((c) => c.id !== id);
  } catch (err: any) {
    error.value = err.data?.message || "Fehler beim Löschen";
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchCompetitions();
});
</script>
