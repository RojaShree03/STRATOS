
import { useState, useEffect } from "react";
import {
  X,
  Plus,
  GitCompare,
  Droplets,
  Wind,
  Gauge,
  Eye,
  Sun,
  Loader2,
  Trash2,
} from "lucide-react";
import WeatherIcon from "./WeatherIcon";
import { formatTemp } from "../utils/tempConverter";
import { loadAtmosphericIntelligence } from "../services/weatherApi";

const PRESET_CITIES = ["Mumbai", "Delhi", "London", "Tokyo", "New York", "Dubai"];

export default function CityComparisonModal({
  isOpen,
  onClose,
  currentCity = "Chennai",
  tempUnit = "C",
}) {
  const [comparedCities, setComparedCities] = useState([]);
  const [comparisonData, setComparisonData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [inputCity, setInputCity] = useState("");
  const [error, setError] = useState(null);
  const [isLightTheme, setIsLightTheme] = useState(() => {
    if (typeof document === "undefined") return false;
    return document.documentElement.dataset.theme === "light" ||
      document.documentElement.classList.contains("light");
  });

  useEffect(() => {
    const root = document.documentElement;
    const updateTheme = () => {
      setIsLightTheme(
        root.dataset.theme === "light" ||
        root.classList.contains("light")
      );
    };

    updateTheme();
    const observer = new MutationObserver(updateTheme);
    observer.observe(root, {
      attributes: true,
      attributeFilter: ["class", "data-theme"],
    });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    setComparedCities((previous) => {
      if (previous.length > 0) return previous;
      return [currentCity, "Bangalore"].filter(Boolean);
    });
  }, [isOpen, currentCity]);

  useEffect(() => {
    if (!isOpen || comparedCities.length === 0) {
      setComparisonData([]);
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function fetchComparison() {
      setLoading(true);
      setError(null);

      const results = await Promise.allSettled(
        comparedCities.map((city) => loadAtmosphericIntelligence(city))
      );

      if (cancelled) return;

      const successful = [];
      const failed = [];

      results.forEach((result, index) => {
        if (result.status === "fulfilled" && result.value) {
          successful.push({ ...result.value, requestedCity: comparedCities[index] });
        } else {
          failed.push(comparedCities[index]);
        }
      });

      setComparisonData(successful);

      if (failed.length > 0) {
        setError(`Could not load: ${failed.join(", ")}. Check the city name or try again.`);
      }

      setLoading(false);
    }

    fetchComparison();

    return () => {
      cancelled = true;
    };
  }, [isOpen, comparedCities]);

  if (!isOpen) return null;

  const handleAddCity = (name) => {
    const clean = name.trim();

    if (!clean) {
      setError("Enter a city name first.");
      return;
    }

    if (comparedCities.some((city) => city.toLowerCase() === clean.toLowerCase())) {
      setError(`${clean} is already in the comparison.`);
      return;
    }

    if (comparedCities.length >= 3) {
      setError("You can compare up to 3 cities at a time.");
      return;
    }

    setError(null);
    setComparedCities((previous) => [...previous, clean]);
    setInputCity("");
  };

  const handleRemoveCity = (name) => {
    if (comparedCities.length <= 1) {
      setError("At least one city must remain in the comparison.");
      return;
    }

    setError(null);
    setComparedCities((previous) =>
      previous.filter((city) => city.toLowerCase() !== name.toLowerCase())
    );
  };

  const displayValue = (value, suffix = "") => {
    if (value === null || value === undefined || value === "") return "--";
    if (typeof value === "number" && !Number.isFinite(value)) return "--";
    return `${value}${suffix}`;
  };

  const getCityKey = (data, index) =>
    `${data.city || "city"}-${data.current?.coord?.lat ?? index}`;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 ${isLightTheme ? "text-slate-900" : "text-white"}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="city-comparison-title"
    >
      <button
        type="button"
        aria-label="Close city comparison"
        onClick={onClose}
        className={`fixed inset-0 cursor-default backdrop-blur-md animate-fade-in ${isLightTheme ? "bg-slate-900/25" : "bg-black/80"}`}
      />

      <div className={`relative z-10 flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl border p-5 shadow-2xl backdrop-blur-2xl sm:p-7 ${isLightTheme ? "border-slate-200 bg-white text-slate-900 shadow-slate-900/20" : "border-white/15 bg-[#090f1e] text-white shadow-black/60"}`}>
        <div className={`flex items-center justify-between gap-3 border-b pb-4 ${isLightTheme ? "border-slate-200" : "border-white/[0.08]"}`}>
          <div className="flex min-w-0 items-center gap-3">
            <div className="rounded-xl border border-cyan-400/20 bg-cyan-500/15 p-2 text-cyan-400">
              <GitCompare className="h-5 w-5" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <h3
                id="city-comparison-title"
                className={`text-lg font-bold tracking-tight sm:text-xl ${isLightTheme ? "text-slate-900" : "text-white"}`}
              >
                Atmospheric City Comparison
              </h3>
              <p className="text-xs" style={{ color: isLightTheme ? "#64748b" : "#94a3b8" }}>
                Compare live weather conditions across cities
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors ${isLightTheme ? "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900" : "bg-white/[0.06] text-slate-300 hover:bg-white/[0.12] hover:text-white"}`}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className={`space-y-3 border-b py-4 ${isLightTheme ? "border-slate-200" : "border-white/[0.06]"}`}>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              handleAddCity(inputCity);
            }}
            className="flex max-w-md items-center gap-2"
          >
            <input
              type="text"
              value={inputCity}
              onChange={(event) => setInputCity(event.target.value)}
              placeholder="Add a city, e.g. London"
              aria-label="City name to compare"
              maxLength={100}
              className={`min-w-0 flex-1 rounded-xl border px-3.5 py-2 text-xs outline-none focus:border-cyan-500 sm:text-sm ${isLightTheme ? "border-slate-300 bg-white text-slate-900 placeholder:text-slate-500" : "border-white/15 bg-white/[0.06] text-white placeholder:text-slate-400"}`}
            />
            <button
              type="submit"
              disabled={comparedCities.length >= 3}
              className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-4 py-2 text-xs font-bold text-white transition-all hover:from-blue-500 hover:to-cyan-400 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Plus className="h-3.5 w-3.5" />
              Add
            </button>
          </form>

          <div className="flex flex-wrap items-center gap-1.5">
            <span className={`mr-1 text-[11px] ${isLightTheme ? "text-slate-500" : "text-slate-400"}`}>Quick Presets:</span>
            {PRESET_CITIES.map((city) => {
              const alreadyAdded = comparedCities.some(
                (item) => item.toLowerCase() === city.toLowerCase()
              );

              return (
                <button
                  type="button"
                  key={city}
                  onClick={() => handleAddCity(city)}
                  disabled={alreadyAdded || comparedCities.length >= 3}
                  className="rounded-lg border px-2.5 py-1 text-[11px] transition-all disabled:cursor-not-allowed disabled:opacity-40" style={{ borderColor: isLightTheme ? "#e2e8f0" : "rgba(255,255,255,0.08)", backgroundColor: isLightTheme ? "#f1f5f9" : "rgba(255,255,255,0.04)", color: isLightTheme ? "#334155" : "#cbd5e1" }}
                >
                  + {city}
                </button>
              );
            })}
          </div>

          {error && (
            <div
              role="alert"
              className={`rounded-lg border px-3 py-2 text-xs ${isLightTheme ? "border-rose-200 bg-rose-50 text-rose-700" : "border-rose-500/30 bg-rose-950/40 text-rose-300"}`}
            >
              {error}
            </div>
          )}
        </div>

        <div className="custom-scrollbar flex-1 overflow-y-auto py-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16" style={{ color: isLightTheme ? "#475569" : "#94a3b8" }}>
              <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
              <span className="text-sm font-medium">
                Loading city weather data...
              </span>
            </div>
          ) : comparisonData.length > 0 ? (
            <div
              className={`grid gap-4 ${comparisonData.length === 1
                ? "mx-auto max-w-sm grid-cols-1"
                : comparisonData.length === 2
                  ? "grid-cols-1 sm:grid-cols-2"
                  : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                }`}
            >
              {comparisonData.map((data, index) => {
                const current = data.current || {};
                const airQuality = data.airQuality;
                const uv = current.uv;

                return (
                  <div
                    key={getCityKey(data, index)}
                    className="flex flex-col justify-between space-y-4 rounded-2xl border p-4 shadow-md transition-all hover:border-cyan-500/30" style={{ borderColor: isLightTheme ? "#e2e8f0" : "rgba(255,255,255,0.08)", backgroundColor: isLightTheme ? "#ffffff" : "rgba(255,255,255,0.03)" }}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h4 className="text-base font-bold tracking-tight sm:text-lg" style={{ color: isLightTheme ? "#0f172a" : "#f8fafc" }}>
                          {data.city || "Unknown city"}
                        </h4>
                        <p className="text-xs" style={{ color: isLightTheme ? "#475569" : "#94a3b8" }}>
                          {[data.state, data.country].filter(Boolean).join(", ") || "Location unavailable"}
                        </p>
                        <p className="mt-0.5 text-[10px]" style={{ color: isLightTheme ? "#64748b" : "#94a3b8" }}>
                          {data.localTimeFormatted || "--"}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveCity(data.requestedCity || data.city)}
                        disabled={comparedCities.length <= 1}
                        aria-label={`Remove ${data.requestedCity || data.city}`}
                        title={`Remove ${data.requestedCity || data.city}`}
                        className="rounded-lg p-1.5 transition-colors hover:bg-slate-100 hover:text-rose-500 disabled:cursor-not-allowed disabled:opacity-30 dark:hover:bg-white/10 dark:hover:text-rose-400" style={{ color: isLightTheme ? "#475569" : "#94a3b8" }}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between gap-2 rounded-xl border p-3" style={{ borderColor: isLightTheme ? "#e2e8f0" : "rgba(255,255,255,0.08)", backgroundColor: isLightTheme ? "#f8fafc" : "rgba(255,255,255,0.02)" }}>
                      <div className="min-w-0">
                        <div className="font-num text-3xl font-bold sm:text-4xl" style={{ color: isLightTheme ? "#0f172a" : "#f8fafc" }}>
                          {formatTemp(current.temp, tempUnit)}
                        </div>
                        <div className="mt-1 text-xs font-medium capitalize" style={{ color: isLightTheme ? "#334155" : "#cbd5e1" }}>
                          {current.description || current.condition || "Weather unavailable"}
                        </div>
                        <div className="mt-0.5 text-[11px]" style={{ color: isLightTheme ? "#64748b" : "#94a3b8" }}>
                          Feels like {formatTemp(current.feelsLike, tempUnit)}
                        </div>
                      </div>

                      <WeatherIcon
                        condition={current.condition}
                        icon={current.icon}
                        size="lg"
                      />
                    </div>

                    <div className="flex items-center justify-between gap-2 px-1 text-xs" style={{ color: isLightTheme ? "#334155" : "#cbd5e1" }}>
                      <span>High: {formatTemp(current.tempMax, tempUnit)}</span>
                      <span className="text-slate-300 dark:text-slate-600">•</span>
                      <span>Low: {formatTemp(current.tempMin, tempUnit)}</span>
                    </div>

                    <div className="space-y-3 border-t border-slate-200 pt-3 text-xs dark:border-white/[0.06]">
                      <div className="flex items-center justify-between gap-2">
                        <span className="flex items-center gap-1.5" style={{ color: isLightTheme ? "#475569" : "#94a3b8" }}>
                          <Droplets className="h-3.5 w-3.5 text-cyan-400" />
                          Humidity
                        </span>
                        <span className="font-num font-semibold" style={{ color: isLightTheme ? "#0f172a" : "#f8fafc" }}>
                          {displayValue(current.humidity, "%")}
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-2">
                        <span className="flex items-center gap-1.5" style={{ color: isLightTheme ? "#475569" : "#94a3b8" }}>
                          <Wind className="h-3.5 w-3.5 text-blue-400" />
                          Wind
                        </span>
                        <span className="text-right font-num font-semibold" style={{ color: isLightTheme ? "#0f172a" : "#f8fafc" }}>
                          {displayValue(current.windSpeedKmH, " km/h")}
                          {current.windDirection ? ` ${current.windDirection}` : ""}
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-2">
                        <span className="flex items-center gap-1.5" style={{ color: isLightTheme ? "#475569" : "#94a3b8" }}>
                          <Gauge className="h-3.5 w-3.5 text-indigo-400" />
                          Pressure
                        </span>
                        <span className="font-num font-semibold" style={{ color: isLightTheme ? "#0f172a" : "#f8fafc" }}>
                          {displayValue(current.pressure, " hPa")}
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-2">
                        <span className="flex items-center gap-1.5" style={{ color: isLightTheme ? "#475569" : "#94a3b8" }}>
                          <Eye className="h-3.5 w-3.5 text-purple-400" />
                          Visibility
                        </span>
                        <span className="font-num font-semibold" style={{ color: isLightTheme ? "#0f172a" : "#f8fafc" }}>
                          {displayValue(current.visibilityKm, " km")}
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-2">
                        <span className="flex items-center gap-1.5" style={{ color: isLightTheme ? "#475569" : "#94a3b8" }}>
                          <Sun className="h-3.5 w-3.5 text-amber-400" />
                          UV Index
                        </span>
                        <span className="font-num font-semibold" style={{ color: isLightTheme ? "#0f172a" : "#f8fafc" }}>
                          {uv?.val !== null && uv?.val !== undefined
                            ? `${uv.val}${uv.text ? ` (${uv.text})` : ""}`
                            : "--"}
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-2">
                        <span style={{ color: isLightTheme ? "#475569" : "#94a3b8" }}>Air Quality</span>
                        <span className="text-right font-num font-semibold" style={{ color: isLightTheme ? "#047857" : "#34d399" }}>
                          {airQuality?.label || "Unavailable"}
                          {airQuality?.score !== null && airQuality?.score !== undefined
                            ? ` (${airQuality.score})`
                            : ""}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-12 text-center text-sm" style={{ color: isLightTheme ? "#475569" : "#94a3b8" }}>
              No comparison data available. Add a city or try again.
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 border-t pt-3 text-xs" style={{ borderColor: isLightTheme ? "#e2e8f0" : "rgba(255,255,255,0.08)", color: isLightTheme ? "#475569" : "#94a3b8" }}>
          <span>Compare up to 3 locations</span>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-slate-200 px-5 py-2 font-bold text-slate-900 transition-all hover:bg-slate-300 dark:bg-white/[0.08] dark:text-white dark:hover:bg-white/[0.15]"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
