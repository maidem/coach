import type { WeightClass } from "~/types/models";

export default defineEventHandler(async (event): Promise<WeightClass> => {
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
    const wc = db
      .prepare(
        "INSERT INTO weight_classes (name, min_weight, max_weight) VALUES (?, ?, ?) RETURNING *",
      )
      .get(
        body.name.trim(),
        body.min_weight || null,
        body.max_weight || null,
      ) as WeightClass;
    return wc;
  } catch (error: any) {
    if (error.message?.includes("UNIQUE")) {
      throw createError({
        statusCode: 409,
        statusMessage: "Gewichtsklasse mit diesem Namen existiert bereits",
      });
    }
    throw error;
  }
});
