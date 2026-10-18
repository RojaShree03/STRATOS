
import { useState, useEffect, useRef } from "react";
import {
  MapPin,
  Heart,
  MoreHorizontal,
  Droplets,
  Wind,
  Gauge,
  Eye,
  Sun,
  Share2,
  Copy,
  RefreshCw,
  Check,
  AlertCircle,
} from "lucide-react";
import { formatTemp } from "../utils/tempConverter";

export default function CurrentWeatherCard({
  weatherData,
  tempUnit = "C",
  isFavorite = false,
  onToggleFavorite,
  onRefresh,
  theme = "dark",
}) {
  const [showMenu, setShowMenu] = useState(false);
  const [coordsCopied, setCoordsCopied] = useState(false);
  const [weatherCopied, setWeatherCopied] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [toast, setToast] = useState(null);

  const menuRef = useRef(null);
  const toastTimerRef = useRef(null);
  const actionTimerRef = useRef(null);

  const showToast = (message, type = "success") => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);

    setToast({ message, type });
    toastTimerRef.current = setTimeout(() => setToast(null), 3200);
  };

  useEffect(() => {
    if (!showMenu) return;

    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") setShowMenu(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [showMenu]);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
      if (actionTimerRef.current) clearTimeout(actionTimerRef.current);
    };
  }, []);

  if (!weatherData?.current) return null;

  const {
    city = "Unknown location",
    state,
    country,
    localTimeFormatted,
    current,
    coord,
  } = weatherData;

  const safeValue = (value, suffix = "") => {
    if (value === null || value === undefined || value === "") return "--";
    if (typeof value === "number" && !Number.isFinite(value)) return "--";
    return `${value}${suffix}`;
  };

  const currentCondition = String(current.condition || "").toLowerCase();
  const currentIcon = String(current.icon || "");
  const isRainy = currentCondition.includes("rain") || currentCondition.includes("drizzle");
  const isNight = currentIcon.includes("n");
  const isLight = theme === "light";

  const buildShareContent = () => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const pathname = typeof window !== "undefined" ? window.location.pathname : "";
    const shareUrl = origin
      ? `${origin}${pathname}?city=${encodeURIComponent(city)}`
      : "";

    const locationStr = [city, state, country].filter(Boolean).join(", ");
    const timestamp =
      localTimeFormatted ||
      new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });

    const text = [
      `STRATOS Weather Briefing: ${locationStr}`,
      `Current: ${formatTemp(current.temp, tempUnit)} — ${current.description || current.condition || "Unknown conditions"}`,
      `Feels like: ${formatTemp(current.feelsLike, tempUnit)}`,
      `High: ${formatTemp(current.tempMax, tempUnit)} / Low: ${formatTemp(current.tempMin, tempUnit)}`,
      `Wind: ${safeValue(current.windSpeedKmH, " km/h")} ${current.windDirection || ""}`,
      `Humidity: ${safeValue(current.humidity, "%")}`,
      `UV Index: ${current.uv?.val ?? "N/A"}`,
      `Local time: ${timestamp}`,
      "",
      "Explore atmospheric intelligence on STRATOS.",
      shareUrl,
    ].filter((line, index, array) => line !== "" || array[index - 1] !== "").join("\n");

    return {
      title: `STRATOS Weather — ${city}`,
      text,
      url: shareUrl,
    };
  };

  const copyText = async (text) => {
    if (navigator.clipboard?.writeText && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return;
    }

    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    textarea.style.pointerEvents = "none";
    document.body.appendChild(textarea);
    textarea.select();

    const copied = document.execCommand("copy");
    document.body.removeChild(textarea);

    if (!copied) throw new Error("Clipboard copy failed");
  };

  const handleCopyCoords = async () => {
    if (
      !Number.isFinite(Number(coord?.lat)) ||
      !Number.isFinite(Number(coord?.lon))
    ) {
      showToast("Coordinates are unavailable.", "error");
      setShowMenu(false);
      return;
    }

    try {
      await copyText(`${coord.lat}, ${coord.lon}`);
      setCoordsCopied(true);
      showToast("Coordinates copied to clipboard!");
      setShowMenu(false);

      if (actionTimerRef.current) clearTimeout(actionTimerRef.current);
      actionTimerRef.current = setTimeout(() => setCoordsCopied(false), 1800);
    } catch {
      showToast("Unable to copy coordinates.", "error");
      setShowMenu(false);
    }
  };

  const handleCopyWeather = async (text) => {
    try {
      await copyText(text);
      setWeatherCopied(true);
      showToast("Weather summary copied to clipboard!");
      setShowMenu(false);

      if (actionTimerRef.current) clearTimeout(actionTimerRef.current);
      actionTimerRef.current = setTimeout(() => setWeatherCopied(false), 1800);
    } catch {
      showToast("Unable to copy. Check your browser clipboard permissions.", "error");
      setShowMenu(false);
    }
  };

  const handleShare = async () => {
    if (isSharing) return;

    const content = buildShareContent();
    setShowMenu(false);

    if (typeof navigator.share === "function") {
      try {
        setIsSharing(true);
        await navigator.share({
          title: content.title,
          text: content.text,
          ...(content.url ? { url: content.url } : {}),
        });
        showToast("Weather briefing shared successfully!");
      } catch (error) {
        if (error?.name !== "AbortError") {
          await handleCopyWeather(content.text);
        }
      } finally {
        setIsSharing(false);
      }
      return;
    }

    await handleCopyWeather(content.text);
  };

  const handleRefresh = async () => {
    setShowMenu(false);

    if (typeof onRefresh !== "function") {
      showToast("Refresh is currently unavailable.", "error");
      return;
    }

    try {
      await onRefresh();
      showToast("Weather refresh requested.");
    } catch {
      showToast("Unable to refresh weather. Please try again.", "error");
    }
  };

  return (
    <div className="group relative flex min-h-[420px] flex-col justify-between overflow-hidden rounded-3xl border border-white/15 p-6 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.7)] glass-panel-elevated sm:p-8">
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className={`absolute left-1/2 top-4 z-50 flex max-w-[90%] -translate-x-1/2 items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold shadow-2xl backdrop-blur-xl animate-fade-in ${toast.type === "success"
              ? "border-emerald-500/40 bg-emerald-950/95 text-emerald-200"
              : "border-rose-500/40 bg-rose-950/95 text-rose-200"
            }`}
        >
          {toast.type === "success" ? (
            <Check className="h-3.5 w-3.5 shrink-0 text-emerald-400" />
          ) : (
            <AlertCircle className="h-3.5 w-3.5 shrink-0 text-rose-400" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className={`absolute inset-0 transition-colors duration-300 ${isLight
              ? "bg-gradient-to-br from-[#dbeafe] via-[#eff6ff] to-[#e0f2fe]"
              : isNight
                ? "bg-gradient-to-b from-[#090e1f] via-[#0b152d] to-[#070b16]"
                : "bg-gradient-to-br from-[#0c1836] via-[#10224b] to-[#0d162d]"
            }`}
        />

        <div className="absolute -right-4 -top-6 h-[300px] w-[340px] max-h-[90%] max-w-[90%] opacity-90">
          <svg
            viewBox="0 0 400 360"
            className="h-full w-full"
            fill="none"
            aria-hidden="true"
          >
            <circle
              cx="290"
              cy="120"
              r="75"
              fill="url(#cardSunCorona)"
              className="motion-safe:animate-pulse"
              style={{ animationDuration: "5s" }}
            />
            <circle cx="290" cy="120" r="46" fill="url(#cardSunCore)" />
            <circle
              cx="290"
              cy="120"
              r="110"
              stroke="url(#cardSunRays)"
              strokeWidth="1.5"
              strokeDasharray="4 8"
              opacity="0.6"
            />

            <path
              d="M180 220 C170 170 230 140 270 160 C310 130 380 160 380 210 C400 230 390 270 350 280 L160 280 C130 280 140 230 180 220Z"
              fill="url(#cardCloudBack)"
              opacity="0.85"
            />
            <path
              d="M210 240 C200 190 260 160 300 180 C340 150 410 180 410 230 C430 250 415 290 380 300 L190 300 C160 300 170 250 210 240Z"
              fill="url(#cardCloudFront)"
            />
            <path
              d="M60 360 L160 260 L220 310 L310 240 L390 300 L450 260 L450 360Z"
              fill="url(#mountainGrad)"
              opacity="0.9"
            />

            <defs>
              <radialGradient id="cardSunCorona" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.8" />
                <stop offset="50%" stopColor="#f97316" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#ea580c" stopOpacity="0" />
              </radialGradient>
              <linearGradient id="cardSunCore" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#fef08a" />
                <stop offset="45%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#d97706" />
              </linearGradient>
              <radialGradient id="cardSunRays" cx="50%" cy="50%" r="50%">
                <stop offset="60%" stopColor="#fbbf24" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
              </radialGradient>
              <linearGradient id="cardCloudBack" x1="0.5" y1="0" x2="0.5" y2="1">
                <stop offset="0%" stopColor="#fed7aa" stopOpacity="0.9" />
                <stop offset="40%" stopColor="#fdba74" stopOpacity="0.7" />
                <stop offset="100%" stopColor="#1e293b" stopOpacity="0.8" />
              </linearGradient>
              <linearGradient id="cardCloudFront" x1="0.5" y1="0" x2="0.5" y2="1">
                <stop offset="0%" stopColor="#ffedd5" />
                <stop offset="35%" stopColor="#fed7aa" />
                <stop offset="70%" stopColor="#94a3b8" />
                <stop offset="100%" stopColor="#1e293b" />
              </linearGradient>
              <linearGradient id="mountainGrad" x1="0.5" y1="0" x2="0.5" y2="1">
                <stop offset="0%" stopColor={isLight ? "#94a3b8" : "#1e293b"} />
                <stop offset="60%" stopColor={isLight ? "#64748b" : "#0f172a"} />
                <stop offset="100%" stopColor={isLight ? "#475569" : "#020617"} />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {isRainy && (
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px] opacity-20" />
        )}

        <div
          className={`pointer-events-none absolute inset-0 ${isLight
              ? "bg-gradient-to-t from-white/75 via-transparent to-transparent"
              : "bg-gradient-to-t from-[#090f1f]/90 via-transparent to-transparent"
            }`}
        />
      </div>

      <div className="relative z-10 flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 shrink-0 text-cyan-400" />
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              {city}
            </h2>
          </div>
          <p className="pl-7 text-xs font-medium text-slate-300 sm:text-sm">
            {[state, country].filter(Boolean).join(", ")}
          </p>
          <p className="pl-7 text-xs font-medium text-slate-400">
            {localTimeFormatted || "--"}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={onToggleFavorite}
            disabled={typeof onToggleFavorite !== "function"}
            aria-label={isFavorite ? "Remove from saved cities" : "Save this city"}
            aria-pressed={isFavorite}
            title={isFavorite ? "Remove from saved cities" : "Save this city"}
            className={`flex h-9 w-9 items-center justify-center rounded-full border transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${isFavorite
                ? "border-rose-500/40 bg-rose-500/20 text-rose-400 shadow-[0_0_12px_rgba(244,63,94,0.4)]"
                : "border-white/10 bg-white/[0.08] text-slate-300 hover:bg-white/[0.15] hover:text-white"
              }`}
          >
            <Heart
              className={`h-4 w-4 transition-transform duration-200 ${isFavorite ? "scale-110 fill-rose-400" : ""
                }`}
            />
          </button>

          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setShowMenu((previous) => !previous)}
              aria-label="More weather actions"
              aria-expanded={showMenu}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.08] text-slate-300 transition-colors hover:bg-white/[0.15] hover:text-white"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>

            {showMenu && (
              <div className="absolute right-0 top-11 z-50 w-52 divide-y divide-white/[0.06] rounded-2xl border border-white/10 bg-slate-900/95 py-1.5 text-xs shadow-2xl backdrop-blur-2xl animate-fade-in">
                <button
                  type="button"
                  onClick={handleRefresh}
                  className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-slate-200 transition-colors hover:bg-white/[0.08]"
                >
                  <RefreshCw className="h-3.5 w-3.5 shrink-0 text-cyan-400" />
                  Refresh Weather
                </button>

                <button
                  type="button"
                  onClick={handleCopyCoords}
                  className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-slate-200 transition-colors hover:bg-white/[0.08]"
                >
                  {coordsCopied ? (
                    <Check className="h-3.5 w-3.5 shrink-0 text-emerald-400" />
                  ) : (
                    <Copy className="h-3.5 w-3.5 shrink-0 text-cyan-400" />
                  )}
                  {coordsCopied ? "Coordinates Copied!" : "Copy Coordinates"}
                </button>

                <button
                  type="button"
                  onClick={handleShare}
                  disabled={isSharing}
                  className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-slate-200 transition-colors hover:bg-white/[0.08] disabled:opacity-60"
                >
                  {weatherCopied ? (
                    <Check className="h-3.5 w-3.5 shrink-0 text-emerald-400" />
                  ) : (
                    <Share2 className="h-3.5 w-3.5 shrink-0 text-cyan-400" />
                  )}
                  {weatherCopied
                    ? "Summary Copied!"
                    : isSharing
                      ? "Sharing..."
                      : "Share Weather"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="relative z-10 my-4 sm:my-6">
        <div className="flex items-baseline gap-1 font-num">
          <span className="text-6xl font-bold tracking-tighter drop-shadow-md sm:text-7xl lg:text-8xl">
            {formatTemp(current.temp, tempUnit, false)}
          </span>
          <span className="translate-y-[-1.5rem] text-2xl font-light text-slate-300 sm:translate-y-[-2rem] sm:text-3xl">
            °{tempUnit}
          </span>
        </div>

        <div className="space-y-1">
          <p className="text-xl font-semibold capitalize tracking-wide drop-shadow-sm sm:text-2xl">
            {current.description || current.condition || "Weather unavailable"}
          </p>
          <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-slate-300 sm:gap-3 sm:text-sm">
            <span>Feels like {formatTemp(current.feelsLike, tempUnit)}</span>
            <span className="h-1 w-1 rounded-full bg-slate-500" />
            <span>
              H: {formatTemp(current.tempMax, tempUnit)} · L: {formatTemp(current.tempMin, tempUnit)}
            </span>
          </div>
        </div>
      </div>

      <div className="relative z-10 grid grid-cols-2 gap-2.5 pt-2 sm:grid-cols-3 lg:grid-cols-5">
        <div className="glass-pill flex items-center gap-3 rounded-2xl border border-white/10 p-3 transition-colors hover:border-cyan-500/30">
          <div className="shrink-0 rounded-xl bg-cyan-500/10 p-2 text-cyan-400">
            <Droplets className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <div className="truncate font-num text-sm font-bold leading-tight">
              {safeValue(current.humidity, "%")}
            </div>
            <div className="truncate text-[10px] font-medium uppercase tracking-wider text-slate-400">
              Humidity
            </div>
          </div>
        </div>

        <div className="glass-pill flex items-center gap-3 rounded-2xl border border-white/10 p-3 transition-colors hover:border-cyan-500/30">
          <div className="shrink-0 rounded-xl bg-blue-500/10 p-2 text-blue-400">
            <Wind className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <div className="truncate font-num text-sm font-bold leading-tight">
              {safeValue(current.windSpeedKmH, " km/h")}
            </div>
            <div className="flex items-center gap-1 truncate text-[10px] font-medium uppercase tracking-wider text-slate-400">
              <span>Wind</span>
              {current.windDirection && (
                <span className="font-bold text-cyan-400">{current.windDirection}</span>
              )}
            </div>
          </div>
        </div>

        <div className="glass-pill flex items-center gap-3 rounded-2xl border border-white/10 p-3 transition-colors hover:border-cyan-500/30">
          <div className="shrink-0 rounded-xl bg-indigo-500/10 p-2 text-indigo-400">
            <Gauge className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <div className="truncate font-num text-sm font-bold leading-tight">
              {safeValue(current.pressure, " hPa")}
            </div>
            <div className="truncate text-[10px] font-medium uppercase tracking-wider text-slate-400">
              Pressure
            </div>
          </div>
        </div>

        <div className="glass-pill flex items-center gap-3 rounded-2xl border border-white/10 p-3 transition-colors hover:border-cyan-500/30">
          <div className="shrink-0 rounded-xl bg-purple-500/10 p-2 text-purple-400">
            <Eye className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <div className="truncate font-num text-sm font-bold leading-tight">
              {safeValue(current.visibilityKm, " km")}
            </div>
            <div className="truncate text-[10px] font-medium uppercase tracking-wider text-slate-400">
              Visibility
            </div>
          </div>
        </div>

        <div className="glass-pill col-span-2 flex items-center gap-3 rounded-2xl border border-white/10 p-3 transition-colors hover:border-cyan-500/30 sm:col-span-1">
          <div className="shrink-0 rounded-xl bg-amber-500/10 p-2 text-amber-400">
            <Sun className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <div className="truncate font-num text-sm font-bold leading-tight">
              {safeValue(current.uv?.val)}
            </div>
            <div className="truncate text-[10px] font-medium uppercase tracking-wider text-slate-400">
              UV {current.uv?.text || ""}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
