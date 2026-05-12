export default defineEventHandler(() => {
  const db = useDb();

  const entries = db
    .prepare(
      `SELECT
        se.id, se.location_id, se.day_of_week, se.start_time, se.end_time,
        se.group_id, se.note, se.sort_order, se.created_at,
        l.name AS location_name, l.description AS location_description,
        g.name AS group_name, g.description AS group_description
      FROM schedule_entries se
      LEFT JOIN locations l ON l.id = se.location_id
      LEFT JOIN groups g ON g.id = se.group_id
      ORDER BY se.location_id, se.day_of_week, se.start_time, se.sort_order`,
    )
    .all() as any[];

  const trainerRows = db
    .prepare(
      `SELECT set2.entry_id, t.id, t.name, t.color
       FROM schedule_entry_trainers set2
       JOIN trainers t ON t.id = set2.trainer_id`,
    )
    .all() as any[];

  const trainersByEntry: Record<number, any[]> = {};
  for (const row of trainerRows) {
    if (!trainersByEntry[row.entry_id]) trainersByEntry[row.entry_id] = [];
    trainersByEntry[row.entry_id].push({
      id: row.id,
      name: row.name,
      color: row.color,
    });
  }

  const labelRows = db
    .prepare(
      `SELECT sel.entry_id, l.id, l.name
       FROM schedule_entry_labels sel
       JOIN labels l ON l.id = sel.label_id`,
    )
    .all() as any[];

  const labelsByEntry: Record<number, any[]> = {};
  for (const row of labelRows) {
    if (!labelsByEntry[row.entry_id]) labelsByEntry[row.entry_id] = [];
    labelsByEntry[row.entry_id].push({ id: row.id, name: row.name });
  }

  return entries.map((e) => ({
    ...e,
    trainers: trainersByEntry[e.id] ?? [],
    labels: labelsByEntry[e.id] ?? [],
  }));
});
