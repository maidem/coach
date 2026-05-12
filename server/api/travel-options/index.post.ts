import type { TravelOption } from "~/types/models";

export default defineEventHandler(async (event): Promise<TravelOption> => {
  requireAdmin(event);

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
      .prepare("INSERT INTO travel_options (name) VALUES (?) RETURNING *")
      .get(body.name.trim()) as TravelOption;
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
