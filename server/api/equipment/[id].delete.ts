export default defineEventHandler((event) => {
  requireAdmin(event);

  const id = parseInt(getRouterParam(event, "id") || "0");
  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: "Ungültige ID",
    });
  }

  const db = useDb();
  db.prepare("DELETE FROM equipment WHERE id = ?").run(id);

  return { success: true };
});
