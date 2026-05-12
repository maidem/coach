import type { Competition } from "~/types/models";

export default defineEventHandler((): Competition[] => {
  const db = useDb();
  const competitions = db
    .prepare("SELECT * FROM competitions ORDER BY created_at DESC")
    .all() as Competition[];
  return competitions;
});
