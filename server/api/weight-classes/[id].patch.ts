import type { WeightClass } from "~/types/models";

export default defineEventHandler(async (event): Promise<WeightClass> => {
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
    const wc = db
      .prepare(
        "UPDATE weight_classes SET name = ?, min_weight = ?, max_weight = ? WHERE id = ? RETURNING *",
      )
      .get(
        body.name.trim(),
        body.min_weight || null,
        body.max_weight || null,
        id,
      ) as WeightClass | undefined;

    if (!wc) {
      throw createError({
        statusCode: 404,
        statusMessage: "Gewichtsklasse nicht gefunden",
      });
    }

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
