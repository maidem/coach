<template>
  <div class="bg-white rounded-lg shadow">
    <div class="p-6 border-b border-gray-200">
      <h2 class="text-xl font-semibold text-gray-900 mb-4">Ausstattung</h2>
      <div class="flex gap-2">
        <input
          v-model="newEquipment.name"
          type="text"
          placeholder="z.B. Daedo"
          class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ink-900 focus:border-transparent"
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
        class="p-4 hover:bg-gray-50"
      >
        <!-- Edit mode -->
        <div v-if="editingId === item.id" class="flex gap-2 items-center">
          <input
            v-model="editForm.name"
            type="text"
            class="flex-1 px-3 py-1.5 border border-ink-300 rounded-lg focus:ring-2 focus:ring-ink-900 focus:border-transparent text-sm"
            @keyup.enter="saveEdit(item.id)"
            @keyup.escape="cancelEdit"
          />
          <button
            @click="saveEdit(item.id)"
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
          <p class="font-medium text-gray-900">{{ item.name }}</p>
          <div class="flex gap-2">
            <button
              @click="startEdit(item)"
              class="px-3 py-1 bg-ink-100 text-ink-700 rounded hover:bg-ink-200 text-sm transition"
            >
              Bearbeiten
            </button>
            <button
              @click="deleteEquipment(item.id)"
              :disabled="loading"
              class="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-gray-400 text-sm transition"
            >
              Löschen
            </button>
          </div>
        </div>
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
const editingId = ref<number | null>(null);
const editForm = ref({ name: "" });

const fetchEquipment = async () => {
  try {
    equipment.value = await $fetch("/api/equipment");
  } catch (err: any) {
    error.value = err.data?.message || "Fehler beim Laden";
  }
};

const startEdit = (item: Equipment) => {
  editingId.value = item.id;
  editForm.value = { name: item.name };
};

const cancelEdit = () => {
  editingId.value = null;
};

const saveEdit = async (id: number) => {
  if (!editForm.value.name.trim()) return;
  loading.value = true;
  error.value = "";
  try {
    const updated = await $fetch(`/api/equipment/${id}`, {
      method: "PATCH",
      body: { name: editForm.value.name },
    });
    const idx = equipment.value.findIndex((e) => e.id === id);
    if (idx !== -1) equipment.value[idx] = updated;
    editingId.value = null;
  } catch (err: any) {
    error.value = err.data?.message || "Fehler beim Speichern";
  } finally {
    loading.value = false;
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
