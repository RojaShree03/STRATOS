
import axios from "axios";

const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;
const BASE_URL = "https://api.openweathermap.org/data/2.5";
const GEO_URL = "https://api.openweathermap.org/geo/1.0";

const http = axios.create({ timeout: 15000 });

function requireApiKey() {
  if (!API_KEY?.trim()) {
    throw new Error("Missing VITE_OPENWEATHER_API_KEY in your .env file.");
  }
}

function validateCoordinates(lat, lon) {
  return Number.isFinite(Number(lat)) &&
    Number.isFinite(Number(lon)) &&
    Number(lat) >= -90 &&
    Number(lat) <= 90 &&
    Number(lon) >= -180 &&
    Number(lon) <= 180;
}

function cityParams(query, coords) {
  if (coords) {
    if (!validateCoordinates(coords.lat, coords.lon)) {
      throw new Error("Invalid location coordinates.");
    }
    return { lat: coords.lat, lon: coords.lon };
  }

  if (typeof query !== "string" || !query.trim()) {
    throw new Error("Please enter a city name.");
  }

  return { q: query.trim() };
}

export function degToCompass(num) {
  if (!Number.isFinite(Number(num))) return "N";
  const directions = [
    "N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE",
    "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW",
  ];
  return directions[Math.round(((Number(num) % 360) + 360) % 360 / 22.5) % 16];
}

export function getBeaufortScale(speedKmH) {
  const speed = Number(speedKmH);
  if (!Number.isFinite(speed) || speed < 0) {
    return { scale: 0, label: "Unknown", description: "Wind data unavailable" };
  }

  const scales = [
    [1, "Calm", "Smoke rises vertically"],
    [5, "Light Air", "Smoke drift indicates wind direction"],
    [11, "Light Breeze", "Wind felt on face; leaves rustle"],
    [19, "Gentle Breeze", "Leaves and twigs move"],
    [28, "Moderate Breeze", "Dust and loose paper are raised"],
    [38, "Fresh Breeze", "Small trees begin to sway"],
    [49, "Strong Breeze", "Large branches move"],
    [61, "High Wind", "Whole trees move"],
    [74, "Gale", "Twigs may break off trees"],
    [89, "Strong Gale", "Minor structural damage is possible"],
    [102, "Storm", "Trees may be uprooted"],
    [117, "Violent Storm", "Widespread damage possible"],
    [Infinity, "Hurricane Force", "Extremely destructive winds"],
  ];

  const index = scales.findIndex(([limit]) => speed < limit);
  const [, label, description] = scales[index];
  return { scale: index, label, description };
}

export function formatLocalTime(timestampSec, timezoneOffsetSec = 0, format = "full") {
  const timestamp = Number.isFinite(Number(timestampSec))
    ? Number(timestampSec)
    : Date.now() / 1000;
  const offset = Number.isFinite(Number(timezoneOffsetSec))
    ? Number(timezoneOffsetSec)
    : 0;
  const date = new Date((timestamp + offset) * 1000);

  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const dayName = days[date.getUTCDay()];
  const dayNum = date.getUTCDate();
  const monthName = months[date.getUTCMonth()];
  const hours = date.getUTCHours();
  const minutes = String(date.getUTCMinutes()).padStart(2, "0");
  const displayHours = hours % 12 || 12;
  const ampm = hours >= 12 ? "PM" : "AM";

  if (format === "timeOnly") return `${displayHours}:${minutes} ${ampm}`;
  if (format === "hourOnly") return `${displayHours} ${ampm}`;
  if (format === "dayOnly") return dayName;
  if (format === "dateKey") {
    return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
  }

  return `${dayName}, ${dayNum} ${monthName} • ${displayHours}:${minutes} ${ampm}`;
}

export function estimateUVIndex(lat, timezoneOffsetSec = 0, cloudCoverPct = 0) {
  const latitude = Number(lat);
  const clouds = Math.max(0, Math.min(100, Number(cloudCoverPct) || 0));

  if (!Number.isFinite(latitude) || Math.abs(latitude) > 90) {
    return { val: null, text: "Unavailable", color: "slate" };
  }

  const localDate = new Date(Date.now() + (Number(timezoneOffsetSec) || 0) * 1000);
  const hour = localDate.getUTCHours() + localDate.getUTCMinutes() / 60;
  const solarDiff = Math.abs(hour - 12.5);

  if (solarDiff >= 6) return { val: 0, text: "Low", color: "emerald" };

  const maxUV = Math.max(0, 12 - (Math.abs(latitude) / 90) * 8);
  const timeFactor = Math.cos((solarDiff / 6) * (Math.PI / 2));
  const cloudFactor = 1 - (clouds / 100) * 0.65;
  const val = Math.min(12, Math.max(0, Math.round(maxUV * timeFactor * cloudFactor)));

  if (val <= 2) return { val, text: "Low", color: "emerald" };
  if (val <= 5) return { val, text: "Moderate", color: "yellow" };
  if (val <= 7) return { val, text: "High", color: "orange" };
  if (val <= 10) return { val, text: "Very High", color: "rose" };
  return { val, text: "Extreme", color: "purple" };
}

export function parseAirQuality(aqiData) {
  const item = aqiData?.list?.[0];
  const comps = item?.components;

  if (!item || !comps) {
    return {
      score: null,
      label: "Unavailable",
      description: "Air quality data is currently unavailable.",
      badgeColor: "text-slate-400 border-slate-500/30 bg-slate-500/10",
      gaugeColor: "#94a3b8",
      components: {},
    };
  }

  const aqi = Number(item.main?.aqi);
  const pm25 = Number(comps.pm2_5);
  const score = Number.isFinite(pm25) ? Math.round(pm25) : null;

  const labels = {
    1: ["Good", "Good air quality.", "text-emerald-400 border-emerald-500/30 bg-emerald-500/10", "#10b981"],
    2: ["Fair", "Acceptable air quality; sensitive people should monitor conditions.", "text-yellow-400 border-yellow-500/30 bg-yellow-500/10", "#eab308"],
    3: ["Moderate", "Some people may experience health effects.", "text-amber-400 border-amber-500/30 bg-amber-500/10", "#f59e0b"],
    4: ["Poor", "Health effects may occur; sensitive groups should reduce exposure.", "text-rose-400 border-rose-500/30 bg-rose-500/10", "#f43f5e"],
    5: ["Very Poor", "High pollution levels; reduce outdoor exposure.", "text-purple-400 border-purple-500/30 bg-purple-500/10", "#a855f7"],
  };

  const [label, description, badgeColor, gaugeColor] =
    labels[aqi] || ["Unavailable", "Air quality category unavailable.", "text-slate-400 border-slate-500/30 bg-slate-500/10", "#94a3b8"];

  return {
    score,
    label,
    description,
    badgeColor,
    gaugeColor,
    components: Object.fromEntries(
      ["pm2_5", "pm10", "no2", "so2", "o3", "co"].map((key) => [
        key,
        Number.isFinite(Number(comps[key])) ? Number(comps[key]) : null,
      ])
    ),
  };
}

export async function getCurrentWeather(query, coords = null) {
  requireApiKey();
  const params = { ...cityParams(query, coords), units: "metric", appid: API_KEY };
  const response = await http.get(`${BASE_URL}/weather`, { params });
  return response.data;
}

export async function getForecast(query, coords = null) {
  requireApiKey();
  const params = { ...cityParams(query, coords), units: "metric", appid: API_KEY };
  const response = await http.get(`${BASE_URL}/forecast`, { params });
  return response.data;
}

export async function getAirPollution(lat, lon) {
  requireApiKey();
  if (!validateCoordinates(lat, lon)) return null;

  try {
    const response = await http.get(`${BASE_URL}/air_pollution`, {
      params: { lat, lon, appid: API_KEY },
    });
    return response.data;
  } catch (error) {
    console.warn("Air pollution data unavailable:", error.message);
    return null;
  }
}

export async function getCitySuggestions(query) {
  if (typeof query !== "string" || query.trim().length < 2) return [];
  requireApiKey();

  try {
    const response = await http.get(`${GEO_URL}/direct`, {
      params: { q: query.trim(), limit: 5, appid: API_KEY },
    });

    return response.data.map((item) => ({
      name: item.name,
      state: item.state || "",
      country: item.country,
      lat: item.lat,
      lon: item.lon,
      label: [item.name, item.state, item.country].filter(Boolean).join(", "),
    }));
  } catch (error) {
    console.warn("City suggestions unavailable:", error.message);
    return [];
  }
}

export async function reverseGeocode(lat, lon) {
  if (!validateCoordinates(lat, lon)) return null;
  requireApiKey();

  try {
    const response = await http.get(`${GEO_URL}/reverse`, {
      params: { lat, lon, limit: 1, appid: API_KEY },
    });

    const item = response.data?.[0];
    if (!item) return null;

    return {
      name: item.name,
      state: item.state || "",
      country: item.country,
    };
  } catch (error) {
    console.warn("Reverse geocoding unavailable:", error.message);
    return null;
  }
}

function weatherItemToHourly(item, timezoneOffsetSec, isNow = false) {
  return {
    timeLabel: isNow ? "Now" : formatLocalTime(item.dt, timezoneOffsetSec, "hourOnly"),
    isNow,
    temp: Math.round(item.main.temp),
    feelsLike: Math.round(item.main.feels_like),
    weatherMain: item.weather?.[0]?.main || "Unknown",
    description: item.weather?.[0]?.description || "",
    icon: item.weather?.[0]?.icon || "01d",
    humidity: item.main.humidity,
    pressure: item.main.pressure,
    windSpeedKmH: Math.round((item.wind?.speed || 0) * 3.6),
    windGustKmH: Math.round((item.wind?.gust ?? item.wind?.speed ?? 0) * 3.6),
    windDirection: degToCompass(item.wind?.deg || 0),
    windDeg: item.wind?.deg || 0,
    clouds: item.clouds?.all || 0,
    pop: Math.round((item.pop || 0) * 100),
  };
}

export function processForecastData(forecastRaw, currentWeather, timezoneOffsetSec = 0) {
  if (!currentWeather?.main || !currentWeather?.weather?.[0]) {
    return { hourly: [], daily: [] };
  }

  const list = Array.isArray(forecastRaw?.list) ? forecastRaw.list : [];
  const hourly = [
    {
      timeLabel: "Now",
      isNow: true,
      temp: Math.round(currentWeather.main.temp),
      feelsLike: Math.round(currentWeather.main.feels_like),
      weatherMain: currentWeather.weather[0].main,
      description: currentWeather.weather[0].description,
      icon: currentWeather.weather[0].icon,
      humidity: currentWeather.main.humidity,
      pressure: currentWeather.main.pressure,
      windSpeedKmH: Math.round((currentWeather.wind?.speed || 0) * 3.6),
      windGustKmH: Math.round((currentWeather.wind?.gust ?? currentWeather.wind?.speed ?? 0) * 3.6),
      windDirection: degToCompass(currentWeather.wind?.deg || 0),
      windDeg: currentWeather.wind?.deg || 0,
      clouds: currentWeather.clouds?.all || 0,
      pop: Math.round((list[0]?.pop || 0) * 100),
    },
    ...list.slice(0, 7).map((item) => weatherItemToHourly(item, timezoneOffsetSec)),
  ];

  const grouped = new Map();

  list.forEach((item) => {
    const key = formatLocalTime(item.dt, timezoneOffsetSec, "dateKey");
    if (!grouped.has(key)) {
      grouped.set(key, { items: [], temps: [], pops: [] });
    }

    const group = grouped.get(key);
    group.items.push(item);
    group.temps.push(item.main.temp);
    group.pops.push(item.pop || 0);
  });

  const todayKey = formatLocalTime(Date.now() / 1000, timezoneOffsetSec, "dateKey");
  const daily = [{
    dayLabel: "Today",
    isToday: true,
    high: Math.round(Math.max(currentWeather.main.temp_max, currentWeather.main.temp)),
    low: Math.round(Math.min(currentWeather.main.temp_min, currentWeather.main.temp)),
    weatherMain: currentWeather.weather[0].main,
    icon: currentWeather.weather[0].icon,
    pop: Math.round((list[0]?.pop || 0) * 100),
  }];

  for (const [key, group] of grouped) {
    if (key <= todayKey || daily.length >= 5) continue;

    const midday = group.items.reduce((best, item) =>
      Math.abs(Number(item.dt_txt?.slice(11, 13) || 12) - 12) <
        Math.abs(Number(best.dt_txt?.slice(11, 13) || 12) - 12)
        ? item
        : best
    );

    daily.push({
      dayLabel: formatLocalTime(midday.dt, timezoneOffsetSec, "dayOnly"),
      isToday: false,
      high: Math.round(Math.max(...group.temps)),
      low: Math.round(Math.min(...group.temps)),
      weatherMain: midday.weather?.[0]?.main || "Unknown",
      icon: midday.weather?.[0]?.icon || "01d",
      pop: Math.round(Math.max(...group.pops) * 100),
    });
  }

  return { hourly: hourly.slice(0, 8), daily: daily.slice(0, 6) };
}


export async function loadAtmosphericIntelligence(queryOrCoords) {
  const isCoords =
    queryOrCoords !== null &&
    typeof queryOrCoords === "object" &&
    queryOrCoords.lat !== undefined;

  // First, get current weather.
  const currentWeather = isCoords
    ? await getCurrentWeather(null, queryOrCoords)
    : await getCurrentWeather(queryOrCoords);

  if (
    !currentWeather?.coord ||
    !currentWeather?.main ||
    !currentWeather?.weather?.[0]
  ) {
    throw new Error("Invalid weather data received from the API.");
  }

  const { lat, lon } = currentWeather.coord;
  const timezoneOffsetSec = currentWeather.timezone || 0;

  // Fetch forecast and air quality in parallel.
  // Skip reverse geocoding because it adds another network request.
  const [forecastResult, airResult] = await Promise.allSettled([
    getForecast(null, { lat, lon }),
    getAirPollution(lat, lon),
  ]);

  const forecastData =
    forecastResult.status === "fulfilled"
      ? forecastResult.value
      : null;

  const airData =
    airResult.status === "fulfilled"
      ? airResult.value
      : null;

  const processedForecast = processForecastData(
    forecastData,
    currentWeather,
    timezoneOffsetSec
  );

  const airQuality = parseAirQuality(airData);

  const uvIndex = estimateUVIndex(
    lat,
    timezoneOffsetSec,
    currentWeather.clouds?.all ?? 0
  );

  const sunriseTs = currentWeather.sys?.sunrise;
  const sunsetTs = currentWeather.sys?.sunset;
  const daylightSec = Math.max(
    0,
    (sunsetTs || 0) - (sunriseTs || 0)
  );

  const daylightHours = Math.floor(daylightSec / 3600);
  const daylightMinutes = Math.floor((daylightSec % 3600) / 60);
  const nowTs = Math.floor(Date.now() / 1000);

  let sunProgress = 0;

  if (
    sunriseTs &&
    sunsetTs &&
    nowTs >= sunriseTs &&
    nowTs <= sunsetTs &&
    daylightSec > 0
  ) {
    sunProgress = Math.round(
      ((nowTs - sunriseTs) / daylightSec) * 100
    );
  } else if (sunsetTs && nowTs > sunsetTs) {
    sunProgress = 100;
  }

  const windSpeedKmH = Math.round(
    (currentWeather.wind?.speed || 0) * 3.6
  );

  const windGustKmH = Math.round(
    (currentWeather.wind?.gust ??
      currentWeather.wind?.speed ??
      0) * 3.6
  );

  const current = {
    temp: Math.round(currentWeather.main.temp),
    feelsLike: Math.round(currentWeather.main.feels_like),
    tempMin: Math.round(currentWeather.main.temp_min),
    tempMax: Math.round(currentWeather.main.temp_max),
    condition: currentWeather.weather[0].main,
    description: currentWeather.weather[0].description,
    icon: currentWeather.weather[0].icon,
    humidity: currentWeather.main.humidity,
    pressure: currentWeather.main.pressure,
    visibilityKm: Math.round(
      (currentWeather.visibility ?? 10000) / 1000
    ),
    windSpeedKmH,
    windGustKmH,
    windDirection: degToCompass(currentWeather.wind?.deg || 0),
    windDeg: currentWeather.wind?.deg || 0,
    beaufort: getBeaufortScale(windSpeedKmH),
    clouds: currentWeather.clouds?.all || 0,
    uv: uvIndex,
  };

  const astronomy = {
    sunrise: sunriseTs
      ? formatLocalTime(sunriseTs, timezoneOffsetSec, "timeOnly")
      : "--",
    sunset: sunsetTs
      ? formatLocalTime(sunsetTs, timezoneOffsetSec, "timeOnly")
      : "--",
    daylightText: `Daylight ${daylightHours}h ${daylightMinutes}m`,
    sunProgress,
  };

  const briefing = generateWeatherBriefing(
    current,
    processedForecast.hourly,
    airQuality
  );

  const advisories = generateAtmosphericAdvisories(
    current,
    processedForecast.hourly,
    airQuality
  );

  return {
    city: currentWeather.name,
    state: "",
    country: currentWeather.sys?.country || "",
    countryFull: currentWeather.sys?.country || "",
    coord: { lat, lon },
    timezone: timezoneOffsetSec,
    localTimeFormatted: formatLocalTime(
      nowTs,
      timezoneOffsetSec,
      "full"
    ),
    current,
    astronomy,
    airQuality,
    hourly: processedForecast.hourly,
    daily: processedForecast.daily,
    briefing,
    advisories,
  };
}


export function generateWeatherBriefing(current, hourly = [], airQuality = {}) {
  const condition = (current.condition || "").toLowerCase();
  const description = (current.description || "").toLowerCase();
  const isStorm = condition.includes("thunder");
  const isRain = condition.includes("rain") || description.includes("rain") || description.includes("drizzle");
  const isSnow = condition.includes("snow");
  const isCloudy = condition.includes("cloud");

  const temps = hourly.length ? hourly.map((item) => item.temp) : [current.temp];
  const maxTemp = Math.max(...temps);
  const minTemp = Math.min(...temps);
  const maxPop = Math.max(0, ...hourly.map((item) => item.pop || 0));

  let headline = "Current atmospheric conditions are relatively stable.";
  let summary = `Temperatures range from ${minTemp}°C to ${maxTemp}°C. Humidity is ${current.humidity}% with winds from ${current.windDirection} at ${current.windSpeedKmH} km/h.`;

  if (isStorm) {
    headline = "Thunderstorm conditions reported.";
    summary = `Thunderstorms may bring lightning, heavy rain and gusts up to ${current.windGustKmH} km/h. Follow local weather warnings.`;
  } else if (isRain) {
    headline = "Rain or drizzle is affecting current conditions.";
    summary = `Forecast precipitation probability reaches ${maxPop}%. Humidity is ${current.humidity}%, with temperatures near ${current.temp}°C.`;
  } else if (isSnow) {
    headline = "Snowy conditions are reported.";
    summary = `Current temperature is ${current.temp}°C. Check local advisories before travelling.`;
  } else if (current.temp >= 32) {
    headline = "Hot conditions; take precautions against heat.";
    summary = `Temperature is ${current.temp}°C and feels like ${current.feelsLike}°C. Drink water and limit strenuous activity during peak heat.`;
  } else if (isCloudy) {
    headline = "Cloud cover is moderating sunshine.";
    summary = `Cloud coverage is ${current.clouds}%, with temperatures around ${current.temp}°C. Forecast precipitation probability reaches ${maxPop}%.`;
  }

  const recommendations = {
    outdoor: {
      status: isStorm || maxPop >= 70 ? "Caution" : current.temp >= 35 ? "Moderate" : "Favorable",
      title: "Outdoor Recreation",
      text: isStorm
        ? "Avoid exposed areas during thunderstorms and follow official alerts."
        : maxPop >= 70
          ? "Consider indoor activities and carry rain protection."
          : current.temp >= 35
            ? "Avoid strenuous activity during peak heat and stay hydrated."
            : "Check local conditions before outdoor activities.",
    },
    clothing: {
      status: "Advisory",
      title: "Recommended Attire",
      text: current.temp <= 14
        ? "Warm layers and wind protection may be useful."
        : current.temp <= 22
          ? "Consider a light jacket or long sleeves."
          : "Lightweight clothing and hydration are recommended in warm weather.",
    },
    sunExposure: {
      status: current.uv?.val >= 6 ? "High Protection" : "Standard",
      title: "Solar & UV Protection",
      text: current.uv?.val == null
        ? "UV estimate unavailable. Check an official UV forecast."
        : current.uv.val >= 6
          ? `Estimated UV Index is ${current.uv.val} (${current.uv.text}). Use sun protection during peak daylight.`
          : `Estimated UV Index is ${current.uv.val} (${current.uv.text}). Follow standard sun precautions.`,
    },
    airQuality: {
      status: airQuality?.label || "Unavailable",
      title: "Air Quality",
      text: airQuality?.score == null
        ? "Air quality data is currently unavailable."
        : `OpenWeather air pollution category: ${airQuality.label}.`,
    },
  };

  return { headline, summary, recommendations };
}

export function generateAtmosphericAdvisories(current, hourly = [], airQuality = {}) {
  const advisories = [];

  if (current.temp >= 38 || current.feelsLike >= 40) {
    advisories.push({
      id: "heat-advisory",
      severity: "warning",
      type: "Excessive Heat Advisory",
      title: "High Temperature",
      message: `Temperature is ${current.temp}°C and feels like ${current.feelsLike}°C. Reduce prolonged outdoor exertion.`,
      source: "Current weather observation",
    });
  }

  if (current.windSpeedKmH >= 45 || current.windGustKmH >= 60) {
    advisories.push({
      id: "wind-advisory",
      severity: "warning",
      type: "High Wind Advisory",
      title: `Strong Winds (${current.windGustKmH} km/h gusts)`,
      message: `Winds are ${current.windSpeedKmH} km/h with gusts up to ${current.windGustKmH} km/h.`,
      source: "Current weather observation",
    });
  }

  if ((current.condition || "").toLowerCase().includes("thunder")) {
    advisories.push({
      id: "storm-advisory",
      severity: "danger",
      type: "Thunderstorm Notice",
      title: "Thunderstorm Conditions",
      message: "Thunderstorms are reported. Seek shelter indoors and follow official local warnings.",
      source: "Current weather observation",
    });
  }

  if (current.visibilityKm <= 1.5) {
    advisories.push({
      id: "fog-advisory",
      severity: "warning",
      type: "Low Visibility Notice",
      title: `Restricted Visibility (${current.visibilityKm} km)`,
      message: "Visibility is low. Take extra care when travelling.",
      source: "Current weather observation",
    });
  }

  if (airQuality?.label === "Poor" || airQuality?.label === "Very Poor") {
    advisories.push({
      id: "air-advisory",
      severity: "warning",
      type: "Air Quality Notice",
      title: `Air Quality: ${airQuality.label}`,
      message: "Consider reducing prolonged outdoor exertion and check local air-quality guidance.",
      source: "OpenWeather air pollution data",
    });
  }

  const rainProbability = Math.max(0, ...hourly.map((item) => item.pop || 0));
  if (rainProbability >= 75) {
    advisories.push({
      id: "rain-advisory",
      severity: "info",
      type: "Precipitation Notice",
      title: `High Rain Probability (${rainProbability}%)`,
      message: "The forecast indicates a high chance of precipitation. Consider carrying rain protection.",
      source: "Forecast data",
    });
  }

  return advisories;
}

export async function fetchMultipleCities(cityNames = []) {
  if (!Array.isArray(cityNames) || cityNames.length === 0) return [];

  const results = await Promise.allSettled(
    cityNames
      .filter((name) => typeof name === "string" && name.trim())
      .map((name) => loadAtmosphericIntelligence(name.trim()))
  );

  return results
    .filter((result) => result.status === "fulfilled")
    .map((result) => result.value);
}
