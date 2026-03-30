// src/components/svg/Scissors.tsx
// Cartoon glove scissors (V-sign / peace hand) SVG icon per D-01.
// Index and middle finger extended, others curled. Mickey Mouse-like glove feel.

interface ScissorsIconProps {
  className?: string
}

export function ScissorsIcon({ className }: ScissorsIconProps) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="가위"
      role="img"
    >
      {/* Wrist */}
      <rect
        x="34" y="75" width="32" height="18" rx="6"
        fill="#FFD89B" stroke="#333" strokeWidth="3"
      />
      {/* Palm */}
      <ellipse
        cx="50" cy="60" rx="20" ry="18"
        fill="#FFE4B5" stroke="#333" strokeWidth="3"
      />
      {/* Index finger (extended, angled left) */}
      <rect
        x="30" y="14" width="11" height="36" rx="5.5"
        fill="#FFE4B5" stroke="#333" strokeWidth="2.5"
        transform="rotate(-8 35 32)"
      />
      {/* Middle finger (extended, angled right) */}
      <rect
        x="52" y="14" width="11" height="36" rx="5.5"
        fill="#FFE4B5" stroke="#333" strokeWidth="2.5"
        transform="rotate(8 57 32)"
      />
      {/* Ring finger (curled) */}
      <ellipse
        cx="62" cy="50" rx="6" ry="8"
        fill="#FFD89B" stroke="#333" strokeWidth="2"
      />
      {/* Pinky finger (curled) */}
      <ellipse
        cx="70" cy="54" rx="5" ry="7"
        fill="#FFD89B" stroke="#333" strokeWidth="2"
      />
      {/* Thumb (curled over ring/pinky) */}
      <ellipse
        cx="34" cy="56" rx="8" ry="6"
        fill="#FFD89B" stroke="#333" strokeWidth="2.5"
        transform="rotate(-10 34 56)"
      />
      {/* V-gap highlight between fingers */}
      <path
        d="M42 28 L47 44 L52 28"
        stroke="#E8C888" strokeWidth="1.5" strokeLinecap="round" fill="none"
      />
    </svg>
  )
}
