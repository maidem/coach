import type { Belt } from "~/types/models";

export default defineEventHandler(async (event): Promise<Belt> => {
  requireAdmin(event);

  const body = await readBody(event);

  if (!body.name?.trim()) {
    throw createError({
      statusCode: 400,
      statusMessage: "Name ist erforderlich",
    });
  }

  const db = useDb();
  const stmt = db.prepare(
    'INSERT INTO belts (name, "order") VALUES (?, ?) RETURNING *',
  );

  try {
    const belt = stmt.get(body.name.trim(), body.order || 0) as Belt;
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
