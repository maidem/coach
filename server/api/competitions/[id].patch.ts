import type { Competition } from "~/types/models";

export default defineEventHandler(async (event): Promise<Competition> => {
  requireAdmin(event);

  const id = parseInt(getRouterParam(event, "id") || "0");
  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: "Ungültige ID",
    });
  }

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
      "UPDATE competitions SET name = ?, tournament_link = ?, date = ? WHERE id = ? RETURNING *",
    )
    .get(
      body.name.trim(),
      body.tournament_link || null,
      body.date || null,
      id,
    ) as Competition | undefined;

  if (!competition) {
    throw createError({
      statusCode: 404,
      statusMessage: "Wettkampf nicht gefunden",
    });
  }

  return competition;
});
