import type { Athlete } from "~/types/models";

export default defineEventHandler(async (event): Promise<Athlete> => {
  requireAdmin(event);

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
      INSERT INTO athletes (
        name,
        first_name,
        last_name,
        photo,
        belt_id,
        weight_class_id,
        group_id,
        competition_id,
        travel_option_id,
        entry_fee_paid,
        overnight_stay,
        notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      RETURNING *
      `,
    )
    .get(
      fullName,
      firstName,
      lastName,
      body.photo || null,
      body.belt_id || null,
      body.weight_class_id || null,
      body.group_id || null,
      body.competition_id || null,
      body.travel_option_id || null,
      body.entry_fee_paid ? 1 : 0,
      body.overnight_stay ? 1 : 0,
      body.notes || null,
    ) as Athlete;

  // Add equipment if provided
  if (body.equipment_ids && Array.isArray(body.equipment_ids)) {
    const stmt = db.prepare(
      "INSERT INTO athlete_equipment (athlete_id, equipment_id) VALUES (?, ?)",
    );
    for (const equipmentId of body.equipment_ids) {
      stmt.run(athlete.id, equipmentId);
    }
  }

  return athlete;
});
