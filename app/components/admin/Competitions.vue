<template>
  <div class="bg-white rounded-lg shadow">
    <div class="p-6 border-b border-gray-200">
      <h2 class="text-xl font-semibold text-gray-900 mb-4">Wettkämpfe</h2>
      <div class="space-y-2">
        <input
          v-model="newComp.name"
          type="text"
          placeholder="Wettkampfname"
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ink-900 focus:border-transparent"
        />
        <input
          v-model="newComp.date"
          type="date"
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ink-900 focus:border-transparent"
        />
        <input
          v-model="newComp.tournament_link"
          type="url"
          placeholder="Link zum Turnier (optional)"
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ink-900 focus:border-transparent"
        />
        <!-- PDF Upload -->
        <div>
          <label class="label">Ausschreibung (PDF, max. 5 MB)</label>
          <div
            class="border-2 border-dashed border-ink-300 rounded-xl p-4 text-center cursor-pointer hover:border-[color:var(--color-lime-vivid)] transition"
            :class="{
              'border-[color:var(--color-lime-vivid)] bg-[color:var(--color-lime-soft)]':
                isDragOver,
            }"
            @dragover.prevent="isDragOver = true"
            @dragleave.prevent="isDragOver = false"
            @drop.prevent="onDrop"
            @click="pdfInputRef?.click()"
          >
            <div v-if="newComp.ausschreibung" class="text-sm text-ink-700">
              <span class="text-2xl">📄</span>
              <p class="mt-1 font-medium">PDF ausgewählt</p>
              <button
                type="button"
                @click.stop="newComp.ausschreibung = null"
                class="text-xs text-red-600 hover:underline mt-1"
              >
                Entfernen
              </button>
            </div>
            <div v-else class="text-ink-400 text-sm">
              <span class="text-2xl">📎</span>
              <p class="mt-1">PDF hierher ziehen oder klicken</p>
            </div>
          </div>
          <input
            ref="pdfInputRef"
            type="file"
            accept="application/pdf"
            class="hidden"
            @change="onFileChange"
          />
        </div>
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
        class="p-4 hover:bg-gray-50"
      >
        <!-- Edit mode -->
        <div v-if="editingId === comp.id" class="space-y-2">
          <input
            v-model="editForm.name"
            type="text"
            placeholder="Wettkampfname"
            class="w-full px-3 py-1.5 border border-ink-300 rounded-lg focus:ring-2 focus:ring-ink-900 focus:border-transparent text-sm"
          />
          <input
            v-model="editForm.date"
            type="date"
            class="w-full px-3 py-1.5 border border-ink-300 rounded-lg focus:ring-2 focus:ring-ink-900 focus:border-transparent text-sm"
          />
          <input
            v-model="editForm.tournament_link"
            type="url"
            placeholder="Link (optional)"
            class="w-full px-3 py-1.5 border border-ink-300 rounded-lg focus:ring-2 focus:ring-ink-900 focus:border-transparent text-sm"
          />
          <!-- PDF in edit mode -->
          <div
            class="border-2 border-dashed border-ink-300 rounded-xl p-3 text-center cursor-pointer hover:border-[color:var(--color-lime-vivid)] transition text-sm"
            @click="editPdfInputRef?.click()"
          >
            <span v-if="editForm.ausschreibung"
              >📄 PDF gespeichert – klicken zum Ersetzen
              <button
                type="button"
                @click.stop="editForm.ausschreibung = null"
                class="text-xs text-red-600 hover:underline ml-2"
              >
                Entfernen
              </button>
            </span>
            <span v-else class="text-ink-400">📎 PDF hochladen (optional)</span>
          </div>
          <input
            ref="editPdfInputRef"
            type="file"
            accept="application/pdf"
            class="hidden"
            @change="onEditFileChange"
          />
          <div class="flex gap-2">
            <button
              @click="saveEdit(comp.id)"
              :disabled="loading"
              class="btn-lime text-xs px-3 py-1.5"
            >
              Speichern
            </button>
            <button @click="cancelEdit" class="btn-ghost text-xs px-3 py-1.5">
              Abbrechen
            </button>
          </div>
        </div>
        <!-- View mode -->
        <div v-else class="flex justify-between items-start gap-4">
          <div class="flex-1">
            <p class="font-medium text-gray-900">{{ comp.name }}</p>
            <p v-if="comp.date" class="text-sm text-gray-600">
              {{ formatDate(comp.date) }}
            </p>
            <div class="flex flex-wrap gap-3 mt-1">
              <a
                v-if="comp.tournament_link"
                :href="comp.tournament_link"
                target="_blank"
                rel="noopener"
                class="text-sm text-[color:var(--color-lime-deep)] hover:underline"
                >🔗 Turnier Link</a
              >
              <a
                v-if="comp.ausschreibung"
                :href="comp.ausschreibung"
                :download="`Ausschreibung_${comp.name}.pdf`"
                class="text-sm text-[color:var(--color-lime-deep)] hover:underline"
                >📄 Ausschreibung</a
              >
            </div>
          </div>
          <div class="flex gap-2 flex-shrink-0">
            <button
              @click="startEdit(comp)"
              class="px-3 py-1 bg-ink-100 text-ink-700 rounded hover:bg-ink-200 text-sm transition"
            >
              Bearbeiten
            </button>
            <button
              @click="deleteCompetition(comp.id)"
              :disabled="loading"
              class="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-gray-400 text-sm transition"
            >
              Löschen
            </button>
          </div>
        </div>
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
const newComp = ref<Partial<Competition & { ausschreibung: string | null }>>({
  name: "",
  tournament_link: "",
  date: "",
  ausschreibung: null,
});
const loading = ref(false);
const error = ref("");
const isDragOver = ref(false);
const pdfInputRef = ref<HTMLInputElement | null>(null);
const editingId = ref<number | null>(null);
const editForm = ref({
  name: "",
  date: "",
  tournament_link: "",
  ausschreibung: null as string | null,
});
const editPdfInputRef = ref<HTMLInputElement | null>(null);

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

const readPdf = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    if (file.size > 5 * 1024 * 1024) {
      reject(new Error("PDF ist zu groß (max. 5 MB)"));
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target!.result as string);
    reader.onerror = () => reject(new Error("Fehler beim Lesen der Datei"));
    reader.readAsDataURL(file);
  });

const onFileChange = async (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (!file) return;
  try {
    newComp.value.ausschreibung = await readPdf(file);
  } catch (err: any) {
    error.value = err.message;
  }
};

const onDrop = async (e: DragEvent) => {
  isDragOver.value = false;
  const file = e.dataTransfer?.files?.[0];
  if (!file || file.type !== "application/pdf") {
    error.value = "Bitte nur PDF-Dateien hochladen";
    return;
  }
  try {
    newComp.value.ausschreibung = await readPdf(file);
  } catch (err: any) {
    error.value = err.message;
  }
};

const onEditFileChange = async (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (!file) return;
  try {
    editForm.value.ausschreibung = await readPdf(file);
  } catch (err: any) {
    error.value = err.message;
  }
};

const startEdit = (comp: Competition) => {
  editingId.value = comp.id;
  editForm.value = {
    name: comp.name,
    date: comp.date || "",
    tournament_link: comp.tournament_link || "",
    ausschreibung: comp.ausschreibung || null,
  };
};

const cancelEdit = () => {
  editingId.value = null;
};

const saveEdit = async (id: number) => {
  if (!editForm.value.name.trim()) return;
  loading.value = true;
  error.value = "";
  try {
    const updated = await $fetch(`/api/competitions/${id}`, {
      method: "PATCH",
      body: {
        name: editForm.value.name,
        tournament_link: editForm.value.tournament_link || null,
        date: editForm.value.date || null,
        ausschreibung: editForm.value.ausschreibung,
      },
    });
    const idx = competitions.value.findIndex((c) => c.id === id);
    if (idx !== -1) competitions.value[idx] = updated;
    editingId.value = null;
  } catch (err: any) {
    error.value = err.data?.message || "Fehler beim Speichern";
  } finally {
    loading.value = false;
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
        ausschreibung: newComp.value.ausschreibung || null,
      },
    });
    competitions.value.push(created);
    newComp.value = {
      name: "",
      tournament_link: "",
      date: "",
      ausschreibung: null,
    };
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
