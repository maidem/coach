import type { Belt } from "~/types/models";

export default defineEventHandler((): Belt[] => {
  const db = useDb();
  const belts = db
    .prepare('SELECT * FROM belts ORDER BY "order" ASC, name ASC')
    .all() as Belt[];
  return belts;
});
