
function SkeletonBlock({ className = "" }) {
  return (
    <div
      aria-hidden="true"
      className={`rounded-xl bg-white/[0.06] ${className}`}
    />
  );
}

function SkeletonShimmer() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 skeleton-shimmer"
    />
  );
}

export function HeroWeatherSkeleton() {
  return (
    <section
      role="status"
      aria-label="Loading current weather"
      className="glass-panel-elevated relative flex min-h-[420px] flex-col justify-between overflow-hidden rounded-3xl border border-white/10 p-6 sm:p-8"
    >
      <SkeletonShimmer />

      <div className="relative space-y-2.5">
        <SkeletonBlock className="h-7 w-48 bg-white/[0.08]" />
        <SkeletonBlock className="h-4 w-32 bg-white/[0.05]" />
        <SkeletonBlock className="h-3 w-40 bg-white/[0.04]" />
      </div>

      <div className="relative my-6 space-y-3">
        <SkeletonBlock className="h-20 w-36 rounded-2xl bg-white/[0.08]" />
        <SkeletonBlock className="h-6 w-44 bg-white/[0.06]" />
        <SkeletonBlock className="h-4 w-56 max-w-full bg-white/[0.04]" />
      </div>

      <div className="relative grid grid-cols-2 gap-2.5 pt-2 sm:grid-cols-5">
        {Array.from({ length: 5 }, (_, index) => (
          <SkeletonBlock
            key={index}
            className="h-14 rounded-2xl border border-white/[0.06] bg-white/[0.05]"
          />
        ))}
      </div>

      <span className="sr-only">Please wait while weather data loads.</span>
    </section>
  );
}

export function HourlySkeleton() {
  return (
    <section
      role="status"
      aria-label="Loading hourly forecast"
      className="glass-panel relative overflow-hidden rounded-3xl border border-white/10 p-5 shadow-xl sm:p-6"
    >
      <SkeletonShimmer />

      <div className="relative mb-5 flex items-center justify-between gap-3">
        <SkeletonBlock className="h-6 w-36 bg-white/[0.08]" />
        <SkeletonBlock className="h-4 w-24 bg-white/[0.05]" />
      </div>

      <div className="relative flex gap-3 overflow-hidden">
        {Array.from({ length: 7 }, (_, index) => (
          <SkeletonBlock
            key={index}
            className="h-28 w-20 shrink-0 rounded-2xl border border-white/[0.05] bg-white/[0.04] sm:w-24"
          />
        ))}
      </div>

      <span className="sr-only">Please wait while hourly forecast loads.</span>
    </section>
  );
}

export function DailySkeleton() {
  return (
    <section
      role="status"
      aria-label="Loading daily forecast"
      className="glass-panel relative overflow-hidden rounded-3xl border border-white/10 p-5 shadow-xl sm:p-6"
    >
      <SkeletonShimmer />

      <div className="relative mb-5 flex items-center justify-between gap-3">
        <SkeletonBlock className="h-6 w-32 bg-white/[0.08]" />
        <SkeletonBlock className="h-4 w-20 bg-white/[0.05]" />
      </div>

      <div className="relative grid grid-cols-4 gap-2 sm:grid-cols-7">
        {Array.from({ length: 7 }, (_, index) => (
          <SkeletonBlock
            key={index}
            className={`h-28 rounded-2xl border border-white/[0.05] bg-white/[0.04] ${index > 3 ? "hidden sm:block" : ""
              }`}
          />
        ))}
      </div>

      <span className="sr-only">Please wait while daily forecast loads.</span>
    </section>
  );
}
