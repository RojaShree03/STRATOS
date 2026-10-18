
import { Calendar, ChevronRight } from "lucide-react";
import WeatherIcon from "./WeatherIcon";
import { formatTemp } from "../utils/tempConverter";

export default function SevenDayForecast({
  dailyData = [],
  tempUnit = "C",
  onViewDetails,
}) {
  const days = Array.isArray(dailyData)
    ? dailyData.filter(
        (day) =>
          day &&
          Number.isFinite(Number(day.high)) &&
          Number.isFinite(Number(day.low))
      )
    : [];

  if (days.length === 0) return null;

  const allTemps = days.flatMap((day) => [
    Number(day.low),
    Number(day.high),
  ]);

  const minTemp = Math.min(...allTemps);
  const maxTemp = Math.max(...allTemps);
  const tempSpan = Math.max(1, maxTemp - minTemp);

  return (
    <section
      className="glass-panel flex h-full min-h-[320px] flex-col justify-between rounded-3xl border border-white/10 p-4 shadow-xl sm:p-6"
      aria-labelledby="seven-day-forecast-heading"
    >
      <div className="mb-5 flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="shrink-0 rounded-lg bg-indigo-500/10 p-1.5 text-indigo-400">
            <Calendar className="h-4 w-4" />
          </div>
          <h3
            id="seven-day-forecast-heading"
            className="text-base font-bold tracking-tight sm:text-lg"
          >
            Forecast
          </h3>
          <span className="whitespace-nowrap rounded-full bg-white/[0.06] px-2 py-0.5 text-[10px] text-slate-400">
            {days.length} days
          </span>
        </div>

        {onViewDetails && (
          <button
            type="button"
            onClick={onViewDetails}
            className="group flex shrink-0 items-center gap-1 rounded-lg text-xs font-semibold text-cyan-400 transition-colors hover:text-cyan-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
          >
            <span>Details</span>
            <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </button>
        )}
      </div>

      <div className="hide-scrollbar -mx-1 overflow-x-auto py-1">
        <div
          className={`grid min-w-0 text-center ${
            days.length > 5 ? "min-w-[420px]" : ""
          }`}
          style={{
            gridTemplateColumns: `repeat(${days.length}, minmax(0, 1fr))`,
          }}
        >
          {days.map((day, index) => {
            const low = Number(day.low);
            const high = Number(day.high);

            const lowPct = Math.max(
              0,
              Math.min(100, ((low - minTemp) / tempSpan) * 100)
            );
            const highPct = Math.max(
              lowPct,
              Math.min(100, ((high - minTemp) / tempSpan) * 100)
            );

            const rangeHeight = Math.max(8, highPct - lowPct);
            const rangeBottom = Math.min(100 - rangeHeight, lowPct);

            const label = day.dayLabel || `Day ${index + 1}`;
            const condition = day.weatherMain || "Unknown";

            return (
              <div
                key={`${label}-${day.date || index}`}
                className={`group flex min-w-0 flex-col items-center justify-between gap-2 rounded-2xl px-1 py-2 transition-colors hover:bg-white/[0.04] sm:gap-2.5 sm:px-1.5 ${
                  day.isToday ? "bg-cyan-500/[0.04]" : ""
                }`}
              >
                <span
                  className={`whitespace-nowrap text-[10px] font-semibold tracking-tight sm:text-xs ${
                    day.isToday
                      ? "text-cyan-300"
                      : "text-slate-300 group-hover:text-white"
                  }`}
                >
                  {label}
                </span>

                <div
                  className="my-1 transition-transform group-hover:scale-110"
                  title={condition}
                >
                  <WeatherIcon
                    condition={condition}
                    icon={day.icon}
                    size="sm"
                  />
                </div>

                <span className="whitespace-nowrap font-num text-xs font-bold text-white sm:text-sm">
                  {formatTemp(high, tempUnit)}
                </span>

                <div
                  className="relative my-0.5 h-12 w-2 overflow-hidden rounded-full bg-slate-800/80"
                  role="img"
                  aria-label={`Temperature range from ${formatTemp(low, tempUnit)} to ${formatTemp(high, tempUnit)}`}
                >
                  <div
                    className="absolute w-full rounded-full bg-gradient-to-t from-cyan-400 via-indigo-400 to-amber-400 shadow-[0_0_8px_rgba(56,189,248,0.5)]"
                    style={{
                      bottom: `${rangeBottom}%`,
                      height: `${rangeHeight}%`,
                    }}
                  />
                </div>

                <span className="whitespace-nowrap font-num text-[10px] font-medium text-slate-400 sm:text-xs">
                  {formatTemp(low, tempUnit)}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <p className="mt-3 text-[10px] text-slate-500">
        Daily high and low temperatures
      </p>
    </section>
  );
}
