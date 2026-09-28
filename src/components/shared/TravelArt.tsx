/** Abstract travel illustration — globe, flight paths, stamps. Pure SVG, no external assets. */
export function TravelArt({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 600 600" className={className} aria-hidden>
      <defs>
        <radialGradient id="ta-globe" cx="38%" cy="32%" r="75%">
          <stop offset="0" stopColor="#1c8a66" />
          <stop offset="0.55" stopColor="#0e5a43" />
          <stop offset="1" stopColor="#08362a" />
        </radialGradient>
        <linearGradient id="ta-gold" x1="0" x2="1">
          <stop offset="0" stopColor="#e9cf8b" />
          <stop offset="1" stopColor="#b98d33" />
        </linearGradient>
        <clipPath id="ta-clip">
          <circle cx="300" cy="300" r="170" />
        </clipPath>
      </defs>
      {/* orbits */}
      <circle cx="300" cy="300" r="250" fill="none" stroke="#ffffff" strokeOpacity=".07" />
      <circle cx="300" cy="300" r="210" fill="none" stroke="#ffffff" strokeOpacity=".1" strokeDasharray="2 8" />
      {/* globe */}
      <circle cx="300" cy="300" r="170" fill="url(#ta-globe)" />
      <g clipPath="url(#ta-clip)" fill="none" stroke="#ffffff" strokeOpacity=".16" strokeWidth="1.2">
        {[-120, -80, -40, 0, 40, 80, 120].map((y) => (
          <ellipse key={y} cx="300" cy={300 + y} rx={Math.sqrt(170 * 170 - y * y)} ry="10" />
        ))}
        {[40, 90, 140, 170].map((rx) => (
          <ellipse key={rx} cx="300" cy="300" rx={rx} ry="170" />
        ))}
        {/* land masses */}
        <path d="M205 215c30-18 70-10 88 8 12 12 4 30-14 34-20 5-26 22-44 24-22 3-46-10-50-30-3-16 6-28 20-36z" fill="#2fa479" fillOpacity=".45" stroke="none" />
        <path d="M330 190c26-6 58 4 70 22 10 16-2 30-20 30-14 0-22 14-38 12-20-2-30-22-26-38 2-12 4-22 14-26z" fill="#2fa479" fillOpacity=".4" stroke="none" />
        <path d="M300 330c20-6 44 4 50 22 6 20-8 44-28 52-18 7-36-6-40-24-4-20 0-44 18-50z" fill="#2fa479" fillOpacity=".4" stroke="none" />
        <path d="M400 300c16-4 36 6 40 20 4 16-10 28-26 26-16-2-28-14-26-28 1-8 4-16 12-18z" fill="#2fa479" fillOpacity=".35" stroke="none" />
      </g>
      <circle cx="300" cy="300" r="170" fill="none" stroke="#ffffff" strokeOpacity=".18" />
      {/* flight paths */}
      <path d="M120 420 C 200 250, 380 180, 500 150" fill="none" stroke="url(#ta-gold)" strokeWidth="2" strokeDasharray="6 8" strokeLinecap="round" />
      <path d="M90 250 C 220 330, 380 380, 520 360" fill="none" stroke="#ffffff" strokeOpacity=".35" strokeWidth="1.5" strokeDasharray="4 8" strokeLinecap="round" />
      {/* plane */}
      <g transform="translate(470 158) rotate(-18)">
        <path d="M-22 0 L18 -3 L26 0 L18 3 Z" fill="#ffffff" />
        <path d="M2 -2 L-8 -18 L-2 -18 L12 -2 Z M2 2 L-8 18 L-2 18 L12 2 Z" fill="#ffffff" />
        <path d="M-18 -1 L-24 -9 L-20 -9 L-12 -1 Z M-18 1 L-24 9 L-20 9 L-12 1 Z" fill="#ffffff" />
      </g>
      {/* pins */}
      {[
        [120, 420],
        [520, 360],
        [90, 250],
      ].map(([x, y]) => (
        <g key={`${x}-${y}`}>
          <circle cx={x} cy={y} r="12" fill="#e9cf8b" fillOpacity=".18" />
          <circle cx={x} cy={y} r="5" fill="#e9cf8b" />
        </g>
      ))}
      {/* stamp */}
      <g transform="translate(430 440) rotate(-12)" opacity=".85">
        <rect x="-62" y="-36" width="124" height="72" rx="10" fill="none" stroke="#e9cf8b" strokeWidth="2.5" />
        <rect x="-54" y="-28" width="108" height="56" rx="6" fill="none" stroke="#e9cf8b" strokeWidth="1" strokeDasharray="3 3" />
        <text x="0" y="-4" textAnchor="middle" fontFamily="Plus Jakarta Sans, sans-serif" fontSize="15" fontWeight="800" fill="#e9cf8b" letterSpacing="2">APPROVED</text>
        <text x="0" y="16" textAnchor="middle" fontFamily="Inter, sans-serif" fontSize="9" fill="#e9cf8b" letterSpacing="3">VISA · ENTRY</text>
      </g>
      {/* passport */}
      <g transform="translate(150 150) rotate(10)">
        <rect x="-44" y="-58" width="88" height="116" rx="10" fill="#0b3b2e" stroke="#e9cf8b" strokeOpacity=".6" />
        <circle cx="0" cy="-8" r="18" fill="none" stroke="#e9cf8b" strokeWidth="1.5" />
        <path d="M-18 -8h36M0 -26c7 6 7 30 0 36M0 -26c-7 6-7 30 0 36" fill="none" stroke="#e9cf8b" strokeWidth="1" />
        <text x="0" y="34" textAnchor="middle" fontFamily="Inter, sans-serif" fontSize="8" fill="#e9cf8b" letterSpacing="2.5">PASSPORT</text>
      </g>
    </svg>
  );
}
