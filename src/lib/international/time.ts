/**
 * Temps international : stockage UTC, affichage dans le fuseau IANA de l'événement.
 */

export function offsetMinutesFor(utcDate: Date, timeZone: string): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(utcDate);

  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value ?? 0);
  const asUtc = Date.UTC(get("year"), get("month") - 1, get("day"), get("hour"), get("minute"), get("second"));
  // Les secondes tronquées sont volontairement ignorées : l'offset est en minutes.
  return Math.round((asUtc - utcDate.getTime()) / 60000);
}

export function localDateTimeToUtc(date: string, time: string, timeZone: string): string {
  const [year, month, day] = date.split("-").map(Number);
  const [hour, minute] = time.split(":").map(Number);
  if (!year || !month || !day || hour === undefined || minute === undefined) {
    throw new Error("Date ou heure invalide");
  }

  let guess = Date.UTC(year, month - 1, day, hour, minute);
  // Deux passes suffisent pour absorber les changements d'heure d'été.
  for (let i = 0; i < 2; i += 1) {
    const offset = offsetMinutesFor(new Date(guess), timeZone);
    guess = Date.UTC(year, month - 1, day, hour, minute) - offset * 60000;
  }
  return new Date(guess).toISOString();
}

export function formatInZone(
  iso: string,
  timeZone: string,
  locale = "en-US",
  options?: Intl.DateTimeFormatOptions
): string {
  return new Intl.DateTimeFormat(locale, {
    timeZone,
    dateStyle: "medium",
    timeStyle: "short",
    ...options,
  }).format(new Date(iso));
}

export function zoneParts(iso: string, timeZone: string, locale = "en-US") {
  const parts = new Intl.DateTimeFormat(locale, {
    timeZone,
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date(iso));
  return parts.reduce<Record<string, string>>((acc, part) => {
    if (part.type !== "literal") acc[part.type] = part.value;
    return acc;
  }, {});
}

export function isValidTimeZone(timeZone: string): boolean {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone });
    return true;
  } catch {
    return false;
  }
}
