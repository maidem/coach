import type { Belt } from "~/types/models";

export default defineEventHandler(async (event): Promise<Belt> => {
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

  try {
    const belt = db
      .prepare(
        'UPDATE belts SET name = ?, "order" = ? WHERE id = ? RETURNING *',
      )
      .get(body.name.trim(), body.order ?? 0, id) as Belt | undefined;

    if (!belt) {
      throw createError({
        statusCode: 404,
        statusMessage: "Gürtelgrad nicht gefunden",
      });
    }

    return belt;
  } catch (error: any) {
    if (error.message?.includes("UNIQUE")) {
      throw createError({
        statusCode: 409,
        statusMessage: "Gürtelgrad mit diesem Namen existiert bereits",
      });
    }
    throw error;
  }
});
