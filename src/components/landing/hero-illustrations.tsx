import type { SVGProps } from "react";

type IllustrationProps = SVGProps<SVGSVGElement>;

/**
 * Three hand-crafted SVG illustrations for the hero carousel. Each one uses
 * the Trackship cobalt-blue primary plus accent shades so they sit nicely on
 * the existing palette in both light and dark themes.
 *
 * Replace them with photographs by dropping JPG/PNG files into
 * `public/carousel/` and updating `HeroCarousel`.
 */

export function TrackingIllustration(props: IllustrationProps) {
  return (
    <svg
      viewBox="0 0 600 480"
      role="img"
      aria-label="Real-time parcel tracking"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <defs>
        <linearGradient id="track-bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="oklch(0.92 0.05 252)" />
          <stop offset="100%" stopColor="oklch(0.85 0.09 252)" />
        </linearGradient>
        <linearGradient id="track-card" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#f1f4ff" />
        </linearGradient>
        <linearGradient id="track-route" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="oklch(0.46 0.17 252)" />
          <stop offset="100%" stopColor="oklch(0.62 0.17 252)" />
        </linearGradient>
      </defs>

      <rect width="600" height="480" rx="32" fill="url(#track-bg)" />

      {/* Phone frame */}
      <g transform="translate(170 70)">
        <rect
          width="260"
          height="380"
          rx="34"
          fill="oklch(0.18 0.02 250)"
          stroke="oklch(0.3 0.04 252)"
          strokeWidth="2"
        />
        <rect
          x="10"
          y="14"
          width="240"
          height="352"
          rx="22"
          fill="url(#track-card)"
        />
        <circle cx="130" cy="24" r="3" fill="oklch(0.18 0.02 250)" />

        {/* Map area */}
        <rect
          x="22"
          y="36"
          width="216"
          height="170"
          rx="14"
          fill="oklch(0.96 0.012 250)"
        />

        {/* Route line */}
        <path
          d="M 40 180 C 80 130, 110 110, 150 120 S 220 70, 230 50"
          fill="none"
          stroke="url(#track-route)"
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray="2 8"
        />
        <path
          d="M 40 180 C 80 130, 110 110, 150 120"
          fill="none"
          stroke="url(#track-route)"
          strokeWidth="4"
          strokeLinecap="round"
        />

        {/* Origin pin */}
        <circle cx="40" cy="180" r="7" fill="oklch(0.7 0.14 200)" />
        <circle cx="40" cy="180" r="3" fill="#fff" />

        {/* Current position pin */}
        <circle cx="150" cy="120" r="9" fill="oklch(0.46 0.17 252)" />
        <circle cx="150" cy="120" r="13" fill="oklch(0.46 0.17 252)" fillOpacity="0.25">
          <animate
            attributeName="r"
            values="13;22;13"
            dur="2.4s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="fill-opacity"
            values="0.35;0;0.35"
            dur="2.4s"
            repeatCount="indefinite"
          />
        </circle>

        {/* Destination pin */}
        <path
          d="M 230 36 L 222 50 L 230 50 L 226 64 L 240 46 L 232 46 Z"
          fill="oklch(0.65 0.18 30)"
        />

        {/* Status card */}
        <rect
          x="22"
          y="222"
          width="216"
          height="60"
          rx="12"
          fill="oklch(0.46 0.17 252)"
        />
        <rect x="34" y="236" width="120" height="10" rx="5" fill="rgba(255,255,255,0.8)" />
        <rect x="34" y="254" width="80" height="8" rx="4" fill="rgba(255,255,255,0.5)" />
        <circle cx="210" cy="252" r="14" fill="rgba(255,255,255,0.18)" />
        <path
          d="M 204 252 l 4 4 l 8 -8"
          fill="none"
          stroke="#fff"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Step rows */}
        {[0, 1, 2].map((i) => (
          <g key={i} transform={`translate(22 ${300 + i * 22})`}>
            <circle cx="10" cy="10" r="4" fill="oklch(0.62 0.17 252)" />
            <rect x="24" y="6" width={140 - i * 20} height="6" rx="3" fill="oklch(0.86 0.025 250)" />
            <rect x="24" y="18" width={70 - i * 8} height="4" rx="2" fill="oklch(0.92 0.012 250)" />
          </g>
        ))}
      </g>

      {/* Floating parcel icon */}
      <g transform="translate(70 90)">
        <rect width="78" height="78" rx="16" fill="#fff" />
        <rect width="78" height="78" rx="16" fill="oklch(0.46 0.17 252)" fillOpacity="0.08" />
        <path
          d="M 14 28 l 25 -14 l 25 14 v 30 l -25 14 l -25 -14 z"
          fill="none"
          stroke="oklch(0.46 0.17 252)"
          strokeWidth="3"
          strokeLinejoin="round"
        />
        <path
          d="M 14 28 l 25 14 l 25 -14"
          fill="none"
          stroke="oklch(0.46 0.17 252)"
          strokeWidth="3"
          strokeLinejoin="round"
        />
        <line
          x1="39"
          y1="42"
          x2="39"
          y2="72"
          stroke="oklch(0.46 0.17 252)"
          strokeWidth="3"
        />
      </g>

      {/* Floating chip */}
      <g transform="translate(440 320)">
        <rect width="120" height="48" rx="14" fill="#fff" />
        <circle cx="22" cy="24" r="9" fill="oklch(0.7 0.14 200)" />
        <path
          d="M 18 24 l 3 3 l 7 -7"
          fill="none"
          stroke="#fff"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <rect x="38" y="14" width="68" height="6" rx="3" fill="oklch(0.86 0.025 250)" />
        <rect x="38" y="26" width="46" height="6" rx="3" fill="oklch(0.92 0.012 250)" />
      </g>
    </svg>
  );
}

export function InternationalIllustration(props: IllustrationProps) {
  return (
    <svg
      viewBox="0 0 600 480"
      role="img"
      aria-label="International logistics network"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <defs>
        <linearGradient id="intl-bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="oklch(0.34 0.12 252)" />
          <stop offset="100%" stopColor="oklch(0.18 0.06 252)" />
        </linearGradient>
        <radialGradient id="intl-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="oklch(0.74 0.16 252)" stopOpacity="0.5" />
          <stop offset="100%" stopColor="oklch(0.46 0.17 252)" stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect width="600" height="480" rx="32" fill="url(#intl-bg)" />

      {/* Glow */}
      <circle cx="300" cy="240" r="200" fill="url(#intl-glow)" />

      {/* Globe */}
      <g transform="translate(120 60)">
        <circle
          cx="180"
          cy="180"
          r="170"
          fill="none"
          stroke="oklch(0.74 0.16 252)"
          strokeOpacity="0.35"
          strokeWidth="1.5"
        />
        <circle
          cx="180"
          cy="180"
          r="170"
          fill="oklch(0.21 0.05 252)"
          fillOpacity="0.5"
        />
        {/* Latitude lines */}
        {[60, 110, 160, 210, 260, 310].map((y, i) => (
          <ellipse
            key={i}
            cx="180"
            cy={y}
            rx={Math.sqrt(170 * 170 - (y - 180) * (y - 180))}
            ry="10"
            fill="none"
            stroke="oklch(0.7 0.14 252)"
            strokeOpacity="0.3"
            strokeWidth="1"
          />
        ))}
        {/* Longitude lines */}
        {[0, 1, 2, 3, 4].map((i) => (
          <ellipse
            key={i}
            cx="180"
            cy="180"
            rx={Math.abs(Math.cos((i * Math.PI) / 5)) * 170}
            ry="170"
            fill="none"
            stroke="oklch(0.7 0.14 252)"
            strokeOpacity="0.3"
            strokeWidth="1"
          />
        ))}

        {/* Connection nodes */}
        {[
          { x: 80, y: 110 },
          { x: 250, y: 90 },
          { x: 290, y: 220 },
          { x: 130, y: 250 },
          { x: 200, y: 160 },
        ].map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r="5" fill="oklch(0.85 0.12 95)" />
            <circle cx={p.x} cy={p.y} r="10" fill="oklch(0.85 0.12 95)" fillOpacity="0.25">
              <animate
                attributeName="r"
                values="10;18;10"
                dur={`${2 + i * 0.4}s`}
                repeatCount="indefinite"
              />
              <animate
                attributeName="fill-opacity"
                values="0.4;0;0.4"
                dur={`${2 + i * 0.4}s`}
                repeatCount="indefinite"
              />
            </circle>
          </g>
        ))}

        {/* Connection arcs */}
        <path
          d="M 80 110 Q 165 30 250 90"
          fill="none"
          stroke="oklch(0.85 0.12 95)"
          strokeWidth="2"
          strokeOpacity="0.6"
          strokeDasharray="4 6"
        />
        <path
          d="M 250 90 Q 320 150 290 220"
          fill="none"
          stroke="oklch(0.85 0.12 95)"
          strokeWidth="2"
          strokeOpacity="0.6"
          strokeDasharray="4 6"
        />
        <path
          d="M 290 220 Q 220 280 130 250"
          fill="none"
          stroke="oklch(0.85 0.12 95)"
          strokeWidth="2"
          strokeOpacity="0.6"
          strokeDasharray="4 6"
        />
        <path
          d="M 130 250 Q 80 180 80 110"
          fill="none"
          stroke="oklch(0.85 0.12 95)"
          strokeWidth="2"
          strokeOpacity="0.6"
          strokeDasharray="4 6"
        />
      </g>

      {/* Floating plane */}
      <g transform="translate(450 80) rotate(15)">
        <path
          d="M 0 12 l 12 -10 l 6 8 l 24 -6 l -2 14 l 22 0 l 4 8 l -22 0 l 2 14 l -24 -6 l -6 8 l -12 -10 z"
          fill="#fff"
          fillOpacity="0.9"
        />
      </g>
    </svg>
  );
}

export function SecurityIllustration(props: IllustrationProps) {
  return (
    <svg
      viewBox="0 0 600 480"
      role="img"
      aria-label="Secure parcel handling"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <defs>
        <linearGradient id="sec-bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="oklch(0.97 0.02 250)" />
          <stop offset="100%" stopColor="oklch(0.9 0.04 252)" />
        </linearGradient>
        <linearGradient id="sec-box" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="oklch(0.78 0.09 75)" />
          <stop offset="100%" stopColor="oklch(0.62 0.1 70)" />
        </linearGradient>
        <linearGradient id="sec-shield" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="oklch(0.62 0.17 252)" />
          <stop offset="100%" stopColor="oklch(0.46 0.17 252)" />
        </linearGradient>
      </defs>

      <rect width="600" height="480" rx="32" fill="url(#sec-bg)" />

      {/* Shadow under box */}
      <ellipse cx="300" cy="380" rx="170" ry="14" fill="oklch(0.18 0.02 250)" fillOpacity="0.12" />

      {/* Parcel box */}
      <g transform="translate(180 130)">
        {/* Sides */}
        <path
          d="M 0 80 L 120 30 L 240 80 L 240 220 L 120 270 L 0 220 Z"
          fill="url(#sec-box)"
        />
        <path
          d="M 0 80 L 120 130 L 240 80"
          fill="oklch(0.85 0.07 70)"
        />
        <path
          d="M 120 130 L 120 270"
          stroke="oklch(0.55 0.1 70)"
          strokeOpacity="0.3"
          strokeWidth="1.5"
        />

        {/* Tape */}
        <rect x="56" y="60" width="128" height="20" fill="oklch(0.96 0.04 250)" transform="skewY(-22)" />
        <rect x="56" y="60" width="128" height="20" fill="oklch(0.46 0.17 252)" fillOpacity="0.2" transform="skewY(-22)" />

        {/* Label */}
        <rect x="35" y="120" width="90" height="55" rx="4" fill="#ffffff" />
        <rect x="42" y="128" width="52" height="5" rx="2" fill="oklch(0.46 0.17 252)" />
        <rect x="42" y="138" width="76" height="3" rx="1" fill="oklch(0.86 0.025 250)" />
        <rect x="42" y="144" width="58" height="3" rx="1" fill="oklch(0.86 0.025 250)" />
        <rect x="42" y="155" width="40" height="14" rx="1" fill="oklch(0.18 0.02 250)" />
        {/* Barcode bars on label */}
        {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <rect
            key={i}
            x={44 + i * 4.2}
            y="156"
            width={i % 2 === 0 ? 1.2 : 2}
            height="12"
            fill="#fff"
          />
        ))}
      </g>

      {/* Shield with check */}
      <g transform="translate(380 60)">
        <path
          d="M 60 0 C 30 18 6 22 0 22 v 60 c 0 36 28 60 60 78 c 32 -18 60 -42 60 -78 v -60 c -6 0 -30 -4 -60 -22 z"
          fill="url(#sec-shield)"
        />
        <path
          d="M 60 0 C 30 18 6 22 0 22 v 60 c 0 36 28 60 60 78 c 32 -18 60 -42 60 -78 v -60 c -6 0 -30 -4 -60 -22 z"
          fill="#fff"
          fillOpacity="0.05"
        />
        <path
          d="M 38 80 l 16 16 l 30 -34"
          fill="none"
          stroke="#fff"
          strokeWidth="7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>

      {/* Floating dot pattern */}
      {[
        { x: 70, y: 90 },
        { x: 110, y: 380 },
        { x: 510, y: 320 },
        { x: 90, y: 260 },
      ].map((p, i) => (
        <circle
          key={i}
          cx={p.x}
          cy={p.y}
          r="4"
          fill="oklch(0.46 0.17 252)"
          fillOpacity="0.4"
        />
      ))}
      {[
        { x: 50, y: 150 },
        { x: 540, y: 90 },
        { x: 540, y: 240 },
        { x: 480, y: 410 },
      ].map((p, i) => (
        <circle key={`r-${i}`} cx={p.x} cy={p.y} r="2.5" fill="oklch(0.65 0.14 200)" />
      ))}
    </svg>
  );
}
