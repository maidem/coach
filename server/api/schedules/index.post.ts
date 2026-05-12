import { requireAdmin } from "../../utils/auth";
import { broadcastEvent } from "../../utils/socket";

export default defineEventHandler(async (event) => {
  requireAdmin(event);
  const body = await readBody<{
    location_id?: number;
    day_of_week?: number;
    start_time?: string;
    end_time?: string;
    group_id?: number | null;
    trainer_ids?: number[];
    label_ids?: number[];
    note?: string;
    sort_order?: number;
  }>(event);

  const location_id = Number(body?.location_id);
  const day_of_week = Number(body?.day_of_week);
  const start_time = (body?.start_time || "").trim();
  const end_time = (body?.end_time || "").trim();

  if (!location_id)
    throw createError({
      statusCode: 400,
      statusMessage: "Standort erforderlich",
    });
  if (day_of_week < 0 || day_of_week > 6 || isNaN(day_of_week))
    throw createError({
      statusCode: 400,
      statusMessage: "Ungültiger Wochentag",
    });
  if (!start_time || !end_time)
    throw createError({
      statusCode: 400,
      statusMessage: "Zeiten erforderlich",
    });

  const db = useDb();

  const info = db
    .prepare(
      `INSERT INTO schedule_entries (location_id, day_of_week, start_time, end_time, group_id, note, sort_order)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(
      location_id,
      day_of_week,
      start_time,
      end_time,
      body?.group_id ?? null,
      body?.note?.trim() || null,
      body?.sort_order ?? 0,
    );

  const entryId = info.lastInsertRowid as number;

  const trainerIds: number[] = Array.isArray(body?.trainer_ids)
    ? body.trainer_ids
    : [];
  const insertTrainer = db.prepare(
    "INSERT OR IGNORE INTO schedule_entry_trainers (entry_id, trainer_id) VALUES (?, ?)",
  );
  for (const tid of trainerIds) {
    insertTrainer.run(entryId, tid);
  }

  const entry = db
    .prepare(
      `SELECT se.*, l.name AS location_name, g.name AS group_name
       FROM schedule_entries se
       LEFT JOIN locations l ON l.id = se.location_id
       LEFT JOIN groups g ON g.id = se.group_id
       WHERE se.id = ?`,
    )
    .get(entryId) as any;

  const trainers = db
    .prepare(
      `SELECT t.id, t.name, t.color FROM schedule_entry_trainers set2
       JOIN trainers t ON t.id = set2.trainer_id WHERE set2.entry_id = ?`,
    )
    .all(entryId);

  const labelIds: number[] = Array.isArray(body?.label_ids)
    ? body!.label_ids!
    : [];
  const insertLabel = db.prepare(
    "INSERT OR IGNORE INTO schedule_entry_labels (entry_id, label_id) VALUES (?, ?)",
  );
  for (const lid of labelIds) {
    insertLabel.run(entryId, lid);
  }

  const labels = db
    .prepare(
      `SELECT l.id, l.name FROM schedule_entry_labels sel
       JOIN labels l ON l.id = sel.label_id WHERE sel.entry_id = ?`,
    )
    .all(entryId);

  const result = { ...entry, trainers, labels };
  broadcastEvent("schedules:created", result);
  return result;
});
