import type { Competition } from "~/types/models";

export default defineEventHandler(async (event): Promise<Competition> => {
  requireAdmin(event);

  const body = await readBody(event);

  if (!body.name?.trim()) {
    throw createError({
      statusCode: 400,
      statusMessage: "Name ist erforderlich",
    });
  }

  const db = useDb();
  const competition = db
    .prepare(
      "INSERT INTO competitions (name, tournament_link, date, ausschreibung) VALUES (?, ?, ?, ?) RETURNING *",
    )
    .get(
      body.name.trim(),
      body.tournament_link || null,
      body.date || null,
      body.ausschreibung || null,
    ) as Competition;

  return competition;
});
