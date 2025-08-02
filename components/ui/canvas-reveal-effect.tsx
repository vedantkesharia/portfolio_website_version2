"use client"
import { Code, BookOpen, Brain, Database, Cloud, Zap } from "lucide-react"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import type React from "react"
import { useEffect, useRef, useState } from "react"

export const CanvasRevealEffect = ({
  animationSpeed = 0.4,
  containerClassName,
  dotSize,
  showGradient = true,
}: {
  animationSpeed?: number
  containerClassName?: string
  dotSize?: number
  showGradient?: boolean
}) => {
  const [isAnimating, setIsAnimating] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const draw = () => {
    if (!canvasRef.current) return
    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight

    const imageData = ctx.createImageData(canvas.width, canvas.height)
    const pixelArr = imageData.data

    const cols = Math.floor(canvas.width / (dotSize || 4))
    const rows = Math.floor(canvas.height / (dotSize || 4))

    for (let col = 0; col < cols; col++) {
      for (let row = 0; row < rows; row++) {
        const currentRow = row
        const currentCol = col

        const x = currentCol * (dotSize || 4)
        const y = currentRow * (dotSize || 4)
      }
    }

    ctx.putImageData(imageData, 0, 0)
  }

  useEffect(() => {
    draw()
  }, [])

  return (
    <div ref={containerRef} className={cn("h-full relative bg-black w-full", containerClassName)}>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 z-10"
        onMouseEnter={() => {
          setIsAnimating(true)
        }}
        onMouseLeave={() => {
          setIsAnimating(false)
        }}
      />
      {showGradient && (
        <div className="h-full w-full bg-gradient-to-br from-black via-black to-neutral-800 absolute inset-0 z-5" />
      )}
    </div>
  )
}

export const Card = ({
  title,
  icon,
  children,
  revealText,
  techStack,
}: {
  title: string
  icon: React.ReactNode
  children?: React.ReactNode
  revealText?: string
  techStack?: string[]
}) => {
  const [hovered, setHovered] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [isInView, setIsInView] = useState(false)
  const [showContent, setShowContent] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768) // md breakpoint
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Intersection Observer for mobile animation
  useEffect(() => {
    if (!isMobile || !cardRef.current) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)
        }
      },
      {
        threshold: 0.3, // Trigger when 30% of the card is visible
        rootMargin: '0px 0px -50px 0px' // Start animation slightly before fully in view
      }
    )

    observer.observe(cardRef.current)

    return () => observer.disconnect()
  }, [isMobile])

  // Staggered animation for mobile
  useEffect(() => {
    if (!isMobile || !isInView) return

    // First show the background effect
    const backgroundTimer = setTimeout(() => {
      setHovered(true)
    }, 200)

    // Then show the content with a delay
    const contentTimer = setTimeout(() => {
      setShowContent(true)
    }, 800)

    return () => {
      clearTimeout(backgroundTimer)
      clearTimeout(contentTimer)
    }
  }, [isMobile, isInView])

  return (
    <div
      ref={cardRef}
      onMouseEnter={() => !isMobile && setHovered(true)}
      onMouseLeave={() => !isMobile && setHovered(false)}
      className="border border-black/[0.2] group/canvas-card flex items-center justify-center dark:border-white/[0.2] max-w-sm w-full mx-auto p-4 relative h-[30rem] relative"
    >
      <Icon className="absolute h-6 w-6 -top-3 -left-3 dark:text-white text-black z-30" />
      <Icon className="absolute h-6 w-6 -bottom-3 -left-3 dark:text-white text-black z-30" />
      <Icon className="absolute h-6 w-6 -top-3 -right-3 dark:text-white text-black z-30" />
      <Icon className="absolute h-6 w-6 -bottom-3 -right-3 dark:text-white text-black z-30" />

      <AnimatePresence>
        {hovered && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="h-full w-full absolute inset-0 z-10"
          >
            <CanvasRevealEffect
              animationSpeed={3}
              containerClassName="bg-emerald-900"
              dotSize={2}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-20">
        {/* Initial icon that's always visible on mobile, hidden on hover for desktop */}
        <div className={cn(
          "text-center transition-all duration-500 w-full mx-auto flex items-center justify-center",
          isMobile 
            ? showContent 
              ? "opacity-0 -translate-y-8 scale-75" 
              : "opacity-100 translate-y-0 scale-100"
            : "group-hover/canvas-card:-translate-y-4 group-hover/canvas-card:opacity-0"
        )}>
          {icon}
        </div>
        
        {/* Content that appears */}
        <div className={cn(
          "transition-all duration-700 ease-out",
          isMobile 
            ? showContent 
              ? "opacity-100 translate-y-0" 
              : "opacity-0 translate-y-4"
            : "opacity-0 group-hover/canvas-card:opacity-100 group-hover/canvas-card:translate-y-0"
        )}>
          <h2 className={cn(
            "dark:text-white text-xl relative z-10 text-black mt-4 font-bold text-center transition-all duration-500",
            isMobile 
              ? showContent 
                ? "text-white -translate-y-2" 
                : "translate-y-0"
              : "group-hover/canvas-card:text-white group-hover/canvas-card:-translate-y-2"
          )}>
            {title}
          </h2>
          
          <div className={cn(
            "relative z-10 mt-4 flex flex-col items-center transition-all duration-500 delay-100",
            isMobile 
              ? showContent 
                ? "text-white -translate-y-2" 
                : "translate-y-0"
              : "group-hover/canvas-card:text-white group-hover/canvas-card:-translate-y-2"
          )}>
            <p className="text-sm text-center mb-4">{revealText}</p>
            {/* Tech Stack */}
            {techStack && (
              <div className="flex flex-wrap gap-2 justify-center">
                {techStack.map((tech, index) => (
                  <motion.span
                    key={index}
                    initial={isMobile ? { opacity: 0, scale: 0.8 } : {}}
                    animate={isMobile && showContent ? { opacity: 1, scale: 1 } : {}}
                    transition={{ delay: index * 0.01, duration: 0.3 }}
                    className="px-3 py-1 bg-white/20 text-xs rounded-full border border-white/30 text-white"
                  >
                    {tech}
                  </motion.span>
                ))}
              </div>
            )}
          </div>
        </div>
        
        {/* Icon at the top that appears on content reveal */}
        <div className={cn(
          "absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-8 transition-all duration-500 delay-200",
          isMobile 
            ? showContent 
              ? "opacity-100 scale-100" 
              : "opacity-0 scale-75"
            : "opacity-0 group-hover/canvas-card:opacity-100 group-hover/canvas-card:scale-100"
        )}>
          {icon}
        </div>
      </div>
    </div>
  )
}

const Icon = ({ className, ...rest }: any) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth="1.5"
      stroke="currentColor"
      className={className}
      {...rest}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m6-6H6" />
    </svg>
  )
}

const AnimatePresence = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>
}






//correct code only phone view issues
// "use client"
// import { cn } from "@/lib/utils"
// import { motion } from "framer-motion"
// import type React from "react"
// import { useEffect, useRef, useState } from "react"

// export const CanvasRevealEffect = ({
//   animationSpeed = 0.4,
//   // opacities = [0.3, 0.3, 0.3, 0.5, 0.5, 0.5, 0.8, 0.8, 0.8, 1],
//   // colors = [[0, 255, 255]],
//   containerClassName,
//   dotSize,
//   showGradient = true,
// }: {
//   animationSpeed?: number
//   // opacities?: number[]
//   // colors?: number[][]
//   containerClassName?: string
//   dotSize?: number
//   showGradient?: boolean
// }) => {
//   const [isAnimating, setIsAnimating] = useState(false)
//   const canvasRef = useRef<HTMLCanvasElement>(null)
//   const containerRef = useRef<HTMLDivElement>(null)

//   const draw = () => {
//     if (!canvasRef.current) return
//     const canvas = canvasRef.current
//     const ctx = canvas.getContext("2d")
//     if (!ctx) return

//     canvas.width = canvas.offsetWidth
//     canvas.height = canvas.offsetHeight

//     const imageData = ctx.createImageData(canvas.width, canvas.height)
//     const pixelArr = imageData.data

//     const cols = Math.floor(canvas.width / (dotSize || 4))
//     const rows = Math.floor(canvas.height / (dotSize || 4))

//     for (let col = 0; col < cols; col++) {
//       for (let row = 0; row < rows; row++) {
//         const currentRow = row
//         const currentCol = col

//         // const color = colors[Math.floor(Math.random() * colors.length)]
//         // const opacity = opacities[Math.floor(Math.random() * opacities.length)]

//         const x = currentCol * (dotSize || 4)
//         const y = currentRow * (dotSize || 4)

//         // for (let i = 0; i < (dotSize || 4); i++) {
//         //   for (let j = 0; j < (dotSize || 4); j++) {
//         //     const index = ((y + j) * canvas.width + (x + i)) * 4
//         //     pixelArr[index] = color[0]
//         //     pixelArr[index + 1] = color[1]
//         //     pixelArr[index + 2] = color[2]
//         //     pixelArr[index + 3] = opacity * 255
//         //   }
//         // }
//       }
//     }

//     ctx.putImageData(imageData, 0, 0)
//   }

//   useEffect(() => {
//     draw()
//   }, [])

//   return (
//     <div ref={containerRef} className={cn("h-full relative bg-black w-full", containerClassName)}>
//       <canvas
//         ref={canvasRef}
//         className="absolute inset-0 z-10"
//         onMouseEnter={() => {
//           setIsAnimating(true)
//         }}
//         onMouseLeave={() => {
//           setIsAnimating(false)
//         }}
//       />
//       {showGradient && (
//         <div className="h-full w-full bg-gradient-to-br from-black via-black to-neutral-800 absolute inset-0 z-5" />
//       )}
//     </div>
//   )
// }

// export const Card = ({
//   title,
//   icon,
//   children,
//   revealText,
//   techStack,
// }: {
//   title: string
//   icon: React.ReactNode
//   children?: React.ReactNode
//   revealText?: string
//   techStack?: string[]
// }) => {
//   const [hovered, setHovered] = useState(false)
//   return (
//     <div
//       onMouseEnter={() => setHovered(true)}
//       onMouseLeave={() => setHovered(false)}
//       className="border border-black/[0.2] group/canvas-card flex items-center justify-center dark:border-white/[0.2] max-w-sm w-full mx-auto p-4 relative h-[30rem] relative"
//     >
//       <Icon className="absolute h-6 w-6 -top-3 -left-3 dark:text-white text-black z-30" />
//       <Icon className="absolute h-6 w-6 -bottom-3 -left-3 dark:text-white text-black z-30" />
//       <Icon className="absolute h-6 w-6 -top-3 -right-3 dark:text-white text-black z-30" />
//       <Icon className="absolute h-6 w-6 -bottom-3 -right-3 dark:text-white text-black z-30" />

//       <AnimatePresence>
//         {hovered && (
//           <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full w-full absolute inset-0 z-10">
//             <CanvasRevealEffect
//               animationSpeed={3}
//               containerClassName="bg-emerald-900"
//               // colors={[
//               //   [236, 72, 153],
//               //   [232, 121, 249],
//               // ]}
//               dotSize={2}
//             />
//           </motion.div>
//         )}
//       </AnimatePresence>

//       <div className="relative z-20">
//         <div className="text-center group-hover/canvas-card:-translate-y-4 group-hover/canvas-card:opacity-0 transition duration-200 w-full mx-auto flex items-center justify-center">
//           {icon}
//         </div>
//         <h2 className="dark:text-white text-xl opacity-0 group-hover/canvas-card:opacity-100 relative z-10 text-black mt-4 font-bold group-hover/canvas-card:text-white group-hover/canvas-card:-translate-y-2 transition duration-200 text-center">
//           {title}
//         </h2>
//         <div className="opacity-0 group-hover/canvas-card:opacity-100 relative z-10 mt-4 group-hover/canvas-card:text-white group-hover/canvas-card:-translate-y-2 transition duration-200 flex flex-col items-center">
//           <p className="text-sm text-center mb-4">{revealText}</p>
//           {/* Tech Stack */}
//           {techStack && (
//             <div className="flex flex-wrap gap-2 justify-center">
//               {techStack.map((tech, index) => (
//                 <span
//                   key={index}
//                   className="px-3 py-1 bg-white/20 text-xs rounded-full border border-white/30 text-white"
//                 >
//                   {tech}
//                 </span>
//               ))}
//             </div>
//           )}
//         </div>
        
//         {/* Add the icon at the top on hover */}
//         <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-8 opacity-0 group-hover/canvas-card:opacity-100 transition duration-200">
//           {icon}
//         </div>
//       </div>
//     </div>
//   )
// }

// const Icon = ({ className, ...rest }: any) => {
//   return (
//     <svg
//       xmlns="http://www.w3.org/2000/svg"
//       fill="none"
//       viewBox="0 0 24 24"
//       strokeWidth="1.5"
//       stroke="currentColor"
//       className={className}
//       {...rest}
//     >
//       <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m6-6H6" />
//     </svg>
//   )
// }

// const AnimatePresence = ({ children }: { children: React.ReactNode }) => {
//   return <>{children}</>
// }





// "use client"
// import { cn } from "@/lib/utils"
// import { motion } from "framer-motion"
// import type React from "react"
// import { useEffect, useRef, useState } from "react"

// export const CanvasRevealEffect = ({
//   animationSpeed = 0.4,
//   // opacities = [0.3, 0.3, 0.3, 0.5, 0.5, 0.5, 0.8, 0.8, 0.8, 1],
//   // colors = [[0, 255, 255]],
//   containerClassName,
//   dotSize,
//   showGradient = true,
// }: {
//   animationSpeed?: number
//   // opacities?: number[]
//   // colors?: number[][]
//   containerClassName?: string
//   dotSize?: number
//   showGradient?: boolean
// }) => {
//   const [isAnimating, setIsAnimating] = useState(false)
//   const canvasRef = useRef<HTMLCanvasElement>(null)
//   const containerRef = useRef<HTMLDivElement>(null)

//   const draw = () => {
//     if (!canvasRef.current) return
//     const canvas = canvasRef.current
//     const ctx = canvas.getContext("2d")
//     if (!ctx) return

//     canvas.width = canvas.offsetWidth
//     canvas.height = canvas.offsetHeight

//     const imageData = ctx.createImageData(canvas.width, canvas.height)
//     const pixelArr = imageData.data

//     const cols = Math.floor(canvas.width / (dotSize || 4))
//     const rows = Math.floor(canvas.height / (dotSize || 4))

//     for (let col = 0; col < cols; col++) {
//       for (let row = 0; row < rows; row++) {
//         const currentRow = row
//         const currentCol = col

//         // const color = colors[Math.floor(Math.random() * colors.length)]
//         // const opacity = opacities[Math.floor(Math.random() * opacities.length)]

//         const x = currentCol * (dotSize || 4)
//         const y = currentRow * (dotSize || 4)

//         // for (let i = 0; i < (dotSize || 4); i++) {
//         //   for (let j = 0; j < (dotSize || 4); j++) {
//         //     const index = ((y + j) * canvas.width + (x + i)) * 4
//         //     pixelArr[index] = color[0]
//         //     pixelArr[index + 1] = color[1]
//         //     pixelArr[index + 2] = color[2]
//         //     pixelArr[index + 3] = opacity * 255
//         //   }
//         // }
//       }
//     }

//     ctx.putImageData(imageData, 0, 0)
//   }

//   useEffect(() => {
//     draw()
//   }, [])

//   return (
//     <div ref={containerRef} className={cn("h-full relative bg-black w-full", containerClassName)}>
//       <canvas
//         ref={canvasRef}
//         className="absolute inset-0 z-20"
//         onMouseEnter={() => {
//           setIsAnimating(true)
//         }}
//         onMouseLeave={() => {
//           setIsAnimating(false)
//         }}
//       />
//       {showGradient && (
//         <div className="h-full w-full bg-gradient-to-br from-black via-black to-neutral-800 absolute inset-0 z-10" />
//       )}
//     </div>
//   )
// }

// export const Card = ({
//   title,
//   icon,
//   children,
//   revealText,
//   techStack,
// }: {
//   title: string
//   icon: React.ReactNode
//   children?: React.ReactNode
//   revealText?: string
//   techStack?: string[]
// }) => {
//   const [hovered, setHovered] = useState(false)
//   return (
//     <div
//       onMouseEnter={() => setHovered(true)}
//       onMouseLeave={() => setHovered(false)}
//       className="border border-black/[0.2] group/canvas-card flex items-center justify-center dark:border-white/[0.2] max-w-sm w-full mx-auto p-4 relative h-[30rem] relative"
//     >
//       <Icon className="absolute h-6 w-6 -top-3 -left-3 dark:text-white text-black" />
//       <Icon className="absolute h-6 w-6 -bottom-3 -left-3 dark:text-white text-black" />
//       <Icon className="absolute h-6 w-6 -top-3 -right-3 dark:text-white text-black" />
//       <Icon className="absolute h-6 w-6 -bottom-3 -right-3 dark:text-white text-black" />

//       <AnimatePresence>
//         {hovered && (
//           <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full w-full absolute inset-0">
//             <CanvasRevealEffect
//               animationSpeed={3}
//               containerClassName="bg-emerald-900"
//               // colors={[
//               //   [236, 72, 153],
//               //   [232, 121, 249],
//               // ]}
//               dotSize={2}
//             />
//           </motion.div>
//         )}
//       </AnimatePresence>

//       <div className="relative z-20">
//         <div className="text-center group-hover/canvas-card:-translate-y-4 group-hover/canvas-card:opacity-0 transition duration-200 w-full mx-auto flex items-center justify-center">
//           {icon}
//         </div>
//         <h2 className="dark:text-white text-xl opacity-0 group-hover/canvas-card:opacity-100 relative z-10 text-black mt-4 font-bold group-hover/canvas-card:text-white group-hover/canvas-card:-translate-y-2 transition duration-200 text-center">
//           {title}
//         </h2>
//         <div className="opacity-0 group-hover/canvas-card:opacity-100 relative z-10 mt-4 group-hover/canvas-card:text-white group-hover/canvas-card:-translate-y-2 transition duration-200 flex flex-col items-center">
//           <p className="text-sm text-center mb-4">{revealText}</p>
//           {/* Tech Stack */}
//           {techStack && (
//             <div className="flex flex-wrap gap-2 justify-center">
//               {techStack.map((tech, index) => (
//                 <span
//                   key={index}
//                   className="px-3 py-1 bg-white/20 text-xs rounded-full border border-white/30 text-white"
//                 >
//                   {tech}
//                 </span>
//               ))}
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   )
// }

// const Icon = ({ className, ...rest }: any) => {
//   return (
//     <svg
//       xmlns="http://www.w3.org/2000/svg"
//       fill="none"
//       viewBox="0 0 24 24"
//       strokeWidth="1.5"
//       stroke="currentColor"
//       className={className}
//       {...rest}
//     >
//       <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m6-6H6" />
//     </svg>
//   )
// }

// const AnimatePresence = ({ children }: { children: React.ReactNode }) => {
//   return <>{children}</>
// }






// "use client";
// import React, { useState, useRef } from "react";
// import { motion } from "framer-motion";
// import { cn } from "@/lib/utils";

// interface CardProps {
//   title: string;
//   icon: React.ReactNode;
//   revealText: string;
//   techStack: string[];
//   model3D: React.ReactNode;
//   children?: React.ReactNode;
//   className?: string;
// }

// export const Card: React.FC<CardProps> = ({
//   title,
//   icon,
//   revealText,
//   techStack,
//   model3D,
//   children,
//   className,
// }) => {
//   const [hovered, setHovered] = useState(false);
//   const divRef = useRef<HTMLDivElement>(null);

//   return (
//     <div
//       onMouseEnter={() => setHovered(true)}
//       onMouseLeave={() => setHovered(false)}
//       ref={divRef}
//       className={cn(
//         "border border-black/[0.2] group/canvas-card flex items-center justify-center dark:border-white/[0.2] max-w-sm w-full mx-auto p-4 relative h-[30rem] cursor-pointer",
//         className
//       )}
//     >
//       <Icon className="absolute h-6 w-6 -top-3 -left-3 dark:text-white text-black" />
//       <Icon className="absolute h-6 w-6 -bottom-3 -left-3 dark:text-white text-black" />
//       <Icon className="absolute h-6 w-6 -top-3 -right-3 dark:text-white text-black" />
//       <Icon className="absolute h-6 w-6 -bottom-3 -right-3 dark:text-white text-black" />

//       <AnimatePresence>
//         {hovered && (
//           <motion.div
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0 }}
//             className="h-full w-full absolute inset-0"
//           >
//             {children}
//           </motion.div>
//         )}
//       </AnimatePresence>

//       <div className="relative z-20">
//         <div className="text-center group-hover/canvas-card:-translate-y-4 absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] group-hover/canvas-card:opacity-0 transition duration-200 w-full mx-auto flex items-center justify-center">
//           <div className="flex flex-col items-center">
//             {icon}
//             <h2 className="dark:text-white text-xl opacity-0 group-hover/canvas-card:opacity-100 relative z-10 text-black mt-4 font-bold group-hover/canvas-card:text-white group-hover/canvas-card:-translate-y-2 transition duration-200">
//               {title}
//             </h2>
//           </div>
//         </div>
        
//         <div className="dark:text-white text-sm opacity-0 group-hover/canvas-card:opacity-100 relative z-10 text-black mt-4 group-hover/canvas-card:text-white group-hover/canvas-card:-translate-y-2 transition duration-200 text-center">
//           <p className="mb-4 text-white">{revealText}</p>
//           <div className="flex flex-wrap gap-2 justify-center">
//             {techStack.map((tech, index) => (
//               <span
//                 key={index}
//                 className="px-2 py-1 bg-white/20 text-xs rounded-full border border-white/30"
//               >
//                 {tech}
//               </span>
//             ))}
//           </div>
//           <div className="mt-4 opacity-30">
//             {model3D}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// const Icon = ({ className, ...rest }: any) => {
//   return (
//     <svg
//       xmlns="http://www.w3.org/2000/svg"
//       fill="none"
//       viewBox="0 0 24 24"
//       strokeWidth="1.5"
//       stroke="currentColor"
//       className={className}
//       {...rest}
//     >
//       <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m6-6H6" />
//     </svg>
//   );
// };

// // Add AnimatePresence import if not already imported
// import { AnimatePresence } from "framer-motion";