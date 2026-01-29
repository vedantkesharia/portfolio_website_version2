"use client"
import { Timeline } from "@/components/ui/timeline"

const workExperience = [
  {
    title: "AI/ML Research Intern",
    company: "University of Southern California (USC)",
    period: "January 2025 - April 2025",
    location: "Los Angeles, CA",
    description: [
      "Contributed to ML models for detecting emotional disturbances and cognitive impairments by analyzing smartphone usage patterns, GPS, and environmental data (air quality, humidity, allergens)",
      "Built and optimized data pipelines, reducing processing time by 60%, and performed advanced data analytics",
      "Visualized insights on a web-based dashboard to support real-time mental health monitoring and behavioral analysis",
    ],
    technologies: ["Python", "TensorFlow", "Data Analytics", "Digital Phenotyping", "Dashboard Development"],
  },
  {
    title: "Web Development Freelancer",
    company: "Freelancing",
    period: "December 2024 - January 2025",
    location: "Remote",
    description: [
      "Designed and developed a dynamic property listing website with advanced search capabilities and filters",
      "Implemented user-friendly features, including property-related news and an intuitive interface",
      "Optimized website functionality to deliver seamless navigation with comprehensive property details",
    ],
    technologies: ["React", "Node.js", "MongoDB", "CSS", "JavaScript"],
  },
  {
    title: "Research Intern",
    company: "Indian Institute of Technology (IIT) Patna",
    period: "September 2024 - December 2024",
    location: "Patna, India",
    description: [
      "Conducted comparative analysis of Vision-Language Models (VLMs) and Large Language Models (LLMs)",
      "Assessed model effectiveness in interpreting region-specific sports data from India and France",
      "Employed rule-based, image-based, and history-based methodologies to evaluate model performance",
    ],
    technologies: ["Python", "VLMs", "LLMs", "Computer Vision", "NLP", "Research Methodologies"],
  },
  {
    title: "AI/ML Intern",
    company: "Datamatics",
    period: "June 2024 - August 2024",
    location: "Mumbai, India",
    description: [
      "Built Agentic Process Automation (APA) systems using Langchain, Autogen, CrewAI, LaVague, Azure and OpenAI",
      "Developed an Adaptive Capital Allocation System with LLMs and RAG for real-time investment insights",
      "Created OCR-based Automated Document Processing tool with advanced preprocessing for low-quality images",
      "Improved text extraction and decision-making accuracy by 70% using RAG and LLM-driven analysis",
    ],
    technologies: ["LangChain", "Autogen", "CrewAI", "Azure", "OpenAI", "RAG", "OCR", "Python"],
  },
  {
    title: "Web Development Intern",
    company: "Centre for Development of Advanced Computing (CDAC)",
    period: "December 2023 - May 2024",
    location: "Mumbai, India",
    description: [
      "Developed an interactive virtual dice simulator using ReactJS, Material UI, JavaScript, Plotly, and CSS",
      "Enabled real-time probability exploration through simulations and live graph updates",
      "Integrated dynamic Plotly charts to visualize theoretical vs. experimental outcomes",
      "Enhanced student engagement and conceptual understanding through intuitive UI and smooth animations",
    ],
    technologies: ["ReactJS", "Material UI", "JavaScript", "Plotly", "CSS", "Data Visualization"],
  },
]

export function ExperienceSection() {
  return (
    <section id="experience" className="pb-20 bg-gray-900/30">
      <div className="max-w-6xl mx-auto px-6">
        <h2 className="text-6xl font-light text-center mb-6 bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
            Work Experience
        </h2>
          <div className="w-80 h-px bg-gradient-to-r from-transparent via-white to-transparent mx-auto" />
        {/* <h2 className="text-5xl font-bold text-center mb-16 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
          Work Experience
        </h2> */}
        <Timeline data={workExperience} />
      </div>
    </section>
  )
}
