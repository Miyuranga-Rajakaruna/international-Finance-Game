import { motion } from "motion/react";

/** Metaphorical "Debt Crisis Tree": roots -> branches -> bond pods -> contagion crown. */
export function DebtTree({ pods, stressed }: { pods: number; stressed?: boolean }) {
  const branches = [
    "M100 190 C 100 160, 70 150, 55 128",
    "M100 175 C 100 150, 132 142, 148 120",
    "M100 155 C 100 132, 68 118, 58 96",
    "M100 140 C 100 118, 134 104, 146 84",
    "M100 125 C 100 100, 100 88, 100 66",
  ];
  const podPos: [number, number][] = [
    [55, 128],
    [148, 120],
    [58, 96],
    [146, 84],
    [100, 66],
  ];
  const crown: [number, number][] = [
    [70, 40],
    [100, 26],
    [132, 42],
    [86, 58],
    [118, 58],
  ];

  return (
    <svg viewBox="0 0 200 220" className="h-full w-full" role="img" aria-label="Debt crisis tree">
      {/* roots */}
      <motion.g
        initial={{ opacity: 0.2 }}
        animate={{ opacity: pods > 0 ? 1 : 0.3 }}
        transition={{ duration: 0.8 }}
        stroke="var(--primary)"
        strokeWidth="1.2"
        fill="none"
        opacity={0.7}
      >
        <path d="M100 200 C 80 206, 62 210, 46 214" />
        <path d="M100 200 C 120 206, 140 210, 156 214" />
        <path d="M100 200 C 96 208, 92 212, 84 218" />
      </motion.g>

      {/* trunk */}
      <path
        d="M96 200 L96 130 Q100 120 104 130 L104 200 Z"
        fill={stressed ? "var(--destructive)" : "var(--muted-foreground)"}
        opacity={0.55}
      />

      {branches.map((d, i) => (
        <motion.path
          key={d}
          d={d}
          fill="none"
          stroke={i >= 3 && stressed ? "var(--destructive)" : "var(--muted-foreground)"}
          strokeWidth="2"
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: pods > i ? 1 : 0, opacity: pods > i ? 0.9 : 0 }}
          transition={{ duration: 0.9, delay: 0.15 * i }}
        />
      ))}

      {podPos.map(([x, y], i) => (
        <motion.g
          key={`pod-${x}-${y}`}
          initial={{ scale: 0, opacity: 0 }}
          animate={pods > i ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 14, delay: 0.4 + 0.15 * i }}
          style={{ transformOrigin: `${x}px ${y}px` }}
        >
          <rect
            x={x - 8}
            y={y - 6}
            width="16"
            height="12"
            rx="1"
            fill="var(--paper)"
            stroke="var(--primary)"
            strokeWidth="0.8"
          />
          <line x1={x - 5} y1={y - 2} x2={x + 5} y2={y - 2} stroke="var(--paper-foreground)" strokeWidth="0.7" />
          <line x1={x - 5} y1={y + 1} x2={x + 2} y2={y + 1} stroke="var(--paper-foreground)" strokeWidth="0.7" />
          <circle cx={x + 5} cy={y + 3} r="1.6" fill="var(--primary)" />
        </motion.g>
      ))}

      {/* contagion crown */}
      {pods >= 5 && (
        <motion.g
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, delay: 1 }}
        >
          {crown.map(([x, y], i, arr) => (
            <g key={`node-${x}-${y}`}>
              <circle cx={x} cy={y} r="3" fill="var(--primary)" />
              {arr.slice(i + 1).map(([x2, y2]) => (
                <line
                  key={`${x}-${x2}-${y2}`}
                  x1={x}
                  y1={y}
                  x2={x2}
                  y2={y2}
                  stroke="var(--primary)"
                  strokeWidth="0.5"
                  opacity="0.5"
                />
              ))}
            </g>
          ))}
        </motion.g>
      )}
    </svg>
  );
}