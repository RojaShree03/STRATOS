
const STATIC_STARS = [
  { id: 0, x: 12, y: 15, size: 1.5, opacity: 0.7, delay: 0.2, duration: 4.5 },
  { id: 1, x: 28, y: 8, size: 2.2, opacity: 0.9, delay: 1.4, duration: 5.2 },
  { id: 2, x: 45, y: 22, size: 1.2, opacity: 0.5, delay: 2.1, duration: 3.8 },
  { id: 3, x: 62, y: 12, size: 1.8, opacity: 0.8, delay: 0.8, duration: 4.1 },
  { id: 4, x: 78, y: 25, size: 2.4, opacity: 0.6, delay: 3.2, duration: 6 },
  { id: 5, x: 89, y: 14, size: 1.1, opacity: 0.7, delay: 1.9, duration: 3.5 },
  { id: 6, x: 8, y: 42, size: 1.9, opacity: 0.5, delay: 2.6, duration: 4.8 },
  { id: 7, x: 22, y: 55, size: 1.4, opacity: 0.8, delay: 0.5, duration: 5.5 },
  { id: 8, x: 38, y: 38, size: 2, opacity: 0.6, delay: 3.7, duration: 4.2 },
  { id: 9, x: 52, y: 48, size: 1.3, opacity: 0.9, delay: 1.1, duration: 3.9 },
  { id: 10, x: 71, y: 40, size: 1.7, opacity: 0.4, delay: 2.8, duration: 5.1 },
  { id: 11, x: 84, y: 52, size: 2.3, opacity: 0.8, delay: 0.3, duration: 4.7 },
  { id: 12, x: 95, y: 36, size: 1.2, opacity: 0.6, delay: 4.1, duration: 3.6 },
  { id: 13, x: 15, y: 72, size: 1.6, opacity: 0.7, delay: 1.7, duration: 4.4 },
  { id: 14, x: 31, y: 82, size: 2.1, opacity: 0.5, delay: 2.3, duration: 5.8 },
];

export default function CosmicBackground({ theme = "dark" }) {
  const isLight = theme === "light";

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-slate-950"
    >
      {/* Light theme background */}
      <div
        className={`absolute inset-0 bg-gradient-to-b from-[#dbe8f6] via-[#ecf2f9] to-[#e2ebf5] transition-opacity duration-200 ${isLight ? "opacity-100" : "opacity-0"
          }`}
      >
        <div className="absolute -top-24 right-0 h-[600px] w-[700px] rounded-full bg-gradient-to-br from-amber-300/35 via-orange-200/25 to-transparent blur-[90px]" />

        <div className="absolute left-0 top-10 h-[520px] w-[600px] rounded-full bg-gradient-to-br from-sky-400/20 via-cyan-300/15 to-transparent blur-[80px]" />

        <div className="absolute left-[20%] top-[38%] h-[450px] w-[750px] rounded-full bg-gradient-to-r from-indigo-300/15 via-sky-300/15 to-transparent blur-[90px]" />

        <div className="absolute -bottom-20 left-10 h-[450px] w-[550px] rounded-full bg-cyan-400/15 blur-[90px]" />

        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a08_1px,transparent_1px),linear-gradient(to_bottom,#0f172a08_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_70%,transparent_100%)]" />
      </div>

      {/* Dark theme background */}
      <div
        className={`absolute inset-0 bg-[#060913] transition-opacity duration-200 ${isLight ? "opacity-0" : "opacity-100"
          }`}
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(20,35,70,0.6),rgba(6,9,19,0.95))]" />

        <div className="absolute -top-24 right-0 h-[550px] w-[650px] rounded-full bg-gradient-to-br from-amber-500/15 via-rose-500/10 to-transparent blur-[80px]" />

        <div className="absolute left-0 top-10 h-[500px] w-[550px] rounded-full bg-gradient-to-br from-cyan-500/12 via-blue-600/10 to-transparent blur-[80px]" />

        <div className="absolute left-[25%] top-[35%] h-[400px] w-[700px] rounded-full bg-gradient-to-r from-indigo-600/10 via-purple-600/10 to-transparent blur-[90px]" />

        <div className="absolute -bottom-20 left-10 h-[450px] w-[500px] rounded-full bg-cyan-600/10 blur-[90px]" />

        {/* Twinkling stars */}
        <div className="absolute inset-0">
          {STATIC_STARS.map((star) => (
            <div
              key={star.id}
              className="absolute rounded-full bg-white motion-safe:animate-[twinkle_var(--twinkle-duration)_ease-in-out_infinite] motion-reduce:animate-none"
              style={{
                top: `${star.y}%`,
                left: `${star.x}%`,
                width: `${star.size}px`,
                height: `${star.size}px`,
                opacity: star.opacity,
                "--twinkle-duration": `${star.duration}s`,
                animationDelay: `${star.delay}s`,
              }}
            />
          ))}
        </div>

        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_70%,transparent_100%)]" />
      </div>
    </div>
  );
}
