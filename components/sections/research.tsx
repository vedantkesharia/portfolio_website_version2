"use client"
import { BookOpen } from "lucide-react"
import { motion } from "framer-motion"

const researchPapers = [
  {
    title: "Adaptive Web Accessing Tool for Visually Impaired People with Explainable AI",
    journal: "International journal Educational Administration: Theory and Practice",
    status: "Published",
    year: "2024",
    description: "Built a multilingual voice assistant for the visually impaired with personalized content delivery using ML and NLP.",
    tech: ["NLP", "TF-IDF", "Explainable AI", "Web Accessibility", "Voice Assistant"],
  },
   {
    title: "Detection of Fake Online Products Using Unsupervised GAN with Grad-CAM Visualization",
    journal: "Presented at BIDA 2025; to be published in Springer’s “Smart Innovation, Systems and Technologies” series.",
    status: "Presented",
    year: "2025",
    description: "Developed a GAN-based framework with Grad-CAM to detect fake online products, achieving high accuracy and explainability.",
    tech: ["GANs", "Computer Vision", "Grad-CAM", "Explainable AI"],
   },
  {
    title: "Comprehensive NLP System for Research Paper Discovery and Similarity Analysis",
    journal: "International Conference on Communication, Computing, and Data Security (ICCCDS 2025)",
    status: "Presented",
    year: "2025",
    description: "Built an NLP-based system to compare research papers, extract key entities, predict citation impact with LSTM, and rank relevance by abstract similarity.",
    tech: ["NLP", "TF-IDF", "LSTM", "Doc2Vec"],
  },
  {
    title: "Enhanced Nighttime Crime Surveillance Using Federated Learning: A Technical Evaluation of Aggregation Methods",
    journal: "4th International Conference on Advances in Data-driven Computing and Intelligent Systems (ADCIS 2025)",
    status: "Under Review",
    year: "2025",
    description: "Federated learning for crime detection with 90-95% accuracy across aggregation methods.",
    tech: ["Federated Learning", "Computer Vision", "Privacy"],
  },
  {
    title: "Resource-Aware Scheduling Algorithms For Machine Learning",
    journal: "Patent Application",
    status: "Patent Applied",
    year: "2024",
    description: "Novel scheduling algorithms for ML workloads in heterogeneous environments.",
    tech: ["Algorithms", "ML Optimization", "Scheduling"],
  },
  {
    title: "AdversaMark: Robust Digital Watermarking through GANs",
    journal: "2nd International Conference on Sustainable Computing and Intelligent Systems (SCIS 2025)",
    status: "Under Review",
    year: "2025",
    description: "Generative adversarial networks for robust digital watermarking solutions.",
    tech: ["GANs", "Digital Watermarking", "Security"],
  },
  {
    title: "Optimized ECG-Based Detection of Hypertensive Heart Disease Using Federated Machine Learning",
    journal: "5th IEEE ASIANCON 2025",
    status: "Under Review",
    year: "2025",
    description: "Federated machine learning approach for ECG-based hypertensive heart disease detection.",
    tech: ["Federated Learning", "ECG Analysis", "Healthcare AI"],
  },
   {
    title: "Enhancing Hypertensive Heart Disease Detection Through ECG Signal Optimization",
    journal: "7th International Conference on Communication and Intelligent Systems (ICCIS 2025)",
    status: "Under Review",
    year: "2025",
    description: "Developed an image-to-signal ECG pipeline using ML/DL for automated hypertensive heart disease detection from paper-based records.",
    tech: ["ECG Image Processing", "Signal Extraction", "Hypertensive Heart Disease", "Machine Learning", "Deep Learning"],
  }
  
]

export function ResearchSection() {
  return (
    <section id="research" className="py-20">
      <div className="max-w-6xl mx-auto px-6">
        {/* <h2 className="text-5xl font-bold text-center mb-16 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
          Research & Publications
        </h2> */}
         <h2 className="text-6xl font-light text-center mb-4 bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
            Research & Publications
        </h2>
          <div className="w-80 h-px bg-gradient-to-r from-transparent via-white to-transparent mx-auto mb-20" />
        <div className="grid md:grid-cols-2 gap-8">
          {researchPapers.map((paper, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group bg-black/50 p-6 rounded-lg border border-gray-800 hover:border-white/30 transition-all duration-500 transform hover:scale-105"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <BookOpen className="w-5 h-5 text-gray-400" />
                  <span className="text-sm text-gray-400">{paper.year}</span>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs ${
                    paper.status === "Published"
                      ? "bg-green-900/50 text-green-300 border border-green-800"
                      : paper.status === "Presented"
                      ? "bg-green-900/50 text-green-300 border border-green-800"
                      : paper.status === "Accepted"
                        ? "bg-blue-900/50 text-blue-300 border border-blue-800"
                        : paper.status === "Patent Applied"
                          ? "bg-purple-900/50 text-purple-300 border border-purple-800"
                          : "bg-yellow-900/50 text-yellow-300 border border-yellow-800"
                  }`}
                >
                  {paper.status}
                </span>
              </div>
              <h3 className="text-lg font-semibold mb-3 group-hover:text-gray-300 transition-colors duration-300">
                {paper.title}
              </h3>
              <p className="text-sm text-gray-400 mb-3 italic">{paper.journal}</p>
              <p className="text-sm text-gray-300 mb-4 leading-relaxed">{paper.description}</p>
              <div className="flex flex-wrap gap-2">
                {paper.tech.map((tech, techIndex) => (
                  <span
                    key={techIndex}
                    className="px-2 py-1 bg-white/10 text-xs rounded border border-gray-700 hover:border-white/30 transition-colors duration-300"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
