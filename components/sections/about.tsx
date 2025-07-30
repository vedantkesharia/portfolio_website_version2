"use client"
import { motion } from "framer-motion"
import { FloatingElements } from "@/components/ui/floating-elements"
import { AnimatedCounter } from "@/components/ui/animated-counter"
import { GraduationCap, Award, Code, BookOpen } from "lucide-react"

export function AboutSection() {
  const scrollToSection = (sectionId: string) => {
    document.getElementById(sectionId)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    })
  }

  const stats = [
    { label: "Research Papers", value: 7, suffix: "+" },
    { label: "Hackathon Wins", value: 5, suffix: "" },
    { label: "Years Experience", value: 3, suffix: "+" },
    { label: "Projects Built", value: 20, suffix: "+" },
  ]

  return (
    <section id="about" className="py-20 relative overflow-hidden">
      <FloatingElements />
      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <h2 className="text-5xl font-bold mb-8 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              About Me
            </h2>

            <div className="space-y-6 text-lg text-gray-300 leading-relaxed">
              <p>
                I'm a passionate Full-Stack AI Engineer pursuing my Master's in Computer Science at University of
                Colorado Boulder. I specialize in building intelligent systems that bridge the gap between cutting-edge
                AI research and practical applications.
              </p>
              <p>
                With extensive experience in AI/ML research, full-stack development, and DevOps, I've contributed to
                groundbreaking projects at USC, IIT Patna, and leading tech companies. My work spans from digital
                phenotyping for mental health to automated document processing systems.
              </p>
            </div>

            {/* Education Section */}
            <div className="space-y-4">
              <h3 className="text-2xl font-semibold text-white mb-4 flex items-center">
                <GraduationCap className="w-6 h-6 mr-3" />
                Education
              </h3>
              <div className="space-y-3">
                <div className="bg-white/5 p-4 rounded-lg border border-gray-800">
                  <h4 className="text-white font-semibold">Master of Science in Computer Science</h4>
                  <p className="text-gray-400">University of Colorado Boulder</p>
                  <p className="text-gray-500 text-sm">Aug 2025 – Apr 2027</p>
                </div>
                <div className="bg-white/5 p-4 rounded-lg border border-gray-800">
                  <h4 className="text-white font-semibold">BTech in Information Technology</h4>
                  <p className="text-gray-400">Dwarkadas J. Sanghvi College of Engineering</p>
                  <p className="text-gray-500 text-sm">Dec 2021 – May 2025 • CGPA: 8.52/10</p>
                  <p className="text-gray-500 text-sm">Honors in Development and Operations</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4 pt-6">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-3 bg-white text-black font-medium hover:bg-gray-200 transition-all duration-300 rounded-lg flex items-center space-x-2"
              >
                <span>Download Resume</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => scrollToSection("contact")}
                className="px-8 py-3 border border-white text-white hover:bg-white hover:text-black transition-all duration-300 rounded-lg"
              >
                Let's Connect
              </motion.button>
            </div>
          </motion.div>

          {/* Stats and Achievements */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-8"
          >
            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-6">
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 p-6 rounded-xl border border-gray-700 text-center backdrop-blur-sm"
                >
                  <AnimatedCounter end={stat.value} suffix={stat.suffix} />
                  <p className="text-gray-400 text-sm mt-2">{stat.label}</p>
                </motion.div>
              ))}
            </div>

            {/* Key Achievements */}
            <div className="bg-gradient-to-br from-gray-900/30 to-gray-800/30 p-8 rounded-xl border border-gray-700 backdrop-blur-sm">
              <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
                <Award className="w-5 h-5 mr-3" />
                Key Achievements
              </h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-white rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-gray-300 text-sm">
                    <span className="text-white font-medium">Smart India Hackathon 2024 Finalist</span> - EcoCarrier ESG
                    Analytics Platform
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-white rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-gray-300 text-sm">
                    <span className="text-white font-medium">1st Place IIT Bombay Techfest</span> - CareerMatic RPA
                    Solution
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-white rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-gray-300 text-sm">
                    <span className="text-white font-medium">Vice Chairperson</span> - DJ Init.AI Club (70+ members)
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-white rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-gray-300 text-sm">
                    <span className="text-white font-medium">7+ Research Publications</span> - International Journals &
                    Conferences
                  </p>
                </div>
              </div>
            </div>

            {/* Specializations */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-blue-900/20 to-blue-800/20 p-4 rounded-lg border border-blue-800/30">
                <Code className="w-8 h-8 text-blue-400 mb-2" />
                <h4 className="text-white font-medium text-sm">Full-Stack Development</h4>
                <p className="text-gray-400 text-xs mt-1">MERN, Next.js, Flutter</p>
              </div>
              <div className="bg-gradient-to-br from-purple-900/20 to-purple-800/20 p-4 rounded-lg border border-purple-800/30">
                <BookOpen className="w-8 h-8 text-purple-400 mb-2" />
                <h4 className="text-white font-medium text-sm">AI/ML Research</h4>
                <p className="text-gray-400 text-xs mt-1">NLP, Computer Vision, GANs</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
