"use client"
import { useScroll, motion, useTransform } from "framer-motion"
import { useRef } from "react"

interface TimelineEntry {
  title: string
  company: string
  period: string
  location: string
  description: string[]
  technologies: string[]
}

export const Timeline = ({ data }: { data: TimelineEntry[] }) => {
  const ref = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 10%", "end 50%"],
  })

  const heightTransform = useTransform(scrollYProgress, [0, 1], [0, 1])
  const opacityTransform = useTransform(scrollYProgress, [0, 0.1], [0, 1])

  // Extract year from period (e.g., "January 2025 – April 2025" -> "2025")
  // const getYearFromPeriod = (period: string) => {
  //   const match = period.match(/(\d{4})/)
  //   return match ? match[1] : period.split(" ")[0]
  // }

  return (
    <div className="w-full bg-transparent dark font-sans md:px-10" ref={containerRef}>
      <div className="max-w-7xl mx-auto py-20 px-4 md:px-8 lg:px-10">
        <div ref={ref} className="relative max-w-7xl mx-auto pb-20">
          {data.map((item, index) => (
            <div key={index} className="flex justify-start pt-10 md:pt-40 md:gap-10">
              <div className="sticky flex flex-col md:flex-row z-40 items-center top-40 self-start max-w-xs lg:max-w-sm md:w-full">
                <div className="h-10 absolute left-3 md:left-3 w-10 rounded-full bg-black dark:bg-white flex items-center justify-center">
                  <div className="h-4 w-4 rounded-full bg-neutral-200 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 p-2" />
                </div>
                <h3 className="hidden md:block text-xl md:pl-20 md:text-5xl font-bold text-neutral-500 dark:text-neutral-500">
                  {/* {getYearFromPeriod(item.period)} */}
                  {item.period.split(" - ")[0]}
                </h3>
              </div>

              <div className="relative pl-20 pr-4 md:pl-4 w-full">
                <h3 className="md:hidden block text-2xl mb-4 text-left font-bold text-neutral-500 dark:text-neutral-500">
                  {/* {getYearFromPeriod(item.period)} */}
                  {item.period.split(" - ")[0]}
                </h3>
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-white dark:bg-neutral-900 p-8 rounded-3xl shadow-lg border border-neutral-200 dark:border-neutral-800"
                >
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-2xl font-bold text-neutral-800 dark:text-white mb-2">{item.title}</h3>
                      <p className="text-lg text-neutral-600 dark:text-neutral-300 mb-1">{item.company}</p>
                      <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-1">{item.period}</p>
                      <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-4">{item.location}</p>
                    </div>

                    <div className="space-y-2">
                      {item.description.map((desc, descIndex) => (
                        <div key={descIndex} className="flex items-start gap-2">
                          <span className="text-neutral-500 dark:text-neutral-400 mt-1">•</span>
                          <p className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed">{desc}</p>
                        </div>
                      ))}
                    </div>

                    <div className="flex flex-wrap gap-2 mt-6">
                      {item.technologies.map((tech, techIndex) => (
                        <span
                          key={techIndex}
                          className="px-3 py-1 bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-xs rounded-full border border-neutral-200 dark:border-neutral-700"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          ))}

          {/* Timeline Base Line */}
          <div className="absolute md:left-8 left-8 top-0 w-[2px] h-full bg-gradient-to-b from-transparent via-neutral-200 dark:via-neutral-700 to-transparent">
            {/* Main Gradient Beam - Connected to Scroll */}
            <motion.div
              className="absolute inset-x-0 top-0 w-[2px] rounded-full origin-top"
              style={{
                scaleY: heightTransform,
                opacity: opacityTransform,
                background: "linear-gradient(to bottom, #60a5fa, #a855f7, #ec4899, #f97316)",
              }}
            />

            {/* Glowing Gradient Beam Effect */}
            <motion.div
              className="absolute inset-x-0 top-0 w-[6px] -ml-[2px] rounded-full origin-top blur-sm"
              style={{
                scaleY: heightTransform,
                opacity: opacityTransform,
                background:
                  "linear-gradient(to bottom, rgba(96, 165, 250, 0.5), rgba(168, 85, 247, 0.5), rgba(236, 72, 153, 0.5), rgba(249, 115, 22, 0.5))",
              }}
              animate={{
                opacity: [0.3, 0.8, 0.3],
              }}
              transition={{
                duration: 3,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}



// "use client"
// import { useScroll, motion } from "framer-motion"
// import { useRef } from "react"

// interface TimelineEntry {
//   title: string
//   company: string
//   period: string
//   location: string
//   description: string[]
//   technologies?: string[]
// }

// export const Timeline = ({ data }: { data: TimelineEntry[] }) => {
//   const ref = useRef<HTMLDivElement>(null)
//   const { scrollYProgress } = useScroll({
//     target: ref,
//     offset: ["start end", "center start"],
//   })

//   return (
//     <div ref={ref} className="relative max-w-7xl mx-auto py-20 px-4 md:px-8 lg:px-10">
//       {data.map((item, index) => (
//         <TimelineItem key={index} item={item} index={index} />
//       ))}
//     </div>
//   )
// }

// const TimelineItem = ({ item, index }: { item: TimelineEntry; index: number }) => {
//   return (
//     <div className="flex justify-start pt-10 md:pt-40 md:gap-10">
//       <div className="sticky flex flex-col md:flex-row z-40 items-center top-40 self-start max-w-xs lg:max-w-sm md:w-full">
//         <div className="h-10 absolute left-3 md:left-3 w-10 rounded-full bg-black dark:bg-white flex items-center justify-center">
//           <div className="h-4 w-4 rounded-full bg-neutral-200 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 p-2" />
//         </div>
//         <h3 className="hidden md:block text-xl md:pl-20 md:text-5xl font-bold text-neutral-500 dark:text-neutral-500">
//           {item.period.split(" – ")[0]}
//         </h3>
//       </div>

//       <div className="relative pl-20 pr-4 md:pl-4 w-full">
//         <h3 className="md:hidden block text-2xl mb-4 text-left font-bold text-neutral-500 dark:text-neutral-500">
//           {item.period.split(" – ")[0]}
//         </h3>
//         <motion.div
//           initial={{ opacity: 0, y: 50 }}
//           whileInView={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.5, delay: index * 0.1 }}
//           className="bg-white dark:bg-neutral-900 p-8 rounded-3xl shadow-lg border border-neutral-200 dark:border-neutral-800"
//         >
//           <div className="flex items-center justify-between mb-4">
//             <div>
//               <h4 className="text-2xl font-bold text-neutral-800 dark:text-neutral-200 mb-2">{item.title}</h4>
//               <p className="text-lg text-neutral-600 dark:text-neutral-400 mb-1">{item.company}</p>
//               <p className="text-sm text-neutral-500 dark:text-neutral-500">
//                 {item.location} • {item.period}
//               </p>
//             </div>
//           </div>

//           <div className="space-y-3 mb-6">
//             {item.description.map((desc, i) => (
//               <p key={i} className="text-neutral-700 dark:text-neutral-300 leading-relaxed">
//                 • {desc}
//               </p>
//             ))}
//           </div>

//           {item.technologies && (
//             <div className="flex flex-wrap gap-2">
//               {item.technologies.map((tech, i) => (
//                 <span
//                   key={i}
//                   className="px-3 py-1 bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-xs rounded-full border border-neutral-200 dark:border-neutral-700"
//                 >
//                   {tech}
//                 </span>
//               ))}
//             </div>
//           )}
//         </motion.div>
//       </div>
//     </div>
//   )
// }
