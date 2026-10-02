export const TIME_ZONE = "Europe/Vienna";

export function todayInVienna(now = new Date()) {
  return new Intl.DateTimeFormat("sv-SE", { timeZone: TIME_ZONE }).format(now);
}

export function addDays(date, days) {
  const value = new Date(`${date}T12:00:00Z`);
  value.setUTCDate(value.getUTCDate() + days);
  return value.toISOString().slice(0, 10);
}

export function bookingWindow(now = new Date()) {
  const today = todayInVienna(now);
  return { minDate: addDays(today, 1), maxDate: addDays(today, 90) };
}

export function isValidDate(date) {
  if (typeof date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(date))
    return false;
  const parsed = new Date(`${date}T12:00:00Z`);
  return (
    Number.isFinite(parsed.getTime()) &&
    parsed.toISOString().slice(0, 10) === date
  );
}

export function isSunday(date) {
  return isValidDate(date) && new Date(`${date}T12:00:00Z`).getUTCDay() === 0;
}

export function formatDate(date) {
  return isValidDate(date)
    ? new Intl.DateTimeFormat("de-AT", { timeZone: TIME_ZONE }).format(
        new Date(`${date}T12:00:00Z`),
      )
    : "";
}
