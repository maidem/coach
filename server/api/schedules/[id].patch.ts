import { requireAdmin } from "../../utils/auth";
import { broadcastEvent } from "../../utils/socket";

export default defineEventHandler(async (event) => {
  requireAdmin(event);
  const id = Number(getRouterParam(event, "id"));
  const db = useDb();

  const existing = db
    .prepare("SELECT * FROM schedule_entries WHERE id = ?")
    .get(id) as any;
  if (!existing) throw createError({ statusCode: 404 });

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

  const location_id =
    body?.location_id !== undefined
      ? Number(body.location_id)
      : existing.location_id;
  const day_of_week =
    body?.day_of_week !== undefined
      ? Number(body.day_of_week)
      : existing.day_of_week;
  const start_time = body?.start_time?.trim() ?? existing.start_time;
  const end_time = body?.end_time?.trim() ?? existing.end_time;
  const group_id =
    "group_id" in (body ?? {}) ? (body!.group_id ?? null) : existing.group_id;
  const note =
    body?.note !== undefined ? body?.note?.trim() || null : existing.note;
  const sort_order =
    body?.sort_order !== undefined ? body.sort_order : existing.sort_order;

  db.prepare(
    `UPDATE schedule_entries
     SET location_id=?, day_of_week=?, start_time=?, end_time=?, group_id=?, note=?, sort_order=?
     WHERE id=?`,
  ).run(
    location_id,
    day_of_week,
    start_time,
    end_time,
    group_id,
    note,
    sort_order,
    id,
  );

  if (Array.isArray(body?.trainer_ids)) {
    db.prepare("DELETE FROM schedule_entry_trainers WHERE entry_id = ?").run(
      id,
    );
    const ins = db.prepare(
      "INSERT OR IGNORE INTO schedule_entry_trainers (entry_id, trainer_id) VALUES (?, ?)",
    );
    for (const tid of body!.trainer_ids!) {
      ins.run(id, tid);
    }
  }

  if (Array.isArray(body?.label_ids)) {
    db.prepare("DELETE FROM schedule_entry_labels WHERE entry_id = ?").run(id);
    const insL = db.prepare(
      "INSERT OR IGNORE INTO schedule_entry_labels (entry_id, label_id) VALUES (?, ?)",
    );
    for (const lid of body!.label_ids!) {
      insL.run(id, lid);
    }
  }

  const entry = db
    .prepare(
      `SELECT se.*, l.name AS location_name, g.name AS group_name
       FROM schedule_entries se
       LEFT JOIN locations l ON l.id = se.location_id
       LEFT JOIN groups g ON g.id = se.group_id
       WHERE se.id = ?`,
    )
    .get(id) as any;

  const trainers = db
    .prepare(
      `SELECT t.id, t.name, t.color FROM schedule_entry_trainers set2
       JOIN trainers t ON t.id = set2.trainer_id WHERE set2.entry_id = ?`,
    )
    .all(id);

  const labels = db
    .prepare(
      `SELECT l.id, l.name FROM schedule_entry_labels sel
       JOIN labels l ON l.id = sel.label_id WHERE sel.entry_id = ?`,
    )
    .all(id);

  const result = { ...entry, trainers, labels };
  broadcastEvent("schedules:updated", result);
  return result;
});
