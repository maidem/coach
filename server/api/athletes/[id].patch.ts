import type { Athlete } from "~/types/models";

export default defineEventHandler(async (event): Promise<Athlete> => {
  requireAdmin(event);

  const id = parseInt(getRouterParam(event, "id") || "0");
  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: "Ungültige ID",
    });
  }

  const body = await readBody(event);

  const firstName = (body.first_name || "").trim();
  const lastName = (body.last_name || "").trim();
  if (!firstName || !lastName) {
    throw createError({
      statusCode: 400,
      statusMessage: "Vor- und Nachname sind erforderlich",
    });
  }
  const fullName = `${firstName} ${lastName}`;

  const db = useDb();

  const athlete = db
    .prepare(
      `
      UPDATE athletes SET
        name = ?,
        first_name = ?,
        last_name = ?,
        photo = ?,
        belt_id = ?,
        weight_class_id = ?,
        group_id = ?,
        competition_id = ?,
        travel_option_id = ?,
        entry_fee_paid = ?,
        overnight_stay = ?,
        notes = ?,
        updated_at = datetime('now')
      WHERE id = ?
      RETURNING *
      `,
    )
    .get(
      fullName,
      firstName,
      lastName,
      body.photo !== undefined ? body.photo : null,
      body.belt_id || null,
      body.weight_class_id || null,
      body.group_id || null,
      body.competition_id || null,
      body.travel_option_id || null,
      body.entry_fee_paid ? 1 : 0,
      body.overnight_stay ? 1 : 0,
      body.notes || null,
      id,
    ) as Athlete | undefined;

  if (!athlete) {
    throw createError({
      statusCode: 404,
      statusMessage: "Athlet nicht gefunden",
    });
  }

  // Update equipment
  if (body.equipment_ids && Array.isArray(body.equipment_ids)) {
    db.prepare("DELETE FROM athlete_equipment WHERE athlete_id = ?").run(id);
    const stmt = db.prepare(
      "INSERT INTO athlete_equipment (athlete_id, equipment_id) VALUES (?, ?)",
    );
    for (const equipmentId of body.equipment_ids) {
      stmt.run(id, equipmentId);
    }
  }

  return athlete;
});
