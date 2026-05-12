import { requireAdmin } from "../../utils/auth";
import { broadcastEvent } from "../../utils/socket";

export default defineEventHandler((event) => {
  requireAdmin(event);
  const id = Number(getRouterParam(event, "id"));
  useDb().prepare("DELETE FROM schedule_entries WHERE id = ?").run(id);
  broadcastEvent("schedules:deleted", { id });
  return { ok: true };
});
