import type { TravelOption } from "~/types/models";

export default defineEventHandler((): TravelOption[] => {
  const db = useDb();
  const options = db
    .prepare("SELECT * FROM travel_options ORDER BY name ASC")
    .all() as TravelOption[];
  return options;
});
