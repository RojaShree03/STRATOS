
import { useState } from "react";
import {
  Search,
  Sun,
  Moon,
  Laptop,
  User,
  Menu,
  X,
  GitCompare,
} from "lucide-react";

export default function Navbar({
  activeTab = "Home",
  setActiveTab,
  tempUnit = "C",
  setTempUnit,
  themeMode = "system",
  effectiveTheme = "dark",
  setThemeMode,
  onOpenSettings,
  onOpenAbout,
  onOpenCompare,
  onFocusSearch,
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: "Home", label: "Home" },
    { id: "Forecast", label: "Forecast" },
    { id: "Maps", label: "Maps" },
    { id: "Compare", label: "Compare" },
    { id: "Saved", label: "Saved" },
    { id: "About", label: "About" },
  ];

  const isLight = effectiveTheme === "light";

  const handleThemeCycle = () => {
    if (!setThemeMode) return;

    const nextTheme =
      themeMode === "system"
        ? "light"
        : themeMode === "light"
          ? "dark"
          : "system";

    setThemeMode(nextTheme);
  };

  const handleNavClick = (id) => {
    setActiveTab?.(id);
    setMobileMenuOpen(false);

    if (id === "About") {
      onOpenAbout?.();
      return;
    }

    if (id === "Compare") {
      onOpenCompare?.();
      return;
    }

    if (id === "Home") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    const sectionIds = {
      Forecast: "forecast-section",
      Maps: "map-section",
      Saved: "saved-section",
    };

    const section = sectionIds[id]
      ? document.getElementById(sectionIds[id])
      : null;

    section?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const themeLabel = {
    system: "System",
    light: "Solar Light",
    dark: "Cosmic Dark",
  }[themeMode] || "System";

  const ThemeIcon =
    themeMode === "light"
      ? Sun
      : themeMode === "dark"
        ? Moon
        : Laptop;

  return (
    <header
      className={`sticky top-0 z-40 w-full border-b transition-colors duration-200 ${
        isLight
          ? "border-slate-200/80 bg-white/95"
          : "border-white/[0.07] bg-[#060913]/95"
      }`}
    >
      <div className="mx-auto flex w-full items-center justify-between gap-3 px-4 py-3 sm:px-6">
      <button
        type="button"
        onClick={() => handleNavClick("Home")}
        aria-label="STRATOS home"
        className="group flex shrink-0 select-none items-center gap-2.5 text-left sm:gap-3.5"
      >
        <div className="relative flex h-9 w-9 items-center justify-center sm:h-10 sm:w-10">
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-cyan-500 to-indigo-600 opacity-80 blur-[6px] transition-opacity group-hover:opacity-100" />
          <svg
            viewBox="0 0 36 36"
            className="relative z-10 h-9 w-9 transition-transform duration-500 group-hover:rotate-12"
            fill="none"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="stratos-planet-gradient" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#38bdf8" />
                <stop offset="60%" stopColor="#2563eb" />
                <stop offset="100%" stopColor="#1e1b4b" />
              </linearGradient>
              <linearGradient id="stratos-ring-gradient" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#818cf8" stopOpacity="0.8" />
              </linearGradient>
              <linearGradient id="stratos-front-ring-gradient" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.6" />
              </linearGradient>
            </defs>
            <ellipse
              cx="18"
              cy="18"
              rx="15"
              ry="5.5"
              transform="rotate(-25 18 18)"
              stroke="url(#stratos-ring-gradient)"
              strokeWidth="1.8"
            />
            <circle
              cx="18"
              cy="18"
              r="7.5"
              fill="url(#stratos-planet-gradient)"
            />
            <path
              d="M 5 22.5 A 15 5.5 155 0 0 31 13.5"
              stroke="url(#stratos-front-ring-gradient)"
              strokeWidth="1.8"
            />
          </svg>
        </div>

        <div>
          <div className="flex items-center gap-1.5 text-lg font-bold leading-none tracking-[0.16em] text-white sm:text-xl sm:tracking-[0.22em]">
            STRATOS
          </div>
          <div className="mt-1 text-[8px] font-semibold uppercase leading-none tracking-[0.2em] text-slate-400 sm:text-[9px] sm:tracking-[0.3em]">
            Above the Ordinary
          </div>
        </div>
      </button>

      <nav
        aria-label="Main navigation"
        className="hidden items-center gap-1 rounded-full border border-white/[0.06] bg-white/[0.03] px-2 py-1.5 backdrop-blur-md md:flex lg:px-3"
      >
        {navItems.map((item) => {
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleNavClick(item.id)}
              aria-current={isActive ? "page" : undefined}
              className={`relative rounded-full px-2.5 py-1.5 text-xs font-medium transition-all duration-300 lg:px-3.5 lg:text-sm ${isActive
                ? "font-semibold text-cyan-400"
                : "text-slate-400 hover:bg-white/[0.04] hover:text-white"
                }`}
            >
              {item.label}
              {isActive && (
                <span className="absolute bottom-0 left-3 right-3 h-[2px] rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 shadow-[0_0_8px_rgba(56,189,248,0.8)]" />
              )}
            </button>
          );
        })}
      </nav>

      <div className="flex shrink-0 items-center gap-1.5 sm:gap-2.5">
        <button
          type="button"
          onClick={onFocusSearch}
          aria-label="Focus city search"
          title="Search cities"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.05] text-slate-400 transition-all hover:bg-white/[0.1] hover:text-white"
        >
          <Search className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={onOpenCompare}
          title="Compare cities"
          className="hidden items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.05] px-3 py-1.5 text-xs font-semibold text-slate-300 transition-all hover:bg-white/[0.1] hover:text-white sm:flex"
        >
          <GitCompare className="h-3.5 w-3.5 text-cyan-400" />
          <span>Compare</span>
        </button>

        <div
          role="group"
          aria-label="Temperature unit"
          className="flex items-center rounded-full border border-white/[0.08] bg-white/[0.05] p-1 backdrop-blur-sm"
        >
          {["C", "F"].map((unit) => (
            <button
              key={unit}
              type="button"
              onClick={() => setTempUnit?.(unit)}
              aria-pressed={tempUnit === unit}
              className={`rounded-full px-2 py-1 text-xs font-semibold transition-all duration-200 sm:px-2.5 ${tempUnit === unit
                ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[0_0_12px_rgba(56,189,248,0.3)]"
                : "text-slate-400 hover:text-white"
                }`}
            >
              °{unit}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={handleThemeCycle}
          disabled={!setThemeMode}
          aria-label={`Theme mode: ${themeLabel}. Click to change theme.`}
          title={`Theme: ${themeLabel}`}
          className={`flex h-9 w-9 items-center justify-center rounded-full border shadow-sm transition-all disabled:cursor-default ${isLight
            ? "border-amber-300 bg-amber-100/80 text-amber-600 hover:bg-amber-100"
            : "border-white/[0.08] bg-white/[0.05] text-cyan-400 hover:bg-white/[0.1]"
            }`}
        >
          <ThemeIcon
            className={`h-4 w-4 ${themeMode === "light"
              ? "text-amber-500"
              : themeMode === "dark"
                ? "text-indigo-400"
                : "text-cyan-400"
              }`}
          />
        </button>

        <button
          type="button"
          onClick={onOpenSettings}
          aria-label="Open settings"
          title="Dashboard settings"
          className={`flex h-9 w-9 items-center justify-center rounded-full border shadow-md transition-colors duration-200 ${isLight
            ? "border-slate-300/30 bg-white/[0.08] text-slate-900 hover:bg-white/[0.15]"
            : "border-white/[0.15] bg-gradient-to-tr from-slate-800 to-slate-700 text-slate-200 hover:from-slate-700 hover:to-slate-600 hover:text-white"
            }`}
        >
          <User className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={() => setMobileMenuOpen((open) => !open)}
          aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={mobileMenuOpen}
          aria-controls="mobile-navigation"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.05] text-slate-400 transition hover:text-white md:hidden"
        >
          {mobileMenuOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>
      </div>
    </div>

      {
    mobileMenuOpen && (
      <div
        id="mobile-navigation"
        className="flex flex-col gap-2 border-b border-white/[0.08] bg-[#070b16]/95 px-5 py-4 backdrop-blur-2xl md:hidden sm:px-6"
      >
        <nav aria-label="Mobile navigation" className="flex flex-col gap-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => handleNavClick(item.id)}
              aria-current={activeTab === item.id ? "page" : undefined}
              className={`rounded-lg px-3 py-2 text-left text-sm font-medium transition-all ${activeTab === item.id
                ? "border border-cyan-500/30 bg-cyan-500/15 text-cyan-400"
                : "text-slate-300 hover:bg-white/[0.05]"
                }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center justify-between border-t border-white/10 pt-3 text-xs text-slate-300">
          <span>Atmospheric Theme</span>
          <button
            type="button"
            onClick={handleThemeCycle}
            disabled={!setThemeMode}
            className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 font-semibold disabled:opacity-50"
          >
            <ThemeIcon className="h-3.5 w-3.5" />
            {themeLabel}
          </button>
        </div>

        <button
          type="button"
          onClick={() => {
            setMobileMenuOpen(false);
            onOpenCompare?.();
          }}
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium text-slate-300 transition hover:bg-white/[0.05] hover:text-white"
        >
          <GitCompare className="h-4 w-4 text-cyan-400" />
          Compare Cities
        </button>
      </div>
    )
  }
    </header>
  );
}
