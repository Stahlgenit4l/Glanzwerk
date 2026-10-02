CREATE TABLE IF NOT EXISTS bookings (
  id TEXT PRIMARY KEY NOT NULL,
  date TEXT NOT NULL,
  service TEXT NOT NULL,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  vehicle TEXT NOT NULL,
  notes TEXT NOT NULL,
  created_at TEXT NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS bookings_date_unique ON bookings(date);
