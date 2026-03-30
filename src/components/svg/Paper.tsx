// src/components/svg/Paper.tsx
// Cartoon glove paper (open hand, fingers spread) SVG icon per D-01.
// Rounded lines, exaggerated proportions, thick outlines, Mickey Mouse-like glove feel.

interface PaperIconProps {
  className?: string
}

export function PaperIcon({ className }: PaperIconProps) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="보"
      role="img"
    >
      {/* Wrist */}
      <rect
        x="34" y="75" width="32" height="18" rx="6"
        fill="#FFD89B" stroke="#333" strokeWidth="3"
      />
      {/* Palm */}
      <ellipse
        cx="50" cy="60" rx="22" ry="18"
        fill="#FFE4B5" stroke="#333" strokeWidth="3"
      />
      {/* Thumb (spread to the left) */}
      <ellipse
        cx="22" cy="52" rx="8" ry="12"
        fill="#FFE4B5" stroke="#333" strokeWidth="2.5"
        transform="rotate(25 22 52)"
      />
      {/* Index finger */}
      <rect
        x="28" y="18" width="10" height="30" rx="5"
        fill="#FFE4B5" stroke="#333" strokeWidth="2.5"
        transform="rotate(-5 33 33)"
      />
      {/* Middle finger */}
      <rect
        x="40" y="14" width="10" height="33" rx="5"
        fill="#FFE4B5" stroke="#333" strokeWidth="2.5"
      />
      {/* Ring finger */}
      <rect
        x="53" y="16" width="10" height="31" rx="5"
        fill="#FFE4B5" stroke="#333" strokeWidth="2.5"
        transform="rotate(5 58 31)"
      />
      {/* Pinky finger */}
      <rect
        x="64" y="22" width="9" height="26" rx="4.5"
        fill="#FFE4B5" stroke="#333" strokeWidth="2.5"
        transform="rotate(10 68 35)"
      />
      {/* Palm line details */}
      <path
        d="M36 58 Q50 52 64 58"
        stroke="#E8C888" strokeWidth="1.5" strokeLinecap="round" fill="none"
      />
      <path
        d="M38 65 Q50 60 62 65"
        stroke="#E8C888" strokeWidth="1.5" strokeLinecap="round" fill="none"
      />
    </svg>
  )
}
