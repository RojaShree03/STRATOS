
import { useState, useEffect, useRef, useCallback } from "react";
import CosmicBackground from "./components/CosmicBackground";
import Navbar from "./components/Navbar";
import HeroSection from "./components/HeroSection";
import CurrentWeatherCard from "./components/CurrentWeatherCard";
import HourlyForecast from "./components/HourlyForecast";
import SevenDayForecast from "./components/SevenDayForecast";
import WeatherMap from "./components/WeatherMap";
import AirQualityCard from "./components/AirQualityCard";
import SunriseSunsetCard from "./components/SunriseSunsetCard";
import SavedCitiesCard from "./components/SavedCitiesCard";
import DailyBriefingCard from "./components/DailyBriefingCard";
import WeatherAlertsBanner from "./components/WeatherAlertsBanner";
import CityComparisonModal from "./components/CityComparisonModal";
import {
  SettingsModal,
  AboutModal,
  ForecastDetailsModal,
} from "./components/Modals";
import { loadAtmosphericIntelligence } from "./services/weatherApi";

const DEFAULT_SAVED_CITIES = [
  { name: "Chennai", temp: 32, condition: "Clouds", icon: "02d" },
  { name: "Bangalore", temp: 28, condition: "Clear", icon: "01d" },
  { name: "Mumbai", temp: 31, condition: "Rain", icon: "10d" },
  { name: "Delhi", temp: 27, condition: "Mist", icon: "50d" },
];

function readStorage(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value === null ? fallback : value;
  } catch {
    return fallback;
  }
}

function readSavedCities() {
  try {
    const value = localStorage.getItem("stratos_saved_cities");
    if (!value) return DEFAULT_SAVED_CITIES;

    const parsed = JSON.parse(value);
    return Array.isArray(parsed)
      ? parsed.filter(
        (city) =>
          city &&
          typeof city.name === "string" &&
          typeof city.temp === "number"
      )
      : DEFAULT_SAVED_CITIES;
  } catch {
    return DEFAULT_SAVED_CITIES;
  }
}

function getInitialCity() {
  try {
    const params = new URLSearchParams(window.location.search);
    const city = params.get("city");

    if (city?.trim()) return city.trim();
  } catch {
    // Use the saved default city.
  }

  return readStorage("stratos_default_city", "Chennai");
}

export default function Weather() {
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("Home");
  const [autoRefreshMinutes, setAutoRefreshMinutes] = useState(15);

  const [themeMode, setThemeMode] = useState(() => {
    const mode = readStorage("stratos_theme_mode", "system");
    return ["system", "light", "dark"].includes(mode) ? mode : "system";
  });

  const [systemIsDark, setSystemIsDark] = useState(() =>
    typeof window !== "undefined" && window.matchMedia
      ? window.matchMedia("(prefers-color-scheme: dark)").matches
      : false
  );

  const [tempUnit, setTempUnit] = useState(() => {
    const unit = readStorage("stratos_temp_unit", "C");
    return ["C", "F"].includes(unit) ? unit : "C";
  });

  const [defaultCity, setDefaultCity] = useState(getInitialCity);
  const [savedCities, setSavedCities] = useState(readSavedCities);

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [compareOpen, setCompareOpen] = useState(false);
  const [comparedCities, setComparedCities] = useState(() => [
    getInitialCity(),
    "London",
    "Tokyo",
  ]);

  const searchInputRef = useRef(null);
  const requestIdRef = useRef(0);

  const effectiveTheme =
    themeMode === "system"
      ? systemIsDark
        ? "dark"
        : "light"
      : themeMode;

  useEffect(() => {
    if (!window.matchMedia) return;

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (event) => setSystemIsDark(event.matches);

    media.addEventListener("change", handler);
    return () => media.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("stratos_theme_mode", themeMode);
    } catch {
      // Theme remains available for the current session.
    }
  }, [themeMode]);

  useEffect(() => {
    const root = document.documentElement;
    const isDark = effectiveTheme === "dark";

    root.classList.toggle("dark", isDark);
    root.classList.toggle("light", !isDark);
    root.dataset.theme = effectiveTheme;
    root.style.colorScheme = effectiveTheme;
  }, [effectiveTheme]);

  useEffect(() => {
    try {
      localStorage.setItem("stratos_temp_unit", tempUnit);
    } catch {
      // Preference remains available for the current session.
    }
  }, [tempUnit]);

  useEffect(() => {
    try {
      localStorage.setItem("stratos_default_city", defaultCity);
    } catch {
      // Preference remains available for the current session.
    }
  }, [defaultCity]);

  useEffect(() => {
    try {
      localStorage.setItem(
        "stratos_saved_cities",
        JSON.stringify(savedCities)
      );
    } catch {
      // Saved cities remain available for the current session.
    }
  }, [savedCities]);

  const fetchWeather = useCallback(async (queryOrCoords) => {
    const requestId = ++requestIdRef.current;

    setLoading(true);
    setError(null);

    try {
      const data = await loadAtmosphericIntelligence(queryOrCoords);

      if (requestId !== requestIdRef.current) return;

      if (
        !data?.city ||
        !data?.current ||
        typeof data.current.temp !== "number"
      ) {
        throw new Error("Invalid weather data received from the API.");
      }

      setWeatherData(data);

      try {
        const url = new URL(window.location.href);
        url.searchParams.set("city", data.city);
        window.history.replaceState(null, "", url.toString());
      } catch {
        // Weather data remains available if URL synchronization fails.
      }

      if (typeof queryOrCoords === "string") {
        try {
          const stored = JSON.parse(
            localStorage.getItem("stratos_recent_cities") || "[]"
          );
          const recent = Array.isArray(stored) ? stored : [];
          const updated = [
            data.city,
            ...recent.filter(
              (city) =>
                typeof city === "string" &&
                city.toLowerCase() !== data.city.toLowerCase()
            ),
          ].slice(0, 6);

          localStorage.setItem(
            "stratos_recent_cities",
            JSON.stringify(updated)
          );
        } catch {
          // Recent searches are optional.
        }
      }

      setSavedCities((previous) =>
        previous.map((city) =>
          city.name.toLowerCase() === data.city.toLowerCase()
            ? {
              ...city,
              name: data.city,
              temp: data.current.temp,
              condition: data.current.condition,
              description: data.current.description,
              icon: data.current.icon,
              feelsLike: data.current.feelsLike,
              tempMax: data.current.tempMax,
              tempMin: data.current.tempMin,
              humidity: data.current.humidity,
              windSpeedKmH: data.current.windSpeedKmH,
              visibilityKm: data.current.visibilityKm,
              state: data.state,
              country: data.country,
              tempUnit: "C",
            }
            : city
        )
      );
    } catch (err) {
      if (requestId !== requestIdRef.current) return;

      console.error("Weather query failed:", err);

      let message =
        "Could not retrieve weather data. Please check the city name.";

      if (err.response?.status === 404) {
        message = `City "${typeof queryOrCoords === "string" ? queryOrCoords : "location"}" not found. Please try another city.`;
      } else if (err.response?.status === 401) {
        message = "Weather API authorization failed. Please check your API key.";
      } else if (err.response?.status === 429) {
        message = "Weather API rate limit exceeded. Please try again shortly.";
      } else if (!navigator.onLine) {
        message = "Network connection lost. Please check your internet connection.";
      } else if (err.message?.startsWith("Invalid weather data")) {
        message = err.message;
      }

      setError(message);
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    fetchWeather(defaultCity);

    return () => {
      requestIdRef.current += 1;
    };
  }, [defaultCity, fetchWeather]);

  useEffect(() => {
    if (!Number.isFinite(autoRefreshMinutes) || autoRefreshMinutes <= 0) {
      return;
    }

    const interval = window.setInterval(() => {
      if (weatherData?.city) {
        fetchWeather(weatherData.city);
      }
    }, autoRefreshMinutes * 60 * 1000);

    return () => window.clearInterval(interval);
  }, [autoRefreshMinutes, weatherData?.city, fetchWeather]);

  const handleUseLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }

    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        fetchWeather({
          lat: coords.latitude,
          lon: coords.longitude,
        });
      },
      (err) => {
        setLoading(false);

        const messages = {
          1: "Location permission denied. Please allow location access or search manually.",
          2: "Location unavailable. Please check your device location settings.",
          3: "Location request timed out. Please try again.",
        };

        setError(
          messages[err.code] || "Could not retrieve your current location."
        );
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handleToggleFavorite = () => {
    if (!weatherData?.city || !weatherData?.current) return;

    const cityName = weatherData.city;
    const exists = savedCities.some(
      (city) => city.name.toLowerCase() === cityName.toLowerCase()
    );

    if (exists) {
      setSavedCities((previous) =>
        previous.filter(
          (city) => city.name.toLowerCase() !== cityName.toLowerCase()
        )
      );
    } else {
      setSavedCities((previous) => [
        ...previous,
        {
          name: cityName,
          temp: weatherData.current.temp,
          condition: weatherData.current.condition,
          icon: weatherData.current.icon,
        },
      ]);
    }
  };

  const handleRemoveCity = (cityName) => {
    setSavedCities((previous) =>
      previous.filter(
        (city) => city.name.toLowerCase() !== cityName.toLowerCase()
      )
    );
  };

  const handleAddCity = async (cityName) => {
    const query = cityName?.trim();
    if (!query) return false;

    try {
      const data = await loadAtmosphericIntelligence(query);
      if (!data?.city || !data?.current) return false;

      const cityNameNormalized = data.city.toLowerCase();
      const exists = savedCities.some(
        (city) => city.name.toLowerCase() === cityNameNormalized
      );

      if (exists) return false;

      setSavedCities((previous) => {
        if (
          previous.some(
            (city) => city.name.toLowerCase() === cityNameNormalized
          )
        ) {
          return previous;
        }

        return [
          ...previous,

          {
            name: data.city,
            temp: data.current.temp,
            condition: data.current.condition,
            description: data.current.description,
            icon: data.current.icon,
            feelsLike: data.current.feelsLike,
            tempMax: data.current.tempMax,
            tempMin: data.current.tempMin,
            humidity: data.current.humidity,
            windSpeedKmH: data.current.windSpeedKmH,
            visibilityKm: data.current.visibilityKm,
            state: data.state,
            country: data.country,
            tempUnit: "C",
          },
        ];
      });

      return true;
    } catch (err) {
      console.warn("Failed to add city:", err);
      return false;
    }
  };

  const isCurrentFavorite = weatherData
    ? savedCities.some(
      (city) =>
        city.name.toLowerCase() === weatherData.city.toLowerCase()
    )
    : false;

  return (
    <div className="relative min-h-screen">
      <CosmicBackground theme={effectiveTheme} />

      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        tempUnit={tempUnit}
        setTempUnit={setTempUnit}
        themeMode={themeMode}
        effectiveTheme={effectiveTheme}
        setThemeMode={setThemeMode}
        onOpenSettings={() => setSettingsOpen(true)}
        onOpenAbout={() => setAboutOpen(true)}
        onOpenCompare={() => setCompareOpen(true)}
        onFocusSearch={() => {
          searchInputRef.current?.focus();
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-8 sm:space-y-10">
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch">
          <div className="lg:col-span-5 flex flex-col justify-center">
            <HeroSection
              onSearch={fetchWeather}
              onUseLocation={handleUseLocation}
              currentCity={weatherData?.city || defaultCity}
              loading={loading}
              error={error}
              onDismissError={() => setError(null)}
              searchRef={searchInputRef}
            />
          </div>

          <div className="lg:col-span-7">
            {weatherData ? (
              <CurrentWeatherCard
                weatherData={weatherData}
                tempUnit={tempUnit}
                isFavorite={isCurrentFavorite}
                onToggleFavorite={handleToggleFavorite}
                onRefresh={() => fetchWeather(weatherData.city)}
                theme={effectiveTheme}
              />
            ) : (
              <div className="glass-panel-elevated rounded-3xl p-12 min-h-[420px] flex items-center justify-center border border-white/10">
                <div className="flex flex-col items-center gap-3 text-slate-400">
                  <div className="w-10 h-10 border-2 border-cyan-400/40 border-t-cyan-400 rounded-full animate-spin" />
                  <span className="text-sm font-medium">
                    Acquiring atmospheric intelligence...
                  </span>
                </div>
              </div>
            )}
          </div>
        </section>

        {weatherData?.advisories?.length > 0 && (
          <WeatherAlertsBanner advisories={weatherData.advisories} />
        )}

        {weatherData?.briefing && (
          <DailyBriefingCard
            briefing={weatherData.briefing}
            cityName={weatherData.city}
          />
        )}

        <section
          id="forecast-section"
          className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch"
        >
          <div className="lg:col-span-7">
            <HourlyForecast
              hourlyData={weatherData?.hourly}
              tempUnit={tempUnit}
            />
          </div>

          <div className="lg:col-span-5">
            <SevenDayForecast
              dailyData={weatherData?.daily}
              tempUnit={tempUnit}
              onViewDetails={() => setDetailsOpen(true)}
            />
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
          <WeatherMap
            coords={weatherData?.coord || { lat: 13.0827, lon: 80.2707 }}
            cityName={weatherData?.city || "Chennai"}
            theme={effectiveTheme}
          />

          <AirQualityCard airQuality={weatherData?.airQuality} />

          <SunriseSunsetCard astronomy={weatherData?.astronomy} />

          <SavedCitiesCard
            savedCities={savedCities}
            currentCity={weatherData?.city || defaultCity}
            onSelectCity={fetchWeather}
            onAddCurrentCity={handleToggleFavorite}
            onRemoveCity={handleRemoveCity}
            onAddCity={handleAddCity}
            tempUnit={tempUnit}
          />
        </section>

        <footer className="pt-8 pb-12 border-t border-white/[0.08] flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="font-semibold">STRATOS Intelligence Node</span>
            <span>•</span>
            <span>Telemetry Active</span>
          </div>

          <div className="flex items-center gap-6">
            <button
              onClick={() => setAboutOpen(true)}
              className="hover:text-cyan-400 transition-colors"
            >
              System Architecture
            </button>
            <button
              onClick={() => setCompareOpen(true)}
              className="hover:text-cyan-400 transition-colors"
            >
              Compare Cities
            </button>
            <button
              onClick={() => setSettingsOpen(true)}
              className="hover:text-cyan-400 transition-colors"
            >
              Telemetry Preferences
            </button>
            <span>Above the Ordinary © 2026</span>
          </div>
        </footer>
      </main>

      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        tempUnit={tempUnit}
        setTempUnit={setTempUnit}
        autoRefreshMinutes={autoRefreshMinutes}
        setAutoRefreshMinutes={setAutoRefreshMinutes}
        defaultCity={defaultCity}
        setDefaultCity={setDefaultCity}
        currentCity={weatherData?.city || defaultCity}
        themeMode={themeMode}
        setThemeMode={setThemeMode}
      />

      <AboutModal
        isOpen={aboutOpen}
        onClose={() => setAboutOpen(false)}
      />

      <ForecastDetailsModal
        isOpen={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        dailyData={weatherData?.daily}
        tempUnit={tempUnit}
      />

      <CityComparisonModal
        isOpen={compareOpen}
        onClose={() => setCompareOpen(false)}
        tempUnit={tempUnit}
        comparedCities={comparedCities}
        setComparedCities={setComparedCities}
      />
    </div>
  );
}
