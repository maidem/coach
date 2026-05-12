<template>
  <div class="bg-white rounded-lg shadow">
    <div class="p-6 border-b border-gray-200">
      <h2 class="text-xl font-semibold text-gray-900 mb-4">Gürtelgrade</h2>
      <div class="flex gap-2">
        <input
          v-model="newBelt.name"
          type="text"
          placeholder="Name des Gürtels"
          class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ink-900 focus:border-transparent"
        />
        <button @click="addBelt" :disabled="loading" class="btn-lime">
          Hinzufügen
        </button>
      </div>
      <div v-if="error" class="mt-2 text-red-600 text-sm">{{ error }}</div>
    </div>

    <div class="divide-y divide-gray-200">
      <div
        v-for="belt in belts"
        :key="belt.id"
        class="p-4 flex justify-between items-center hover:bg-gray-50"
      >
        <div>
          <p class="font-medium text-gray-900">{{ belt.name }}</p>
        </div>
        <button
          @click="deleteBelt(belt.id)"
          :disabled="loading"
          class="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-gray-400 text-sm transition"
        >
          Löschen
        </button>
      </div>
    </div>

    <div v-if="belts.length === 0" class="p-6 text-center text-gray-500">
      Keine Gürtelgrade vorhanden
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Belt } from "~/types/models";

const belts = ref<Belt[]>([]);
const newBelt = ref({ name: "", order: 0 });
const loading = ref(false);
const error = ref("");

const fetchBelts = async () => {
  try {
    belts.value = await $fetch("/api/belts");
  } catch (err: any) {
    error.value = err.data?.message || "Fehler beim Laden der Gürtelgrade";
  }
};

const addBelt = async () => {
  if (!newBelt.value.name.trim()) return;

  loading.value = true;
  error.value = "";

  try {
    const created = await $fetch("/api/belts", {
      method: "POST",
      body: { name: newBelt.value.name, order: newBelt.value.order },
    });
    belts.value.push(created);
    belts.value.sort(
      (a, b) => a.order - b.order || a.name.localeCompare(b.name),
    );
    newBelt.value = { name: "", order: 0 };
  } catch (err: any) {
    error.value = err.data?.message || "Fehler beim Hinzufügen";
  } finally {
    loading.value = false;
  }
};

const deleteBelt = async (id: number) => {
  if (!confirm("Möchten Sie diesen Gürtelgrad löschen?")) return;

  loading.value = true;
  try {
    await $fetch(`/api/belts/${id}`, { method: "DELETE" });
    belts.value = belts.value.filter((b) => b.id !== id);
  } catch (err: any) {
    error.value = err.data?.message || "Fehler beim Löschen";
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchBelts();
});
</script>
