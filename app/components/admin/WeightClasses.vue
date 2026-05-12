<template>
  <div class="bg-white rounded-lg shadow">
    <div class="p-6 border-b border-gray-200">
      <h2 class="text-xl font-semibold text-gray-900 mb-4">Gewichtsklassen</h2>
      <div class="flex gap-2">
        <input
          v-model="newWC.name"
          type="text"
          placeholder="Name (z.B. -50kg)"
          class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ink-900 focus:border-transparent"
        />
        <button @click="addWeightClass" :disabled="loading" class="btn-lime">
          Hinzufügen
        </button>
      </div>
      <div v-if="error" class="mt-2 text-red-600 text-sm">{{ error }}</div>
    </div>

    <div class="divide-y divide-gray-200">
      <div
        v-for="wc in weightClasses"
        :key="wc.id"
        class="p-4 hover:bg-gray-50"
      >
        <!-- Edit mode -->
        <div v-if="editingId === wc.id" class="flex gap-2 items-center">
          <input
            v-model="editForm.name"
            type="text"
            class="flex-1 px-3 py-1.5 border border-ink-300 rounded-lg focus:ring-2 focus:ring-ink-900 focus:border-transparent text-sm"
            @keyup.enter="saveEdit(wc.id)"
            @keyup.escape="cancelEdit"
          />
          <button
            @click="saveEdit(wc.id)"
            :disabled="loading"
            class="btn-lime text-xs px-3 py-1.5"
          >
            Speichern
          </button>
          <button @click="cancelEdit" class="btn-ghost text-xs px-3 py-1.5">
            Abbrechen
          </button>
        </div>
        <!-- View mode -->
        <div v-else class="flex justify-between items-center">
          <p class="font-medium text-gray-900">{{ wc.name }}</p>
          <div class="flex gap-2">
            <button
              @click="startEdit(wc)"
              class="px-3 py-1 bg-ink-100 text-ink-700 rounded hover:bg-ink-200 text-sm transition"
            >
              Bearbeiten
            </button>
            <button
              @click="deleteWeightClass(wc.id)"
              :disabled="loading"
              class="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-gray-400 text-sm transition"
            >
              Löschen
            </button>
          </div>
        </div>
      </div>
    </div>

    <div
      v-if="weightClasses.length === 0"
      class="p-6 text-center text-gray-500"
    >
      Keine Gewichtsklassen vorhanden
    </div>
  </div>
</template>

<script setup lang="ts">
import type { WeightClass } from "~/types/models";

const weightClasses = ref<WeightClass[]>([]);
const newWC = ref<Partial<WeightClass>>({ name: "" });
const loading = ref(false);
const error = ref("");
const editingId = ref<number | null>(null);
const editForm = ref({ name: "" });

const fetchWeightClasses = async () => {
  try {
    weightClasses.value = await $fetch("/api/weight-classes");
  } catch (err: any) {
    error.value = err.data?.message || "Fehler beim Laden";
  }
};

const startEdit = (wc: WeightClass) => {
  editingId.value = wc.id;
  editForm.value = { name: wc.name };
};

const cancelEdit = () => {
  editingId.value = null;
};

const saveEdit = async (id: number) => {
  if (!editForm.value.name.trim()) return;
  loading.value = true;
  error.value = "";
  try {
    const updated = await $fetch(`/api/weight-classes/${id}`, {
      method: "PATCH",
      body: { name: editForm.value.name },
    });
    const idx = weightClasses.value.findIndex((w) => w.id === id);
    if (idx !== -1) weightClasses.value[idx] = updated;
    editingId.value = null;
  } catch (err: any) {
    error.value = err.data?.message || "Fehler beim Speichern";
  } finally {
    loading.value = false;
  }
};

const addWeightClass = async () => {
  if (!newWC.value.name?.trim()) return;

  loading.value = true;
  error.value = "";

  try {
    const created = await $fetch("/api/weight-classes", {
      method: "POST",
      body: {
        name: newWC.value.name,
        min_weight: newWC.value.min_weight,
        max_weight: newWC.value.max_weight,
      },
    });
    weightClasses.value.push(created);
    newWC.value = { name: "" };
  } catch (err: any) {
    error.value = err.data?.message || "Fehler beim Hinzufügen";
  } finally {
    loading.value = false;
  }
};

const deleteWeightClass = async (id: number) => {
  if (!confirm("Möchten Sie diese Gewichtsklasse löschen?")) return;

  loading.value = true;
  try {
    await $fetch(`/api/weight-classes/${id}`, { method: "DELETE" });
    weightClasses.value = weightClasses.value.filter((w) => w.id !== id);
  } catch (err: any) {
    error.value = err.data?.message || "Fehler beim Löschen";
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchWeightClasses();
});
</script>
