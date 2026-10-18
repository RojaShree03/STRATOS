
import { useState } from "react";
import {
  AlertTriangle,
  AlertCircle,
  Info,
  X,
  ChevronDown,
  ChevronUp,
  ShieldAlert,
} from "lucide-react";

const ALERT_STYLES = {
  danger: {
    badge: "border-rose-500/40 bg-rose-500/20 text-rose-300",
    container: "border-rose-500/30 bg-rose-950/40 text-rose-200",
    icon: AlertCircle,
    iconColor: "text-rose-400",
  },
  warning: {
    badge: "border-amber-500/40 bg-amber-500/20 text-amber-300",
    container: "border-amber-500/30 bg-amber-950/40 text-amber-200",
    icon: AlertTriangle,
    iconColor: "text-amber-400",
  },
  info: {
    badge: "border-cyan-500/40 bg-cyan-500/20 text-cyan-300",
    container: "border-cyan-500/30 bg-cyan-950/40 text-cyan-200",
    icon: Info,
    iconColor: "text-cyan-400",
  },
};

function getAlertStyle(severity) {
  return ALERT_STYLES[String(severity || "info").toLowerCase()] || ALERT_STYLES.info;
}

function AlertDetails({ alert }) {
  const style = getAlertStyle(alert.severity);
  const Icon = style.icon;

  return (
    <article className="space-y-1">
      <div className="flex flex-wrap items-center gap-2">
        <span
          className={`rounded border px-1.5 py-0.5 text-[10px] font-semibold uppercase ${style.badge}`}
        >
          {alert.type || "Weather Advisory"}
        </span>
        <span className="text-xs font-bold text-white">
          {alert.title || "Weather Advisory"}
        </span>
      </div>

      <p className="text-xs leading-relaxed text-slate-300">
        {alert.message || "Please check local weather conditions for updates."}
      </p>
    </article>
  );
}

export default function WeatherAlertsBanner({ advisories = [] }) {
  const [dismissed, setDismissed] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const alerts = Array.isArray(advisories)
    ? advisories.filter((alert) => alert && typeof alert === "object")
    : [];

  if (alerts.length === 0 || dismissed) return null;

  const primaryAlert = alerts[0];
  const style = getAlertStyle(primaryAlert.severity);
  const Icon = style.icon;
  const additionalCount = alerts.length - 1;

  return (
    <section
      role="region"
      aria-label="Weather advisories"
      className={`rounded-2xl border p-4 shadow-lg backdrop-blur-xl transition-all duration-300 ${style.container}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <div className="mt-0.5 shrink-0 rounded-xl bg-white/[0.05] p-2">
            <Icon
              className={`h-5 w-5 ${style.iconColor} ${primaryAlert.severity === "danger"
                  ? "motion-safe:animate-pulse"
                  : ""
                }`}
            />
          </div>

          <div className="min-w-0 flex-1 space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${style.badge}`}
              >
                {primaryAlert.type || "Weather Advisory"}
              </span>

              <h4 className="text-sm font-bold tracking-tight text-white">
                {primaryAlert.title || "Weather Advisory"}
              </h4>
            </div>

            <p className="max-w-3xl text-xs leading-relaxed text-slate-200/90">
              {primaryAlert.message ||
                "Please check local weather conditions for updates."}
            </p>

            {expanded && additionalCount > 0 && (
              <div className="mt-3 space-y-3 border-t border-white/10 pt-3">
                {alerts.slice(1).map((alert, index) => (
                  <AlertDetails
                    key={alert.id ?? `${alert.title ?? "alert"}-${index}`}
                    alert={alert}
                  />
                ))}
              </div>
            )}

            <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-slate-400">
              <ShieldAlert className="h-3 w-3 shrink-0" />
              <span>
                Source: {primaryAlert.source || "Weather data provider"}
              </span>
              {primaryAlert.updatedAt && (
                <>
                  <span aria-hidden="true">•</span>
                  <span>
                    Updated:{" "}
                    {String(primaryAlert.updatedAt)}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          {additionalCount > 0 && (
            <button
              type="button"
              onClick={() => setExpanded((value) => !value)}
              aria-expanded={expanded}
              aria-label={
                expanded
                  ? "Hide additional advisories"
                  : `Show ${additionalCount} additional advisories`
              }
              title={expanded ? "Show less" : "Show more"}
              className="rounded-lg p-1 text-slate-300 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
            >
              {expanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </button>
          )}

          <button
            type="button"
            onClick={() => setDismissed(true)}
            aria-label="Dismiss weather advisories"
            title="Dismiss advisories"
            className="rounded-lg p-1 text-slate-400 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </section>
  );
}
