export function convertTemp(celsius, unit = "C") {
  const value = Number(celsius);
  if (celsius === null || celsius === undefined || celsius === "" || !Number.isFinite(value)) return "--";
  return Math.round(unit === "F" ? (value * 9) / 5 + 32 : value);
}

export function formatTemp(celsius, unit = "C", includeDegree = true) {
  const value = convertTemp(celsius, unit);
  if (value === "--") return value;
  return includeDegree ? `${value}°` : String(value);
}

export function convertSpeed(kmh, unit = "km/h") {
  const value = Number(kmh);
  if (kmh === null || kmh === undefined || kmh === "" || !Number.isFinite(value)) return "--";

  if (unit === "mph") {
    return `${Math.round(value * 0.621371)} mph`;
  }

  return `${Math.round(value)} km/h`;
}