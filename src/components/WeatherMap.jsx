
import { useState, useEffect, useRef, useMemo } from "react";
import {
  Compass,
  Maximize2,
  Minimize2,
  CloudRain,
  Thermometer,
  Wind,
  Cloud,
  Play,
  Pause,
  RotateCcw,
  Radio,
  Info,
  Layers,
  AlertCircle,
} from "lucide-react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const CARTO_KEY = import.meta.env.VITE_CARTO_API_KEY || "";
const OPENWEATHER_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY || "";

const DEFAULT_COORDS = { lat: 13.0827, lon: 80.2707 };

const LAYERS = [
  { id: "rainviewer", label: "Live Radar", icon: Radio, source: "RainViewer", requiresKey: false },
  { id: "precipitation_new", label: "Precipitation", icon: CloudRain, source: "OpenWeather", requiresKey: true },
  { id: "temp_new", label: "Temperature", icon: Thermometer, source: "OpenWeather", requiresKey: true },
  { id: "wind_new", label: "Wind Stream", icon: Wind, source: "OpenWeather", requiresKey: true },
  { id: "clouds_new", label: "Cloud Cover", icon: Cloud, source: "OpenWeather", requiresKey: true },
];

function createBaseTileLayer(theme) {
  if (CARTO_KEY) {
    const style = theme === "light" ? "light_all" : "dark_all";

    return L.tileLayer(
      `https://{s}.basemaps.cartocdn.com/${style}/{z}/{x}/{y}{r}.png?key=${CARTO_KEY}`,
      {
        maxZoom: 19,
        subdomains: "abcd",
        attribution:
          '&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }
    );
  }

  return L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    subdomains: "abc",
    className: theme === "light" ? "stratos-osm-light" : "stratos-osm-dark",
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  });
}

function createBeaconIcon() {
  return L.divIcon({
    className: "custom-radar-beacon",
    html: `
      <div style="position:relative;width:32px;height:32px;display:flex;align-items:center;justify-content:center">
        <span style="position:absolute;width:30px;height:30px;border-radius:50%;background:rgba(34,211,238,.25);border:1px solid rgba(34,211,238,.8);animation:stratos-radar-pulse 2s infinite"></span>
        <span style="position:absolute;width:14px;height:14px;border-radius:50%;background:rgba(34,211,238,.9);box-shadow:0 0 14px #22d3ee"></span>
        <span style="position:absolute;width:6px;height:6px;border-radius:50%;background:white"></span>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
}

export default function WeatherMap({
  coords = DEFAULT_COORDS,
  cityName = "Chennai",
  theme = "dark",
}) {
  const [activeLayer, setActiveLayer] = useState("rainviewer");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showMapInfo, setShowMapInfo] = useState(false);
  const [tileError, setTileError] = useState("");
  const [radarFrames, setRadarFrames] = useState([]);
  const [radarHost, setRadarHost] = useState("https://tilecache.rainviewer.com");
  const [currentFrameIdx, setCurrentFrameIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const baseTileLayerRef = useRef(null);
  const weatherTileLayerRef = useRef(null);
  const markerRef = useRef(null);
  const playTimerRef = useRef(null);

  const safeCoords = useMemo(() => {
    const lat = Number(coords?.lat);
    const lon = Number(coords?.lon ?? coords?.lng);

    return {
      lat: Number.isFinite(lat) && lat >= -90 && lat <= 90 ? lat : DEFAULT_COORDS.lat,
      lon: Number.isFinite(lon) && lon >= -180 && lon <= 180 ? lon : DEFAULT_COORDS.lon,
    };
  }, [coords?.lat, coords?.lon, coords?.lng]);

  const isLight = theme === "light";

  const layers = useMemo(
    () =>
      LAYERS.map((layer) => ({
        ...layer,
        available: !layer.requiresKey || Boolean(OPENWEATHER_KEY),
      })),
    []
  );

  // Load recent radar frames.
  useEffect(() => {
    const controller = new AbortController();

    async function loadRadar() {
      try {
        const response = await fetch(
          "https://api.rainviewer.com/public/weather-maps.json",
          { signal: controller.signal }
        );

        if (!response.ok) {
          throw new Error(`Radar feed returned ${response.status}`);
        }

        const data = await response.json();
        const frames = data?.radar?.past ?? [];

        if (frames.length) {
          const recentFrames = frames.slice(-8);
          setRadarHost(data.host || "https://tilecache.rainviewer.com");
          setRadarFrames(recentFrames);
          setCurrentFrameIdx(recentFrames.length - 1);
          setTileError("");
        } else {
          setTileError("No recent radar frames are currently available.");
        }
      } catch (error) {
        if (error.name !== "AbortError") {
          console.warn("RainViewer radar feed unavailable:", error.message);
          setTileError("Live radar is temporarily unavailable.");
        }
      }
    }

    loadRadar();

    return () => controller.abort();
  }, []);

  // Radar animation playback.
  useEffect(() => {
    if (playTimerRef.current) {
      clearInterval(playTimerRef.current);
      playTimerRef.current = null;
    }

    if (!isPlaying || activeLayer !== "rainviewer" || radarFrames.length < 2) {
      return undefined;
    }

    playTimerRef.current = setInterval(() => {
      setCurrentFrameIdx((previous) => (previous + 1) % radarFrames.length);
    }, 900);

    return () => {
      if (playTimerRef.current) {
        clearInterval(playTimerRef.current);
        playTimerRef.current = null;
      }
    };
  }, [isPlaying, activeLayer, radarFrames.length]);

  // Create the map once and destroy it on unmount.
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return undefined;

    const map = L.map(mapContainerRef.current, {
      center: [safeCoords.lat, safeCoords.lon],
      zoom: 6,
      zoomControl: true,
      attributionControl: true,
    });

    const baseLayer = createBaseTileLayer(theme);
    baseLayer.addTo(map);

    baseTileLayerRef.current = baseLayer;
    mapInstanceRef.current = map;

    const marker = L.marker([safeCoords.lat, safeCoords.lon], {
      icon: createBeaconIcon(),
      keyboard: true,
      title: cityName || "Selected location",
      alt: cityName || "Selected location",
    }).addTo(map);

    markerRef.current = marker;

    const resizeObserver =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(() => map.invalidateSize({ pan: false }))
        : null;

    if (mapContainerRef.current && resizeObserver) {
      resizeObserver.observe(mapContainerRef.current);
    }

    const resizeFallback = () => map.invalidateSize({ pan: false });
    window.addEventListener("resize", resizeFallback);

    requestAnimationFrame(() => map.invalidateSize({ pan: false }));

    return () => {
      window.removeEventListener("resize", resizeFallback);
      resizeObserver?.disconnect();

      if (playTimerRef.current) {
        clearInterval(playTimerRef.current);
        playTimerRef.current = null;
      }

      map.remove();
      mapInstanceRef.current = null;
      baseTileLayerRef.current = null;
      weatherTileLayerRef.current = null;
      markerRef.current = null;
    };
    // Map instance is intentionally created once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Move the map marker when the selected city changes.
  useEffect(() => {
    const map = mapInstanceRef.current;

    if (!map) return;

    map.setView(
      [safeCoords.lat, safeCoords.lon],
      isFullscreen ? 7 : 6,
      { animate: true, duration: 0.6 }
    );

    markerRef.current?.setLatLng([safeCoords.lat, safeCoords.lon]);
    markerRef.current?.bindTooltip(cityName || "Selected location", {
      direction: "top",
      offset: [0, -16],
    });

    requestAnimationFrame(() => map.invalidateSize({ pan: false }));
  }, [safeCoords, cityName, isFullscreen]);

  // Update the basemap when the theme changes.
  useEffect(() => {
    const map = mapInstanceRef.current;
    const oldLayer = baseTileLayerRef.current;

    if (!map || !oldLayer) return;

    const newLayer = createBaseTileLayer(theme);
    newLayer.addTo(map);
    oldLayer.remove();

    baseTileLayerRef.current = newLayer;
    map.invalidateSize({ pan: false });
  }, [theme]);

  // Render the selected weather overlay.
  useEffect(() => {
    const map = mapInstanceRef.current;

    if (!map) return;

    if (weatherTileLayerRef.current) {
      weatherTileLayerRef.current.remove();
      weatherTileLayerRef.current = null;
    }

    setTileError("");

    let tileUrl = "";
    let opacity = 0.75;

    if (activeLayer === "rainviewer") {
      const frame = radarFrames[currentFrameIdx];

      if (frame?.path) {
        tileUrl = `${radarHost}${frame.path}/256/{z}/{x}/{y}/2/1_1.png`;
        opacity = 0.85;
      }
    } else if (OPENWEATHER_KEY) {
      tileUrl = `https://tile.openweathermap.org/map/${activeLayer}/{z}/{x}/{y}.png?appid=${OPENWEATHER_KEY}`;
    } else {
      setTileError("OpenWeather API key required. Check your .env configuration.");
    }

    if (!tileUrl) return;

    const overlay = L.tileLayer(tileUrl, {
      opacity,
      maxZoom: 18,
      attribution:
        activeLayer === "rainviewer"
          ? '&copy; <a href="https://www.rainviewer.com/">RainViewer</a>'
          : '&copy; <a href="https://openweathermap.org/">OpenWeather</a>',
    });

    overlay.on("tileerror", () => {
      setTileError(
        activeLayer === "rainviewer"
          ? "Radar tiles could not load. Try again shortly."
          : "Weather tiles could not load. Check the API key, subscription, and tile access."
      );
    });

    overlay.addTo(map);
    weatherTileLayerRef.current = overlay;

    return () => {
      overlay.off();
      overlay.remove();

      if (weatherTileLayerRef.current === overlay) {
        weatherTileLayerRef.current = null;
      }
    };
  }, [activeLayer, currentFrameIdx, radarFrames, radarHost]);

  // Keep playback paused when leaving radar mode.
  useEffect(() => {
    if (activeLayer !== "rainviewer") {
      setIsPlaying(false);
    }
  }, [activeLayer]);

  // Escape key exits fullscreen.
  useEffect(() => {
    if (!isFullscreen) return undefined;

    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        setIsFullscreen(false);
        setShowMapInfo(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isFullscreen]);

  const currentRadarTime = radarFrames[currentFrameIdx]
    ? new Date(radarFrames[currentFrameIdx].time * 1000).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })
    : "--:--";

  const toggleFullscreen = () => {
    setIsFullscreen((previous) => !previous);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        mapInstanceRef.current?.invalidateSize({ pan: false, animate: false });
      });
    });
  };

  return (
    <>
      <section
        id="map-section"
        className={`glass-panel relative flex flex-col justify-between overflow-hidden rounded-3xl border p-5 shadow-xl transition-all duration-300 ${isLight ? "border-slate-300/70" : "border-white/10"
          } ${isFullscreen
            ? "!fixed !inset-0 !z-[10000] !m-0 !h-screen !w-screen !max-w-none rounded-none sm:!inset-0"
            : "relative h-full min-h-[330px] w-full"
          }`}
        aria-label={`Weather map for ${cityName}`}
      >
        <div className="relative z-10 mb-3 flex flex-col gap-2.5">
          <div className="flex min-w-0 items-center gap-2">
            <div
              className={`rounded-lg p-1.5 ${isLight
                ? "bg-cyan-500/15 text-cyan-700"
                : "bg-cyan-500/10 text-cyan-400"
                }`}
            >
              <Compass className="h-4 w-4" />
            </div>

            <h3 className={`min-w-0 flex-1 text-sm font-bold leading-tight tracking-tight sm:text-base ${isLight ? "text-slate-900" : "text-white"}`}>
              Atmospheric Radar &amp; Map
            </h3>

            <span className={`hidden max-w-[96px] shrink-0 truncate text-xs xl:inline ${isLight ? "text-slate-600" : "text-slate-400"}`}>
              • {cityName}
            </span>
          </div>

          <div className="flex w-full min-w-0 items-center gap-2">
            {activeLayer === "rainviewer" && radarFrames.length > 0 && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-300">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
                Radar
              </span>
            )}

            <button
              type="button"
              onClick={() => setShowMapInfo((previous) => !previous)}
              aria-label="Map provider information"
              aria-expanded={showMapInfo}
              className={`flex items-center gap-1 rounded-full border px-2 py-1 text-[10px] font-medium transition-colors ${isLight ? "border-slate-300 bg-white/90 text-slate-700 hover:bg-slate-100 hover:text-slate-900" : "border-white/10 bg-white/[0.08] text-slate-400 hover:bg-white/[0.15] hover:text-slate-200"}`}
            >
              <Layers className="h-3 w-3 text-cyan-400" />
              <span className="hidden sm:inline">
                {CARTO_KEY ? "CARTO" : "OpenStreetMap"}
              </span>
              <Info className="h-3 w-3" />
            </button>

            <div className="ml-auto">
              <button
                type="button"
                onClick={toggleFullscreen}
                title={isFullscreen ? "Exit fullscreen" : "Expand weather map"}
                aria-label={isFullscreen ? "Exit fullscreen" : "Expand weather map"}
                className={`flex h-7 w-7 items-center justify-center rounded-full border transition-colors ${isLight ? "border-slate-300 bg-white text-slate-700 hover:bg-slate-100 hover:text-slate-900" : "border-white/10 bg-white/[0.08] text-slate-400 hover:bg-white/[0.15] hover:text-white"}`}
              >
                {isFullscreen ? (
                  <Minimize2 className="h-3.5 w-3.5" />
                ) : (
                  <Maximize2 className="h-3.5 w-3.5" />
                )}
              </button>
            </div>
          </div>
        </div>

        <div className={`stratos-map-container relative min-h-[220px] flex-1 overflow-hidden border ${isLight ? "border-slate-300" : "border-white/10"} ${isFullscreen ? "min-h-0 rounded-none" : "rounded-2xl"
          }`}>
          <div ref={mapContainerRef} className="absolute inset-0 z-0 h-full w-full" />

          {!isLight && (
            <div className="pointer-events-none absolute inset-0 z-[400] bg-[radial-gradient(ellipse_at_center,transparent_50%,rgba(6,9,19,0.35)_100%)]" />
          )}

          <div className={`absolute left-2.5 top-2.5 z-[500] flex flex-col gap-1 rounded-2xl border p-1.5 shadow-lg backdrop-blur-md ${isLight ? "border-slate-200 bg-white/95" : "border-white/10 bg-slate-900/90 dark:bg-[#0b1325]/90"}`}>
            {layers.map((layer) => {
              const Icon = layer.icon;
              const isActive = activeLayer === layer.id;

              return (
                <button
                  key={layer.id}
                  type="button"
                  onClick={() => {
                    setActiveLayer(layer.id);
                    setTileError("");
                  }}
                  title={`${layer.source}${!layer.available ? " — API key required" : ""}`}
                  aria-label={layer.label}
                  aria-pressed={isActive}
                  className={`flex items-center gap-2 rounded-xl px-2.5 py-1.5 text-xs font-medium transition-all duration-200 ${isActive
                    ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-[0_0_12px_rgba(56,189,248,0.4)]"
                    : "text-slate-300 hover:bg-white/[0.08] hover:text-white"
                    }`}
                >
                  <Icon className="h-3.5 w-3.5 shrink-0" />
                  <span className="hidden sm:inline">{layer.label}</span>
                  {!layer.available && (
                    <span className="sr-only">API key required</span>
                  )}
                </button>
              );
            })}
          </div>

          {(tileError || (activeLayer !== "rainviewer" && !OPENWEATHER_KEY)) && (
            <div
              role="status"
              className="absolute right-2.5 top-2.5 z-[500] flex max-w-[65%] items-start gap-2 rounded-xl border border-rose-500/40 bg-rose-950/90 px-3 py-2 text-xs text-rose-200 shadow-lg backdrop-blur-md sm:max-w-sm"
            >
              <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-rose-400" />
              <span>
                {tileError ||
                  "OpenWeather API key required. Configure VITE_OPENWEATHER_API_KEY."}
              </span>
            </div>
          )}

          {showMapInfo && (
            <div className={`absolute inset-4 z-[700] flex flex-col justify-between overflow-y-auto rounded-2xl border p-5 shadow-2xl backdrop-blur-xl ${isLight ? "border-slate-200 bg-white/95 text-slate-900" : "border-white/15 bg-slate-900/95 text-white dark:bg-[#090f1f]/95"}`}>
              <div className="space-y-3">
                <div className={`flex items-center justify-between gap-3 border-b pb-2 ${isLight ? "border-slate-200" : "border-white/10"}`}>
                  <div className="flex items-center gap-2">
                    <Compass className="h-4 w-4 text-cyan-400" />
                    <h4 className={`text-sm font-bold ${isLight ? "text-slate-900" : "text-white"}`}>
                      Atmospheric Map Information
                    </h4>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowMapInfo(false)}
                    className={`rounded-lg px-2 py-1 text-xs ${isLight ? "bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-950" : "bg-white/10 text-slate-400 hover:text-white"}`}
                  >
                    Close
                  </button>
                </div>

                <div className={`space-y-3 text-xs leading-relaxed ${isLight ? "text-slate-700" : "text-slate-300"}`}>
                  <p>
                    <strong className={isLight ? "text-slate-950" : "text-white"}>Basemap:</strong>{" "}
                    {CARTO_KEY
                      ? "CARTO Basemaps"
                      : "OpenStreetMap Standard"}
                  </p>

                  <p>
                    <strong className={isLight ? "text-slate-950" : "text-white"}>Radar:</strong> RainViewer
                    provides recent radar frames when its public feed is
                    available. Frame availability and update intervals depend
                    on the provider.
                  </p>

                  <p>
                    <strong className={isLight ? "text-slate-950" : "text-white"}>Weather overlays:</strong>{" "}
                    OpenWeather tile layers require a valid API key and
                    compatible API access.
                  </p>

                  <p>
                    <strong className={isLight ? "text-slate-950" : "text-white"}>Configuration:</strong>{" "}
                    <code className={`rounded px-1 py-0.5 ${isLight ? "bg-cyan-50 text-cyan-800" : "bg-white/5 text-cyan-300"}`}>
                      VITE_OPENWEATHER_API_KEY
                    </code>{" "}
                    and optionally{" "}
                    <code className={`rounded px-1 py-0.5 ${isLight ? "bg-cyan-50 text-cyan-800" : "bg-white/5 text-cyan-300"}`}>
                      VITE_CARTO_API_KEY
                    </code>
                    .
                  </p>

                  <p>
                    <strong className={isLight ? "text-slate-950" : "text-white"}>Tile attribution:</strong>{" "}
                    Provider attribution is displayed on the map.
                  </p>

                  <a
                    href="https://openweathermap.org/api"
                    target="_blank"
                    rel="noreferrer"
                    className={`inline-block underline ${isLight ? "text-cyan-700" : "text-cyan-300"}`}
                  >
                    OpenWeather API documentation
                  </a>
                </div>
              </div>

              <div className={`flex justify-end border-t pt-3 ${isLight ? "border-slate-200" : "border-white/10"}`}>
                <button
                  type="button"
                  onClick={() => setShowMapInfo(false)}
                  className="rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-4 py-1.5 text-xs font-semibold text-white"
                >
                  Got it
                </button>
              </div>
            </div>
          )}

          {activeLayer === "rainviewer" && radarFrames.length > 0 && (
            <div className={`absolute bottom-2.5 left-2.5 right-2.5 z-[500] flex items-center justify-between gap-3 rounded-xl border px-3 py-2 text-xs shadow-lg backdrop-blur-md ${isLight ? "border-slate-200 bg-white/95" : "border-white/10 bg-slate-900/90 dark:bg-[#0a1122]/90"}`}>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsPlaying((previous) => !previous)}
                  className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-500 text-white shadow-sm transition-colors hover:bg-cyan-400"
                  title={isPlaying ? "Pause radar playback" : "Play radar playback"}
                  aria-label={isPlaying ? "Pause radar playback" : "Play radar playback"}
                >
                  {isPlaying ? (
                    <Pause className="h-3.5 w-3.5" />
                  ) : (
                    <Play className="h-3.5 w-3.5" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsPlaying(false);
                    setCurrentFrameIdx(radarFrames.length - 1);
                  }}
                  className={`flex h-7 w-7 items-center justify-center rounded-lg transition-colors ${isLight ? "bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-950" : "bg-white/[0.08] text-slate-300 hover:bg-white/[0.15] hover:text-white"}`}
                  title="Jump to latest scan"
                  aria-label="Jump to latest scan"
                >
                  <RotateCcw className="h-3 w-3" />
                </button>
              </div>

              <div className="flex max-w-xs flex-1 items-center gap-1.5">
                {radarFrames.map((frame, index) => (
                  <button
                    key={`${frame.time}-${index}`}
                    type="button"
                    onClick={() => {
                      setIsPlaying(false);
                      setCurrentFrameIdx(index);
                    }}
                    aria-label={`Select radar frame ${index + 1}`}
                    aria-pressed={index === currentFrameIdx}
                    className={`h-1.5 flex-1 rounded-full transition-all ${index === currentFrameIdx
                      ? "bg-cyan-400 shadow-[0_0_8px_#38bdf8]"
                      : "bg-white/20 hover:bg-white/40"
                      }`}
                  />
                ))}
              </div>

              <div className="shrink-0 text-[11px] font-semibold text-cyan-300">
                {currentRadarTime}
              </div>
            </div>
          )}
        </div>
      </section>

      {isFullscreen && (
        <button
          type="button"
          onClick={() => {
            setIsFullscreen(false);
            setShowMapInfo(false);
          }}
          aria-label="Close fullscreen map"
          className={`fixed inset-0 z-[9990] cursor-default backdrop-blur-sm ${isLight ? "bg-slate-900/45" : "bg-black/85"}`}
        />
      )}

      <style>{`
        @keyframes stratos-radar-pulse {
          0% { transform: scale(.65); opacity: .9; }
          100% { transform: scale(1.5); opacity: 0; }
        }

        .stratos-osm-dark {
          filter: invert(.88) hue-rotate(180deg) brightness(.8) contrast(.9) saturate(.7);
        }

        .stratos-osm-light {
          filter: none;
        }

        .custom-radar-beacon {
          background: transparent;
          border: none;
        }

        .stratos-map-container .leaflet-container {
          width: 100%;
          height: 100%;
          background: #0b1325;
          font-family: inherit;
        }

        .stratos-map-container .leaflet-control-attribution {
          font-size: 9px;
        }
      `}</style>
    </>
  );
}
