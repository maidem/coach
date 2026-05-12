<template>
  <div class="bg-white rounded-lg shadow">
    <div class="p-6 border-b border-gray-200">
      <h2 class="text-xl font-semibold text-gray-900 mb-4">Ausstattung</h2>
      <div class="flex gap-2">
        <input
          v-model="newEquipment.name"
          type="text"
          placeholder="z.B. Daedo"
          class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <button @click="addEquipment" :disabled="loading" class="btn-lime">
          Hinzufügen
        </button>
      </div>
      <div v-if="error" class="mt-2 text-red-600 text-sm">{{ error }}</div>
    </div>

    <div class="divide-y divide-gray-200">
      <div
        v-for="item in equipment"
        :key="item.id"
        class="p-4 flex justify-between items-center hover:bg-gray-50"
      >
        <p class="font-medium text-gray-900">{{ item.name }}</p>
        <button
          @click="deleteEquipment(item.id)"
          :disabled="loading"
          class="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-gray-400 text-sm transition"
        >
          Löschen
        </button>
      </div>
    </div>

    <div v-if="equipment.length === 0" class="p-6 text-center text-gray-500">
      Keine Ausstattung vorhanden
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Equipment } from "~/types/models";

const equipment = ref<Equipment[]>([]);
const newEquipment = ref<Partial<Equipment>>({ name: "" });
const loading = ref(false);
const error = ref("");

const fetchEquipment = async () => {
  try {
    equipment.value = await $fetch("/api/equipment");
  } catch (err: any) {
    error.value = err.data?.message || "Fehler beim Laden";
  }
};

const addEquipment = async () => {
  if (!newEquipment.value.name?.trim()) return;

  loading.value = true;
  error.value = "";

  try {
    const created = await $fetch("/api/equipment", {
      method: "POST",
      body: { name: newEquipment.value.name },
    });
    equipment.value.push(created);
    newEquipment.value = { name: "" };
  } catch (err: any) {
    error.value = err.data?.message || "Fehler beim Hinzufügen";
  } finally {
    loading.value = false;
  }
};

const deleteEquipment = async (id: number) => {
  if (!confirm("Möchten Sie diese Ausstattung löschen?")) return;

  loading.value = true;
  try {
    await $fetch(`/api/equipment/${id}`, { method: "DELETE" });
    equipment.value = equipment.value.filter((e) => e.id !== id);
  } catch (err: any) {
    error.value = err.data?.message || "Fehler beim Löschen";
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchEquipment();
});
</script>
