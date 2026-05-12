// Public endpoint for Typo3 – no authentication required.
// Returns the weekly schedule grouped by location and day of week.
const DAY_NAMES = [
  "Montag",
  "Dienstag",
  "Mittwoch",
  "Donnerstag",
  "Freitag",
  "Samstag",
  "Sonntag",
];

export default defineEventHandler(() => {
  const db = useDb();

  const entries = db
    .prepare(
      `SELECT
        se.id, se.location_id, se.day_of_week, se.start_time, se.end_time,
        se.group_id, se.note, se.sort_order,
        l.name AS location_name, l.description AS location_description,
        g.name AS group_name
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

  // Group by location, then by day_of_week
  const locationMap: Record<number, any> = {};
  for (const entry of entries) {
    if (!locationMap[entry.location_id]) {
      locationMap[entry.location_id] = {
        id: entry.location_id,
        name: entry.location_name,
        description: entry.location_description,
        days: {},
      };
    }
    const loc = locationMap[entry.location_id];
    if (!loc.days[entry.day_of_week]) {
      loc.days[entry.day_of_week] = {
        day_of_week: entry.day_of_week,
        day_name: DAY_NAMES[entry.day_of_week],
        entries: [],
      };
    }
    loc.days[entry.day_of_week].entries.push({
      id: entry.id,
      start_time: entry.start_time,
      end_time: entry.end_time,
      group_name: entry.group_name,
      note: entry.note,
      trainers: trainersByEntry[entry.id] ?? [],
    });
  }

  return Object.values(locationMap).map((loc) => ({
    ...loc,
    days: Object.values(loc.days).sort(
      (a: any, b: any) => a.day_of_week - b.day_of_week,
    ),
  }));
});
