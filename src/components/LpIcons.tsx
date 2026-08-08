import { m as motion } from "framer-motion";

const INK = "#16130E";

interface IconProps {
  size?: number;
  stroke?: string;
  accent?: string;
  bg?: string;
  className?: string;
}

export function IconVideos({
  size = 32,
  stroke = INK,
  accent = "#7A2BF5",
  bg = "#fff",
  className,
}: IconProps) {
  return (
    <svg viewBox="0 0 48 48" width={size} height={size} className={className}>
      <motion.g
        style={{ originX: "9px", originY: "21px" }}
        animate={{ rotate: [0, -18, 0] }}
        transition={{ duration: 0.55, repeat: Infinity, repeatDelay: 2.4, ease: "easeInOut" }}
      >
        <rect x="8" y="12" width="32" height="9" rx="3" fill={bg} stroke={stroke} strokeWidth="4" />
        <path d="M15 13 L 12 20 M24 13 L 21 20 M33 13 L 30 20" stroke={stroke} strokeWidth="3" strokeLinecap="round" />
      </motion.g>
      <rect x="8" y="21" width="32" height="17" rx="3.5" fill={bg} stroke={stroke} strokeWidth="4" />
      <motion.path
        d="M21 25.5 L 28.5 29.5 L 21 33.5 Z"
        fill={accent}
        animate={{ scale: [1, 1.18, 1] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        style={{ originX: "24px", originY: "29.5px" }}
      />
    </svg>
  );
}

export function IconRelogio({
  size = 24,
  stroke = INK,
  accent = "#7A2BF5",
  bg = "#fff",
  className,
}: IconProps) {
  return (
    <svg viewBox="0 0 48 48" width={size} height={size} className={className}>
      <circle cx="24" cy="24" r="16" fill={bg} stroke={stroke} strokeWidth="4" />
      <path
        d="M24 11.5 L24 14 M36.5 24 L34 24 M24 36.5 L24 34 M11.5 24 L14 24"
        stroke={stroke}
        strokeWidth="2.6"
        strokeLinecap="round"
      />
      <motion.g
        style={{ originX: "24px", originY: "24px" }}
        animate={{ rotate: 360 }}
        transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
      >
        <path d="M24 24 L24 15.5" stroke={stroke} strokeWidth="3.2" strokeLinecap="round" />
      </motion.g>
      <path d="M24 24 L29.5 27" stroke={stroke} strokeWidth="3.2" strokeLinecap="round" />
      <circle cx="24" cy="24" r="2.4" fill={accent} />
    </svg>
  );
}

export function Starburst({
  size = 64,
  color = "#B9F227",
  className,
  spin = true,
}: {
  size?: number;
  color?: string;
  className?: string;
  spin?: boolean;
}) {
  return (
    <motion.svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      className={className}
      animate={spin ? { rotate: 360 } : undefined}
      transition={spin ? { duration: 32, repeat: Infinity, ease: "linear" } : undefined}
    >
      <path
        d="M62 32 L43.1 36.6 L53.2 53.2 L36.6 43.1 L32 62 L27.4 43.1 L10.8 53.2 L20.9 36.6 L2 32 L20.9 27.4 L10.8 10.8 L27.4 20.9 L32 2 L36.6 20.9 L53.2 10.8 L43.1 27.4 Z"
        fill={color}
      />
    </motion.svg>
  );
}
