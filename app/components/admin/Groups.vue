<template>
  <div class="bg-white rounded-lg shadow">
    <div class="p-6 border-b border-gray-200">
      <h2 class="text-xl font-semibold text-gray-900 mb-4">Gruppen</h2>
      <div class="space-y-2">
        <input
          v-model="newGroup.name"
          type="text"
          placeholder="Gruppenname"
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <textarea
          v-model="newGroup.description"
          placeholder="Beschreibung (Altersklasse)"
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ink-900 focus:border-transparent"
          rows="2"
        ></textarea>
        <button @click="addGroup" :disabled="loading" class="btn-lime">
          Hinzufügen
        </button>
      </div>
      <div v-if="error" class="mt-2 text-red-600 text-sm">{{ error }}</div>
    </div>

    <div class="divide-y divide-gray-200">
      <div
        v-for="group in groups"
        :key="group.id"
        class="p-4 flex justify-between items-center hover:bg-gray-50"
      >
        <div>
          <p class="font-medium text-gray-900">{{ group.name }}</p>
          <p v-if="group.description" class="text-sm text-gray-600">
            {{ group.description }}
          </p>
        </div>
        <button
          @click="deleteGroup(group.id)"
          :disabled="loading"
          class="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-gray-400 text-sm transition"
        >
          Löschen
        </button>
      </div>
    </div>

    <div v-if="groups.length === 0" class="p-6 text-center text-gray-500">
      Keine Gruppen vorhanden
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Group } from "~/types/models";

const groups = ref<Group[]>([]);
const newGroup = ref<Partial<Group>>({ name: "", description: "" });
const loading = ref(false);
const error = ref("");

const fetchGroups = async () => {
  try {
    groups.value = await $fetch("/api/groups");
  } catch (err: any) {
    error.value = err.data?.message || "Fehler beim Laden";
  }
};

const addGroup = async () => {
  if (!newGroup.value.name?.trim()) return;

  loading.value = true;
  error.value = "";

  try {
    const created = await $fetch("/api/groups", {
      method: "POST",
      body: {
        name: newGroup.value.name,
        description: newGroup.value.description || null,
      },
    });
    groups.value.push(created);
    newGroup.value = { name: "", description: "" };
  } catch (err: any) {
    error.value = err.data?.message || "Fehler beim Hinzufügen";
  } finally {
    loading.value = false;
  }
};

const deleteGroup = async (id: number) => {
  if (!confirm("Möchten Sie diese Gruppe löschen?")) return;

  loading.value = true;
  try {
    await $fetch(`/api/groups/${id}`, { method: "DELETE" });
    groups.value = groups.value.filter((g) => g.id !== id);
  } catch (err: any) {
    error.value = err.data?.message || "Fehler beim Löschen";
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchGroups();
});
</script>
