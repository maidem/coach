import type { WeightClass } from "~/types/models";

export default defineEventHandler((): WeightClass[] => {
  const db = useDb();
  const classes = db
    .prepare("SELECT * FROM weight_classes ORDER BY min_weight ASC")
    .all() as WeightClass[];
  return classes;
});
