
import { Sparkles, Activity, Shirt, Sun, Wind } from "lucide-react";

const STATUS_STYLES = {
  caution: "border-rose-500/30 bg-rose-500/15 text-rose-300",
  moderate: "border-amber-500/30 bg-amber-500/15 text-amber-300",
  good: "border-emerald-500/30 bg-emerald-500/15 text-emerald-300",
  neutral: "border-indigo-500/30 bg-indigo-500/15 text-indigo-300",
};

function getStatusStyle(status, type = "general") {
  const normalized = String(status || "").toLowerCase();

  if (
    normalized.includes("caution") ||
    normalized.includes("poor") ||
    normalized.includes("unhealthy") ||
    normalized.includes("danger") ||
    normalized.includes("very high") ||
    normalized.includes("extreme")
  ) {
    return STATUS_STYLES.caution;
  }

  if (
    normalized.includes("moderate") ||
    normalized.includes("high") ||
    normalized.includes("fair") ||
    normalized.includes("limited")
  ) {
    return STATUS_STYLES.moderate;
  }

  if (
    normalized.includes("good") ||
    normalized.includes("low") ||
    normalized.includes("safe") ||
    normalized.includes("clear") ||
    normalized.includes("favorable") ||
    normalized.includes("excellent")
  ) {
    return STATUS_STYLES.good;
  }

  return type === "clothing" ? STATUS_STYLES.neutral : STATUS_STYLES.good;
}

function RecommendationCard({ icon: Icon, title, recommendation, type }) {
  if (!recommendation) return null;

  const status = recommendation.status || "No status";
  const text = recommendation.text || "No recommendation available.";

  return (
    <div className="flex flex-col justify-between space-y-2 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-3.5 transition-colors hover:border-white/15">
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2 text-xs font-bold text-white">
          <Icon className={`h-4 w-4 shrink-0 ${type.iconColor}`} />
          <span>{title}</span>
        </div>

        <span
          className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-bold ${getStatusStyle(
            status,
            type.key
          )}`}
        >
          {status}
        </span>
      </div>

      <p className="text-xs leading-relaxed text-slate-300">{text}</p>
    </div>
  );
}

export default function DailyBriefingCard({
  briefing,
  cityName = "Chennai",
}) {
  if (!briefing) return null;

  const { headline, summary, recommendations } = briefing;

  const recommendationCards = [
    {
      key: "outdoor",
      title: "Outdoor Activity",
      icon: Activity,
      iconColor: "text-cyan-400",
      recommendation: recommendations?.outdoor,
    },
    {
      key: "clothing",
      title: "Recommended Attire",
      icon: Shirt,
      iconColor: "text-indigo-400",
      recommendation: recommendations?.clothing,
    },
    {
      key: "sunExposure",
      title: "Solar Exposure",
      icon: Sun,
      iconColor: "text-amber-400",
      recommendation: recommendations?.sunExposure,
    },
    {
      key: "airQuality",
      title: "Air Quality",
      icon: Wind,
      iconColor: "text-emerald-400",
      recommendation: recommendations?.airQuality,
    },
  ].filter((item) => item.recommendation);

  return (
    <section
      aria-label={`Atmospheric briefing for ${cityName}`}
      className="glass-panel space-y-5 rounded-3xl border border-white/10 p-6 shadow-xl"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="rounded-lg border border-cyan-400/20 bg-gradient-to-tr from-cyan-500/20 to-blue-500/20 p-1.5 text-cyan-300">
            <Sparkles className="h-4 w-4" />
          </div>

          <div className="min-w-0">
            <h3 className="text-base font-bold tracking-tight text-white sm:text-lg">
              Atmospheric Briefing
            </h3>
            <p className="text-[11px] font-medium text-slate-400">
              Intelligence synthesis for {cityName}
            </p>
          </div>
        </div>

        <div className="hidden shrink-0 items-center gap-1.5 rounded-full border border-cyan-500/20 bg-cyan-950/40 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-cyan-300 sm:inline-flex">
          <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 motion-safe:animate-pulse" />
          <span>Weather Briefing</span>
        </div>
      </div>

      <div className="space-y-1.5 rounded-2xl border border-white/[0.06] bg-white/[0.03] p-4">
        <h4 className="text-sm font-semibold leading-snug text-white sm:text-base">
          {headline || `Weather briefing for ${cityName}`}
        </h4>
        <p className="text-xs font-normal leading-relaxed text-slate-300/90 sm:text-sm">
          {summary || "A detailed weather summary is currently unavailable."}
        </p>
      </div>

      {recommendationCards.length > 0 && (
        <div className="grid grid-cols-1 gap-3 pt-1 sm:grid-cols-2 lg:grid-cols-4">
          {recommendationCards.map((item) => (
            <RecommendationCard
              key={item.key}
              icon={item.icon}
              title={item.title}
              recommendation={item.recommendation}
              type={item}
            />
          ))}
        </div>
      )}
    </section>
  );
}
