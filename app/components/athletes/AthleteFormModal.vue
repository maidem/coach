<template>
  <div
    class="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50 p-4"
  >
    <div
      class="bg-white rounded-2xl shadow-xl w-full sm:max-w-2xl max-h-[90vh] overflow-y-auto"
    >
      <!-- Header -->
      <div
        class="sticky top-0 bg-white border-b border-ink-200 px-6 py-4 flex justify-between items-center rounded-t-2xl"
      >
        <h2 class="text-2xl font-bold text-ink-900">
          {{ athlete?.id ? "Athlet bearbeiten" : "Neuer Athlet" }}
        </h2>
        <button @click="$emit('close')" class="btn-ghost text-xl px-2 py-1">✕</button>
      </div>

      <!-- Form -->
      <form @submit.prevent="saveAthlete" class="p-6 space-y-6">

        <!-- Foto Upload -->
        <div>
          <label class="label">Foto</label>
          <div
            class="border-2 border-dashed border-ink-300 rounded-xl p-6 text-center cursor-pointer hover:border-[color:var(--color-lime-vivid)] transition"
            :class="{ 'border-[color:var(--color-lime-vivid)] bg-[color:var(--color-lime-soft)]': isDragOver }"
            @dragover.prevent="isDragOver = true"
            @dragleave.prevent="isDragOver = false"
            @drop.prevent="onDrop"
            @click="fileInputRef?.click()"
          >
            <img
              v-if="form.photo"
              :src="form.photo"
              class="h-32 w-32 object-cover rounded-full mx-auto mb-2"
              alt="Athleten Foto"
            />
            <div v-else class="text-ink-400">
              <div class="text-4xl mb-2">📷</div>
              <p class="text-sm">Foto hierher ziehen oder klicken zum Auswählen</p>
              <p class="text-xs text-ink-400 mt-1">JPG, PNG, WebP (max. 5 MB)</p>
            </div>
            <button
              v-if="form.photo"
              type="button"
              @click.stop="form.photo = null"
              class="mt-2 text-xs text-red-600 hover:underline"
            >Foto entfernen</button>
          </div>
          <input
            ref="fileInputRef"
            type="file"
            accept="image/*"
            class="hidden"
            @change="onFileChange"
          />
        </div>

        <!-- Vor- und Nachname -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="label">Vorname *</label>
            <input
              v-model="form.first_name"
              type="text"
              required
              placeholder="Vorname"
              class="input"
            />
          </div>
          <div>
            <label class="label">Nachname *</label>
            <input
              v-model="form.last_name"
              type="text"
              required
              placeholder="Nachname"
              class="input"
            />
          </div>
        </div>

        <!-- Two Column Layout -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <!-- Belt -->
          <div>
            <label class="label">Gürtelgrad</label>
            <select v-model.number="form.belt_id" class="select">
              <option :value="null">-- Wählen --</option>
              <option v-for="belt in belts" :key="belt.id" :value="belt.id">
                {{ belt.name }}
              </option>
            </select>
          </div>

          <!-- Weight Class -->
          <div>
            <label class="label">Gewichtsklasse</label>
            <select v-model.number="form.weight_class_id" class="select">
              <option :value="null">-- Wählen --</option>
              <option v-for="wc in weightClasses" :key="wc.id" :value="wc.id">
                {{ wc.name }}
              </option>
            </select>
          </div>

          <!-- Group -->
          <div>
            <label class="label">Gruppe</label>
            <select v-model.number="form.group_id" class="select">
              <option :value="null">-- Wählen --</option>
              <option v-for="group in groups" :key="group.id" :value="group.id">
                {{ group.name }}
              </option>
            </select>
          </div>

          <!-- Competition -->
          <div>
            <label class="label">Wettkampf</label>
            <select v-model.number="form.competition_id" class="select">
              <option :value="null">-- Wählen --</option>
              <option
                v-for="comp in competitions"
                :key="comp.id"
                :value="comp.id"
              >
                {{ comp.name }}{{ comp.date ? ` (${formatDate(comp.date)})` : "" }}
              </option>
            </select>
          </div>

          <!-- Travel Option -->
          <div>
            <label class="label">Reisemöglichkeit</label>
            <select v-model.number="form.travel_option_id" class="select">
              <option :value="null">-- Wählen --</option>
              <option
                v-for="option in travelOptions"
                :key="option.id"
                :value="option.id"
              >
                {{ option.name }}
              </option>
            </select>
          </div>
        </div>

        <!-- Equipment Multi-Select -->
        <div>
          <label class="label">Ausstattung</label>
          <div class="flex flex-wrap gap-2 mt-1">
            <label
              v-for="item in equipment"
              :key="item.id"
              class="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-ink-200 cursor-pointer hover:bg-ink-50 transition"
              :class="{ 'border-[color:var(--color-lime-vivid)] bg-[color:var(--color-lime-soft)]': form.equipment_ids?.includes(item.id) }"
            >
              <input
                :checked="form.equipment_ids?.includes(item.id)"
                @change="toggleEquipment(item.id)"
                type="checkbox"
                class="rounded border-ink-300"
              />
              <span class="text-sm text-ink-800">{{ item.name }}</span>
            </label>
          </div>
        </div>

        <!-- Checkboxes -->
        <div class="space-y-3 bg-ink-50 p-4 rounded-xl">
          <label class="flex items-center gap-3 cursor-pointer">
            <input v-model="form.entry_fee_paid" type="checkbox" class="rounded border-ink-300" />
            <span class="font-medium text-ink-700">Startgebühr bezahlt</span>
          </label>
          <label class="flex items-center gap-3 cursor-pointer">
            <input v-model="form.overnight_stay" type="checkbox" class="rounded border-ink-300" />
            <span class="font-medium text-ink-700">Übernachtung benötigt</span>
          </label>
        </div>

        <!-- Notes -->
        <div>
          <label class="label">Notizen</label>
          <textarea
            v-model="form.notes"
            class="textarea"
            rows="3"
            placeholder="Zusätzliche Notizen..."
          ></textarea>
        </div>

        <!-- Error -->
        <div v-if="error" class="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700">
          {{ error }}
        </div>

        <!-- Buttons -->
        <div class="flex gap-3 sm:justify-end">
          <button type="button" @click="$emit('close')" class="btn-ghost flex-1 sm:flex-none">
            Abbrechen
          </button>
          <button type="submit" :disabled="loading" class="btn-lime flex-1 sm:flex-none">
            {{ loading ? "Speichern..." : "Speichern" }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import type {
  Athlete,
  Belt,
  WeightClass,
  Group,
  Competition,
  TravelOption,
  Equipment,
} from "~/types/models";

const props = defineProps<{
  athlete: Athlete | null;
}>();

const emit = defineEmits<{
  close: [];
  save: [];
}>();

const fileInputRef = ref<HTMLInputElement | null>(null);
const isDragOver = ref(false);

const form = ref<Partial<Athlete>>({
  first_name: "",
  last_name: "",
  photo: null,
  belt_id: null,
  weight_class_id: null,
  group_id: null,
  competition_id: null,
  travel_option_id: null,
  entry_fee_paid: false,
  overnight_stay: false,
  notes: "",
  equipment_ids: [],
});

const belts = ref<Belt[]>([]);
const weightClasses = ref<WeightClass[]>([]);
const groups = ref<Group[]>([]);
const competitions = ref<Competition[]>([]);
const travelOptions = ref<TravelOption[]>([]);
const equipment = ref<Equipment[]>([]);
const loading = ref(false);
const error = ref("");

const formatDate = (dateStr: string) => {
  try {
    return new Date(dateStr + "T00:00:00").toLocaleDateString("de-DE", {
      year: "numeric", month: "long", day: "numeric",
    });
  } catch { return dateStr; }
};

const readImageFile = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (file.size > 5 * 1024 * 1024) {
      reject(new Error("Datei ist zu groß (max. 5 MB)"));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

const onFileChange = async (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (!file) return;
  try {
    form.value.photo = await readImageFile(file);
  } catch (err: any) {
    error.value = err.message || "Fehler beim Laden des Bildes";
  }
};

const onDrop = async (e: DragEvent) => {
  isDragOver.value = false;
  const file = e.dataTransfer?.files?.[0];
  if (!file || !file.type.startsWith("image/")) return;
  try {
    form.value.photo = await readImageFile(file);
  } catch (err: any) {
    error.value = err.message || "Fehler beim Laden des Bildes";
  }
};

const toggleEquipment = (equipmentId: number) => {
  if (!form.value.equipment_ids) form.value.equipment_ids = [];
  const idx = form.value.equipment_ids.indexOf(equipmentId);
  if (idx === -1) {
    form.value.equipment_ids.push(equipmentId);
  } else {
    form.value.equipment_ids.splice(idx, 1);
  }
};

const fetchMasterData = async () => {
  try {
    const [b, wc, g, c, t, e] = await Promise.all([
      $fetch<Belt[]>("/api/belts"),
      $fetch<WeightClass[]>("/api/weight-classes"),
      $fetch<Group[]>("/api/groups"),
      $fetch<Competition[]>("/api/competitions"),
      $fetch<TravelOption[]>("/api/travel-options"),
      $fetch<Equipment[]>("/api/equipment"),
    ]);
    belts.value = b;
    weightClasses.value = wc;
    groups.value = g;
    competitions.value = c;
    travelOptions.value = t;
    equipment.value = e;
  } catch (err: any) {
    error.value = "Fehler beim Laden der Stammdaten";
  }
};

const saveAthlete = async () => {
  loading.value = true;
  error.value = "";
  try {
    const body = {
      first_name: form.value.first_name,
      last_name: form.value.last_name,
      photo: form.value.photo || null,
      belt_id: form.value.belt_id,
      weight_class_id: form.value.weight_class_id,
      group_id: form.value.group_id,
      competition_id: form.value.competition_id,
      travel_option_id: form.value.travel_option_id,
      entry_fee_paid: form.value.entry_fee_paid,
      overnight_stay: form.value.overnight_stay,
      notes: form.value.notes,
      equipment_ids: form.value.equipment_ids,
    };
    if (props.athlete?.id) {
      await $fetch(`/api/athletes/${props.athlete.id}`, { method: "PATCH", body });
    } else {
      await $fetch("/api/athletes", { method: "POST", body });
    }
    emit("save");
  } catch (err: any) {
    error.value = err.data?.statusMessage || err.message || "Fehler beim Speichern";
  } finally {
    loading.value = false;
  }
};

onMounted(async () => {
  await fetchMasterData();
  if (props.athlete) {
    form.value = {
      first_name: props.athlete.first_name || "",
      last_name: props.athlete.last_name || "",
      photo: props.athlete.photo || null,
      belt_id: props.athlete.belt_id,
      weight_class_id: props.athlete.weight_class_id,
      group_id: props.athlete.group_id,
      competition_id: props.athlete.competition_id,
      travel_option_id: props.athlete.travel_option_id,
      entry_fee_paid: props.athlete.entry_fee_paid,
      overnight_stay: props.athlete.overnight_stay,
      notes: props.athlete.notes,
      equipment_ids: props.athlete.equipment_ids || [],
    };
  }
});
</script>
