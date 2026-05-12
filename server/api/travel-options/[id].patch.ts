import type { TravelOption } from "~/types/models";

export default defineEventHandler(async (event): Promise<TravelOption> => {
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
    const option = db
      .prepare("UPDATE travel_options SET name = ? WHERE id = ? RETURNING *")
      .get(body.name.trim(), id) as TravelOption | undefined;

    if (!option) {
      throw createError({
        statusCode: 404,
        statusMessage: "Reisemöglichkeit nicht gefunden",
      });
    }

    return option;
  } catch (error: any) {
    if (error.message?.includes("UNIQUE")) {
      throw createError({
        statusCode: 409,
        statusMessage: "Reisemöglichkeit mit diesem Namen existiert bereits",
      });
    }
    throw error;
  }
});
