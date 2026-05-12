import type { Group } from "~/types/models";

export default defineEventHandler((): Group[] => {
  const db = useDb();
  const groups = db
    .prepare("SELECT * FROM groups ORDER BY name ASC")
    .all() as Group[];
  return groups;
});
