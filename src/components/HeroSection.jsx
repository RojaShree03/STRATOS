
import { useState, useEffect, useRef } from "react";
import {
  Search,
  ArrowRight,
  MapPin,
  Sparkles,
  Loader2,
  X,
  AlertCircle,
} from "lucide-react";
import { getCitySuggestions } from "../services/weatherApi";

const PRESET_CITIES = ["Chennai", "Bengaluru" ,"Mumbai", "Delhi"];

function getRecentCities() {
  try {
    const saved = JSON.parse(
      localStorage.getItem("stratos_recent_cities") || "[]"
    );

    if (!Array.isArray(saved)) return [];

    return saved
      .filter((city) => typeof city === "string" && city.trim())
      .map((city) => city.trim())
      .filter(
        (city, index, list) =>
          list.findIndex(
            (item) => item.toLowerCase() === city.toLowerCase()
          ) === index
      )
      .slice(0, 4);
  } catch {
    return [];
  }
}

export default function HeroSection({
  onSearch,
  onUseLocation,
  currentCity = "Chennai",
  loading = false,
  error = null,
  onDismissError,
  searchRef,
}) {
  const [query, setQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState(currentCity);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeSuggestionIdx, setActiveSuggestionIdx] = useState(-1);
  const [recentCities] = useState(getRecentCities);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);

  const dropdownRef = useRef(null);
  const suggestionRefs = useRef([]);

  // Fetch city suggestions while the user types.
  useEffect(() => {
    const trimmedQuery = query.trim();

    if (trimmedQuery.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      setSuggestionsLoading(false);
      return;
    }

    let cancelled = false;

    const timer = setTimeout(async () => {
      setSuggestionsLoading(true);

      try {
        const results = await getCitySuggestions(trimmedQuery);

        if (cancelled) return;

        const validResults = Array.isArray(results)
          ? results.filter(
            (item) =>
              item &&
              typeof item.name === "string" &&
              Number.isFinite(Number(item.lat)) &&
              Number.isFinite(Number(item.lon))
          )
          : [];

        setSuggestions(validResults);
        setShowSuggestions(validResults.length > 0);
        setActiveSuggestionIdx(-1);
      } catch {
        if (!cancelled) {
          setSuggestions([]);
          setShowSuggestions(false);
        }
      } finally {
        if (!cancelled) {
          setSuggestionsLoading(false);
        }
      }
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query]);

  // Close suggestions when clicking outside the search area.
  useEffect(() => {
    const handlePointerDown = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setShowSuggestions(false);
        setActiveSuggestionIdx(-1);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
    };
  }, []);

  // Keep the active suggestion visible.
  useEffect(() => {
    if (activeSuggestionIdx >= 0) {
      suggestionRefs.current[activeSuggestionIdx]?.scrollIntoView({
        block: "nearest",
      });
    }
  }, [activeSuggestionIdx]);

  // Sync the selected button when the actual weather city changes.
  useEffect(() => {
    if (currentCity) {
      setSelectedCity(currentCity);
    }
  }, [currentCity]);

  const handleSubmit = (event) => {
    event.preventDefault();

    const city = query.trim();

    if (!city || loading || typeof onSearch !== "function") return;

    setSelectedCity(city);
    setShowSuggestions(false);
    setActiveSuggestionIdx(-1);
    onSearch(city);
  };

  const handleSelectSuggestion = (item) => {
    if (!item?.name || loading || typeof onSearch !== "function") return;

    setSelectedCity(item.name);
    setQuery("");
    setSuggestions([]);
    setShowSuggestions(false);
    setActiveSuggestionIdx(-1);
    onSearch(item.name);
  };

  const handleKeyDown = (event) => {
    if (event.key === "Escape") {
      setShowSuggestions(false);
      setActiveSuggestionIdx(-1);
      return;
    }

    if (!showSuggestions || suggestions.length === 0) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();

      setActiveSuggestionIdx((previous) =>
        previous < suggestions.length - 1 ? previous + 1 : 0
      );
    } else if (event.key === "ArrowUp") {
      event.preventDefault();

      setActiveSuggestionIdx((previous) =>
        previous > 0 ? previous - 1 : suggestions.length - 1
      );
    } else if (event.key === "Enter" && activeSuggestionIdx >= 0) {
      event.preventDefault();
      handleSelectSuggestion(suggestions[activeSuggestionIdx]);
    }
  };

  const handleClear = () => {
    setQuery("");
    setSuggestions([]);
    setShowSuggestions(false);
    setActiveSuggestionIdx(-1);
    searchRef?.current?.focus();
  };

  const handleCityClick = (city) => {
    if (loading || typeof onSearch !== "function") return;

    // Update the active button immediately.
    setSelectedCity(city);
    setQuery("");
    setSuggestions([]);
    setShowSuggestions(false);
    setActiveSuggestionIdx(-1);

    onSearch(city);
  };

  const isCityActive = (city) =>
    selectedCity?.trim().toLowerCase() === city?.trim().toLowerCase();

  const activeCityClass =
    "border-cyan-400/60 bg-cyan-500/20 text-cyan-300 shadow-[0_0_12px_rgba(56,189,248,0.25)]";

  const inactiveCityClass =
    "border-white/[0.08] bg-white/[0.04] text-slate-300 hover:bg-white/[0.09] hover:text-white";

  return (
    <section className="flex flex-col justify-center space-y-6">
      <div className="inline-flex w-fit items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-950/40 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-cyan-400 backdrop-blur-md">
        <Sparkles className="h-3.5 w-3.5 text-cyan-300 motion-safe:animate-pulse" />
        <span>Real-Time Weather Intelligence</span>
      </div>

      <div className="space-y-2">
        <h1 className="text-4xl font-extrabold leading-[1.1] tracking-tight text-white sm:text-5xl lg:text-6xl">
          See the world
          <br />
          <span className="bg-gradient-to-r from-cyan-400 via-indigo-300 to-fuchsia-400 bg-clip-text text-transparent">
            differently.
          </span>
        </h1>

        <p className="max-w-xl pt-2 text-base font-normal leading-relaxed text-slate-300/90 sm:text-lg">
          Explore real-time weather, forecasts and atmospheric insights for any
          place on Earth.
        </p>
      </div>

      <div className="relative max-w-xl" ref={dropdownRef}>
        <form onSubmit={handleSubmit} className="relative flex items-center">
          <div className="pointer-events-none absolute left-4 z-10 text-slate-400">
            {loading || suggestionsLoading ? (
              <Loader2 className="h-5 w-5 animate-spin text-cyan-400" />
            ) : (
              <Search className="h-5 w-5" />
            )}
          </div>

          <input
            ref={searchRef}
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              if (suggestions.length > 0) setShowSuggestions(true);
            }}
            role="combobox"
            aria-label="Search weather by city"
            aria-autocomplete="list"
            aria-expanded={showSuggestions && suggestions.length > 0}
            aria-controls="city-suggestions"
            aria-activedescendant={
              activeSuggestionIdx >= 0
                ? `city-suggestion-${activeSuggestionIdx}`
                : undefined
            }
            autoComplete="off"
            placeholder="Search for a city, e.g. Chennai"
            disabled={loading}
            className="h-14 w-full rounded-full border border-white/15 bg-[#0c1324]/80 pl-12 pr-24 text-sm text-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.35)] outline-none transition-all duration-300 placeholder:text-slate-400 hover:bg-[#0f172e]/90 focus:border-cyan-400/60 focus:bg-[#0c1324] focus:shadow-[0_0_25px_rgba(56,189,248,0.25)] sm:text-base"
          />

          {query && (
            <button
              type="button"
              onClick={handleClear}
              aria-label="Clear city search"
              className="absolute right-14 rounded-full p-1 text-slate-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          )}

          <button
            type="submit"
            disabled={loading || !query.trim()}
            aria-label="Search weather"
            className="absolute right-2 flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-tr from-blue-600 to-cyan-400 text-white shadow-[0_0_15px_rgba(56,189,248,0.5)] transition-all duration-300 hover:scale-105 hover:from-blue-500 hover:to-cyan-300 hover:shadow-[0_0_20px_rgba(56,189,248,0.8)] active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ArrowRight className="h-4 w-4" />
            )}
          </button>
        </form>

        {showSuggestions && suggestions.length > 0 && (
          <div
            id="city-suggestions"
            role="listbox"
            aria-label="City suggestions"
            className="absolute left-0 right-0 top-16 z-50 overflow-hidden rounded-2xl border border-white/10 bg-[#0d1629]/95 py-1.5 shadow-2xl backdrop-blur-2xl"
          >
            {suggestions.map((item, index) => (
              <button
                ref={(element) => {
                  suggestionRefs.current[index] = element;
                }}
                id={`city-suggestion-${index}`}
                key={`${item.lat}-${item.lon}-${item.name}-${index}`}
                type="button"
                role="option"
                aria-selected={activeSuggestionIdx === index}
                disabled={loading}
                onMouseEnter={() => setActiveSuggestionIdx(index)}
                onClick={() => handleSelectSuggestion(item)}
                className={`flex w-full items-center justify-between gap-3 border-b border-white/[0.05] px-4 py-2.5 text-left transition-colors last:border-b-0 ${activeSuggestionIdx === index
                    ? "bg-cyan-500/20 text-cyan-200"
                    : "text-slate-200 hover:bg-white/[0.06]"
                  }`}
              >
                <span className="flex min-w-0 items-center gap-2.5">
                  <MapPin className="h-4 w-4 shrink-0 text-cyan-400" />
                  <span className="truncate text-sm font-medium">
                    {item.name}
                  </span>

                  {item.state && (
                    <span className="truncate text-xs text-slate-400">
                      {item.state}
                    </span>
                  )}
                </span>

                {item.country && (
                  <span className="shrink-0 rounded bg-white/10 px-2 py-0.5 text-xs font-semibold text-slate-300">
                    {item.country}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {error && (
        <div
          role="alert"
          className="flex max-w-xl items-center justify-between gap-3 rounded-xl border border-rose-500/30 bg-rose-950/50 p-3.5 text-sm text-rose-200 backdrop-blur-md animate-fade-in"
        >
          <div className="flex min-w-0 items-center gap-2.5">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>

          {typeof onDismissError === "function" && (
            <button
              type="button"
              onClick={onDismissError}
              aria-label="Dismiss error"
              className="shrink-0 rounded p-1 text-rose-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2.5 pt-1">
        <button
          type="button"
          onClick={onUseLocation}
          disabled={loading || typeof onUseLocation !== "function"}
          className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-white/[0.06] px-3.5 py-1.5 text-xs font-medium text-cyan-300 shadow-sm transition-all duration-200 hover:border-cyan-400 hover:bg-white/[0.12] hover:shadow-[0_0_12px_rgba(56,189,248,0.25)] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <MapPin className="h-3.5 w-3.5 text-cyan-400" />
          <span>Use my location</span>
        </button>

        {PRESET_CITIES.map((city) => {
          const isActive = isCityActive(city);

          return (
            <button
              type="button"
              key={city}
              onClick={() => handleCityClick(city)}
              disabled={loading}
              aria-pressed={isActive}
              className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all duration-200 ${isActive ? activeCityClass : inactiveCityClass
                } disabled:cursor-not-allowed disabled:opacity-50`}
            >
              {city}
            </button>
          );
        })}

        {recentCities
          .filter(
            (city) =>
              !PRESET_CITIES.some(
                (preset) => preset.toLowerCase() === city.toLowerCase()
              )
          )
          .map((city) => {
            const isActive = isCityActive(city);

            return (
              <button
                type="button"
                key={city}
                onClick={() => handleCityClick(city)}
                disabled={loading}
                aria-pressed={isActive}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-all duration-200 ${isActive ? activeCityClass : inactiveCityClass
                  } disabled:cursor-not-allowed disabled:opacity-50`}
              >
                {city}
              </button>
            );
          })}
      </div>
    </section>
  );
}
