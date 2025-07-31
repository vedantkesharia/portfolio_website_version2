"use client"
import { motion } from "framer-motion"
import type { ReactNode } from "react"

interface EnhancedStatsCardProps {
  value: string | number
  label: string
  icon: ReactNode
  delay: number
  isLoading: boolean
}

export const EnhancedStatsCard = ({ value, label, icon, delay, isLoading }: EnhancedStatsCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      whileHover={{ scale: 1.02, y: -2 }}
      className="group relative overflow-hidden"
    >
      {/* Subtle glow effect */}
      <div className="absolute -inset-0.5 bg-white/5 rounded-xl blur opacity-0 group-hover:opacity-100 transition duration-500" />

      {/* Main Card */}
      <div className="relative bg-gray-900/60 backdrop-blur-sm border border-gray-800 p-6 rounded-xl hover:border-gray-700 hover:bg-gray-900/80 transition-all duration-300">
        {/* Corner Decoration */}
        <div className="absolute top-0 right-0 w-12 h-12 bg-gradient-to-br from-white/5 to-transparent rounded-bl-2xl" />

        {/* Floating Particles */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          <div className="absolute top-3 right-4 w-1 h-1 bg-white/30 rounded-full animate-pulse" />
          <div className="absolute top-6 right-8 w-0.5 h-0.5 bg-white/20 rounded-full animate-pulse delay-300" />
          <div className="absolute bottom-4 left-6 w-1 h-1 bg-white/15 rounded-full animate-pulse delay-700" />
        </div>

        {/* Content */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex-1">
            <div className="text-3xl font-light text-white mb-2 tracking-tight">
              {isLoading ? (
                <div className="animate-pulse bg-gray-700/50 h-8 w-16 rounded" />
              ) : (
                <motion.span
                  initial={{ opacity: 0, scale: 0.5 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8, delay: delay + 0.2 }}
                >
                  {value}
                </motion.span>
              )}
            </div>
            <div className="text-sm text-gray-400 uppercase tracking-wider font-medium group-hover:text-gray-300 transition-colors duration-300">
              {label}
            </div>
          </div>

          <div className="text-gray-500 group-hover:text-gray-300 transition-colors duration-300">{icon}</div>
        </div>

        {/* Subtle inner glow */}
        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/2 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl" />
      </div>
    </motion.div>
  )
}

interface SpecialStatsCardProps {
  value: string | number
  label: string
  icon: ReactNode
  delay: number
  isLoading: boolean
}

export const SpecialStatsCard = ({ value, label, icon, delay, isLoading }: SpecialStatsCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay }}
      whileHover={{ scale: 1.02 }}
      className="group relative overflow-hidden"
    >
      {/* Subtle animated border */}
      <div className="absolute inset-0 bg-gradient-to-r from-gray-700/30 via-gray-600/30 to-gray-700/30 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      {/* Main Card */}
      <div className="relative bg-gray-900/70 backdrop-blur-sm border border-gray-700 p-8 rounded-xl m-0.5 hover:border-gray-600 transition-all duration-300">
        {/* Accent Line */}
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-gray-500 to-gray-700 rounded-l-xl" />

        {/* Floating Dots */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
          <div className="absolute top-4 right-6 w-2 h-2 bg-white/20 rounded-full animate-pulse" />
          <div className="absolute top-8 right-12 w-1 h-1 bg-white/15 rounded-full animate-pulse delay-500" />
          <div className="absolute bottom-6 right-8 w-1.5 h-1.5 bg-white/10 rounded-full animate-pulse delay-1000" />
        </div>

        {/* Content */}
        <div className="relative z-10 text-center">
          <div className="flex justify-center mb-4 text-gray-400 group-hover:text-gray-300 transition-colors duration-300">
            {icon}
          </div>

          <div className="text-4xl font-light text-white mb-3 tracking-tight">
            {isLoading ? (
              <div className="animate-pulse bg-gray-700/50 h-10 w-12 rounded mx-auto" />
            ) : (
              <motion.span
                initial={{ opacity: 0, scale: 0.5 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, delay: delay + 0.3 }}
              >
                {value}
              </motion.span>
            )}
          </div>

          <div className="text-sm text-gray-400 uppercase tracking-wider font-medium group-hover:text-gray-300 transition-colors duration-300">
            {label}
          </div>
        </div>

        {/* Subtle shimmer effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/3 to-transparent -skew-x-12 opacity-0 group-hover:opacity-100 group-hover:animate-pulse transition-opacity duration-700 rounded-xl" />
      </div>
    </motion.div>
  )
}
