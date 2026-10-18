
function classifyWeather(condition, icon) {
  const cond = String(condition || "").toLowerCase();
  const code = String(icon || "");
  const isNight = code.endsWith("n");

  if (cond.includes("thunder") || cond.includes("lightning") || code.startsWith("11")) {
    return "thunder";
  }

  if (
    cond.includes("snow") ||
    cond.includes("sleet") ||
    cond.includes("ice") ||
    cond.includes("blizzard") ||
    code.startsWith("13")
  ) {
    return "snow";
  }

  if (
    cond.includes("rain") ||
    cond.includes("drizzle") ||
    cond.includes("shower") ||
    code.startsWith("09") ||
    code.startsWith("10")
  ) {
    return "rain";
  }

  if (
    cond.includes("fog") ||
    cond.includes("mist") ||
    cond.includes("haze") ||
    cond.includes("smoke") ||
    cond.includes("dust") ||
    cond.includes("sand") ||
    cond.includes("ash") ||
    code.startsWith("50")
  ) {
    return "mist";
  }

  if (
    cond.includes("few") ||
    cond.includes("scattered") ||
    cond.includes("partly") ||
    code.startsWith("02")
  ) {
    return isNight ? "partly-night" : "partly-day";
  }

  if (
    cond.includes("cloud") ||
    cond.includes("overcast") ||
    code.startsWith("03") ||
    code.startsWith("04")
  ) {
    return "cloudy";
  }

  return isNight ? "clear-night" : "clear-day";
}

const SIZE_MAP = {
  sm: 24,
  md: 36,
  lg: 52,
  xl: 72,
};

const GRADIENTS = {
  sun: "stratos-sun-gradient",
  moon: "stratos-moon-gradient",
  cloud: "stratos-cloud-gradient",
  cloudNight: "stratos-cloud-night-gradient",
  rain: "stratos-rain-cloud-gradient",
  thunder: "stratos-thunder-cloud-gradient",
  snow: "stratos-snow-cloud-gradient",
};

function GradientDefinitions({ prefix }) {
  return (
    <defs>
      <linearGradient id={`${prefix}-${GRADIENTS.sun}`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#fef08a" />
        <stop offset="50%" stopColor="#f59e0b" />
        <stop offset="100%" stopColor="#d97706" />
      </linearGradient>

      <linearGradient id={`${prefix}-${GRADIENTS.moon}`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#f8fafc" />
        <stop offset="60%" stopColor="#38bdf8" />
        <stop offset="100%" stopColor="#0284c7" />
      </linearGradient>

      <linearGradient id={`${prefix}-${GRADIENTS.cloud}`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#ffffff" />
        <stop offset="45%" stopColor="#e2e8f0" />
        <stop offset="100%" stopColor="#94a3b8" />
      </linearGradient>

      <linearGradient id={`${prefix}-${GRADIENTS.cloudNight}`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#cbd5e1" />
        <stop offset="100%" stopColor="#475569" />
      </linearGradient>

      <linearGradient id={`${prefix}-${GRADIENTS.rain}`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#94a3b8" />
        <stop offset="100%" stopColor="#475569" />
      </linearGradient>

      <linearGradient id={`${prefix}-${GRADIENTS.thunder}`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#64748b" />
        <stop offset="100%" stopColor="#334155" />
      </linearGradient>

      <linearGradient id={`${prefix}-${GRADIENTS.snow}`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#e2e8f0" />
        <stop offset="100%" stopColor="#94a3b8" />
      </linearGradient>
    </defs>
  );
}

export default function WeatherIcon({
  condition = "Clear",
  icon = "01d",
  size = "md",
  className = "",
}) {
  const px = SIZE_MAP[size] || SIZE_MAP.md;
  const type = classifyWeather(condition, icon);
  const prefix = `weather-icon-${type}-${px}`;
  const sunGradient = `url(#${prefix}-${GRADIENTS.sun})`;
  const moonGradient = `url(#${prefix}-${GRADIENTS.moon})`;
  const cloudGradient = `url(#${prefix}-${GRADIENTS.cloud})`;

  const containerStyle = {
    width: `${px}px`,
    height: `${px}px`,
    minWidth: `${px}px`,
    minHeight: `${px}px`,
  };

  const svgProps = {
    viewBox: "0 0 48 48",
    width: px,
    height: px,
    fill: "none",
    "aria-hidden": true,
    className: "relative z-10 h-full w-full",
  };

  let artwork;

  switch (type) {
    case "clear-day":
      artwork = (
        <>
          <circle cx="24" cy="24" r="11" fill={sunGradient} />
          <g stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round">
            <line x1="24" y1="4" x2="24" y2="8" />
            <line x1="24" y1="40" x2="24" y2="44" />
            <line x1="4" y1="24" x2="8" y2="24" />
            <line x1="40" y1="24" x2="44" y2="24" />
            <line x1="9.8" y1="9.8" x2="12.8" y2="12.8" />
            <line x1="35.2" y1="35.2" x2="38.2" y2="38.2" />
            <line x1="9.8" y1="38.2" x2="12.8" y2="35.2" />
            <line x1="35.2" y1="12.8" x2="38.2" y2="9.8" />
          </g>
        </>
      );
      break;

    case "clear-night":
      artwork = (
        <>
          <path
            d="M31 7C21 7 13 15 13 25c0 10 8 18 18 18 3 0 6-1 9-3-7-2-12-8-12-15S33 12 40 10c-3-2-6-3-9-3Z"
            fill={moonGradient}
          />
          <circle cx="12" cy="13" r="1.5" fill="#e0f2fe" />
          <circle cx="37" cy="20" r="1.2" fill="#e0f2fe" opacity="0.7" />
        </>
      );
      break;

    case "partly-day":
      artwork = (
        <>
          <circle cx="32" cy="17" r="9" fill={sunGradient} />
          <path
            d="M17 39c-5 0-9-4-9-9 0-4 3-7 7-8 1-6 6-10 12-10 7 0 13 6 13 13v1c3 1 5 4 5 7 0 4-3 6-7 6Z"
            fill={cloudGradient}
          />
        </>
      );
      break;

    case "partly-night":
      artwork = (
        <>
          <path
            d="M31 7c-6 1-10 6-10 12 0 5 3 9 8 11-7 0-12-5-12-12 0-6 6-11 14-11Z"
            fill={moonGradient}
          />
          <path
            d="M16 39c-4 0-8-4-8-8 0-4 3-7 7-8 1-6 6-10 12-10 7 0 13 6 13 13v1c3 1 5 4 5 7 0 3-3 5-7 5Z"
            fill={`url(#${prefix}-${GRADIENTS.cloudNight})`}
          />
        </>
      );
      break;

    case "cloudy":
      artwork = (
        <>
          <path
            d="M24 16c-5 0-9 3-10 7-4 1-6 4-6 7 0 4 3 7 7 7h19c5 0 8-3 8-7 0-4-3-7-7-7-1-4-5-7-11-7Z"
            fill="#64748b"
            opacity="0.65"
          />
          <path
            d="M14 38c-4 0-7-3-7-7 0-4 3-7 6-8 2-5 6-9 12-9 7 0 12 5 13 12 3 1 5 3 5 6 0 4-3 6-7 6Z"
            fill={cloudGradient}
          />
        </>
      );
      break;

    case "rain":
      artwork = (
        <>
          <path
            d="M14 30c-4 0-7-3-7-7 0-4 3-7 6-8 2-5 6-9 12-9 7 0 12 5 13 12 3 1 5 3 5 6 0 4-3 6-7 6Z"
            fill={`url(#${prefix}-${GRADIENTS.rain})`}
          />
          <g stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round">
            <line x1="16" y1="34" x2="13" y2="41" />
            <line x1="25" y1="34" x2="22" y2="41" />
            <line x1="34" y1="34" x2="31" y2="41" />
          </g>
        </>
      );
      break;

    case "thunder":
      artwork = (
        <>
          <path
            d="M14 28c-4 0-7-3-7-7 0-4 3-7 6-8 2-5 6-9 12-9 7 0 12 5 13 12 3 1 5 3 5 6 0 4-3 6-7 6Z"
            fill={`url(#${prefix}-${GRADIENTS.thunder})`}
          />
          <polygon
            points="25,25 17,36 23,36 20,46 31,33 25,33"
            fill="#fbbf24"
            stroke="#f59e0b"
            strokeWidth="1"
          />
        </>
      );
      break;

    case "snow":
      artwork = (
        <>
          <path
            d="M14 28c-4 0-7-3-7-7 0-4 3-7 6-8 2-5 6-9 12-9 7 0 12 5 13 12 3 1 5 3 5 6 0 4-3 6-7 6Z"
            fill={`url(#${prefix}-${GRADIENTS.snow})`}
          />
          <g fill="#e0f2fe">
            <circle cx="15" cy="35" r="2" />
            <circle cx="24" cy="40" r="2.2" fill="#fff" />
            <circle cx="33" cy="35" r="2" />
          </g>
        </>
      );
      break;

    case "mist":
    default:
      artwork = (
        <g
          stroke="#94a3b8"
          strokeWidth="2.5"
          strokeLinecap="round"
          opacity="0.9"
        >
          <line x1="12" y1="15" x2="36" y2="15" />
          <line x1="8" y1="22" x2="40" y2="22" />
          <line x1="12" y1="29" x2="36" y2="29" />
          <line x1="15" y1="36" x2="33" y2="36" />
        </g>
      );
  }

  return (
    <div
      style={containerStyle}
      className={`relative flex shrink-0 items-center justify-center ${type === "clear-day"
          ? "before:absolute before:inset-1 before:rounded-full before:bg-amber-400/30 before:blur-sm before:content-[''] motion-safe:before:animate-pulse"
          : type === "clear-night"
            ? "before:absolute before:inset-1 before:rounded-full before:bg-cyan-400/20 before:blur-sm before:content-['']"
            : ""
        } ${className}`}
      role="img"
      aria-label={`${condition || "Clear"} weather`}
    >
      <svg
        {...svgProps}
        className={`relative z-10 h-full w-full ${type === "clear-day"
            ? "drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]"
            : type === "clear-night"
              ? "drop-shadow-[0_0_8px_rgba(56,189,248,0.5)]"
              : ""
          }`}
      >
        <GradientDefinitions prefix={prefix} />
        {artwork}
      </svg>
    </div>
  );
}
