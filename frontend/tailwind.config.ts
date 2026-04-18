import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        sand: "#f6efe3",
        moss: "#20342b",
        sage: "#95a98b",
        leaf: "#22c55e",
        amber: "#eab308",
        ember: "#f97316",
        berry: "#ef4444",
        ink: "#162019"
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(255,255,255,0.08), 0 22px 80px rgba(22,32,25,0.18)"
      },
      animation: {
        floaty: "floaty 6s ease-in-out infinite",
        pulseRing: "pulseRing 2.4s ease-in-out infinite",
        slideUp: "slideUp 0.9s cubic-bezier(0.22, 1, 0.36, 1) both",
        shimmer: "shimmer 2.8s linear infinite"
      },
      keyframes: {
        floaty: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" }
        },
        pulseRing: {
          "0%, 100%": { opacity: "0.55", transform: "scale(0.98)" },
          "50%": { opacity: "1", transform: "scale(1.04)" }
        },
        slideUp: {
          from: { opacity: "0", transform: "translateY(22px)" },
          to: { opacity: "1", transform: "translateY(0)" }
        },
        shimmer: {
          from: { backgroundPosition: "200% 0" },
          to: { backgroundPosition: "-200% 0" }
        }
      }
    }
  },
  plugins: []
};

export default config;
