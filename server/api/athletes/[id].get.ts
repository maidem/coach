import type { Athlete, Equipment } from "~/types/models";

interface AthleteDetail extends Athlete {
  belt_name?: string;
  weight_class_name?: string;
  group_name?: string;
  competition_name?: string;
  travel_option_name?: string;
  equipment?: Equipment[];
}

export default defineEventHandler((event): AthleteDetail | null => {
  const id = parseInt(getRouterParam(event, "id") || "0");
  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: "Ungültige ID",
    });
  }

  const db = useDb();

  const athlete = db
    .prepare(
      `
      SELECT
        a.*,
        b.name as belt_name,
        wc.name as weight_class_name,
        g.name as group_name,
        c.name as competition_name,
        t.name as travel_option_name
      FROM athletes a
      LEFT JOIN belts b ON a.belt_id = b.id
      LEFT JOIN weight_classes wc ON a.weight_class_id = wc.id
      LEFT JOIN groups g ON a.group_id = g.id
      LEFT JOIN competitions c ON a.competition_id = c.id
      LEFT JOIN travel_options t ON a.travel_option_id = t.id
      WHERE a.id = ?
      `,
    )
    .get(id) as AthleteDetail | undefined;

  if (!athlete) {
    throw createError({
      statusCode: 404,
      statusMessage: "Athlet nicht gefunden",
    });
  }

  // Get equipment
  const equipment = db
    .prepare(
      `
      SELECT e.* FROM equipment e
      JOIN athlete_equipment ae ON e.id = ae.equipment_id
      WHERE ae.athlete_id = ?
      `,
    )
    .all(id) as Equipment[];

  athlete.equipment = equipment;

  return athlete;
});
