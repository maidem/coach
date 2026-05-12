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
        class="p-4 flex justify-between items-start hover:bg-gray-50 gap-4"
      >
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
            >
              🔗 Turnier Link
            </a>
            <a
              v-if="comp.ausschreibung"
              :href="comp.ausschreibung"
              :download="`Ausschreibung_${comp.name}.pdf`"
              class="text-sm text-[color:var(--color-lime-deep)] hover:underline"
            >
              📄 Ausschreibung herunterladen
            </a>
          </div>
        </div>
        <button
          @click="deleteCompetition(comp.id)"
          :disabled="loading"
          class="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-gray-400 text-sm transition flex-shrink-0"
        >
          Löschen
        </button>
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
