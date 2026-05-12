import type { Equipment } from "~/types/models";

export default defineEventHandler(async (event): Promise<Equipment> => {
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
    const item = db
      .prepare("UPDATE equipment SET name = ? WHERE id = ? RETURNING *")
      .get(body.name.trim(), id) as Equipment | undefined;

    if (!item) {
      throw createError({
        statusCode: 404,
        statusMessage: "Ausstattung nicht gefunden",
      });
    }

    return item;
  } catch (error: any) {
    if (error.message?.includes("UNIQUE")) {
      throw createError({
        statusCode: 409,
        statusMessage: "Ausstattung mit diesem Namen existiert bereits",
      });
    }
    throw error;
  }
});
