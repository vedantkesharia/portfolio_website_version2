import { Navbar } from "@/components/layout/navbar"
import { HeroSection } from "@/components/sections/hero"
import { AboutSection } from "@/components/sections/about"
import { ExperienceSection } from "@/components/sections/experience"
import { SkillsSection } from "@/components/sections/skills"
import { ResearchSection } from "@/components/sections/research"
import { ProjectsSection } from "@/components/sections/projects"
import { ContactSection } from "@/components/sections/contact"
import { Footer } from "@/components/layout/footer"

export default function Home() {
  return (
    <div className="bg-black text-white overflow-x-hidden">
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
