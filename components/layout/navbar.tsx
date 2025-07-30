"use client"
import { useState, useEffect } from "react"
import { VKLogo } from "@/components/ui/logo"
import { Menu, X, Home, User, Code, BookOpen, FolderOpen, Mail, Briefcase } from "lucide-react"

const navItems = [
  { name: "Home", link: "home", icon: <Home className="h-4 w-4" /> },
  { name: "About", link: "about", icon: <User className="h-4 w-4" /> },
  { name: "Experience", link: "experience", icon: <Briefcase className="h-4 w-4" /> },
  { name: "Skills", link: "skills", icon: <Code className="h-4 w-4" /> },
  { name: "Research", link: "research", icon: <BookOpen className="h-4 w-4" /> },
  { name: "Projects", link: "projects", icon: <FolderOpen className="h-4 w-4" /> },
  { name: "Contact", link: "contact", icon: <Mail className="h-4 w-4" /> },
]

export function Navbar() {
  const [activeSection, setActiveSection] = useState<string>("home")
  const [isScrolled, setIsScrolled] = useState<boolean>(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)

      const sections = ["home", "about", "experience", "skills", "research", "projects", "contact"]
      const current = sections.find((section) => {
        const element = document.getElementById(section)
        if (element) {
          const rect = element.getBoundingClientRect()
          return rect.top <= 100 && rect.bottom >= 100
        }
        return false
      })

      if (current) setActiveSection(current)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const scrollToSection = (sectionId: string) => {
    document.getElementById(sectionId)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    })
    setMobileMenuOpen(false)
  }

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-500 ${
        isScrolled ? "bg-black/90 backdrop-blur-lg border-b border-white/10" : ""
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          <VKLogo className="w-12 h-12" />

          <div className="hidden md:flex space-x-8">
            {navItems.map((item) => (
              <button
                key={item.name}
                onClick={() => scrollToSection(item.link)}
                className={`relative px-4 py-2 transition-all duration-300 hover:text-gray-300 ${
                  activeSection === item.link ? "text-white" : "text-gray-500"
                }`}
              >
                {item.name}
                {activeSection === item.link && (
                  <div className="absolute bottom-0 left-0 w-full h-0.5 bg-white transform origin-left animate-pulse" />
                )}
              </button>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 w-full bg-black/95 backdrop-blur-lg border-b border-white/10">
            <div className="flex flex-col space-y-4 p-6">
              {navItems.map((item) => (
                <button
                  key={item.name}
                  onClick={() => scrollToSection(item.link)}
                  className={`text-left px-4 py-2 transition-all duration-300 hover:text-gray-300 flex items-center space-x-3 ${
                    activeSection === item.link ? "text-white" : "text-gray-500"
                  }`}
                >
                  {item.icon}
                  <span>{item.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
