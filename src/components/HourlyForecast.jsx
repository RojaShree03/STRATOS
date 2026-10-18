
import { useState, useRef, useEffect, useMemo } from "react";
import {
  Clock,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  LayoutGrid,
  Droplets,
  Wind,
  Gauge,
  Cloud,
} from "lucide-react";
import WeatherIcon from "./WeatherIcon";
import { formatTemp } from "../utils/tempConverter";

export default function HourlyForecast({ hourlyData = [], tempUnit = "C" }) {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [viewMode, setViewMode] = useState("cards");
  const scrollRef = useRef(null);

  const validHours = useMemo(
    () =>
      Array.isArray(hourlyData)
        ? hourlyData.filter(
          (hour) =>
            hour &&
            Number.isFinite(Number(hour.temp)) &&
            Number.isFinite(Number(hour.pop ?? 0))
        )
        : [],
    [hourlyData]
  );

  useEffect(() => {
    setSelectedIdx((previous) =>
      validHours.length === 0
        ? 0
        : Math.min(previous, validHours.length - 1)
    );
  }, [validHours.length]);

  const scroll = (direction) => {
    if (!scrollRef.current) return;

    const amount = scrollRef.current.clientWidth * 0.65;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  if (validHours.length === 0) return null;

  const activeHour = validHours[selectedIdx] || validHours[0];

  const chartWidth = 580;
  const chartHeight = 140;
  const paddingX = validHours.length > 1 ? 28 : chartWidth / 2;
  const paddingTop = 28;
  const paddingBottom = 24;
  const usableWidth = chartWidth - paddingX * 2;
  const usableHeight = chartHeight - paddingTop - paddingBottom;

  const temperatures = validHours.map((hour) => Number(hour.temp));
  const minTemp = Math.min(...temperatures);
  const maxTemp = Math.max(...temperatures);
  const range = Math.max(1, maxTemp - minTemp);

  const points = validHours.map((hour, index) => {
    const x =
      validHours.length === 1
        ? chartWidth / 2
        : paddingX + (index / (validHours.length - 1)) * usableWidth;

    const y =
      paddingTop +
      ((maxTemp - Number(hour.temp)) / range) * usableHeight;

    return { x, y, hour, index };
  });

  const pathD =
    points.length === 1
      ? `M ${points[0].x} ${points[0].y}`
      : points.reduce((path, point, index) => {
        if (index === 0) return `M ${point.x} ${point.y}`;

        const previous = points[index - 1];
        const middleX = (previous.x + point.x) / 2;

        return (
          path +
          ` C ${middleX} ${previous.y}, ${middleX} ${point.y}, ${point.x} ${point.y}`
        );
      }, "");

  const areaD =
    points.length > 1
      ? `${pathD} L ${points[points.length - 1].x} ${chartHeight - paddingBottom} L ${points[0].x} ${chartHeight - paddingBottom} Z`
      : "";

  const safePercent = (value) => {
    const number = Number(value);
    return Number.isFinite(number)
      ? Math.max(0, Math.min(100, Math.round(number)))
      : 0;
  };

  const safeMetric = (value, suffix = "") => {
    if (value === null || value === undefined || value === "") return "--";

    const number = Number(value);
    if (!Number.isFinite(number)) return "--";

    return `${number}${suffix}`;
  };

  return (
    <section className="glass-panel flex h-full min-h-[320px] flex-col justify-between space-y-4 rounded-3xl border border-white/10 p-5 shadow-xl sm:p-6">
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="rounded-lg bg-cyan-500/10 p-1.5 text-cyan-400">
            <Clock className="h-4 w-4" />
          </div>
          <h3 className="text-base font-bold tracking-tight sm:text-lg">
            Hourly Forecast
          </h3>
          <span className="hidden text-xs text-slate-400 sm:inline">
            · Next 24 hours
          </span>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <div className="flex items-center rounded-xl border border-white/[0.08] bg-white/[0.05] p-0.5">
            <button
              type="button"
              onClick={() => setViewMode("cards")}
              aria-label="Show hourly forecast cards"
              aria-pressed={viewMode === "cards"}
              className={`rounded-lg p-1.5 transition-colors ${viewMode === "cards"
                  ? "bg-cyan-500/20 text-cyan-300 shadow-sm"
                  : "text-slate-400 hover:text-white"
                }`}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("chart")}
              aria-label="Show temperature trend chart"
              aria-pressed={viewMode === "chart"}
              className={`rounded-lg p-1.5 transition-colors ${viewMode === "chart"
                  ? "bg-cyan-500/20 text-cyan-300 shadow-sm"
                  : "text-slate-400 hover:text-white"
                }`}
            >
              <BarChart3 className="h-3.5 w-3.5" />
            </button>
          </div>

          {viewMode === "cards" && (
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => scroll("left")}
                aria-label="Scroll forecast left"
                className="flex h-7 w-7 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.06] text-slate-300 transition-colors hover:bg-white/[0.12] hover:text-white"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => scroll("right")}
                aria-label="Scroll forecast right"
                className="flex h-7 w-7 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.06] text-slate-300 transition-colors hover:bg-white/[0.12] hover:text-white"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {viewMode === "cards" ? (
        <div
          ref={scrollRef}
          className="hide-scrollbar flex items-center gap-3 overflow-x-auto scroll-smooth px-0.5 py-2"
        >
          {validHours.map((hour, index) => {
            const isSelected = selectedIdx === index;
            const pop = safePercent(hour.pop);

            return (
              <button
                type="button"
                key={`${hour.timeLabel || "hour"}-${hour.dt || index}`}
                onClick={() => setSelectedIdx(index)}
                aria-pressed={isSelected}
                className={`group flex w-20 shrink-0 flex-col items-center justify-between gap-2.5 rounded-2xl px-2 py-3.5 transition-all duration-200 sm:w-24 ${isSelected
                    ? "scale-[1.02] border border-cyan-400/60 bg-gradient-to-b from-cyan-500/20 via-blue-600/15 to-transparent shadow-[0_0_20px_rgba(56,189,248,0.25)]"
                    : "border border-white/[0.06] bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.08]"
                  }`}
              >
                <span
                  className={`text-xs font-semibold ${isSelected
                      ? "font-bold text-cyan-300"
                      : "text-slate-300 group-hover:text-white"
                    }`}
                >
                  {hour.timeLabel || "--"}
                </span>

                <div className="my-0.5 transition-transform group-hover:scale-110">
                  <WeatherIcon
                    condition={hour.weatherMain || hour.condition}
                    icon={hour.icon}
                    size="md"
                  />
                </div>

                <div className="flex flex-col items-center">
                  <span className="font-num text-sm font-bold text-white sm:text-base">
                    {formatTemp(hour.temp, tempUnit)}
                  </span>
                  <span className="flex items-center gap-0.5 text-[10px] font-medium text-cyan-300">
                    <Droplets className="h-2.5 w-2.5" />
                    {pop}% rain
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="relative w-full overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] p-3">
          <svg
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            className="h-36 w-full overflow-visible"
            role="img"
            aria-label="Hourly temperature trend and precipitation probability chart"
          >
            <defs>
              <linearGradient
                id="hourlyTempGradient"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
              </linearGradient>
            </defs>

            {[0, 1, 2].map((line) => {
              const y =
                paddingTop + (usableHeight / 2) * line;

              return (
                <line
                  key={`grid-${line}`}
                  x1={paddingX}
                  y1={y}
                  x2={chartWidth - paddingX}
                  y2={y}
                  stroke="rgba(148,163,184,0.12)"
                  strokeDasharray="3 5"
                />
              );
            })}

            {points.map((point) => {
              const barHeight = (safePercent(point.hour.pop) / 100) * 28;

              return (
                <rect
                  key={`rain-${point.index}`}
                  x={point.x - 4}
                  y={chartHeight - paddingBottom - barHeight}
                  width={8}
                  height={barHeight}
                  rx={2}
                  fill="rgba(56,189,248,0.3)"
                />
              );
            })}

            {areaD && <path d={areaD} fill="url(#hourlyTempGradient)" />}

            <path
              d={pathD}
              fill="none"
              stroke="#38bdf8"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {points.map((point) => {
              const isSelected = selectedIdx === point.index;

              return (
                <g key={`point-${point.index}`}>
                  <circle
                    cx={point.x}
                    cy={point.y}
                    r="10"
                    fill="transparent"
                    className="cursor-pointer"
                    onClick={() => setSelectedIdx(point.index)}
                  />
                  <circle
                    cx={point.x}
                    cy={point.y}
                    r={isSelected ? 5 : 3}
                    fill={isSelected ? "#38bdf8" : "#0f172a"}
                    stroke={isSelected ? "#ffffff" : "#38bdf8"}
                    strokeWidth="2"
                    className="pointer-events-none transition-all duration-200"
                  />
                  {(
                    point.index === 0 ||
                    point.index === points.length - 1 ||
                    point.index === selectedIdx ||
                    point.index % Math.max(1, Math.ceil(points.length / 6)) === 0
                  ) && (
                      <>
                        <text
                          x={point.x}
                          y={Math.max(12, point.y - 10)}
                          textAnchor="middle"
                          fill={isSelected ? "#38bdf8" : "#94a3b8"}
                          fontSize="10"
                          fontWeight="600"
                        >
                          {formatTemp(point.hour.temp, tempUnit)}
                        </text>
                        <text
                          x={point.x}
                          y={chartHeight - 5}
                          textAnchor="middle"
                          fill={isSelected ? "#ffffff" : "#64748b"}
                          fontSize="9"
                          fontWeight="500"
                        >
                          {point.hour.timeLabel || ""}
                        </text>
                      </>
                    )}
                </g>
              );
            })}
          </svg>
          <p className="mt-1 text-center text-[10px] text-slate-500">
            Temperature trend · Bars show precipitation probability
          </p>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.06] pt-3 text-xs">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <span className="font-bold text-cyan-300">
            {activeHour.isNow ? "Currently" : activeHour.timeLabel || "Selected hour"}:
          </span>
          <span className="font-medium capitalize text-white">
            {activeHour.description || activeHour.weatherMain || activeHour.condition || "Conditions unavailable"}
          </span>
          <span className="text-slate-400">
            Feels {formatTemp(activeHour.feelsLike ?? activeHour.temp, tempUnit)}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-slate-300">
          <div
            className="flex items-center gap-1.5"
            title="Precipitation probability"
          >
            <Droplets className="h-3.5 w-3.5 text-cyan-400" />
            <span>{safePercent(activeHour.pop)}% rain</span>
          </div>

          <div className="flex items-center gap-1.5" title="Wind speed">
            <Wind className="h-3.5 w-3.5 text-blue-400" />
            <span>
              {safeMetric(activeHour.windSpeedKmH, " km/h")}
              {activeHour.windDirection ? ` ${activeHour.windDirection}` : ""}
              {activeHour.windGustKmH != null
                ? ` (Gusts ${safeMetric(activeHour.windGustKmH, " km/h")})`
                : ""}
            </span>
          </div>

          <div className="flex items-center gap-1.5" title="Relative humidity">
            <Gauge className="h-3.5 w-3.5 text-indigo-400" />
            <span>{safeMetric(activeHour.humidity, "%")}</span>
          </div>

          <div className="flex items-center gap-1.5" title="Cloud cover">
            <Cloud className="h-3.5 w-3.5 text-slate-400" />
            <span>{safeMetric(activeHour.clouds, "%")}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
