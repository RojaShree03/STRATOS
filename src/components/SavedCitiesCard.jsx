
import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import {
  Bookmark,
  ChevronRight,
  Maximize2,
  Minimize2,
  Plus,
  Heart,
  Trash2,
  X,
  MapPin,
  Thermometer,
  Droplets,
  Wind,
  Eye,
  CalendarDays,
  ExternalLink,
  AlertCircle,
} from "lucide-react";
import WeatherIcon from "./WeatherIcon";
import { formatTemp } from "../utils/tempConverter";

function useLightTheme() {
  const [isLightTheme, setIsLightTheme] = useState(() => {
    if (typeof document === "undefined") return false;
    return (
      document.documentElement.dataset.theme === "light" ||
      document.documentElement.classList.contains("light")
    );
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

  return isLightTheme;
}

function getCityDetails(city) {
  if (!city) return [];

  const details = [
    {
      label: "Feels like",
      value:
        city.feelsLike != null && Number.isFinite(Number(city.feelsLike))
          ? formatTemp(Number(city.feelsLike), city.tempUnit || "C")
          : null,
      icon: Thermometer,
    },
    {
      label: "Humidity",
      value:
        city.humidity != null && Number.isFinite(Number(city.humidity))
          ? `${city.humidity}%`
          : null,
      icon: Droplets,
    },
    {
      label: "Wind",
      value:
        city.windSpeedKmH != null && Number.isFinite(Number(city.windSpeedKmH))
          ? `${city.windSpeedKmH} km/h`
          : city.windSpeed != null && Number.isFinite(Number(city.windSpeed))
            ? `${city.windSpeed} km/h`
            : null,
      icon: Wind,
    },
    {
      label: "Visibility",
      value:
        city.visibilityKm != null && Number.isFinite(Number(city.visibilityKm))
          ? `${city.visibilityKm} km`
          : null,
      icon: Eye,
    },
  ];

  return details.filter((detail) => detail.value != null);
}

function CityDetailsModal({
  city,
  tempUnit,
  onClose,
  onSelect,
  onRemove,
}) {
  const closeButtonRef = useRef(null);
  const isLightTheme = useLightTheme();

  useEffect(() => {
    closeButtonRef.current?.focus();

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!city) return null;

  const temperature =
    city.temp != null && Number.isFinite(Number(city.temp))
      ? formatTemp(Number(city.temp), tempUnit)
      : "--";

  const details = getCityDetails(city);
  const condition = city.description || city.condition || "Weather unavailable";

  return (
    <div
      className={`fixed inset-0 z-[1200] flex items-center justify-center overflow-y-auto p-4 backdrop-blur-md animate-fade-in ${isLightTheme ? "bg-slate-900/25" : "bg-slate-950/75"}`}
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="saved-city-modal-title"
        className={`animate-modal-enter relative my-auto w-full max-w-md overflow-hidden rounded-3xl border shadow-2xl ${isLightTheme ? "border-slate-200 bg-white text-slate-900 shadow-slate-900/20" : "glass-panel-elevated border-white/10 text-white"}`}
      >
        <div className="pointer-events-none absolute -right-16 -top-20 h-52 w-52 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-16 h-48 w-48 rounded-full bg-blue-500/10 blur-3xl" />

        <div className={`relative z-10 flex items-center justify-between border-b px-5 py-4 ${isLightTheme ? "border-slate-200" : "border-white/10"}`}>
          <div className="flex items-center gap-2">
            <div className="rounded-xl bg-cyan-500/10 p-2 text-cyan-400">
              <MapPin className="h-4 w-4" />
            </div>
            <span className={`text-xs font-semibold uppercase tracking-wider ${isLightTheme ? "text-slate-600" : "text-slate-400"}`}>
              Saved location
            </span>
          </div>

          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label="Close saved city details"
            className={`rounded-xl border p-2 transition ${isLightTheme ? "border-slate-200 bg-slate-100 text-slate-600 hover:bg-slate-200" : "border-white/10 bg-white/[0.05] text-slate-400 hover:bg-white/10 hover:text-white"}`}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="relative z-10 p-5">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <h2
                id="saved-city-modal-title"
                className={`break-words text-2xl font-bold tracking-tight ${isLightTheme ? "text-slate-900" : "text-white"}`}
              >
                {city.name}
              </h2>

              {city.state || city.country ? (
                <p className={`mt-1 text-sm ${isLightTheme ? "text-slate-600" : "text-slate-400"}`}>
                  {[city.state, city.country].filter(Boolean).join(", ")}
                </p>
              ) : (
                <p className={`mt-1 text-sm ${isLightTheme ? "text-slate-600" : "text-slate-400"}`}>
                  Saved weather location
                </p>
              )}
            </div>

            <div className="shrink-0">
              <WeatherIcon
                condition={city.condition || "Clear"}
                icon={city.icon || "01d"}
                size="lg"
              />
            </div>
          </div>

          <div className="mt-5 rounded-2xl border border-cyan-400/15 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 p-4">
            <p className={`text-sm capitalize ${isLightTheme ? "text-slate-700" : "text-slate-300"}`}>{condition}</p>
            <p className={`font-num mt-1 text-4xl font-bold tracking-tight ${isLightTheme ? "text-slate-900" : "text-white"}`}>
              {temperature}
            </p>

            {(city.tempMax != null || city.tempMin != null) && (
              <div className={`mt-2 flex flex-wrap gap-3 text-xs ${isLightTheme ? "text-slate-600" : "text-slate-400"}`}>
                {city.tempMax != null &&
                  Number.isFinite(Number(city.tempMax)) && (
                    <span>
                      High{" "}
                      <strong className={isLightTheme ? "text-rose-700" : "text-rose-300"}>
                        {formatTemp(Number(city.tempMax), tempUnit)}
                      </strong>
                    </span>
                  )}

                {city.tempMin != null &&
                  Number.isFinite(Number(city.tempMin)) && (
                    <span>
                      Low{" "}
                      <strong className={isLightTheme ? "text-cyan-700" : "text-cyan-300"}>
                        {formatTemp(Number(city.tempMin), tempUnit)}
                      </strong>
                    </span>
                  )}
              </div>
            )}
          </div>

          {details.length > 0 ? (
            <div className="mt-4 grid grid-cols-2 gap-2">
              {details.map((detail) => {
                const Icon = detail.icon;

                return (
                  <div
                    key={detail.label}
                    className={`rounded-2xl border p-3 ${isLightTheme ? "border-slate-200 bg-slate-50" : "border-white/[0.08] bg-white/[0.035]"}`}
                  >
                    <div className={`flex items-center gap-2 ${isLightTheme ? "text-slate-600" : "text-slate-400"}`}>
                      <Icon className="h-4 w-4 text-cyan-400" />
                      <span className="text-xs">{detail.label}</span>
                    </div>
                    <p className={`mt-2 text-sm font-bold ${isLightTheme ? "text-slate-900" : "text-white"}`}>
                      {detail.value}
                    </p>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className={`mt-4 flex items-start gap-2 rounded-xl border p-3 text-xs ${isLightTheme ? "border-amber-200 bg-amber-50 text-slate-700" : "border-amber-400/20 bg-amber-400/5 text-slate-300"}`}>
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
              <p>
                Extra weather details aren't available for this saved entry
                yet. Select the city to load its latest weather.
              </p>
            </div>
          )}

          <div className="mt-5 flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={() => onSelect?.(city.name)}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-cyan-400/30 bg-gradient-to-r from-blue-600 to-cyan-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-950/20 hover:brightness-110"
            >
              <ExternalLink className="h-4 w-4" />
              Show current weather
            </button>

            <button
              type="button"
              onClick={() => onRemove?.(city.name)}
              className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold ${isLightTheme ? "border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100" : "border-rose-400/20 bg-rose-500/10 text-rose-300 hover:border-rose-400/50 hover:bg-rose-500/20"}`}
            >
              <Trash2 className="h-4 w-4" />
              Remove
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

export default function SavedCitiesCard({
  savedCities = [],
  currentCity = "Chennai",
  onSelectCity,
  onAddCurrentCity,
  onRemoveCity,
  onAddCity,
  tempUnit = "C",
}) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCityInput, setNewCityInput] = useState("");
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState("");
  const [selectedCity, setSelectedCity] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const isLightTheme = useLightTheme();

  const addInputRef = useRef(null);

  const cities = Array.isArray(savedCities) ? savedCities : [];
  const normalizedCurrentCity = String(currentCity || "").trim().toLowerCase();

  const currentCityIsSaved = cities.some(
    (city) =>
      String(city?.name || "").trim().toLowerCase() === normalizedCurrentCity
  );

  const closeAddForm = () => {
    if (addLoading) return;
    setShowAddModal(false);
    setNewCityInput("");
    setAddError("");
  };

  const openCityDetails = (city) => {
    setSelectedCity(city);
  };

  const closeCityDetails = () => {
    setSelectedCity(null);
  };

  const handleSelectCity = (cityName) => {
    setSelectedCity(null);
    onSelectCity?.(cityName);
  };

  const handleRemoveCity = (cityName) => {
    setSelectedCity(null);
    onRemoveCity?.(cityName);
  };

  const handleAddSubmit = async (event) => {
    event.preventDefault();

    const cityName = newCityInput.trim();

    if (!cityName || addLoading) return;

    const alreadySaved = cities.some(
      (city) =>
        String(city?.name || "").trim().toLowerCase() === cityName.toLowerCase()
    );

    if (alreadySaved) {
      setAddError("This city is already in your saved list.");
      return;
    }

    if (typeof onAddCity !== "function") {
      setAddError("Adding cities is currently unavailable.");
      return;
    }

    setAddLoading(true);
    setAddError("");

    try {
      const success = await onAddCity(cityName);

      if (success) {
        setNewCityInput("");
        setShowAddModal(false);
        setAddError("");
      } else {
        setAddError("Unable to add city. Check the name and try again.");
      }
    } catch {
      setAddError("Something went wrong. Please try again.");
    } finally {
      setAddLoading(false);
    }
  };

  const handleAddCurrentCity = async () => {
    if (currentCityIsSaved) {
      setShowAddModal(true);
      setAddError("");
      requestAnimationFrame(() => addInputRef.current?.focus());
      return;
    }

    if (typeof onAddCurrentCity !== "function") {
      setShowAddModal(true);
      setAddError("");
      requestAnimationFrame(() => addInputRef.current?.focus());
      return;
    }

    try {
      await onAddCurrentCity();
    } catch {
      setAddError("Unable to save the current city.");
      setShowAddModal(true);
    }
  };

  useEffect(() => {
    if (!selectedCity) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setSelectedCity(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedCity]);

  useEffect(() => {
    if (!isExpanded) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event) => {
      if (event.key === "Escape" && !selectedCity) {
        setIsExpanded(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isExpanded, selectedCity]);

  const expandedBackdrop = isExpanded
    ? createPortal(
      <button
        type="button"
        aria-label="Close expanded saved cities"
        onClick={() => setIsExpanded(false)}
        className="fixed inset-0 cursor-default bg-slate-950/75 backdrop-blur-sm"
        style={{ position: "fixed", inset: 0, zIndex: 1090, width: "100vw", height: "100dvh" }}
      />,
      document.body
    )
    : null;

  const savedCitiesPanel = (
    <section
      id="saved-section"
      aria-labelledby="saved-cities-heading"
      className={`glass-panel relative flex flex-col rounded-3xl border border-white/10 p-5 shadow-xl ${isExpanded
        ? "!m-0 !max-w-none min-h-0 justify-start overflow-hidden rounded-none p-5 sm:p-8"
        : "h-full min-h-[330px] justify-between"
        }`}
      style={isExpanded ? {
        position: "fixed",
        inset: 0,
        zIndex: 1101,
        width: "100vw",
        height: "100dvh",
        maxWidth: "none",
        margin: 0,
        borderRadius: 0,
        background: isLightTheme ? "#f8fafc" : "#0b1020",
        color: isLightTheme ? "#0f172a" : "#f8fafc",
        overflow: "hidden",
        boxSizing: "border-box",
      } : undefined}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-rose-500/10 p-1.5 text-rose-400">
            <Bookmark className="h-4 w-4" />
          </div>

          <h3
            id="saved-cities-heading"
            className={`text-sm font-bold tracking-tight sm:text-base ${isLightTheme ? "text-slate-900" : "text-white"}`}
          >
            Saved Cities
          </h3>

          <span className={`rounded-full px-2 py-0.5 text-[10px] ${isLightTheme ? "bg-slate-100 text-slate-600" : "bg-white/[0.06] text-slate-400"}`}>
            {cities.length}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <span className={`hidden text-xs sm:inline ${isLightTheme ? "text-slate-600" : "text-slate-400"}`}>
            {isExpanded ? "Expanded view" : ""}
          </span>
          <button
            type="button"
            onClick={() => setIsExpanded((expanded) => !expanded)}
            aria-label={isExpanded ? "Collapse saved cities" : "Expand saved cities"}
            title={isExpanded ? "Collapse" : "Expand saved cities"}
            className={`rounded-xl border p-2 transition hover:border-cyan-400/30 hover:bg-cyan-500/10 hover:text-cyan-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 ${isLightTheme ? "border-slate-200 bg-slate-100 text-slate-600" : "border-white/10 bg-white/[0.04] text-slate-400 hover:text-cyan-300"}`}
          >
            {isExpanded ? (
              <Minimize2 className="h-4 w-4" />
            ) : (
              <Maximize2 className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      <div className={`custom-scrollbar my-2 flex-1 space-y-1.5 overflow-y-auto pr-1 ${isExpanded ? "min-h-0 max-h-none" : "max-h-[190px]"
        }`}>
        {cities.length === 0 ? (
          <div className={`flex h-full min-h-[120px] flex-col items-center justify-center gap-2 text-center ${isLightTheme ? "text-slate-600" : "text-slate-400"}`}>
            <Bookmark className="h-6 w-6 text-slate-500" />
            <p className={`text-xs ${isLightTheme ? "text-slate-600" : "text-slate-400"}`}>No saved cities yet.</p>
            <p className={`text-[11px] ${isLightTheme ? "text-slate-500" : "text-slate-500"}`}>
              Save a city to access it quickly.
            </p>
          </div>
        ) : (
          cities.map((item, index) => {
            if (!item?.name) return null;

            const cityName = String(item.name);
            const isCurrent =
              normalizedCurrentCity === cityName.trim().toLowerCase();

            return (
              <div
                key={`${cityName}-${index}`}
                className={`group flex items-center justify-between gap-2 rounded-2xl border px-3 py-2 transition-all duration-200 ${isCurrent
                  ? "border-cyan-400/30 bg-cyan-500/15 text-white"
                  : "border-transparent text-slate-300 hover:border-cyan-400/20 hover:bg-white/[0.06] hover:text-white"
                  }`}
              >
                <button
                  type="button"
                  onClick={() => openCityDetails(item)}
                  aria-label={`Open saved weather details for ${cityName}`}
                  className="flex min-w-0 flex-1 items-center gap-2.5 rounded-lg text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
                >
                  <WeatherIcon
                    condition={item.condition || "Clear"}
                    icon={item.icon || "01d"}
                    size="sm"
                  />

                  <span className="max-w-[100px] truncate text-xs font-semibold sm:max-w-[120px] sm:text-sm">
                    {cityName}
                  </span>
                </button>

                <div className="flex shrink-0 items-center gap-2">
                  {isCurrent && (
                    <Heart
                      aria-label="Current city"
                      className="h-3.5 w-3.5 shrink-0 fill-purple-400 text-purple-400"
                    />
                  )}

                  {item.temp != null && Number.isFinite(Number(item.temp)) && (
                    <span
                      className={`font-num text-xs font-bold sm:text-sm ${isCurrent
                        ? "text-cyan-300"
                        : "text-slate-200"
                        }`}
                    >
                      {formatTemp(Number(item.temp), tempUnit)}
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={() => handleRemoveCity(cityName)}
                    aria-label={`Remove ${cityName} from saved cities`}
                    title={`Remove ${cityName}`}
                    className="rounded-md p-1 text-slate-400 transition-colors hover:bg-rose-500/10 hover:text-rose-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className={`border-t pt-2 ${isLightTheme ? "border-slate-200" : "border-white/[0.06]"}`}>
        {showAddModal ? (
          <form onSubmit={handleAddSubmit} className="space-y-2">
            <div className="flex items-center gap-1.5">
              <input
                ref={addInputRef}
                type="text"
                autoFocus
                value={newCityInput}
                onChange={(event) => {
                  setNewCityInput(event.target.value);
                  setAddError("");
                }}
                onKeyDown={(event) => {
                  if (event.key === "Escape") closeAddForm();
                }}
                placeholder="Enter city name..."
                aria-label="City name"
                aria-invalid={Boolean(addError)}
                aria-describedby={addError ? "saved-city-error" : undefined}
                maxLength={100}
                disabled={addLoading}
                className={`min-w-0 flex-1 rounded-xl border px-2.5 py-2 text-xs outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 disabled:opacity-60 ${isLightTheme ? "border-slate-300 bg-white text-slate-900 placeholder:text-slate-500" : "border-white/20 bg-white/[0.08] text-white placeholder:text-slate-400"}`}
              />

              <button
                type="submit"
                disabled={addLoading || !newCityInput.trim()}
                className="rounded-xl bg-cyan-500 px-3 py-2 text-xs font-semibold text-white transition-all hover:bg-cyan-400 hover:shadow-lg hover:shadow-cyan-500/20 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {addLoading ? "Adding..." : "Add"}
              </button>

              <button
                type="button"
                onClick={closeAddForm}
                disabled={addLoading}
                aria-label="Cancel adding city"
                className={`rounded-lg p-2 transition disabled:opacity-50 ${isLightTheme ? "text-slate-600 hover:bg-slate-100 hover:text-slate-900" : "text-slate-400 hover:bg-white/10 hover:text-white"}`}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {addError && (
              <p
                id="saved-city-error"
                role="alert"
                className="px-1 text-[11px] text-rose-400"
              >
                {addError}
              </p>
            )}
          </form>
        ) : (
          <div className="space-y-2">
            {addError && (
              <p role="alert" className="text-[11px] text-rose-400">
                {addError}
              </p>
            )}

            <button
              type="button"
              onClick={handleAddCurrentCity}
              className={`flex w-full items-center justify-center gap-1.5 rounded-2xl border py-2 text-xs font-semibold shadow-sm transition-all hover:-translate-y-0.5 hover:border-cyan-400/30 hover:bg-cyan-500/10 hover:text-cyan-700 active:translate-y-0 ${isLightTheme ? "border-slate-200 bg-slate-100 text-slate-800" : "border-white/[0.08] bg-white/[0.05] text-slate-200 hover:text-cyan-300"}`}
            >
              <Plus className="h-3.5 w-3.5 text-cyan-400" />
              <span>
                {currentCityIsSaved
                  ? "Add Another City"
                  : `Save ${currentCity || "Current City"}`}
              </span>
            </button>

            {currentCityIsSaved && (
              <button
                type="button"
                onClick={() => {
                  setShowAddModal(true);
                  setAddError("");
                  requestAnimationFrame(() => addInputRef.current?.focus());
                }}
                className={`w-full rounded-lg py-1 text-[11px] transition-colors hover:bg-cyan-500/10 ${isLightTheme ? "text-cyan-700 hover:text-cyan-800" : "text-cyan-400 hover:text-cyan-300"}`}
              >
                Search for another city
              </button>
            )}
          </div>
        )}
      </div>
    </section>
  );

  return (
    <>
      {expandedBackdrop}
      {isExpanded ? createPortal(savedCitiesPanel, document.body) : savedCitiesPanel}

      {selectedCity && (
        <CityDetailsModal
          city={selectedCity}
          tempUnit={tempUnit}
          onClose={closeCityDetails}
          onSelect={handleSelectCity}
          onRemove={handleRemoveCity}
        />
      )}
    </>
  );
}
