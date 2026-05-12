import type { Equipment } from "~/types/models";

export default defineEventHandler(async (event): Promise<Equipment> => {
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
    const item = db
      .prepare("INSERT INTO equipment (name) VALUES (?) RETURNING *")
      .get(body.name.trim()) as Equipment;
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
