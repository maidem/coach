<template>
  <div
    class="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50 p-4"
  >
    <div
      class="bg-white rounded-lg shadow-xl w-full sm:max-w-2xl max-h-[90vh] overflow-y-auto"
    >
      <!-- Header -->
      <div
        class="sticky top-0 bg-ink-900 text-white px-6 py-6 flex justify-between items-start rounded-t-lg"
      >
        <div class="flex items-center gap-4">
          <img
            v-if="athlete?.photo"
            :src="athlete.photo"
            class="h-16 w-16 object-cover rounded-full border-2 border-white/30"
            alt="Athleten Foto"
          />
          <div
            v-else
            class="h-16 w-16 rounded-full bg-ink-700 flex items-center justify-center text-2xl"
          >
            👤
          </div>
          <div>
            <h2 class="text-2xl font-bold">
              {{ athlete?.first_name }} {{ athlete?.last_name }}
            </h2>
            <p class="text-ink-400 mt-1">Athlet Profil</p>
          </div>
        </div>
        <button
          @click="$emit('close')"
          class="text-ink-300 hover:text-white text-2xl"
        >
          ✕
        </button>
      </div>

      <!-- Content -->
      <div class="p-6 space-y-6">
        <!-- Status Badges -->
        <div class="flex flex-wrap gap-3">
          <span
            :class="[
              'px-3 py-1 rounded-full text-sm font-medium',
              athlete?.entry_fee_paid
                ? 'bg-green-100 text-green-800'
                : 'bg-yellow-100 text-yellow-800',
            ]"
          >
            Startgebühr:
            {{ athlete?.entry_fee_paid ? "✓ Bezahlt" : "✗ Ausstehend" }}
          </span>
          <span
            :class="[
              'px-3 py-1 rounded-full text-sm font-medium',
              athlete?.overnight_stay
                ? 'bg-[color:var(--color-lime-soft)] text-[color:var(--color-lime-deep)]'
                : 'bg-gray-100 text-gray-800',
            ]"
          >
            Übernachtung: {{ athlete?.overnight_stay ? "✓ Ja" : "✗ Nein" }}
          </span>
        </div>

        <!-- Details Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <!-- Belt -->
          <div v-if="athlete?.belt_name" class="bg-gray-50 p-4 rounded-lg">
            <p class="text-sm font-medium text-gray-600">Gürtelgrad</p>
            <p class="text-lg font-semibold text-gray-900 mt-1">
              {{ athlete.belt_name }}
            </p>
          </div>

          <!-- Weight Class -->
          <div
            v-if="athlete?.weight_class_name"
            class="bg-gray-50 p-4 rounded-lg"
          >
            <p class="text-sm font-medium text-gray-600">Gewichtsklasse</p>
            <p class="text-lg font-semibold text-gray-900 mt-1">
              {{ athlete.weight_class_name }}
            </p>
          </div>

          <!-- Group -->
          <div v-if="athlete?.group_name" class="bg-gray-50 p-4 rounded-lg">
            <p class="text-sm font-medium text-gray-600">Gruppe</p>
            <p class="text-lg font-semibold text-gray-900 mt-1">
              {{ athlete.group_name }}
            </p>
          </div>

          <!-- Competition -->
          <div
            v-if="athlete?.competition_name"
            class="bg-gray-50 p-4 rounded-lg"
          >
            <p class="text-sm font-medium text-gray-600">Wettkampf</p>
            <p class="text-lg font-semibold text-gray-900 mt-1">
              {{ athlete.competition_name }}
            </p>
          </div>

          <!-- Travel Option -->
          <div
            v-if="athlete?.travel_option_name"
            class="bg-gray-50 p-4 rounded-lg"
          >
            <p class="text-sm font-medium text-gray-600">Reisemöglichkeit</p>
            <p class="text-lg font-semibold text-gray-900 mt-1">
              {{ athlete.travel_option_name }}
            </p>
          </div>
        </div>

        <!-- Equipment -->
        <div v-if="athlete?.equipment && athlete.equipment.length > 0">
          <h3 class="font-semibold text-gray-900 mb-3">Ausstattung</h3>
          <div class="flex flex-wrap gap-2">
            <span
              v-for="item in athlete.equipment"
              :key="item.id"
              class="chip-lime"
            >
              {{ item.name }}
            </span>
          </div>
        </div>

        <!-- Notes -->
        <div v-if="athlete?.notes">
          <h3 class="font-semibold text-gray-900 mb-2">Notizen</h3>
          <div
            class="bg-gray-50 p-4 rounded-lg text-gray-700 whitespace-pre-wrap"
          >
            {{ athlete.notes }}
          </div>
        </div>

        <!-- Meta Info -->
        <div class="text-xs text-gray-500 pt-4 border-t border-gray-200">
          <p v-if="athlete?.created_at">
            Erstellt: {{ formatDate(athlete.created_at) }}
          </p>
          <p v-if="athlete?.updated_at">
            Zuletzt geändert: {{ formatDate(athlete.updated_at) }}
          </p>
        </div>
      </div>

      <!-- Actions -->
      <div
        class="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex gap-3 sm:justify-end flex-wrap"
      >
        <button
          @click="$emit('close')"
          class="flex-1 sm:flex-none px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 font-medium transition"
        >
          Schließen
        </button>
        <button @click="$emit('edit')" class="btn-lime flex-1 sm:flex-none">
          Bearbeiten
        </button>
        <button
          @click="deleteAthlete"
          :disabled="deleting"
          class="flex-1 sm:flex-none px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 font-medium transition"
        >
          {{ deleting ? "Wird gelöscht..." : "Löschen" }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Athlete } from "~/types/models";

const props = defineProps<{
  athlete: Athlete | null;
}>();

const emit = defineEmits<{
  close: [];
  edit: [];
  delete: [];
}>();

const deleting = ref(false);

const formatDate = (dateStr: string) => {
  try {
    return new Date(dateStr).toLocaleDateString("de-DE", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateStr;
  }
};

const deleteAthlete = async () => {
  if (!props.athlete?.id) return;
  if (
    !confirm(
      `Möchten Sie den Athleten "${props.athlete.name}" wirklich löschen?`,
    )
  ) {
    return;
  }

  deleting.value = true;
  try {
    await $fetch(`/api/athletes/${props.athlete.id}`, {
      method: "DELETE",
    });
    emit("delete");
  } catch (err: any) {
    alert(err.data?.message || "Fehler beim Löschen");
  } finally {
    deleting.value = false;
  }
};
</script>
