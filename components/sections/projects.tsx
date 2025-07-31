"use client"
import { useState } from "react"
import { ExternalLink, Github, ChevronDown } from "lucide-react"
import { motion } from "framer-motion"
import cdac_image from "../../public/img/cdac_img.jpeg"


const allProjects = [
  // First batch - main projects
  {
    title: "CareerMatic",
    description:
      "1st place at IIT Bombay Techfest. Automated job matching system with resume parsing, AI-based role matching, and personalized email delivery.",
    tech: ["Python", "NLP", "RPA", "ML", "Web Scraping", "Email API"],
    image: "/placeholder.svg?height=200&width=400&text=CareerMatic+RPA+Job+Matching",
    achievement: "🏆 1st Place IIT Bombay",
    // demoLink: "https://vedantkeshariaportfolio.netlify.app/#project",
    // githubLink: "https://github.com/vedantkesharia/vedant1_cdac/tree/master",
  },
  {
    title: "EcoCarrier",
    description:
      "Smart India Hackathon 2024 Finalist. Comprehensive ESG platform with IoT leak detection, MERN stack, Flutter app, and multilingual RAG chatbot.",
    tech: ["MERN Stack", "Flutter", "IoT", "AWS", "ML", "RAG"],
    image: "/img/EcoCarrier.png",
    achievement: "🏅 SIH 2024 Finalist",
    demoLink: "https://github.com/vedantkesharia/sih_2024_hackstreet_boys",
    githubLink: "https://github.com/vedantkesharia/sih_2024_hackstreet_boys",
  },
  {
    title: "AgroServe - P2P Lending Platform",
    description:
      "Fintech Domain Prize Winner at SPIT Hackathon. Multilingual platform for secure farmer lending with ML-based crop analysis and credit scoring.",
    tech: ["Flutter", "MERN Stack", "ML", "Credit Analysis", "Multilingual"],
    image: "/img/AgroServe.png",
    achievement: "🏆 Fintech Prize Winner",
    demoLink: "https://drive.google.com/file/d/1JdI3wCdRISMpE0WeiPwMkNn72MKIH85L/view",
    githubLink: "https://github.com/vedantkesharia/spit_hackathon",
  },
  {
    title: "Virtual Dice Simulator",
    description:
      "Virtual lab for students to explain them probability using dice simulation with real-time graph updates and interactive learning.",
    tech: ["ReactJS", "Material UI", "JavaScript", "Plotly", "CSS"],
    image: "/img/cdac_img.jpeg",
    demoLink: "https://github.com/vedantkesharia/vedant1_cdac/tree/master",
    githubLink: "https://github.com/vedantkesharia/vedant1_cdac/tree/master",
  },
  {
    title: "BrainAI",
    description:
      "An AI web application with functions like code/music/video/image generation from any text using advanced AI models.",
    tech: ["Next.js", "OpenAI", "React", "TypeScript", "AI APIs"],
    image: "/img/brainai_img.jpeg",
    demoLink: "https://brainai.vercel.app/",
    githubLink: "https://github.com/vedantkesharia/Brainai",
  },
  {
    title: "SocialBay",
    description:
      "This is a social media website made by tools like MUI, ReactJs, NodeJs, ExpressJs, MongoDB with real-time features.",
    tech: ["React", "Node.js", "Express", "MongoDB", "Material UI"],
    image: "/img/SocialBay_img.jpeg",
    demoLink: "http://thesocialbay.netlify.app/",
    githubLink: "https://github.com/vedantkesharia/SocialBay",
  },

  // Second batch
  {
    title: "EverNote",
    description:
      "Note taking application using ReactJs, HTML, Bootstrap, NodeJs, ExpressJs, MongoDB, Rest API, jwt authentication etc...",
    tech: ["React", "Node.js", "Express", "MongoDB", "JWT", "Bootstrap"],
    image: "/img/Evernote_img.jpeg",
    demoLink: "https://myevernotes.netlify.app/",
    githubLink: "https://github.com/vedantkesharia/iNotebook",
  },
  {
    title: "VideoVerse",
    description:
      "Youtube clone using API fetching with video search play functionality using ReactJs, Material UI with responsive design.",
    tech: ["React", "Material UI", "YouTube API", "JavaScript"],
    image: "/img/videoverse_img.jpeg",
    demoLink: "http://thevideoverse.netlify.app/",
    githubLink: "https://github.com/vedantkesharia/VideoVerse_youtube_clone",
  },
  {
    title: "CodeSync",
    description:
      "A code sharing web application where users can save and share their code snippets using NextJs, TailwindCSS, MongoDB, NodeJS.",
    tech: ["Next.js", "TailwindCSS", "MongoDB", "Node.js"],
    image: "/img/codesync_img.jpg",
    demoLink: "https://codesyncweb.vercel.app/",
    githubLink: "https://github.com/vedantkesharia/CodeSync",
  },
  {
    title: "CodeLockr - NPM Package",
    description:
      "Codelockr: npm package providing classical ciphers for easy cryptography using JavaScript, TypeScript and React.",
    tech: ["JavaScript", "TypeScript", "NPM", "Cryptography"],
    image: "/img/codelockr_img.jpg",
    demoLink: "https://www.npmjs.com/package/codelockr",
    githubLink: "https://github.com/vedantkesharia/codelockr-npm-package",
  },
  {
    title: "Flexibble",
    description:
      "Full stack web application to showcase and share your projects, Tech: NextJS, HTML, Tailwind CSS, cloudinary, NodeJs.",
    tech: ["Next.js", "TailwindCSS", "Cloudinary", "Node.js"],
    image: "/img/flexibble_img.jpeg",
    demoLink: "https://flexibble-flax.vercel.app/",
    githubLink: "https://github.com/vedantkesharia/Flexibble",
  },
  {
    title: "BlogNest",
    description:
      "A full stack web application where users can create and showcase their own personalized blogs using Reactjs, NodeJs, ExpressJs, Bootstrap.",
    tech: ["React", "Node.js", "Express", "Bootstrap", "MongoDB"],
    image: "/img/blogNest_img.jpeg",
    demoLink: "https://github.com/vedantkesharia/BlogNest/tree/master",
    githubLink: "https://github.com/vedantkesharia/BlogNest/tree/master",
  },

  // Third batch
  {
    title: "iPhone Landing Site",
    description:
      "iPhone landing site using GSAP animation, threejs, HTML with stunning 3D animations and smooth scrolling effects.",
    tech: ["GSAP", "Three.js", "HTML", "CSS", "JavaScript"],
    image: "/img/iphone_site_img.jpeg",
    demoLink: "http://iphonelandingsite.netlify.app/",
    githubLink: "https://github.com/vedantkesharia/Iphone_landingpage",
  },
  {
    title: "vChat",
    description:
      "A real time chatting application using ReactJs, CSS, HTML, Firebase with instant messaging and user authentication.",
    tech: ["React", "Firebase", "CSS", "HTML", "Real-time"],
    image: "/img/vchat_img.jpeg",
    demoLink: "https://github.com/vedantkesharia/vchat/tree/master",
    githubLink: "https://github.com/vedantkesharia/vchat/tree/master",
  },
  {
    title: "NewsToday",
    description:
      "A website that provides latest news cards to the user API fetching, ReactJs, HTML, Bootstrap, javascript etc...",
    tech: ["React", "News API", "Bootstrap", "JavaScript"],
    image: "/img/newstoday_img.jpeg",
    demoLink: "https://github.com/vedantkesharia/News-App_newstoday/tree/master",
    githubLink: "https://github.com/vedantkesharia/News-App_newstoday/tree/master",
  },
]

export function ProjectsSection() {
  const [visibleProjects, setVisibleProjects] = useState(6)
  const [isLoading, setIsLoading] = useState(false)

  const loadMoreProjects = () => {
    setIsLoading(true)
    setTimeout(() => {
      setVisibleProjects((prev) => Math.min(prev + 6, allProjects.length))
      setIsLoading(false)
    }, 500)
  }

  const ProjectCard = ({ project, index }: { project: any; index: number }) => {
    return (
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: index * 0.1 }}
        className="h-full"
      >
        <div className="bg-gray-50 dark:bg-black dark:border-white/[0.2] border-black/[0.1] w-full rounded-xl p-6 border hover:shadow-2xl hover:shadow-emerald-500/[0.1] transition-all duration-300 transform hover:scale-105 flex flex-col">
          {/* Title */}
          <h3 className="text-xl font-bold text-neutral-600 dark:text-white mb-3">{project.title}</h3>

          {/* Description */}
          <p className="text-neutral-500 text-sm dark:text-neutral-300 mb-4 leading-relaxed flex-grow">
            {project.description}
          </p>

          {/* Image with proper aspect ratio */}
          <div className="w-full mb-4 overflow-hidden rounded-xl">
            <img
              src={project.image || "/placeholder.svg"}
              alt={project.title}
              className="w-full h-48 object-cover transition-transform duration-300 hover:scale-105"
            />
          </div>

          {/* Tech Stack Ovals */}
          <div className="flex flex-wrap gap-2 mb-4">
            {project.tech.map((tech: string, techIndex: number) => (
              <span
                key={techIndex}
                className="px-3 py-1 bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-xs rounded-full border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
              >
                {tech}
              </span>
            ))}
          </div>

          {/* Demo and GitHub Links */}
          <div className="flex justify-between items-center mt-auto pt-4">
            <a
              href={project.demoLink}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 rounded-xl text-sm font-medium dark:text-white flex items-center space-x-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors border border-neutral-200 dark:border-neutral-700"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Demo</span>
            </a>
            <a
              href={project.githubLink}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 rounded-xl bg-black dark:bg-white dark:text-black text-white text-sm font-bold flex items-center space-x-2 hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
            >
              <Github className="w-4 h-4" />
              <span>GitHub</span>
            </a>
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <section id="projects" className="py-20 bg-gray-900/30 relative z-10">
      <div className="max-w-7xl mx-auto px-6">
        {/* <h2 className="text-5xl font-bold text-center mb-16 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
          Featured Projects
        </h2> */}

        <h2 className="text-6xl font-light text-center mb-4 bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
            Featured Projects
        </h2>
          <div className="w-96 h-px bg-gradient-to-r from-transparent via-white to-transparent mx-auto mb-20" />

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {allProjects.slice(0, visibleProjects).map((project, index) => (
            <ProjectCard key={index} project={project} index={index} />
          ))}
        </div>

        {/* Load More Button */}
        {visibleProjects < allProjects.length && (
          <div className="flex justify-center mt-16">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={loadMoreProjects}
              disabled={isLoading}
              className="px-8 py-3 bg-white text-black font-medium hover:bg-gray-200 transition-all duration-300 rounded-lg flex items-center space-x-2 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                  <span>Loading...</span>
                </>
              ) : (
                <>
                  <span>Load More Projects</span>
                  <ChevronDown className="w-4 h-4" />
                </>
              )}
            </motion.button>
          </div>
        )}

        {/* Projects Counter */}
        {/* <div className="text-center mt-8">
          <p className="text-gray-400 text-sm">
            Showing {visibleProjects} of {allProjects.length} projects
          </p>
        </div> */}
      </div>
    </section>
  )
}





// "use client"
// import { useState } from "react"
// import { ExternalLink, Github, ChevronDown } from "lucide-react"
// import { CardContainer, CardBody, CardItem } from "@/components/ui/3d-card"
// import { motion } from "framer-motion"

// const allProjects = [
//   // First batch - main projects
//   {
//     title: "CareerMatic - RPA Job Matching",
//     description:
//       "1st place at IIT Bombay Techfest. Automated job matching system with resume parsing, AI-based role matching, and personalized email delivery.",
//     tech: ["Python", "NLP", "RPA", "ML", "Web Scraping", "Email API"],
//     image: "/placeholder.svg?height=200&width=400&text=CareerMatic+RPA+Job+Matching",
//     achievement: "🏆 1st Place IIT Bombay",
//     link: "https://github.com/vedantkesharia/vedant1_cdac/tree/master",
//     github: "https://github.com/vedantkesharia",
//   },
//   {
//     title: "EcoCarrier - ESG Analytics Platform",
//     description:
//       "Smart India Hackathon 2024 Finalist. Comprehensive ESG platform with IoT leak detection, MERN stack, Flutter app, and multilingual RAG chatbot.",
//     tech: ["MERN Stack", "Flutter", "IoT", "AWS", "ML", "RAG"],
//     image: "/placeholder.svg?height=200&width=400&text=EcoCarrier+ESG+Analytics+Platform",
//     achievement: "🏅 SIH 2024 Finalist",
//     link: "https://vedantkeshariaportfolio.netlify.app/#project",
//     github: "https://github.com/vedantkesharia",
//   },
//   {
//     title: "AgroServe - P2P Lending Platform",
//     description:
//       "Fintech Domain Prize Winner at SPIT Hackathon. Multilingual platform for secure farmer lending with ML-based crop analysis and credit scoring.",
//     tech: ["Flutter", "MERN Stack", "ML", "Credit Analysis", "Multilingual"],
//     image: "/placeholder.svg?height=200&width=400&text=AgroServe+P2P+Lending+Platform",
//     achievement: "🏆 Fintech Prize Winner",
//     link: "https://vedantkeshariaportfolio.netlify.app/#project",
//     github: "https://github.com/vedantkesharia",
//   },
//   {
//     title: "Virtual Dice Simulator",
//     description:
//       "Virtual lab for students to explain them probability using dice simulation with real-time graph updates and interactive learning.",
//     tech: ["ReactJS", "Material UI", "JavaScript", "Plotly", "CSS"],
//     image: "/placeholder.svg?height=200&width=400&text=Virtual+Dice+Simulator",
//     achievement: "🎓 CDAC Project",
//     link: "https://github.com/vedantkesharia/vedant1_cdac/tree/master",
//     github: "https://github.com/vedantkesharia/vedant1_cdac/tree/master",
//   },
//   {
//     title: "BrainAI",
//     description:
//       "An AI web application with functions like code/music/video/image generation from any text using advanced AI models.",
//     tech: ["Next.js", "OpenAI", "React", "TypeScript", "AI APIs"],
//     image: "/placeholder.svg?height=200&width=400&text=BrainAI+Generation+Platform",
//     achievement: "🤖 AI Platform",
//     link: "https://brainai.vercel.app/",
//     github: "https://github.com/vedantkesharia",
//   },
//   {
//     title: "SocialBay",
//     description:
//       "This is a social media website made by tools like MUI, ReactJs, NodeJs, ExpressJs, MongoDB with real-time features.",
//     tech: ["React", "Node.js", "Express", "MongoDB", "Material UI"],
//     image: "/placeholder.svg?height=200&width=400&text=SocialBay+Social+Media",
//     achievement: "📱 Social Platform",
//     link: "http://thesocialbay.netlify.app/",
//     github: "https://github.com/vedantkesharia",
//   },

//   // Second batch
//   {
//     title: "EverNote",
//     description:
//       "Note taking application using ReactJs, HTML, Bootstrap, NodeJs, ExpressJs, MongoDB, Rest API, jwt authentication etc...",
//     tech: ["React", "Node.js", "Express", "MongoDB", "JWT", "Bootstrap"],
//     image: "/placeholder.svg?height=200&width=400&text=EverNote+Note+Taking",
//     achievement: "📝 Productivity App",
//     link: "https://myevernotes.netlify.app/",
//     github: "https://github.com/vedantkesharia",
//   },
//   {
//     title: "VideoVerse",
//     description:
//       "Youtube clone using API fetching with video search play functionality using ReactJs, Material UI with responsive design.",
//     tech: ["React", "Material UI", "YouTube API", "JavaScript"],
//     image: "/placeholder.svg?height=200&width=400&text=VideoVerse+YouTube+Clone",
//     achievement: "🎥 Video Platform",
//     link: "http://thevideoverse.netlify.app/",
//     github: "https://github.com/vedantkesharia",
//   },
//   {
//     title: "CodeSync",
//     description:
//       "A code sharing web application where users can save and share their code snippets using NextJs, TailwindCSS, MongoDB, NodeJS.",
//     tech: ["Next.js", "TailwindCSS", "MongoDB", "Node.js"],
//     image: "/placeholder.svg?height=200&width=400&text=CodeSync+Code+Sharing",
//     achievement: "💻 Developer Tool",
//     link: "https://codesyncweb.vercel.app/",
//     github: "https://github.com/vedantkesharia",
//   },
//   {
//     title: "CodeLockr - NPM Package",
//     description:
//       "Codelockr: npm package providing classical ciphers for easy cryptography using JavaScript, TypeScript and React.",
//     tech: ["JavaScript", "TypeScript", "NPM", "Cryptography"],
//     image: "/placeholder.svg?height=200&width=400&text=CodeLockr+NPM+Package",
//     achievement: "📦 NPM Package",
//     link: "https://www.npmjs.com/package/codelockr",
//     github: "https://github.com/vedantkesharia",
//   },
//   {
//     title: "Flexibble",
//     description:
//       "Full stack web application to showcase and share your projects, Tech: NextJS, HTML, Tailwind CSS, cloudinary, NodeJs.",
//     tech: ["Next.js", "TailwindCSS", "Cloudinary", "Node.js"],
//     image: "/placeholder.svg?height=200&width=400&text=Flexibble+Project+Showcase",
//     achievement: "🎨 Portfolio Platform",
//     link: "https://flexibble-flax.vercel.app/",
//     github: "https://github.com/vedantkesharia",
//   },
//   {
//     title: "BlogNest",
//     description:
//       "A full stack web application where users can create and showcase their own personalized blogs using Reactjs, NodeJs, ExpressJs, Bootstrap.",
//     tech: ["React", "Node.js", "Express", "Bootstrap", "MongoDB"],
//     image: "/placeholder.svg?height=200&width=400&text=BlogNest+Blogging+Platform",
//     achievement: "✍️ Blogging Platform",
//     link: "https://github.com/vedantkesharia/BlogNest/tree/master",
//     github: "https://github.com/vedantkesharia/BlogNest/tree/master",
//   },

//   // Third batch
//   {
//     title: "iPhone Landing Site",
//     description:
//       "iPhone landing site using GSAP animation, threejs, HTML with stunning 3D animations and smooth scrolling effects.",
//     tech: ["GSAP", "Three.js", "HTML", "CSS", "JavaScript"],
//     image: "/placeholder.svg?height=200&width=400&text=iPhone+Landing+Site",
//     achievement: "📱 3D Animation",
//     link: "http://iphonelandingsite.netlify.app/",
//     github: "https://github.com/vedantkesharia",
//   },
//   {
//     title: "vChat",
//     description:
//       "A real time chatting application using ReactJs, CSS, HTML, Firebase with instant messaging and user authentication.",
//     tech: ["React", "Firebase", "CSS", "HTML", "Real-time"],
//     image: "/placeholder.svg?height=200&width=400&text=vChat+Real+Time+Chat",
//     achievement: "💬 Chat Application",
//     link: "https://github.com/vedantkesharia/vchat/tree/master",
//     github: "https://github.com/vedantkesharia/vchat/tree/master",
//   },
//   {
//     title: "NewsToday",
//     description:
//       "A website that provides latest news cards to the user API fetching, ReactJs, HTML, Bootstrap, javascript etc...",
//     tech: ["React", "News API", "Bootstrap", "JavaScript"],
//     image: "/placeholder.svg?height=200&width=400&text=NewsToday+News+App",
//     achievement: "📰 News Platform",
//     link: "https://github.com/vedantkesharia/News-App_newstoday/tree/master",
//     github: "https://github.com/vedantkesharia/News-App_newstoday/tree/master",
//   },
// ]

// export function ProjectsSection() {
//   const [visibleProjects, setVisibleProjects] = useState(6)
//   const [isLoading, setIsLoading] = useState(false)

//   const loadMoreProjects = () => {
//     setIsLoading(true)
//     setTimeout(() => {
//       setVisibleProjects((prev) => Math.min(prev + 6, allProjects.length))
//       setIsLoading(false)
//     }, 500)
//   }

//   const ProjectCard = ({ project, index }: { project: any; index: number }) => {
//     return (
//       <motion.div
//         initial={{ opacity: 0, y: 50 }}
//         whileInView={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.5, delay: index * 0.1 }}
//         className="h-full"
//       >
//         {/* Desktop 3D Card */}
//         <div className="hidden md:block">
//           <CardContainer className="inter-var h-full">
//             <CardBody className="bg-gray-50 relative group/card dark:hover:shadow-2xl dark:hover:shadow-emerald-500/[0.1] dark:bg-black dark:border-white/[0.2] border-black/[0.1] w-full h-full rounded-xl p-6 border">
//               <CardItem translateZ="50" className="text-xl font-bold text-neutral-600 dark:text-white mb-2">
//                 {project.title}
//               </CardItem>
//               <CardItem
//                 as="p"
//                 translateZ="60"
//                 className="text-neutral-500 text-sm mt-2 dark:text-neutral-300 mb-4 line-clamp-3"
//               >
//                 {project.description}
//               </CardItem>
//               <CardItem translateZ="100" className="w-full mt-4 mb-4">
//                 <img
//                   src={project.image || "/placeholder.svg"}
//                   height="200"
//                   width="400"
//                   className="h-48 w-full object-cover rounded-xl group-hover/card:shadow-xl"
//                   alt={project.title}
//                 />
//               </CardItem>
//               <CardItem translateZ="50" className="text-xs text-neutral-500 dark:text-neutral-400 mb-4">
//                 {project.achievement}
//               </CardItem>
//               <div className="flex flex-wrap gap-1 mb-4">
//                 {project.tech.slice(0, 4).map((tech: string, techIndex: number) => (
//                   <CardItem
//                     key={techIndex}
//                     translateZ="40"
//                     className="px-2 py-1 bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-xs rounded border border-neutral-200 dark:border-neutral-700"
//                   >
//                     {tech}
//                   </CardItem>
//                 ))}
//                 {project.tech.length > 4 && (
//                   <CardItem
//                     translateZ="40"
//                     className="px-2 py-1 bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-xs rounded border border-neutral-200 dark:border-neutral-700"
//                   >
//                     +{project.tech.length - 4}
//                   </CardItem>
//                 )}
//               </div>
//               <div className="flex justify-between items-center mt-auto">
//                 <CardItem
//                   translateZ={20}
//                   as="a"
//                   href={project.link}
//                   target="_blank"
//                   className="px-4 py-2 rounded-xl text-xs font-normal dark:text-white flex items-center space-x-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
//                 >
//                   <span>View Project</span>
//                   <ExternalLink className="w-3 h-3" />
//                 </CardItem>
//                 <CardItem
//                   translateZ={20}
//                   as="a"
//                   href={project.github}
//                   target="_blank"
//                   className="px-4 py-2 rounded-xl bg-black dark:bg-white dark:text-black text-white text-xs font-bold flex items-center space-x-1 hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
//                 >
//                   <Github className="w-3 h-3" />
//                   <span>GitHub</span>
//                 </CardItem>
//               </div>
//             </CardBody>
//           </CardContainer>
//         </div>

//         {/* Mobile Simple Card */}
//         <div className="md:hidden">
//           <div className="bg-gray-50 dark:bg-black dark:border-white/[0.2] border-black/[0.1] w-full h-full rounded-xl p-6 border hover:shadow-2xl hover:shadow-emerald-500/[0.1] transition-all duration-300">
//             <h3 className="text-xl font-bold text-neutral-600 dark:text-white mb-2">{project.title}</h3>
//             <p className="text-neutral-500 text-sm mt-2 dark:text-neutral-300 mb-4 line-clamp-3">
//               {project.description}
//             </p>
//             <div className="w-full mt-4 mb-4">
//               <img
//                 src={project.image || "/placeholder.svg"}
//                 height="200"
//                 width="400"
//                 className="h-48 w-full object-cover rounded-xl"
//                 alt={project.title}
//               />
//             </div>
//             <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-4">{project.achievement}</p>
//             <div className="flex flex-wrap gap-1 mb-4">
//               {project.tech.slice(0, 4).map((tech: string, techIndex: number) => (
//                 <span
//                   key={techIndex}
//                   className="px-2 py-1 bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-xs rounded border border-neutral-200 dark:border-neutral-700"
//                 >
//                   {tech}
//                 </span>
//               ))}
//               {project.tech.length > 4 && (
//                 <span className="px-2 py-1 bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-xs rounded border border-neutral-200 dark:border-neutral-700">
//                   +{project.tech.length - 4}
//                 </span>
//               )}
//             </div>
//             <div className="flex justify-between items-center mt-auto">
//               <a
//                 href={project.link}
//                 target="_blank"
//                 className="px-4 py-2 rounded-xl text-xs font-normal dark:text-white flex items-center space-x-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
//                 rel="noreferrer"
//               >
//                 <span>View Project</span>
//                 <ExternalLink className="w-3 h-3" />
//               </a>
//               <a
//                 href={project.github}
//                 target="_blank"
//                 className="px-4 py-2 rounded-xl bg-black dark:bg-white dark:text-black text-white text-xs font-bold flex items-center space-x-1 hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
//                 rel="noreferrer"
//               >
//                 <Github className="w-3 h-3" />
//                 <span>GitHub</span>
//               </a>
//             </div>
//           </div>
//         </div>
//       </motion.div>
//     )
//   }

//   return (
//     <section id="projects" className="py-20 bg-gray-900/30">
//       <div className="max-w-7xl mx-auto px-6">
// //         <h2 className="text-5xl font-bold text-center mb-16 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
// //           Featured Projects
// //         </h2>
//  <h2 className="text-6xl font-bold text-center mb-4 bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
//             Featured Projects
//         </h2>
//           <div className="w-96 h-px bg-gradient-to-r from-transparent via-white to-transparent mx-auto mb-20" />

//         <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
//           {allProjects.slice(0, visibleProjects).map((project, index) => (
//             <ProjectCard key={index} project={project} index={index} />
//           ))}
//         </div>

//         {/* Load More Button */}
//         {visibleProjects < allProjects.length && (
//           <div className="flex justify-center mt-12">
//             <motion.button
//               whileHover={{ scale: 1.05 }}
//               whileTap={{ scale: 0.95 }}
//               onClick={loadMoreProjects}
//               disabled={isLoading}
//               className="px-8 py-3 bg-white text-black font-medium hover:bg-gray-200 transition-all duration-300 rounded-lg flex items-center space-x-2 disabled:opacity-50"
//             >
//               {isLoading ? (
//                 <>
//                   <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
//                   <span>Loading...</span>
//                 </>
//               ) : (
//                 <>
//                   <span>Load More Projects</span>
//                   <ChevronDown className="w-4 h-4" />
//                 </>
//               )}
//             </motion.button>
//           </div>
//         )}

//         {/* Projects Counter */}
//         <div className="text-center mt-8">
//           <p className="text-gray-400 text-sm">
//             Showing {visibleProjects} of {allProjects.length} projects
//           </p>
//         </div>
//       </div>
//     </section>
//   )
// }
