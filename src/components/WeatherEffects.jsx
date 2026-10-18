
const RAIN_DROPS = Array.from({ length: 40 }, (_, i) => ({
  id: i,
  left: i * 2.5 + (i % 3) * 0.5,
  delay: ((i * 137) % 2000) / 1000,
  duration: 0.7 + ((i * 73) % 500) / 1000,
  opacity: 0.25 + ((i * 29) % 45) / 100,
  height: 18 + (i % 12),
}));

const SNOW_FLAKES = Array.from({ length: 32 }, (_, i) => ({
  id: i,
  left: i * 3.1 + 1,
  delay: ((i * 191) % 5000) / 1000,
  duration: 4.5 + ((i * 89) % 4000) / 1000,
  size: 3 + (i % 4),
  opacity: 0.3 + ((i * 37) % 50) / 100,
}));

const SOLAR_MOTES = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  left: 55 + i * 2.3,
  top: 5 + i * 3.1,
  delay: (i * 0.6) % 4,
  duration: 4 + (i % 3),
  size: 2 + (i % 3),
}));

function classifyWeather(condition, icon) {
  const normalized = String(condition || "").toLowerCase();
  const iconCode = String(icon || "");
  const isNight = iconCode.endsWith("n");

  if (
    normalized.includes("thunder") ||
    normalized.includes("lightning")
  ) {
    return "thunder";
  }

  if (
    normalized.includes("snow") ||
    normalized.includes("sleet") ||
    normalized.includes("ice") ||
    normalized.includes("blizzard")
  ) {
    return "snow";
  }

  if (
    normalized.includes("rain") ||
    normalized.includes("drizzle") ||
    normalized.includes("shower")
  ) {
    return "rain";
  }

  if (
    normalized.includes("fog") ||
    normalized.includes("mist") ||
    normalized.includes("haze") ||
    normalized.includes("smoke") ||
    normalized.includes("dust") ||
    normalized.includes("sand") ||
    normalized.includes("ash")
  ) {
    return "mist";
  }

  if (
    normalized.includes("cloud") ||
    normalized.includes("overcast") ||
    ["02d", "02n", "03d", "03n", "04d", "04n"].includes(iconCode)
  ) {
    return "clouds";
  }

  return isNight ? "clear-night" : "clear-day";
}

export default function WeatherEffects({
  condition = "Clear",
  icon = "01d",
  windDeg = 210,
  enabled = true,
}) {
  if (!enabled) return null;

  const weatherType = classifyWeather(condition, icon);
  const direction = Number(windDeg);
  const safeDirection = Number.isFinite(direction) ? direction : 210;

  const slantDeg = Math.max(
    -18,
    Math.min(18, Math.sin((safeDirection * Math.PI) / 180) * 14)
  );

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden transition-opacity duration-1000 motion-reduce:!transition-none"
    >
      {weatherType === "thunder" && (
        <>
          <div className="absolute inset-0 animate-lightning bg-violet-600/20 mix-blend-screen motion-reduce:animate-none" />
          <div className="absolute right-[20%] top-0 h-[500px] w-[600px] rounded-full bg-cyan-400/15 blur-[140px] animate-lightning motion-reduce:animate-none" />
        </>
      )}

      {(weatherType === "rain" || weatherType === "thunder") && (
        <div
          className="absolute inset-0 motion-reduce:hidden"
          style={{ transform: `rotate(${slantDeg}deg) scale(1.1)` }}
        >
          {RAIN_DROPS.map((drop) => (
            <div
              key={drop.id}
              className="absolute w-[1.5px] rounded-full bg-gradient-to-b from-transparent via-cyan-300 to-cyan-100"
              style={{
                left: `${drop.left}%`,
                top: "-30px",
                height: `${drop.height}px`,
                opacity: drop.opacity,
                animation: `rainFall ${drop.duration}s linear infinite`,
                animationDelay: `${drop.delay}s`,
              }}
            />
          ))}
        </div>
      )}

      {weatherType === "snow" && (
        <div className="absolute inset-0 motion-reduce:hidden">
          {SNOW_FLAKES.map((flake) => (
            <div
              key={flake.id}
              className="absolute rounded-full bg-white shadow-[0_0_6px_rgba(255,255,255,0.8)]"
              style={{
                left: `${flake.left}%`,
                top: "-15px",
                width: `${flake.size}px`,
                height: `${flake.size}px`,
                opacity: flake.opacity,
                animation: `snowFlutter ${flake.duration}s ease-in-out infinite`,
                animationDelay: `${flake.delay}s`,
              }}
            />
          ))}
        </div>
      )}

      {weatherType === "mist" && (
        <div className="absolute inset-0 flex flex-col justify-end motion-reduce:hidden">
          <div className="ml-[-20%] h-64 w-[140%] animate-mist bg-gradient-to-t from-slate-400/15 via-cyan-500/10 to-transparent blur-3xl" />
          <div
            className="ml-[-10%] h-48 w-[140%] animate-mist bg-gradient-to-t from-slate-300/10 via-indigo-400/10 to-transparent blur-2xl"
            style={{
              animationDelay: "5s",
              animationDuration: "35s",
            }}
          />
        </div>
      )}

      {weatherType === "clouds" && (
        <div className="absolute inset-0 overflow-hidden motion-reduce:hidden">
          <div className="absolute -left-10 -top-20 h-80 w-[120%] animate-clouds-slow bg-gradient-to-b from-slate-500/10 via-slate-700/10 to-transparent blur-3xl" />
          <div className="absolute -right-10 top-[20%] h-64 w-[110%] animate-clouds-fast bg-gradient-to-r from-transparent via-cyan-900/10 to-indigo-950/15 blur-2xl" />
        </div>
      )}

      {weatherType === "clear-day" && (
        <div className="absolute inset-0">
          <div className="absolute -top-20 right-10 h-[480px] w-[480px] animate-solar-pulse rounded-full bg-gradient-to-br from-amber-400/20 via-orange-500/10 to-transparent blur-[120px] motion-reduce:animate-none" />

          <div className="motion-reduce:hidden">
            {SOLAR_MOTES.map((mote) => (
              <div
                key={mote.id}
                className="absolute animate-float rounded-full bg-amber-300/60 blur-[0.5px]"
                style={{
                  left: `${mote.left}%`,
                  top: `${mote.top}%`,
                  width: `${mote.size}px`,
                  height: `${mote.size}px`,
                  animationDelay: `${mote.delay}s`,
                  animationDuration: `${mote.duration}s`,
                }}
              />
            ))}
          </div>
        </div>
      )}

      {weatherType === "clear-night" && (
        <div className="absolute inset-0">
          <div className="absolute right-20 top-10 h-[350px] w-[400px] rounded-full bg-gradient-to-b from-indigo-500/15 via-blue-700/10 to-transparent blur-[110px]" />
        </div>
      )}
    </div>
  );
}
