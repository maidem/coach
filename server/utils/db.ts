import Database from "better-sqlite3";
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";

let db: Database.Database | null = null;

export function useDb(): Database.Database {
  if (db) {
    // Re-run idempotent migrations for hot-reload/deploy safety.
    migrate(db);
    return db;
  }
  const config = useRuntimeConfig();
  const dbPath = resolve(
    process.env.DATABASE_PATH || (config.databasePath as string),
  );
  mkdirSync(dirname(dbPath), { recursive: true });

  db = new Database(dbPath);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  migrate(db);
  return db;
}

function migrate(db: Database.Database) {
  // Admin Masters
  db.exec(`
    CREATE TABLE IF NOT EXISTS belts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      "order" INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS weight_classes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      min_weight REAL,
      max_weight REAL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS groups (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      description TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS competitions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      tournament_link TEXT,
      date TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS travel_options (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS equipment (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- Main Athlete Table
    CREATE TABLE IF NOT EXISTS athletes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      belt_id INTEGER REFERENCES belts(id) ON DELETE SET NULL,
      weight_class_id INTEGER REFERENCES weight_classes(id) ON DELETE SET NULL,
      group_id INTEGER REFERENCES groups(id) ON DELETE SET NULL,
      competition_id INTEGER REFERENCES competitions(id) ON DELETE SET NULL,
      travel_option_id INTEGER REFERENCES travel_options(id) ON DELETE SET NULL,
      entry_fee_paid BOOLEAN NOT NULL DEFAULT 0,
      overnight_stay BOOLEAN NOT NULL DEFAULT 0,
      notes TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS athlete_equipment (
      athlete_id INTEGER NOT NULL REFERENCES athletes(id) ON DELETE CASCADE,
      equipment_id INTEGER NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,
      PRIMARY KEY (athlete_id, equipment_id)
    );

    -- Indexes
    CREATE INDEX IF NOT EXISTS idx_athletes_belt ON athletes(belt_id);
    CREATE INDEX IF NOT EXISTS idx_athletes_weight_class ON athletes(weight_class_id);
    CREATE INDEX IF NOT EXISTS idx_athletes_group ON athletes(group_id);
    CREATE INDEX IF NOT EXISTS idx_athletes_competition ON athletes(competition_id);
    CREATE INDEX IF NOT EXISTS idx_athletes_travel_option ON athletes(travel_option_id);
    CREATE INDEX IF NOT EXISTS idx_athlete_equipment_athlete ON athlete_equipment(athlete_id);
    CREATE INDEX IF NOT EXISTS idx_athlete_equipment_equipment ON athlete_equipment(equipment_id);
  `);

  // Idempotent column additions for athletes
  for (const col of [
    "ALTER TABLE athletes ADD COLUMN first_name TEXT NOT NULL DEFAULT ''",
    "ALTER TABLE athletes ADD COLUMN last_name TEXT NOT NULL DEFAULT ''",
    "ALTER TABLE athletes ADD COLUMN photo TEXT",
  ]) {
    try {
      db.exec(col);
    } catch {
      /* column already exists */
    }
  }

  // Seed default belt grades if table is empty
  const beltCount = (
    db.prepare("SELECT COUNT(*) as c FROM belts").get() as { c: number }
  ).c;
  if (beltCount === 0) {
    const insertBelt = db.prepare(
      `INSERT OR IGNORE INTO belts (name, "order") VALUES (?, ?)`,
    );
    const belts = [
      "10. Kup",
      "9. Kup",
      "8. Kup",
      "7. Kup",
      "6. Kup",
      "5. Kup",
      "4. Kup",
      "3. Kup",
      "2. Kup",
      "1. Kup",
      "1. Dan",
      "2. Dan",
      "3. Dan",
      "4. Dan",
      "5. Dan",
      "6. Dan",
      "7. Dan",
      "8. Dan",
      "9. Dan",
    ];
    belts.forEach((name, i) => insertBelt.run(name, i + 1));
  }
}
