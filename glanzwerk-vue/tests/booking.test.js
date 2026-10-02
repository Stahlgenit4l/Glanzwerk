import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { once } from "node:events";
import { createPinia, setActivePinia } from "pinia";
import { openDatabase } from "../server/database.js";
import { createApp } from "../server/app.js";
import { bookingWindow, addDays, isSunday } from "../shared/calendar.js";
import { useBookingStore } from "../src/stores/booking.js";

function nextBusinessDay() {
  const { minDate } = bookingWindow();
  return isSunday(minDate) ? addDays(minDate, 1) : minDate;
}
const customer = {
  name: "Test Person",
  phone: "+43 1234567",
  email: "test@example.com",
  vehicle: "Opel Vectra",
  notes: "",
  consent: true,
};

async function fixture(t) {
  const directory = await mkdtemp(join(tmpdir(), "glanzwerk-test-"));
  const file = join(directory, "bookings.sqlite");
  const database = openDatabase(file);
  const server = createApp(database).listen(0, "127.0.0.1");
  await once(server, "listening");
  const base = `http://127.0.0.1:${server.address().port}`;
  t.after(async () => {
    await new Promise((resolve) => server.close(resolve));
    database.close();
    await rm(directory, { recursive: true, force: true });
  });
  return { database, file, base };
}

async function post(base, body, origin = base) {
  return fetch(`${base}/api/bookings`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: origin },
    body: JSON.stringify(body),
  });
}

test("Buchungen bleiben in SQLite und sind gegen doppelte Termine geschützt", async (t) => {
  const { base, file } = await fixture(t);
  const payload = { ...customer, date: nextBusinessDay(), service: "interior" };
  const results = await Promise.all([post(base, payload), post(base, payload)]);
  assert.deepEqual(results.map((r) => r.status).sort(), [201, 409]);
  const success = await results.find((r) => r.status === 201).json();
  assert.match(success.reference, /^[A-F0-9]{8}$/);
  const availability = await (await fetch(`${base}/api/bookings`)).json();
  assert.deepEqual(availability.dates, [payload.date]);
  assert.ok(!JSON.stringify(availability).includes(customer.email));
  const secondConnection = openDatabase(file);
  assert.equal(
    secondConnection.prepare("SELECT COUNT(*) AS n FROM bookings").get().n,
    1,
  );
  assert.equal(
    secondConnection.prepare("SELECT email FROM bookings").get().email,
    customer.email,
  );
  secondConnection.close();
});

test("Backend lehnt ungültige Eingaben, Sonntage und fremde Origins ab", async (t) => {
  const { base, database } = await fixture(t);
  const valid = { ...customer, date: nextBusinessDay(), service: "politur" };
  let sunday = bookingWindow().minDate;
  while (!isSunday(sunday)) sunday = addDays(sunday, 1);
  for (const changes of [
    { date: "2026-02-30" },
    { date: "2020-01-01" },
    { date: sunday },
    { date: addDays(bookingWindow().maxDate, 1) },
    { consent: false },
    { service: "fake" },
    { email: "falsch" },
    { name: "  " },
    { notes: "x".repeat(1001) },
  ])
    assert.equal((await post(base, { ...valid, ...changes })).status, 400);
  assert.equal(
    (await post(base, valid, "https://fremde-seite.example")).status,
    403,
  );
  assert.equal(
    database.prepare("SELECT COUNT(*) AS n FROM bookings").get().n,
    0,
  );
});

test("Pinia lädt Verfügbarkeit, speichert die Paketauswahl und hält eine stabile Bestätigung", async (t) => {
  const { base } = await fixture(t);
  const realFetch = globalThis.fetch;
  globalThis.fetch = (url, options) => realFetch(new URL(url, base), options);
  t.after(() => {
    globalThis.fetch = realFetch;
  });
  setActivePinia(createPinia());
  const store = useBookingStore();
  await store.loadAvailability();
  assert.equal(store.availabilityReady, true);
  store.selectedService = "politur";
  store.date = nextBusinessDay();
  Object.assign(store.form, customer);
  assert.equal(store.canSubmit, true);
  assert.equal(await store.submitBooking(), true);
  assert.equal(store.confirmation.service, "politur");
  store.selectedService = "interior";
  assert.equal(store.confirmation.service, "politur");
  assert.ok(store.bookedDates.includes(store.date));
  await store.startNewBooking();
  assert.equal(store.confirmation, null);
  assert.equal(store.form.name, "");
  assert.equal(store.date, "");
  assert.equal(store.availabilityReady, true);
});

test("Bei Netzwerkfehlern bleiben Formulareingaben im Pinia-Store erhalten", async (t) => {
  const realFetch = globalThis.fetch;
  globalThis.fetch = async () => {
    throw new Error("Verbindung unterbrochen");
  };
  t.after(() => {
    globalThis.fetch = realFetch;
  });
  setActivePinia(createPinia());
  const store = useBookingStore();
  store.date = nextBusinessDay();
  store.availabilityReady = true;
  Object.assign(store.form, customer);
  assert.equal(await store.submitBooking(), false);
  assert.equal(store.form.name, customer.name);
  assert.equal(store.form.email, customer.email);
  assert.equal(store.saving, false);
  assert.equal(store.confirmation, null);
  assert.match(store.submitError, /Verbindung/);
});
