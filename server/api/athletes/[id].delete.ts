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
  // Cascade delete via foreign key
  db.prepare("DELETE FROM athletes WHERE id = ?").run(id);

  return { success: true };
});
