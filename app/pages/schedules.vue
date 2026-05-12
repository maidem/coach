<script setup lang="ts">
definePageMeta({ middleware: "admin" });

const DAY_NAMES = [
  "Montag",
  "Dienstag",
  "Mittwoch",
  "Donnerstag",
  "Freitag",
  "Samstag",
  "Sonntag",
];
const DAY_SHORT = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];

const { data: entries, refresh } = await useFetch<any[]>("/api/schedules");
const { data: locations } = await useFetch<any[]>("/api/locations");
const { data: groups } = await useFetch<any[]>("/api/groups");
const { data: labels } = await useFetch<any[]>("/api/labels");

const entriesRef = ref<any[]>(entries.value ?? []);
watch(entries, (v) => {
  if (v) entriesRef.value = v;
});

// Realtime sync
const { $io } = useNuxtApp() as any;
if ($io) {
  $io.on("schedules:created", (e: any) => {
    entriesRef.value.push(e);
  });
  $io.on("schedules:updated", (e: any) => {
    const i = entriesRef.value.findIndex((x) => x.id === e.id);
    if (i >= 0) entriesRef.value[i] = e;
    else entriesRef.value.push(e);
  });
  $io.on("schedules:deleted", ({ id }: { id: number }) => {
    entriesRef.value = entriesRef.value.filter((x) => x.id !== id);
  });
}

// Group entries by day
const filterLocationId = ref<number | null>(null);

function entriesForDay(day: number) {
  return entriesRef.value
    .filter(
      (e) =>
        e.day_of_week === day &&
        (filterLocationId.value === null ||
          e.location_id === filterLocationId.value),
    )
    .sort(
      (a, b) =>
        (a.location_name ?? "").localeCompare(b.location_name ?? "") ||
        a.start_time.localeCompare(b.start_time) ||
        a.sort_order - b.sort_order,
    );
}

// --- Add/Edit modal ---
const showModal = ref(false);
const editingId = ref<number | null>(null);

const defaultForm = () => ({
  location_id: locations.value?.[0]?.id ?? null,
  day_of_week: 0,
  start_time: "17:00",
  end_time: "18:00",
  group_id: null as number | null,
  label_ids: [] as number[],
  sort_order: 0,
});

const form = reactive(defaultForm());
const formError = ref("");
const formLoading = ref(false);

function openAdd(locationId?: number, day?: number) {
  editingId.value = null;
  Object.assign(form, defaultForm());
  if (locationId !== undefined) form.location_id = locationId;
  if (day !== undefined) form.day_of_week = day;
  formError.value = "";
  showModal.value = true;
}

function openEdit(entry: any) {
  editingId.value = entry.id;
  form.location_id = entry.location_id;
  form.day_of_week = entry.day_of_week;
  form.start_time = entry.start_time;
  form.end_time = entry.end_time;
  form.group_id = entry.group_id ?? null;
  form.label_ids = entry.labels?.map((l: any) => l.id) ?? [];
  form.sort_order = entry.sort_order ?? 0;
  formError.value = "";
  showModal.value = true;
}

async function saveEntry() {
  formError.value = "";
  formLoading.value = true;
  try {
    const body = {
      location_id: form.location_id,
      day_of_week: form.day_of_week,
      start_time: form.start_time,
      end_time: form.end_time,
      group_id: form.group_id,
      label_ids: form.label_ids,
      note: null,
      sort_order: form.sort_order,
    };
    if (editingId.value !== null) {
      await $fetch(`/api/schedules/${editingId.value}`, {
        method: "PATCH",
        body,
      });
    } else {
      await $fetch("/api/schedules", { method: "POST", body });
    }
    showModal.value = false;
    await refresh();
  } catch (e: any) {
    formError.value = e?.statusMessage || "Fehler beim Speichern";
  } finally {
    formLoading.value = false;
  }
}

async function deleteEntry(id: number) {
  if (!confirm("Trainingseinheit wirklich löschen?")) return;
  await $fetch(`/api/schedules/${id}`, { method: "DELETE" });
  await refresh();
}

function toggleLabel(id: number) {
  const i = form.label_ids.indexOf(id);
  if (i >= 0) form.label_ids.splice(i, 1);
  else form.label_ids.push(id);
}
</script>

<template>
  <section class="space-y-8">
    <div
      class="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4"
    >
      <div>
        <h1 class="text-3xl font-semibold tracking-tight">Trainingsplan</h1>
        <p class="text-ink-500 mt-1">
          Wöchentliche Trainingszeiten pro Standort verwalten.
        </p>
      </div>
      <button class="btn-lime" @click="openAdd()">+ Eintrag hinzufügen</button>
    </div>

    <!-- Location filter -->
    <div v-if="locations?.length" class="space-y-2">
      <span class="block text-xs text-ink-500">Standort:</span>
      <div
        class="flex items-center gap-2 overflow-x-auto pb-1 -mb-1 whitespace-nowrap scrollbar-none"
      >
        <button
          class="chip text-xs flex-shrink-0"
          :class="
            !filterLocationId ? '!bg-ink-900 !text-white !border-ink-900' : ''
          "
          @click="filterLocationId = null"
        >
          Alle
        </button>
        <button
          v-for="loc in locations"
          :key="loc.id"
          class="chip text-xs flex-shrink-0"
          :class="
            filterLocationId === loc.id
              ? '!bg-ink-900 !text-white !border-ink-900'
              : ''
          "
          @click="
            filterLocationId = filterLocationId === loc.id ? null : loc.id
          "
        >
          {{ loc.name }}{{ loc.description ? " – " + loc.description : "" }}
        </button>
      </div>
    </div>

    <!-- No locations hint -->
    <div v-if="!locations?.length" class="card text-center text-ink-500 py-12">
      Noch keine Standorte angelegt. Bitte zuerst unter
      <NuxtLink to="/locations" class="underline font-medium"
        >Standorte</NuxtLink
      >
      einen Standort erstellen.
    </div>

    <!-- No entries at all -->
    <div
      v-else-if="entriesRef.length === 0"
      class="card text-center text-ink-500 py-12 text-sm"
    >
      Noch keine Trainingszeiten angelegt.
    </div>

    <!-- Single unified table grouped by day -->
    <div v-else class="card p-0 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr
              class="bg-ink-900 text-lime-vivid text-xs uppercase tracking-wider"
            >
              <th class="text-left px-5 py-3 w-32">Tag</th>
              <th class="text-left px-5 py-3 w-44">Uhrzeit</th>
              <th class="text-left px-5 py-3">Standort</th>
              <th class="text-left px-5 py-3">Gruppenform</th>
              <th class="px-5 py-3 w-20"></th>
            </tr>
          </thead>
          <tbody>
            <template v-for="(day, idx) in DAY_NAMES" :key="day">
              <template v-if="entriesForDay(idx).length">
                <!-- Day separator row -->
                <tr class="bg-ink-50 border-t border-ink-200">
                  <td colspan="5" class="px-5 py-2">
                    <span class="font-semibold text-ink-800">{{ day }}</span>
                  </td>
                </tr>
                <!-- Entries -->
                <tr
                  v-for="entry in entriesForDay(idx)"
                  :key="entry.id"
                  class="border-t border-ink-100 hover:bg-ink-50/50 transition-colors"
                >
                  <td class="px-5 py-3"></td>
                  <td
                    class="px-5 py-3 font-mono font-medium text-ink-800 whitespace-nowrap"
                  >
                    {{ entry.start_time }} – {{ entry.end_time }}
                  </td>
                  <td class="px-5 py-3">
                    <div v-if="entry.location_name" class="flex flex-col">
                      <span class="font-medium text-ink-900">{{
                        entry.location_name
                      }}</span>
                      <span
                        v-if="entry.location_description"
                        class="text-xs text-ink-500"
                        >{{ entry.location_description }}</span
                      >
                      <div
                        v-if="entry.labels?.length"
                        class="flex flex-wrap gap-1 mt-1"
                      >
                        <span
                          v-for="label in entry.labels"
                          :key="label.id"
                          class="chip-label"
                          >{{ label.name }}</span
                        >
                      </div>
                    </div>
                    <span v-else class="text-ink-400 italic">–</span>
                  </td>
                  <td class="px-5 py-3">
                    <span
                      v-if="entry.group_name"
                      class="font-medium text-ink-900"
                    >
                      <div class="flex flex-col">
                        <span class="font-medium text-ink-900">{{
                          entry.group_name
                        }}</span>
                        <span
                          v-if="entry.group_description"
                          class="text-xs text-ink-500"
                          >{{ entry.group_description }}</span
                        >
                      </div>
                    </span>
                    <span v-else-if="entry.note" class="text-ink-600">{{
                      entry.note
                    }}</span>
                    <span v-else class="text-ink-400 italic">–</span>
                  </td>
                  <td class="px-5 py-3 text-right space-x-1 whitespace-nowrap">
                    <button
                      class="btn-ghost text-xs !px-2 !py-1"
                      @click="openEdit(entry)"
                    >
                      ✎
                    </button>
                    <button
                      class="btn-danger text-xs !px-2 !py-1"
                      @click="deleteEntry(entry.id)"
                    >
                      ✕
                    </button>
                  </td>
                </tr>
              </template>
            </template>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal: Add / Edit entry -->
    <Teleport to="body">
      <div
        v-if="showModal"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
        @click.self="showModal = false"
      >
        <div
          class="absolute inset-0 bg-ink-950/40 backdrop-blur-sm"
          @click="showModal = false"
        />
        <div
          class="relative card w-full max-w-lg flex flex-col max-h-[90dvh] shadow-2xl"
        >
          <div class="flex items-center justify-between flex-shrink-0">
            <h3 class="font-semibold text-lg">
              {{
                editingId !== null
                  ? "Trainingszeit bearbeiten"
                  : "Trainingszeit hinzufügen"
              }}
            </h3>
            <button
              class="btn-ghost !px-2 !py-1 text-lg leading-none"
              @click="showModal = false"
            >
              ✕
            </button>
          </div>

          <div class="flex-1 overflow-y-auto space-y-5 py-1">
            <!-- Row 1: Location + Day -->
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="label">Standort</label>
                <select v-model="form.location_id" class="select">
                  <option v-for="l in locations" :key="l.id" :value="l.id">
                    {{ l.name }}{{ l.description ? " – " + l.description : "" }}
                  </option>
                </select>
              </div>
              <div>
                <label class="label">Wochentag</label>
                <select v-model="form.day_of_week" class="select">
                  <option
                    v-for="(name, idx) in DAY_NAMES"
                    :key="idx"
                    :value="idx"
                  >
                    {{ name }}
                  </option>
                </select>
              </div>
            </div>

            <!-- Row 2: Times -->
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="label">Von</label>
                <input v-model="form.start_time" type="time" class="input" />
              </div>
              <div>
                <label class="label">Bis</label>
                <input v-model="form.end_time" type="time" class="input" />
              </div>
            </div>

            <!-- Row 3: Group -->
            <div>
              <label class="label">Gruppe / Gruppenform</label>
              <div class="flex flex-col gap-1.5 mt-1">
                <button
                  v-for="g in groups"
                  :key="g.id"
                  type="button"
                  class="chip w-full text-left !justify-start !rounded-xl px-3 py-2 transition-all"
                  :class="
                    form.group_id === g.id
                      ? '!border-ink-900 !bg-ink-900 !text-white'
                      : 'hover:border-ink-400'
                  "
                  @click="form.group_id = g.id"
                >
                  <span class="flex flex-col">
                    <span class="text-sm font-medium leading-tight">{{
                      g.name
                    }}</span>
                    <span
                      v-if="g.description"
                      class="text-xs opacity-70 leading-tight"
                      >{{ g.description }}</span
                    >
                  </span>
                </button>
              </div>
            </div>

            <!-- Row 4: Labels -->
            <div v-if="labels?.length">
              <label class="label">Labels</label>
              <div class="flex flex-wrap gap-2 mt-1">
                <button
                  v-for="label in labels"
                  :key="label.id"
                  type="button"
                  class="chip-label chip-wrap"
                  :class="
                    form.label_ids.includes(label.id)
                      ? '!bg-[color:var(--color-lime-vivid)] !text-ink-950 !border-[color:var(--color-lime-deep)]/40'
                      : ''
                  "
                  @click="toggleLabel(label.id)"
                >
                  {{ label.name }}
                </button>
              </div>
            </div>
          </div>
          <div class="flex-shrink-0 space-y-3 pt-1">
            <div v-if="formError" class="text-sm text-red-600">
              {{ formError }}
            </div>

            <!-- Actions -->
            <div class="flex justify-end gap-2">
              <button class="btn-ghost" @click="showModal = false">
                Abbrechen
              </button>
              <button
                class="btn-lime"
                :disabled="formLoading"
                @click="saveEntry"
              >
                {{ formLoading ? "Speichern…" : "Speichern" }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </section>
</template>
