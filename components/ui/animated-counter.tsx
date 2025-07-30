"use client"
import { motion, useInView } from "framer-motion"
import { useRef, useEffect, useState } from "react"

interface AnimatedCounterProps {
  end: number
  duration?: number
  suffix?: string
  prefix?: string
}

export const AnimatedCounter = ({ end, duration = 2, suffix = "", prefix = "" }: AnimatedCounterProps) => {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  useEffect(() => {
    if (isInView) {
      let startTime: number
      const animate = (currentTime: number) => {
        if (!startTime) startTime = currentTime
        const progress = Math.min((currentTime - startTime) / (duration * 1000), 1)
        setCount(Math.floor(progress * end))
        if (progress < 1) {
          requestAnimationFrame(animate)
        }
      }
      requestAnimationFrame(animate)
    }
  }, [isInView, end, duration])

  return (
    <motion.span ref={ref} className="font-bold text-2xl">
      {prefix}
      {count}
      {suffix}
    </motion.span>
  )
}
