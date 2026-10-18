
import { Wind } from "lucide-react";

export default function AirQualityCard({ airQuality }) {
  if (!airQuality) return null;

  const { score, label, description, components = {} } = airQuality;

  const pollutants = [
    { key: "pm2_5", label: "PM2.5" },
    { key: "pm10", label: "PM10" },
    { key: "no2", label: "NO₂" },
    { key: "so2", label: "SO₂" },
  ];

  const aqi = Number(score);
  const validScore = Number.isFinite(aqi) ? aqi : null;
  const progress = validScore === null ? 0 : Math.max(0, Math.min(100, validScore));

  const statusColor =
    label === "Good"
      ? "text-emerald-400"
      : label === "Fair"
        ? "text-lime-400"
        : label === "Moderate"
          ? "text-yellow-400"
          : label === "Poor"
            ? "text-orange-400"
            : "text-red-400";

  const gaugeColor =
    label === "Good"
      ? "#10b981"
      : label === "Fair"
        ? "#84cc16"
        : label === "Moderate"
          ? "#eab308"
          : label === "Poor"
            ? "#f97316"
            : "#ef4444";

  const formatPollutant = (value) => {
    const number = Number(value);
    return value !== null && value !== undefined && value !== "" &&
      Number.isFinite(number)
      ? number.toFixed(1)
      : "--";
  };

  return (
    <div className="glass-panel flex h-full min-h-[330px] flex-col justify-between rounded-3xl border border-white/10 p-5 shadow-xl">
      <div className="flex items-center gap-2">
        <div className="rounded-lg bg-emerald-500/10 p-1.5 text-emerald-400">
          <Wind className="h-4 w-4" aria-hidden="true" />
        </div>
        <h3 className="text-sm font-bold tracking-tight sm:text-base">
          Air Quality
        </h3>
      </div>

      <div className="my-3 flex items-center gap-4">
        <div
          className="relative h-24 w-24 shrink-0"
          role="img"
          aria-label={
            validScore === null
              ? "Air quality score unavailable"
              : `Air quality score ${validScore}, ${label || "status unavailable"}`
          }
        >
          <svg
            viewBox="0 0 100 100"
            className="-rotate-90"
            width="96"
            height="96"
            aria-hidden="true"
          >
            <circle
              cx="50"
              cy="50"
              r="38"
              fill="none"
              stroke="rgba(255,255,255,0.08)"
              strokeWidth="7"
            />
            <circle
              cx="50"
              cy="50"
              r="38"
              fill="none"
              stroke={gaugeColor}
              strokeWidth="7"
              strokeDasharray={2 * Math.PI * 38}
              strokeDashoffset={
                2 * Math.PI * 38 * (1 - progress / 100)
              }
              strokeLinecap="round"
              className="transition-all duration-300 ease-out"
            />
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="font-num text-2xl font-extrabold leading-none">
              {validScore === null ? "--" : validScore}
            </span>
            <span className={`mt-1 text-[11px] font-semibold leading-tight ${statusColor}`}>
              {label || "Unavailable"}
            </span>
          </div>
        </div>

        <div className="min-w-0 flex-1 text-xs font-normal leading-relaxed text-slate-300">
          <p className="mb-1 font-medium text-white">
            {description || "Air quality information is currently unavailable."}
          </p>
          <p className="text-[11px] text-slate-400">
            Pollutant concentrations are shown in µg/m³.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 border-t border-white/[0.06] pt-3 sm:grid-cols-4">
        {pollutants.map(({ key, label: pollutantLabel }) => (
          <div
            key={key}
            className="rounded-xl border border-white/[0.04] bg-white/[0.03] p-2 text-center"
          >
            <div className="text-[10px] font-medium text-slate-400">
              {pollutantLabel}
            </div>
            <div className="mt-1 font-num text-sm font-bold text-white">
              {formatPollutant(components[key])}
            </div>
            <div className="text-[9px] text-slate-500">µg/m³</div>
          </div>
        ))}
      </div>
    </div>
  );
}
