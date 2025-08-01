"use client"
import { Code, BookOpen, Brain, Database, Cloud, Zap } from "lucide-react"

// import { Card } from "@/components/ui/canvas_reveal_effect"

import { Card } from "@/components/ui/canvas-reveal-effect"

const skills = [
  {
    name: "Full-Stack Development",
    icon: <Code className="w-10 h-10 text-white" />,
    tech: ["React.js", "Next.js", "Node.js", "Express", "MongoDB", "Firebase", "Javascript", "TypeScript", "Tailwind CSS", "PHP", "MySQL", "HTML", "CSS"],
    description: "End-to-end web application development with modern frameworks and best practices.",
    revealText: "Building scalable applications from frontend to backend with cutting-edge technologies.",
  },
  {
    name: "AI/ML Engineering",
    icon: <Brain className="w-10 h-10 text-white" />,
    tech: ["TensorFlow", "PyTorch", "NLP", "Computer Vision", "GANs", "Neural Networks", "Autogen", "LangChain", "RAG", "CrewAI", "LaVague", "Agentic AI"],
    description: "Advanced machine learning and AI solutions for real-world problems.",
    revealText: "Developing intelligent systems using deep learning, NLP, and computer vision techniques.",
  },
  {
    name: "DevOps & Cloud",
    icon: <Cloud className="w-10 h-10 text-white" />,
    tech: ["AWS", "Azure", "Docker", "GCP", "Firebase", "CI/CD"],
    description: "Scalable cloud infrastructure and deployment automation.",
    revealText: "Architecting robust cloud solutions with automated deployment pipelines.",
  },
  {
    name: "Research & Publications",
    icon: <BookOpen className="w-10 h-10 text-white" />,
    tech: ["7+ Papers", "Patent Applied", "International Journals", "Conferences"],
    description: "Academic research and scholarly publications in AI/ML.",
    revealText: "Contributing to cutting-edge research in AI, ML, and computer science domains.",
  },
  {
    name: "Data Science",
    icon: <Database className="w-10 h-10 text-white" />,
    tech: ["Python", "SQL", "Pandas", "NumPy", "Matplotlib", "Seaborn", "Jupyter"],
    description: "Data analysis, visualization, and statistical modeling.",
    revealText: "Extracting insights from complex datasets using advanced analytics and visualization.",
  },
  {
    name: "Performance Optimization",
    icon: <Zap className="w-10 h-10 text-white" />,
    tech: ["Algorithm Design", "System Architecture", "Performance Tuning", "Scalability"],
    description: "Optimizing systems for maximum performance and efficiency.",
    revealText: "Building high-performance systems that scale efficiently under heavy loads.",
  },
]

export function SkillsSection() {
  return (
    <section id="skills" className="py-20 bg-gray-900/30">
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-5xl font-light text-center mb-4 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
          Skills & Expertise
        </h2>
        <div className="w-80 h-px bg-gradient-to-r from-transparent via-white to-transparent mx-auto mb-20" />


        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {skills.map((skill, index) => (
            <Card key={index} title={skill.name} icon={skill.icon} revealText={skill.revealText} techStack={skill.tech}>
              <div className="absolute inset-0 h-full w-full bg-gradient-to-br from-blue-400 to-blue-600" />
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}




// "use client"
// import { Code, Palette, Smartphone, BookOpen } from "lucide-react"
// import { HoverEffect } from "@/components/ui/card-hover-effect"

// const skills = [
//   {
//     name: "Full-Stack Development",
//     icon: Code,
//     tech: ["React", "Next.js", "Node.js", "Express", "MongoDB", "TypeScript"],
//     description: "End-to-end web application development",
//   },
//   {
//     name: "AI/ML Engineering",
//     icon: Palette,
//     tech: ["TensorFlow", "PyTorch", "NLP", "Computer Vision", "GANs", "Neural Networks"],
//     description: "Advanced machine learning and AI solutions",
//   },
//   {
//     name: "DevOps & Cloud",
//     icon: Smartphone,
//     tech: ["AWS", "Azure", "Docker", "GCP", "Firebase", "CI/CD"],
//     description: "Scalable cloud infrastructure and deployment",
//   },
//   {
//     name: "Research & Publications",
//     icon: BookOpen,
//     tech: ["7+ Papers", "Patent Applied", "International Journals", "Conferences"],
//     description: "Academic research and scholarly publications",
//   },
// ]

// const skillsForHover = skills.map((skill) => ({
//   title: skill.name,
//   description: skill.description,
//   link: skill.name.toLowerCase().replace(/\s+/g, "-"),
// }))

// export function SkillsSection() {
//   return (
//     <section id="skills" className="py-20 bg-gray-900/30">
//       <div className="max-w-6xl mx-auto px-6">
//         <h2 className="text-5xl font-bold text-center mb-16 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
//           Skills & Expertise
//         </h2>

//         <HoverEffect items={skillsForHover} className="grid-cols-1 md:grid-cols-2" />

//         <div className="grid md:grid-cols-2 gap-8 mt-8">
//           {skills.map((skill, index) => (
//             <div
//               key={index}
//               className="group bg-black/50 p-8 rounded-lg border border-gray-800 hover:border-white/30 transition-all duration-500 transform hover:scale-105"
//             >
//               <div className="flex items-center mb-6">
//                 <skill.icon className="w-8 h-8 text-white mr-4 group-hover:animate-pulse" />
//                 <div>
//                   <h3 className="text-xl font-semibold">{skill.name}</h3>
//                   <p className="text-sm text-gray-400 mt-1">{skill.description}</p>
//                 </div>
//               </div>
//               <div className="flex flex-wrap gap-2">
//                 {skill.tech.map((tech, techIndex) => (
//                   <span
//                     key={techIndex}
//                     className="px-3 py-1 bg-white/10 text-xs rounded-full border border-gray-700 hover:border-white/30 transition-colors duration-300"
//                   >
//                     {tech}
//                   </span>
//                 ))}
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>
//     </section>
//   )
// }
