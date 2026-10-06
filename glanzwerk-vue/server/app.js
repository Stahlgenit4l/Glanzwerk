import express from "express";
import { randomUUID } from "node:crypto";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import {
  bookingWindow,
  todayInVienna,
  isValidDate,
  isSunday,
} from "../shared/calendar.js";
import { servicePackages } from "../shared/services.js";

function validString(value, min, max) {
  return (
    typeof value === "string" &&
    value.trim().length >= min &&
    value.length <= max
  );
}

export function createApp(
  database,
  { staticDirectory = resolve("dist") } = {},
) {
  const app = express();
  app.disable("x-powered-by");
  app.use(express.json({ limit: "16kb" }));

  app.get("/api/bookings", (request, response) => {
    response.set("Cache-Control", "no-store");
    try {
      const rows = database
        .prepare("SELECT date FROM bookings WHERE date >= ? ORDER BY date")
        .all(todayInVienna());
      response.json({ dates: rows.map((row) => row.date), ...bookingWindow() });
    } catch (error) {
      console.error(
        "Verfügbarkeit konnte nicht gelesen werden:",
        error.message,
      );
      response
        .status(503)
        .json({ error: "Verfügbarkeit derzeit nicht verfügbar." });
    }
  });

  app.post("/api/bookings", (request, response) => {
    const origin = request.get("origin");
    if (origin && origin !== `${request.protocol}://${request.get("host")}`) {
      return response.status(403).json({ error: "Ungültige Anfrage." });
    }
    const data = request.body;
    if (!data || typeof data !== "object" || Array.isArray(data)) {
      return response.status(400).json({ error: "Bitte prüfe deine Angaben." });
    }
    const { date, service, name, phone, email, vehicle, consent } = data;
    const notes = data.notes ?? "";
    const { minDate, maxDate } = bookingWindow();
    if (
      !isValidDate(date) ||
      date < minDate ||
      date > maxDate ||
      !servicePackages.some((pack) => pack.id === service) ||
      !validString(name, 1, 100) ||
      !validString(phone, 6, 30) ||
      !validString(email, 3, 150) ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
      !validString(vehicle, 1, 150) ||
      !validString(notes, 0, 1000) ||
      consent !== true
    ) {
      return response
        .status(400)
        .json({
          error:
            "Bitte prüfe deine Angaben. Termine sind ab morgen, Montag bis Samstag, innerhalb von 90 Tagen buchbar.",
        });
    }
    try {
      const id = randomUUID();
      database
        .prepare(
          `
        INSERT INTO bookings (id, date, service, name, phone, email, vehicle, notes, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
        )
        .run(
          id,
          date,
          service,
          name.trim(),
          phone.trim(),
          email.trim(),
          vehicle.trim(),
          notes.trim(),
          new Date().toISOString(),
        );
      response.status(201).json({ reference: id.slice(0, 8).toUpperCase() });
    } catch (error) {
      if (
        String(error.message).includes(
          "UNIQUE constraint failed: bookings.date",
        )
      ) {
        return response
          .status(409)
          .json({
            error:
              "Dieser Termin wurde gerade gebucht. Bitte wähle einen anderen Tag.",
          });
      }
      console.error("Buchung konnte nicht gespeichert werden:", error.message);
      response
        .status(503)
        .json({
          error: "Speichern derzeit nicht möglich. Bitte versuche es erneut.",
        });
    }
  });

  // Keine öffentliche Route für Kundendaten.
  app.use("/api", (request, response) =>
    response.status(404).json({ error: "API-Endpunkt nicht gefunden." }),
  );
  if (existsSync(resolve(staticDirectory, "index.html"))) {
    app.use(express.static(staticDirectory));
    app.get("/", (request, response) =>
      response.sendFile(resolve(staticDirectory, "index.html")),
    );
  }
  app.use((error, request, response, next) => {
    if (error.type === "entity.too.large")
      return response.status(413).json({ error: "Die Anfrage ist zu groß." });
    if (error instanceof SyntaxError)
      return response.status(400).json({ error: "Ungültiges JSON." });
    console.error(error.message);
    response.status(500).json({ error: "Ein Serverfehler ist aufgetreten." });
  });
  return app;
}
