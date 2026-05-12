import type { Group } from "~/types/models";

export default defineEventHandler(async (event): Promise<Group> => {
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
    const group = db
      .prepare(
        "INSERT INTO groups (name, description) VALUES (?, ?) RETURNING *",
      )
      .get(body.name.trim(), body.description || null) as Group;
    return group;
  } catch (error: any) {
    if (error.message?.includes("UNIQUE")) {
      throw createError({
        statusCode: 409,
        statusMessage: "Gruppe mit diesem Namen existiert bereits",
      });
    }
    throw error;
  }
});
