import type { Equipment } from "~/types/models";

export default defineEventHandler((): Equipment[] => {
  const db = useDb();
  const equipment = db
    .prepare("SELECT * FROM equipment ORDER BY name ASC")
    .all() as Equipment[];
  return equipment;
});
