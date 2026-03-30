// src/components/svg/Rock.tsx
// Cartoon glove rock (closed fist) SVG icon per D-01.
// Rounded lines, exaggerated proportions, thick outlines, Mickey Mouse-like glove feel.

interface RockIconProps {
  className?: string
}

export function RockIcon({ className }: RockIconProps) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="바위"
      role="img"
    >
      {/* Wrist / arm base */}
      <rect
        x="32" y="70" width="36" height="20" rx="6"
        fill="#FFD89B" stroke="#333" strokeWidth="3"
      />
      {/* Main fist body */}
      <ellipse
        cx="50" cy="52" rx="28" ry="22"
        fill="#FFE4B5" stroke="#333" strokeWidth="3.5"
      />
      {/* Knuckle bumps */}
      <circle cx="32" cy="40" r="7" fill="#FFE4B5" stroke="#333" strokeWidth="2.5" />
      <circle cx="44" cy="35" r="7.5" fill="#FFE4B5" stroke="#333" strokeWidth="2.5" />
      <circle cx="57" cy="35" r="7.5" fill="#FFE4B5" stroke="#333" strokeWidth="2.5" />
      <circle cx="69" cy="40" r="7" fill="#FFE4B5" stroke="#333" strokeWidth="2.5" />
      {/* Thumb wrapped around */}
      <ellipse
        cx="28" cy="58" rx="10" ry="7"
        fill="#FFD89B" stroke="#333" strokeWidth="2.5"
        transform="rotate(-15 28 58)"
      />
      {/* Shadow under knuckles */}
      <path
        d="M30 48 Q50 42 70 48"
        stroke="#E8C888" strokeWidth="2" strokeLinecap="round" fill="none"
      />
    </svg>
  )
}
