"use client";
import { useState, useEffect } from "react";
import { ChevronDown, Github, Linkedin, Mail, Code } from "lucide-react";
import { Spotlight } from "@/components/ui/spotlight";
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";
import { BackgroundBeams } from "@/components/ui/background-beams";
import { Sparkles } from "@/components/ui/sparkles";
import { FloatingDots } from "@/components/ui/floating-dots";
import { Globe } from "@/components/ui/globe";
import { AuroraBackground } from "../ui/aurora-background";

export function HeroSection() {
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <section
      id="home"
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
    >
      <AuroraBackground className="absolute inset-0" />
      {/* Custom Cursor */}
      <div
        className="fixed w-6 h-6 bg-white rounded-full pointer-events-none z-50 mix-blend-difference transition-transform duration-150 ease-out"
        style={{
          left: mousePosition.x - 12,
          top: mousePosition.y - 12,
          transform: "scale(1.5)",
        }}
      />

      {/* Background Effects */}
      <BackgroundBeams className="absolute inset-0" />
      <Sparkles className="absolute inset-0 opacity-60" />
      <FloatingDots className="absolute inset-0 opacity-40" />
      <Spotlight
        className="-top-40 left-0 md:left-60 md:-top-20"
        fill="white"
      />

      {/* 3D Globe */}
      {/* <div className="absolute right-10 top-1/2 transform -translate-y-1/2 hidden lg:block">
        <Globe className="opacity-30" />
      </div> */}

      <div className="relative z-10 text-center max-w-4xl mx-auto px-6 pt-32">
        <div className="space-y-8">
          <div className="text-lg text-gray-400 mb-6 animate-fade-in">
            Hello, I'm
          </div>
          <h1 className="text-6xl md:text-8xl font-bold leading-tight">
            <span className="block transform hover:scale-105 transition-transform duration-700">
              Vedant
            </span>
            <span className="block bg-gradient-to-r from-white via-gray-300 to-white bg-clip-text text-transparent">
              Kesharia
            </span>
          </h1>
          <h2 className="text-2xl md:text-3xl text-gray-300 font-light mb-8">
            Full-Stack AI Engineer & Researcher
          </h2>
          <TextGenerateEffect
            words="Building intelligent systems with cutting-edge AI/ML, full-stack development, and DevOps expertise"
            className="text-xl md:text-2xl text-gray-400 max-w-2xl mx-auto"
          />
          <div className="flex justify-center space-x-6 pt-8">
            <a
              href="https://github.com/vedantkesharia"
              target="_blank"
              rel="noopener noreferrer"
              className="group cursor-pointer transform hover:scale-110 transition-all duration-300"
            >
              <Github className="w-8 h-8 text-gray-400 group-hover:text-white transition-colors duration-300" />
            </a>
            <a
              href="https://www.linkedin.com/in/vedant-kesharia-556603235/"
              target="_blank"
              rel="noopener noreferrer"
              className="group cursor-pointer transform hover:scale-110 transition-all duration-300"
            >
              <Linkedin className="w-8 h-8 text-gray-400 group-hover:text-white transition-colors duration-300" />
            </a>
            <a
              href="mailto:keshariavedant@gmail.com"
              className="group cursor-pointer transform hover:scale-110 transition-all duration-300"
            >
              <Mail className="w-8 h-8 text-gray-400 group-hover:text-white transition-colors duration-300" />
            </a>
            <a
              href="https://leetcode.com/your-username"
              target="_blank"
              rel="noopener noreferrer"
              className="group cursor-pointer transform hover:scale-110 transition-all duration-300"
            >
              <Code className="w-8 h-8 text-gray-400 group-hover:text-white transition-colors duration-300" />
            </a>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <ChevronDown className="w-8 h-8 text-gray-400" />
      </div>
    </section>
  );
}

// "use client"
// import { useState, useEffect } from "react"
// import { ChevronDown, Github, Linkedin, Mail } from "lucide-react"
// import { Spotlight } from "@/components/ui/spotlight"
// import { TextGenerateEffect } from "@/components/ui/text-generate-effect"
// import { BackgroundBeams } from "@/components/ui/background-beams"
// import { Particles } from "@/components/ui/particles"

// export function HeroSection() {
//   const [mousePosition, setMousePosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 })

//   useEffect(() => {
//     const handleMouseMove = (e: MouseEvent) => {
//       setMousePosition({ x: e.clientX, y: e.clientY })
//     }

//     window.addEventListener("mousemove", handleMouseMove)
//     return () => window.removeEventListener("mousemove", handleMouseMove)
//   }, [])

//   return (
//     <section id="home" className="min-h-screen flex items-center justify-center relative overflow-hidden">
//       {/* Custom Cursor */}
//       <div
//         className="fixed w-6 h-6 bg-white rounded-full pointer-events-none z-50 mix-blend-difference transition-transform duration-150 ease-out"
//         style={{
//           left: mousePosition.x - 12,
//           top: mousePosition.y - 12,
//           transform: "scale(1.5)",
//         }}
//       />

//       <BackgroundBeams className="absolute inset-0" />
//       <Particles />
//       <Spotlight className="-top-40 left-0 md:left-60 md:-top-20" fill="white" />

//       <div className="relative z-10 text-center max-w-4xl mx-auto px-6 pt-32">
//         <div className="space-y-8">
//           <div className="text-lg text-gray-400 mb-6 animate-fade-in">Hello, I'm</div>
//           <h1 className="text-6xl md:text-8xl font-bold leading-tight">
//             <span className="block transform hover:scale-105 transition-transform duration-700">Vedant</span>
//             <span className="block bg-gradient-to-r from-white via-gray-300 to-white bg-clip-text text-transparent">
//               Kesharia
//             </span>
//           </h1>
//           <h2 className="text-2xl md:text-3xl text-gray-300 font-light mb-8">Full-Stack AI Engineer & Researcher</h2>
//           <TextGenerateEffect
//             words="Building intelligent systems with cutting-edge AI/ML, full-stack development, and DevOps expertise"
//             className="text-xl md:text-2xl text-gray-400 max-w-2xl mx-auto"
//           />
//           <div className="flex justify-center space-x-6 pt-8">
//             <a
//               href="https://github.com/vedantkesharia"
//               target="_blank"
//               rel="noopener noreferrer"
//               className="group cursor-pointer transform hover:scale-110 transition-all duration-300"
//             >
//               <Github className="w-8 h-8 text-gray-400 group-hover:text-white transition-colors duration-300" />
//             </a>
//             <a
//               href="https://www.linkedin.com/in/vedant-kesharia-556603235/"
//               target="_blank"
//               rel="noopener noreferrer"
//               className="group cursor-pointer transform hover:scale-110 transition-all duration-300"
//             >
//               <Linkedin className="w-8 h-8 text-gray-400 group-hover:text-white transition-colors duration-300" />
//             </a>
//             <a
//               href="mailto:keshariavedant@gmail.com"
//               className="group cursor-pointer transform hover:scale-110 transition-all duration-300"
//             >
//               <Mail className="w-8 h-8 text-gray-400 group-hover:text-white transition-colors duration-300" />
//             </a>
//           </div>
//         </div>
//       </div>

//       {/* Scroll Indicator */}
//       <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
//         <ChevronDown className="w-8 h-8 text-gray-400" />
//       </div>
//     </section>
//   )
// }
