"use client"
import { motion } from "framer-motion"

export function AuroraBackground({ className }: { className?: string }) {
  return (
    <div className={className}>
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -inset-10 opacity-50"
          animate={{
            background: [
              "radial-gradient(600px circle at 0% 0%, rgba(120, 119, 198, 0.3), transparent 50%)",
              "radial-gradient(600px circle at 100% 100%, rgba(120, 119, 198, 0.3), transparent 50%)",
              "radial-gradient(600px circle at 50% 50%, rgba(120, 119, 198, 0.3), transparent 50%)",
              "radial-gradient(600px circle at 0% 100%, rgba(120, 119, 198, 0.3), transparent 50%)",
              "radial-gradient(600px circle at 100% 0%, rgba(120, 119, 198, 0.3), transparent 50%)",
            ],
          }}
          transition={{
            duration: 20,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
        />
        <motion.div
          className="absolute -inset-10 opacity-30"
          animate={{
            background: [
              "radial-gradient(800px circle at 100% 0%, rgba(56, 189, 248, 0.2), transparent 50%)",
              "radial-gradient(800px circle at 0% 100%, rgba(56, 189, 248, 0.2), transparent 50%)",
              "radial-gradient(800px circle at 50% 50%, rgba(56, 189, 248, 0.2), transparent 50%)",
              "radial-gradient(800px circle at 100% 100%, rgba(56, 189, 248, 0.2), transparent 50%)",
              "radial-gradient(800px circle at 0% 0%, rgba(56, 189, 248, 0.2), transparent 50%)",
            ],
          }}
          transition={{
            duration: 25,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
        />
      </div>
    </div>
  )
}
