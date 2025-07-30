"use client"
import { motion } from "framer-motion"

export const VKLogo = ({ className = "w-10 h-10" }: { className?: string }) => {
  return (
    <motion.div
      className={`${className} relative cursor-pointer`}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
    >
      <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="50%" stopColor="#e5e5e5" />
            <stop offset="100%" stopColor="#a3a3a3" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Outer circle with subtle glow */}
        <circle
          cx="50"
          cy="50"
          r="45"
          stroke="url(#logoGradient)"
          strokeWidth="2"
          fill="none"
          className="drop-shadow-lg"
          filter="url(#glow)"
        />

        {/* V letter - completely redesigned to be clearly a V */}
        <g>
          {/* Left stroke of V */}
          <path
            d="M25 25 L42 65"
            stroke="url(#logoGradient)"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          {/* Right stroke of V */}
          <path
            d="M58 25 L42 65"
            stroke="url(#logoGradient)"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </g>

        {/* K letter - positioned clearly separate from V */}
        <g>
          {/* Vertical line of K */}
          <path
            d="M65 25 L65 75"
            stroke="url(#logoGradient)"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          {/* Upper diagonal of K */}
          <path
            d="M65 45 L80 25"
            stroke="url(#logoGradient)"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          {/* Lower diagonal of K */}
          <path
            d="M65 45 L80 75"
            stroke="url(#logoGradient)"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </g>

        {/* Subtle inner glow effect */}
        <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />

        {/* Small decorative dots for extra elegance */}
        <circle cx="42" cy="67" r="1.5" fill="url(#logoGradient)" opacity="0.6" />
        <circle cx="65" cy="47" r="1.5" fill="url(#logoGradient)" opacity="0.6" />
      </svg>
    </motion.div>
  )
}
