import {
  bookingWindow,
  todayInVienna,
  isValidDate,
  isSunday,
} from "../shared/calendar.js";
import { servicePackages } from "../shared/services.js";

function json(data, status = 200) {
  return Response.json(data, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

function validText(value, min, max) {
  return (
    typeof value === "string" &&
    value.trim().length >= min &&
    value.trim().length <= max
  );
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (!url.pathname.startsWith("/api/")) {
      return env.ASSETS.fetch(request);
    }

    if (url.pathname !== "/api/bookings") {
      return json({ error: "Nicht gefunden." }, 404);
    }

    try {
      if (request.method === "GET") {
        const { results } = await env.DB.prepare(
          "SELECT date FROM bookings WHERE date >= ? ORDER BY date",
        )
          .bind(todayInVienna())
          .all();

        return json({
          dates: results.map((row) => row.date),
          ...bookingWindow(),
        });
      }

      if (request.method !== "POST") {
        return json({ error: "Methode nicht erlaubt." }, 405);
      }

      const origin = request.headers.get("Origin");
      if (origin && origin !== url.origin) {
        return json({ error: "Anfrage nicht erlaubt." }, 403);
      }

      const raw = await request.text();
      if (new TextEncoder().encode(raw).length > 16384) {
        return json({ error: "Anfrage zu groß." }, 413);
      }

      let body;
      try {
        body = JSON.parse(raw);
      } catch {
        return json({ error: "Ungültige Anfrage." }, 400);
      }

      if (!body || typeof body !== "object" || Array.isArray(body)) {
        return json({ error: "Ungültige Angaben." }, 400);
      }

      const { minDate, maxDate } = bookingWindow();
      const notes = body.notes ?? "";

      const valid =
        isValidDate(body.date) &&
        body.date >= minDate &&
        body.date <= maxDate &&
        !isSunday(body.date) &&
        servicePackages.some((service) => service.id === body.service) &&
        validText(body.name, 1, 100) &&
        validText(body.phone, 6, 30) &&
        validText(body.email, 3, 150) &&
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email.trim()) &&
        validText(body.vehicle, 1, 150) &&
        validText(notes, 0, 1000) &&
        body.consent === true;

      if (!valid) {
        return json(
          {
            error:
              "Bitte prüfe deine Angaben. Termine sind ab morgen, Montag bis Samstag, innerhalb von 90 Tagen buchbar.",
          },
          400,
        );
      }

      const id = crypto.randomUUID();

      try {
        await env.DB.prepare(`
          INSERT INTO bookings
            (id, date, service, name, phone, email, vehicle, notes, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `)
          .bind(
            id,
            body.date,
            body.service,
            body.name.trim(),
            body.phone.trim(),
            body.email.trim(),
            body.vehicle.trim(),
            notes.trim(),
            new Date().toISOString(),
          )
          .run();
      } catch (error) {
        if (String(error).includes("UNIQUE constraint failed: bookings.date")) {
          return json(
            { error: "Dieser Termin ist bereits vergeben. Wähle einen anderen Tag." },
            409,
          );
        }
        throw error;
      }

      return json({ reference: id.slice(0, 8).toUpperCase() }, 201);
    } catch {
      return json(
        { error: "Buchungssystem derzeit nicht erreichbar. Bitte später erneut versuchen." },
        503,
      );
    }
  },
};