import { Navbar } from "@/components/layout/navbar"
import { HeroSection } from "@/components/sections/hero"
import { AboutSection } from "@/components/sections/about"
import { ExperienceSection } from "@/components/sections/experience"
import { SkillsSection } from "@/components/sections/skills"
import { ResearchSection } from "@/components/sections/research"
import { ProjectsSection } from "@/components/sections/projects"
import { ContactSection } from "@/components/sections/contact"
import { Footer } from "@/components/layout/footer"

const siteUrl = "https://vedantkeshariaportfolio.vercel.app"

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      name: "Vedant Kesharia Portfolio",
      url: siteUrl,
      description:
        "Portfolio of Vedant Kesharia featuring software engineering experience, AI/ML research, publications, and full-stack projects.",
      inLanguage: "en-US",
    },
    {
      "@type": "Person",
      name: "Vedant Kesharia",
      url: siteUrl,
      jobTitle: "Full-Stack AI Engineer and Researcher",
      email: "mailto:keshariavedant@gmail.com",
      sameAs: [
        "https://github.com/vedantkesharia",
        "https://www.linkedin.com/in/vedant-kesharia-556603235/",
        "https://leetcode.com/u/keshariavedant",
      ],
      alumniOf: [
        {
          "@type": "CollegeOrUniversity",
          name: "University of Colorado Boulder",
        },
        {
          "@type": "CollegeOrUniversity",
          name: "Dwarkadas J. Sanghvi College of Engineering",
        },
      ],
      knowsAbout: [
        "Artificial Intelligence",
        "Machine Learning",
        "Software Engineering",
        "AWS",
        "Java",
        "Python",
        "Next.js",
        "React",
      ],
    },
  ],
}

export default function Home() {
  return (
    <div className="bg-black text-white overflow-x-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <Navbar />
      <HeroSection />
      <AboutSection />
      <ExperienceSection />
      <SkillsSection />
      <ResearchSection />
      <ProjectsSection />
      <ContactSection />
      <Footer />
    </div>
  )
}
