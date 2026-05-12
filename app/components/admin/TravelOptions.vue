<template>
  <div class="bg-white rounded-lg shadow">
    <div class="p-6 border-b border-gray-200">
      <h2 class="text-xl font-semibold text-gray-900 mb-4">
        Reisemöglichkeiten
      </h2>
      <div class="flex gap-2">
        <input
          v-model="newOption.name"
          type="text"
          placeholder="Reisemöglichkeit (z.B. Mitfahrgelegenheit)"
          class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ink-900 focus:border-transparent"
        />
        <button @click="addTravelOption" :disabled="loading" class="btn-lime">
          Hinzufügen
        </button>
      </div>
      <div v-if="error" class="mt-2 text-red-600 text-sm">{{ error }}</div>
    </div>

    <div class="divide-y divide-gray-200">
      <div
        v-for="option in travelOptions"
        :key="option.id"
        class="p-4 hover:bg-gray-50"
      >
        <!-- Edit mode -->
        <div v-if="editingId === option.id" class="flex gap-2 items-center">
          <input
            v-model="editForm.name"
            type="text"
            class="flex-1 px-3 py-1.5 border border-ink-300 rounded-lg focus:ring-2 focus:ring-ink-900 focus:border-transparent text-sm"
            @keyup.enter="saveEdit(option.id)"
            @keyup.escape="cancelEdit"
          />
          <button
            @click="saveEdit(option.id)"
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
          <p class="font-medium text-gray-900">{{ option.name }}</p>
          <div class="flex gap-2">
            <button
              @click="startEdit(option)"
              class="px-3 py-1 bg-ink-100 text-ink-700 rounded hover:bg-ink-200 text-sm transition"
            >
              Bearbeiten
            </button>
            <button
              @click="deleteTravelOption(option.id)"
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
      v-if="travelOptions.length === 0"
      class="p-6 text-center text-gray-500"
    >
      Keine Reisemöglichkeiten vorhanden
    </div>
  </div>
</template>

<script setup lang="ts">
import type { TravelOption } from "~/types/models";

const travelOptions = ref<TravelOption[]>([]);
const newOption = ref<Partial<TravelOption>>({ name: "" });
const loading = ref(false);
const error = ref("");
const editingId = ref<number | null>(null);
const editForm = ref({ name: "" });

const fetchTravelOptions = async () => {
  try {
    travelOptions.value = await $fetch("/api/travel-options");
  } catch (err: any) {
    error.value = err.data?.message || "Fehler beim Laden";
  }
};

const startEdit = (option: TravelOption) => {
  editingId.value = option.id;
  editForm.value = { name: option.name };
};

const cancelEdit = () => {
  editingId.value = null;
};

const saveEdit = async (id: number) => {
  if (!editForm.value.name.trim()) return;
  loading.value = true;
  error.value = "";
  try {
    const updated = await $fetch(`/api/travel-options/${id}`, {
      method: "PATCH",
      body: { name: editForm.value.name },
    });
    const idx = travelOptions.value.findIndex((t) => t.id === id);
    if (idx !== -1) travelOptions.value[idx] = updated;
    editingId.value = null;
  } catch (err: any) {
    error.value = err.data?.message || "Fehler beim Speichern";
  } finally {
    loading.value = false;
  }
};

const addTravelOption = async () => {
  if (!newOption.value.name?.trim()) return;

  loading.value = true;
  error.value = "";

  try {
    const created = await $fetch("/api/travel-options", {
      method: "POST",
      body: { name: newOption.value.name },
    });
    travelOptions.value.push(created);
    newOption.value = { name: "" };
  } catch (err: any) {
    error.value = err.data?.message || "Fehler beim Hinzufügen";
  } finally {
    loading.value = false;
  }
};

const deleteTravelOption = async (id: number) => {
  if (!confirm("Möchten Sie diese Reisemöglichkeit löschen?")) return;

  loading.value = true;
  try {
    await $fetch(`/api/travel-options/${id}`, { method: "DELETE" });
    travelOptions.value = travelOptions.value.filter((t) => t.id !== id);
  } catch (err: any) {
    error.value = err.data?.message || "Fehler beim Löschen";
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchTravelOptions();
});
</script>
