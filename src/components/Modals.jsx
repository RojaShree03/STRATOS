
import { useEffect } from "react";
import {
  X,
  Sliders,
  Calendar,
  Sparkles,
  Droplets,
  Sun,
  Moon,
  Laptop,
} from "lucide-react";
import WeatherIcon from "./WeatherIcon";
import { formatTemp } from "../utils/tempConverter";

function ModalShell({ onClose, children, maxWidth = "max-w-md" }) {
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose?.();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="presentation"
    >
      <button
        type="button"
        aria-label="Close modal"
        onClick={onClose}
        className="fixed inset-0 cursor-default bg-black/75 backdrop-blur-md animate-fade-in"
      />
      <section
        role="dialog"
        aria-modal="true"
        className={`relative z-10 w-full ${maxWidth} max-h-[85vh] overflow-hidden rounded-3xl border border-white/15 bg-[#0a1020]/95 p-6 shadow-[0_25px_60px_rgba(0,0,0,0.8)] backdrop-blur-2xl sm:p-7`}
      >
        {children}
      </section>
    </div>
  );
}

function ModalHeader({ icon: Icon, title, subtitle, onClose, iconClass = "text-cyan-400 bg-cyan-500/10" }) {
  return (
    <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
      <div className="flex min-w-0 items-center gap-2.5">
        <div className={`rounded-xl p-2 ${iconClass}`}>
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <h3 className="text-lg font-bold text-white">{title}</h3>
          {subtitle && (
            <p className="text-[10px] uppercase tracking-widest text-slate-400">
              {subtitle}
            </p>
          )}
        </div>
      </div>
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="ml-3 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/[0.06] text-slate-300 transition hover:bg-white/[0.12] hover:text-white"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

function ModalFooter({ onClose, label = "Done" }) {
  return (
    <div className="flex justify-end border-t border-white/[0.08] pt-4">
      <button
        type="button"
        onClick={onClose}
        className="rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-2 text-xs font-bold text-white transition hover:shadow-[0_0_15px_rgba(56,189,248,0.4)]"
      >
        {label}
      </button>
    </div>
  );
}

export function SettingsModal({
  isOpen,
  onClose,
  tempUnit,
  setTempUnit,
  autoRefreshMinutes,
  setAutoRefreshMinutes,
  defaultCity,
  setDefaultCity,
  currentCity,
  themeMode = "system",
  setThemeMode,
}) {
  if (!isOpen) return null;

  const themeOptions = [
    { value: "system", label: "System", Icon: Laptop, color: "text-cyan-400" },
    { value: "light", label: "Solar Light", Icon: Sun, color: "text-amber-400" },
    { value: "dark", label: "Cosmic Dark", Icon: Moon, color: "text-indigo-300" },
  ];

  const selectedThemeClass = {
    system: "bg-gradient-to-r from-blue-600 to-cyan-500",
    light: "bg-gradient-to-r from-amber-500 to-orange-500",
    dark: "bg-gradient-to-r from-indigo-600 to-purple-600",
  };

  return (
    <ModalShell onClose={onClose}>
      <ModalHeader
        icon={Sliders}
        title="STRATOS Settings"
        onClose={onClose}
      />

      <div className="space-y-5 overflow-y-auto py-5">
        {setThemeMode && (
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-400">
              Atmospheric Theme
            </label>
            <div className="grid grid-cols-3 gap-2">
              {themeOptions.map(({ value, label, Icon, color }) => (
                <button
                  key={value}
                  type="button"
                  aria-pressed={themeMode === value}
                  onClick={() => setThemeMode(value)}
                  className={`flex flex-col items-center gap-1.5 rounded-xl px-2 py-2 text-xs font-bold transition-all ${themeMode === value
                      ? `${selectedThemeClass[value]} text-white shadow-[0_0_15px_rgba(56,189,248,0.2)]`
                      : "bg-white/[0.05] text-slate-300 hover:bg-white/[0.09]"
                    }`}
                >
                  <Icon className={`h-4 w-4 ${color}`} />
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-400">
            Temperature Unit
          </label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { value: "C", label: "Celsius (°C)" },
              { value: "F", label: "Fahrenheit (°F)" },
            ].map(({ value, label }) => (
              <button
                key={value}
                type="button"
                aria-pressed={tempUnit === value}
                onClick={() => setTempUnit(value)}
                className={`rounded-xl px-4 py-2.5 text-xs font-bold transition-all ${tempUnit === value
                    ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-[0_0_15px_rgba(56,189,248,0.3)]"
                    : "bg-white/[0.05] text-slate-300 hover:bg-white/[0.09]"
                  }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label
            htmlFor="auto-refresh"
            className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-400"
          >
            Live Weather Refresh
          </label>
          <select
            id="auto-refresh"
            value={autoRefreshMinutes}
            onChange={(event) =>
              setAutoRefreshMinutes(Number(event.target.value))
            }
            className="w-full rounded-xl border border-white/15 bg-[#0d1629] px-3 py-2.5 text-xs text-white outline-none focus:border-cyan-400"
          >
            <option value={0}>Manual Only</option>
            <option value={5}>Every 5 minutes</option>
            <option value={15}>Every 15 minutes</option>
            <option value={30}>Every 30 minutes</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="default-city"
            className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-400"
          >
            Default Startup City
          </label>
          <div className="flex items-center gap-2">
            <input
              id="default-city"
              type="text"
              value={defaultCity ?? ""}
              onChange={(event) => setDefaultCity(event.target.value)}
              placeholder="e.g. Chennai"
              maxLength={100}
              className="min-w-0 flex-1 rounded-xl border border-white/15 bg-[#0d1629] px-3 py-2 text-xs text-white outline-none placeholder:text-slate-500 focus:border-cyan-400"
            />
            <button
              type="button"
              disabled={!currentCity}
              onClick={() => currentCity && setDefaultCity(currentCity)}
              className="shrink-0 rounded-xl bg-white/[0.08] px-3 py-2 text-xs font-medium text-slate-200 transition hover:bg-white/[0.15] disabled:cursor-not-allowed disabled:opacity-40"
            >
              Use Current
            </button>
          </div>
        </div>
      </div>

      <ModalFooter onClose={onClose} />
    </ModalShell>
  );
}

export function AboutModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <ModalShell onClose={onClose}>
      <ModalHeader
        icon={Sparkles}
        title="STRATOS"
        subtitle="Above the Ordinary"
        onClose={onClose}
        iconClass="bg-blue-500/10 text-cyan-400"
      />

      <div className="space-y-4 py-5 text-xs leading-relaxed text-slate-300">
        <p>
          <strong className="text-white">STRATOS</strong> is a cinematic weather
          intelligence dashboard featuring atmospheric data, interactive
          forecasts, and a futuristic interface.
        </p>

        <div className="space-y-2 rounded-2xl border border-white/[0.06] bg-white/[0.03] p-3.5">
          <div className="font-semibold text-white">Atmospheric Data Sources</div>
          <ul className="space-y-1 text-slate-400">
            <li>• Real-time weather and atmospheric conditions</li>
            <li>• 5-day / 3-hour meteorological forecasts</li>
            <li>• Air quality and particulate matter (PM2.5, PM10)</li>
            <li>• Solar path and astronomical information, where available</li>
            <li>• Interactive map and weather layers, where configured</li>
          </ul>
        </div>

        <p className="text-[11px] text-slate-400">
          Built with React, Tailwind CSS, Leaflet, and OpenWeather data.
        </p>
      </div>

      <ModalFooter onClose={onClose} label="Close" />
    </ModalShell>
  );
}

export function ForecastDetailsModal({
  isOpen,
  onClose,
  dailyData = [],
  tempUnit = "C",
}) {
  if (!isOpen) return null;

  const validDays = Array.isArray(dailyData)
    ? dailyData.filter(
      (day) =>
        day &&
        (typeof day.high === "number" || Number.isFinite(Number(day.high))) &&
        (typeof day.low === "number" || Number.isFinite(Number(day.low)))
    )
    : [];

  return (
    <ModalShell onClose={onClose} maxWidth="max-w-2xl">
      <ModalHeader
        icon={Calendar}
        title="Forecast Outlook"
        onClose={onClose}
        iconClass="bg-indigo-500/10 text-indigo-400"
      />

      <div className="custom-scrollbar flex-1 space-y-2.5 overflow-y-auto py-4 pr-1">
        {validDays.length === 0 ? (
          <div className="py-10 text-center text-sm text-slate-400">
            Forecast details are not available yet.
          </div>
        ) : (
          validDays.map((day, index) => {
            const high = Number(day.high);
            const low = Number(day.low);
            const pop = Number(day.pop);
            const dayLabel = day.dayLabel || `Day ${index + 1}`;

            return (
              <div
                key={`${dayLabel}-${index}`}
                className="flex items-center justify-between gap-3 rounded-2xl border border-white/[0.05] bg-white/[0.03] p-3 transition-colors hover:bg-white/[0.06]"
              >
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <WeatherIcon
                    condition={day.weatherMain || "Clear"}
                    icon={day.icon}
                    size="sm"
                  />
                  <div className="min-w-0">
                    <div className="text-sm font-bold text-white">
                      {dayLabel}
                    </div>
                    <div className="text-[11px] capitalize text-slate-400">
                      {day.weatherMain || "Unknown"}
                    </div>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-1 text-xs text-cyan-300">
                  {Number.isFinite(pop) && pop > 0 && (
                    <>
                      <Droplets className="h-3.5 w-3.5" />
                      <span>{Math.round(pop)}%</span>
                    </>
                  )}
                </div>

                <div className="flex shrink-0 items-center gap-3">
                  <span className="font-num text-sm font-bold text-white">
                    {formatTemp(high, tempUnit)}
                  </span>
                  <span className="font-num text-xs font-medium text-slate-400">
                    {formatTemp(low, tempUnit)}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      <ModalFooter onClose={onClose} />
    </ModalShell>
  );
}
