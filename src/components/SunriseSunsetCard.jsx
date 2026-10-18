
import { Sun } from "lucide-react";

export default function SunriseSunsetCard({ astronomy }) {
  if (!astronomy) return null;

  const {
    sunrise,
    sunset,
    daylightText,
    sunProgress = 50,
  } = astronomy;

  const progressValue = Number(sunProgress);
  const progress = Number.isFinite(progressValue)
    ? Math.min(100, Math.max(0, progressValue))
    : 50;

  const angleRad = Math.PI - (progress / 100) * Math.PI;

  const cx = 100;
  const cy = 75;
  const radius = 65;

  const sunX = cx + radius * Math.cos(angleRad);
  const sunY = cy - radius * Math.sin(angleRad);

  const gradientId = "sunrise-sunset-arc-gradient";
  const glowId = "sunrise-sunset-glow-gradient";

  const formatTime = (value) => {
    if (typeof value === "string" && value.trim()) return value;
    return "--:--";
  };

  return (
    <section
      className="glass-panel flex h-full min-h-[330px] flex-col justify-between rounded-3xl border border-white/10 p-5 shadow-xl"
      aria-labelledby="sunrise-sunset-heading"
    >
      <div className="flex items-center gap-2">
        <div className="rounded-lg bg-amber-500/10 p-1.5 text-amber-400">
          <Sun className="h-4 w-4" />
        </div>
        <h3
          id="sunrise-sunset-heading"
          className="text-sm font-bold tracking-tight sm:text-base"
        >
          Sunrise &amp; Sunset
        </h3>
      </div>

      <div className="my-1 flex h-32 w-full items-center justify-center overflow-hidden">
        <svg
          viewBox="0 0 200 95"
          className="h-full w-full overflow-visible"
          role="img"
          aria-label={`Sun position: ${Math.round(progress)} percent along the daylight arc`}
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <linearGradient
              id={gradientId}
              x1="0"
              y1="0"
              x2="1"
              y2="0"
            >
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.4" />
              <stop offset="50%" stopColor="#fbbf24" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#f97316" stopOpacity="0.4" />
            </linearGradient>

            <radialGradient id={glowId} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="50%" stopColor="#f59e0b" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
            </radialGradient>
          </defs>

          <path
            d="M 35 75 A 65 65 0 0 1 165 75"
            fill="none"
            stroke={`url(#${gradientId})`}
            strokeWidth="2.5"
            strokeDasharray="4 4"
          />

          <line
            x1="15"
            y1="75"
            x2="185"
            y2="75"
            stroke="rgba(255,255,255,0.12)"
            strokeWidth="1.5"
          />

          <g transform={`translate(${sunX}, ${sunY})`}>
            <circle
              cx="0"
              cy="0"
              r="14"
              fill={`url(#${glowId})`}
              className="motion-safe:animate-pulse"
              style={{ animationDuration: "3s" }}
            />
            <circle
              cx="0"
              cy="0"
              r="6"
              fill="#fbbf24"
              stroke="#ffffff"
              strokeWidth="1.5"
            />
          </g>
        </svg>
      </div>

      <div className="flex items-center justify-between gap-2 border-t border-white/[0.06] pt-3">
        <div className="min-w-0">
          <div className="font-num text-xs font-bold text-white sm:text-sm">
            {formatTime(sunrise)}
          </div>
          <div className="text-[10px] font-medium text-slate-400">
            Sunrise
          </div>
        </div>

        <div className="min-w-0 px-1 text-center">
          <div className="text-[11px] font-semibold text-cyan-300">
            {daylightText || "Daylight unavailable"}
          </div>
        </div>

        <div className="min-w-0 text-right">
          <div className="font-num text-xs font-bold text-white sm:text-sm">
            {formatTime(sunset)}
          </div>
          <div className="text-[10px] font-medium text-slate-400">
            Sunset
          </div>
        </div>
      </div>
    </section>
  );
}
