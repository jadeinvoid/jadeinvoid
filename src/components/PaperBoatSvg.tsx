import { motion } from 'motion/react'
import type { InlineSvgProps } from '../types'

export function PaperBoatSvg({ partMotion, transition }: InlineSvgProps) {
  return (
    <motion.svg
      viewBox="0 0 374 220"
      role="img"
      aria-label="Paper boat"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="boat-gradient" x1="187" y1="4" x2="187" y2="181" gradientUnits="userSpaceOnUse">
          <stop stopColor="#8bb2ff" />
          <stop offset="1" stopColor="#80609a" />
        </linearGradient>
      </defs>
      <motion.g
        animate={partMotion}
        transition={transition}
        style={{ transformOrigin: '184px 102px' }}
      >
        <path
          d="M91 102 179 9a7 7 0 0 1 10 0l87 93h67a7 7 0 0 1 6 10l-35 65a7 7 0 0 1-6 4H65a7 7 0 0 1-6-4l-35-65a7 7 0 0 1 6-10h61Z"
          fill="url(#boat-gradient)"
          stroke="currentColor"
          strokeWidth="10"
          strokeLinejoin="round"
        />
        <motion.path
          d="M184 101C167 87 143 48 184 7"
          fill="none"
          stroke="currentColor"
          strokeWidth="10"
          strokeLinecap="round"
        />
        <motion.path
          d="M184 101c17-14 40-53 0-94"
          fill="none"
          stroke="currentColor"
          strokeWidth="10"
          strokeLinecap="round"
        />
      </motion.g>
    </motion.svg>
  )
}
