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
      <div v-for="belt in belts" :key="belt.id" class="p-4 hover:bg-gray-50">
        <!-- Edit mode -->
        <div v-if="editingId === belt.id" class="flex gap-2 items-center">
          <input
            v-model="editForm.name"
            type="text"
            class="flex-1 px-3 py-1.5 border border-ink-300 rounded-lg focus:ring-2 focus:ring-ink-900 focus:border-transparent text-sm"
            @keyup.enter="saveEdit(belt.id)"
            @keyup.escape="cancelEdit"
          />
          <button
            @click="saveEdit(belt.id)"
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
          <p class="font-medium text-gray-900">{{ belt.name }}</p>
          <div class="flex gap-2">
            <button
              @click="startEdit(belt)"
              class="px-3 py-1 bg-ink-100 text-ink-700 rounded hover:bg-ink-200 text-sm transition"
            >
              Bearbeiten
            </button>
            <button
              @click="deleteBelt(belt.id)"
              :disabled="loading"
              class="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-gray-400 text-sm transition"
            >
              Löschen
            </button>
          </div>
        </div>
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
const editingId = ref<number | null>(null);
const editForm = ref({ name: "" });

const fetchBelts = async () => {
  try {
    belts.value = await $fetch("/api/belts");
  } catch (err: any) {
    error.value = err.data?.message || "Fehler beim Laden der Gürtelgrade";
  }
};

const startEdit = (belt: Belt) => {
  editingId.value = belt.id;
  editForm.value = { name: belt.name };
};

const cancelEdit = () => {
  editingId.value = null;
};

const saveEdit = async (id: number) => {
  if (!editForm.value.name.trim()) return;
  loading.value = true;
  error.value = "";
  try {
    const belt = belts.value.find((b) => b.id === id)!;
    const updated = await $fetch(`/api/belts/${id}`, {
      method: "PATCH",
      body: { name: editForm.value.name, order: belt.order },
    });
    const idx = belts.value.findIndex((b) => b.id === id);
    if (idx !== -1) belts.value[idx] = updated;
    editingId.value = null;
  } catch (err: any) {
    error.value = err.data?.message || "Fehler beim Speichern";
  } finally {
    loading.value = false;
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
