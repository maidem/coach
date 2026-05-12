import type { Athlete } from "~/types/models";

interface AthleteWithJoined extends Athlete {
  belt_name?: string;
  weight_class_name?: string;
  group_name?: string;
  competition_name?: string;
  travel_option_name?: string;
}

export default defineEventHandler((): AthleteWithJoined[] => {
  const db = useDb();

  const athletes = db
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
      ORDER BY a.name ASC
      `,
    )
    .all() as AthleteWithJoined[];

  return athletes;
});
