"use client";

import type React from "react";
import { useState, useEffect, useRef } from "react";
import {
  ChevronDown,
  Github,
  Linkedin,
  Mail,
  ExternalLink,
  Code,
  Palette,
  Smartphone,
  Menu,
  X,
  BookOpen,
} from "lucide-react";
import * as THREE from "three";

const Portfolio: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string>("home");
  const [isScrolled, setIsScrolled] = useState<boolean>(false);
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const threeRef = useRef<HTMLDivElement>(null);
  const [buttonText, setButtonText] = useState<string>("Send Message");
  const [formData, setFormData] = useState<{
    user_firstname: string;
    user_lastname: string;
    user_email: string;
    user_phone: string;
    message: string;
  }>({
    user_firstname: "",
    user_lastname: "",
    user_email: "",
    user_phone: "",
    message: "",
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);

      const sections = [
        "home",
        "about",
        "skills",
        "research",
        "projects",
        "contact",
      ];
      const current = sections.find((section) => {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          return rect.top <= 100 && rect.bottom >= 100;
        }
        return false;
      });

      if (current) setActiveSection(current);
    };

    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    // Three.js setup
    if (threeRef.current) {
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
      const renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
      });

      renderer.setSize(300, 300);
      renderer.setClearColor(0x000000, 0);
      threeRef.current.appendChild(renderer.domElement);

      // Create a geometric shape
      const geometry = new THREE.IcosahedronGeometry(1, 1);
      const material = new THREE.MeshPhongMaterial({
        color: 0xffffff,
        wireframe: true,
        transparent: true,
        opacity: 0.8,
      });
      const mesh = new THREE.Mesh(geometry, material);
      scene.add(mesh);

      // Add lighting
      const light = new THREE.DirectionalLight(0xffffff, 1);
      light.position.set(5, 5, 5);
      scene.add(light);
      scene.add(new THREE.AmbientLight(0x404040, 0.4));

      camera.position.z = 3;

      // Animation loop
      const animate = () => {
        requestAnimationFrame(animate);
        mesh.rotation.x += 0.01;
        mesh.rotation.y += 0.01;
        renderer.render(scene, camera);
      };
      animate();

      // Event listeners
      window.addEventListener("scroll", handleScroll);
      window.addEventListener("mousemove", handleMouseMove);

      // Cleanup
      return () => {
        window.removeEventListener("scroll", handleScroll);
        window.removeEventListener("mousemove", handleMouseMove);
        if (
          threeRef.current &&
          renderer.domElement &&
          threeRef.current.contains(renderer.domElement)
        ) {
          threeRef.current.removeChild(renderer.domElement);
        }
        renderer.dispose();
        geometry.dispose();
        material.dispose();
      };
    }

    window.addEventListener("scroll", handleScroll);
    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  const scrollToSection = (sectionId: string) => {
    document.getElementById(sectionId)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
    setMobileMenuOpen(false);
  };

  const validateForm = (): boolean => {
    let isValid = true;
    const newErrors: Record<string, string> = {};

    if (formData.user_firstname.trim() === "") {
      newErrors.user_firstname = "First name is required";
      isValid = false;
    }

    if (formData.user_lastname.trim() === "") {
      newErrors.user_lastname = "Last name is required";
      isValid = false;
    }

    if (formData.user_email.trim() === "") {
      newErrors.user_email = "Email is required";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.user_email)) {
      newErrors.user_email = "Email is invalid";
      isValid = false;
    }

    if (formData.user_phone.trim() === "") {
      newErrors.user_phone = "Phone number is required";
      isValid = false;
    } else if (!/^\d{10}$/.test(formData.user_phone)) {
      newErrors.user_phone = "Phone number is invalid";
      isValid = false;
    }

    if (formData.message.trim() === "") {
      newErrors.message = "Message is required";
      isValid = false;
    }

    setFormErrors(newErrors);
    return isValid;
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const sendEmail = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (validateForm()) {
      setButtonText("Sending...");

      // Simulate EmailJS call (replace with actual EmailJS implementation)
      setTimeout(() => {
        console.log("Email sent successfully");
        setButtonText("Message Sent!");
        setFormData({
          user_firstname: "",
          user_lastname: "",
          user_email: "",
          user_phone: "",
          message: "",
        });

        setTimeout(() => {
          setButtonText("Send Message");
        }, 3000);
      }, 2000);
    }
  };

  const skills = [
    {
      name: "Full-Stack Development",
      icon: Code,
      tech: ["React", "Next.js", "Node.js", "Express", "MongoDB", "TypeScript"],
      description: "End-to-end web application development",
    },
    {
      name: "AI/ML Engineering",
      icon: Palette,
      tech: [
        "TensorFlow",
        "PyTorch",
        "NLP",
        "Computer Vision",
        "GANs",
        "Neural Networks",
      ],
      description: "Advanced machine learning and AI solutions",
    },
    {
      name: "DevOps & Cloud",
      icon: Smartphone,
      tech: ["AWS", "Azure", "Docker", "GCP", "Firebase", "CI/CD"],
      description: "Scalable cloud infrastructure and deployment",
    },
    {
      name: "Research & Publications",
      icon: BookOpen,
      tech: [
        "7+ Papers",
        "Patent Applied",
        "International Journals",
        "Conferences",
      ],
      description: "Academic research and scholarly publications",
    },
  ];

  const researchPapers = [
    {
      title:
        "Adaptive Web Accessing Tool for Visually Impaired People with Explainable AI",
      journal: "Educational Administration: Theory and Practice",
      status: "Published",
      year: "2024",
      description:
        "Voice assistant with ML/NLP, achieving 97% accuracy with explainable AI techniques.",
      tech: ["NLP", "ML", "Explainable AI", "TF-IDF"],
    },
    {
      title:
        "Detection of Fake Online Products Using Unsupervised GAN with Grad-CAM Visualization",
      journal: "Springer - Smart Innovation, Systems and Technologies",
      status: "To be Published",
      year: "2024",
      description:
        "DCGAN and Grad-CAM framework achieving 0.94 R² and 0.98 F1 scores.",
      tech: ["GANs", "DCGAN", "Grad-CAM", "Computer Vision"],
    },
    {
      title:
        "Comprehensive NLP System for Research Paper Discovery and Similarity Analysis",
      journal: "ICCCDS 2025",
      status: "Accepted",
      year: "2025",
      description:
        "NLP system using TF-IDF, LSA, Doc2Vec with LSTM-based citation prediction.",
      tech: ["NLP", "TF-IDF", "LSTM", "Doc2Vec"],
    },
    {
      title: "Enhanced Nighttime Crime Surveillance Using Federated Learning",
      journal: "Under Review",
      status: "Under Review",
      year: "2025",
      description:
        "Federated learning for crime detection with 90-95% accuracy across aggregation methods.",
      tech: ["Federated Learning", "Computer Vision", "Privacy"],
    },
    {
      title: "Resource-Aware Scheduling Algorithms For Machine Learning",
      journal: "Patent Application",
      status: "Patent Applied",
      year: "2024",
      description:
        "Novel scheduling algorithms for ML workloads in heterogeneous environments.",
      tech: ["Algorithms", "ML Optimization", "Scheduling"],
    },
    {
      title: "AdversaMark: Robust Digital Watermarking through GANs",
      journal: "SCIS 2025",
      status: "Under Review",
      year: "2025",
      description:
        "Generative adversarial networks for robust digital watermarking solutions.",
      tech: ["GANs", "Digital Watermarking", "Security"],
    },
  ];

  const projects = [
    {
      title: "EcoCarrier - ESG Analytics Platform",
      description:
        "Smart India Hackathon 2024 Finalist. Comprehensive ESG platform with IoT leak detection, MERN stack, Flutter app, and multilingual RAG chatbot.",
      tech: ["MERN Stack", "Flutter", "IoT", "AWS", "ML", "RAG"],
      image:
        "/placeholder.svg?height=200&width=400&text=EcoCarrier+ESG+Analytics+Platform",
      achievement: "SIH 2024 Finalist",
    },
    {
      title: "CareerMatic - RPA Job Matching",
      description:
        "1st place at IIT Bombay Techfest. Automated job matching system with resume parsing, AI-based role matching, and personalized email delivery.",
      tech: ["Python", "NLP", "RPA", "ML", "Web Scraping", "Email API"],
      image:
        "/placeholder.svg?height=200&width=400&text=CareerMatic+RPA+Job+Matching",
      achievement: "1st Place IIT Bombay",
    },
    {
      title: "AgroServe - P2P Lending Platform",
      description:
        "Fintech Domain Prize Winner at SPIT Hackathon. Multilingual platform for secure farmer lending with ML-based crop analysis and credit scoring.",
      tech: ["Flutter", "MERN Stack", "ML", "Credit Analysis", "Multilingual"],
      image:
        "/placeholder.svg?height=200&width=400&text=AgroServe+P2P+Lending+Platform",
      achievement: "Fintech Prize Winner",
    },
    {
      title: "Adaptive Web Tool for Visually Impaired",
      description:
        "Published research with voice assistant using ML/NLP. Features multilingual support, Wikipedia integration, and explainable AI with 97% accuracy.",
      tech: ["Python", "NLP", "ML", "TF-IDF", "Explainable AI", "Voice Tech"],
      image:
        "/placeholder.svg?height=200&width=400&text=Adaptive+Web+Tool+Published+Research",
      achievement: "Published Research",
    },
    {
      title: "Fake Product Detection with GANs",
      description:
        "Research using DCGAN and Grad-CAM visualization for fraud detection. Achieved 0.94 R² and 0.98 F1 scores. To be published in Springer.",
      tech: ["GANs", "DCGAN", "Grad-CAM", "Computer Vision", "PyTorch", "ML"],
      image:
        "/placeholder.svg?height=200&width=400&text=Fake+Product+Detection+GANs+Grad-CAM",
      achievement: "Springer Publication",
    },
    {
      title: "NLP Research Paper Discovery",
      description:
        "Comprehensive system using TF-IDF, LSA, Doc2Vec, and Sentence Transformers. LSTM-based citation prediction and similarity analysis.",
      tech: ["NLP", "TF-IDF", "LSTM", "Doc2Vec", "Transformers", "Python"],
      image:
        "/placeholder.svg?height=200&width=400&text=NLP+Paper+Discovery+Research+System",
      achievement: "ICCCDS 2025",
    },
  ];

  return (
    <div className="bg-black text-white overflow-x-hidden">
      {/* Custom Cursor - only for medium to big screens */}

      <div
        className="hidden md:block fixed w-6 h-6 bg-white rounded-full pointer-events-none z-50 mix-blend-difference transition-transform duration-150 ease-out"
        style={{
          left: mousePosition.x - 12,
          top: mousePosition.y - 12,
          transform: `scale(${activeSection === "home" ? 1.5 : 1})`,
        }}
      />
      
      {/* Custom Cursor - only for all screens */}
      {/* <div
        className="fixed w-6 h-6 bg-white rounded-full pointer-events-none z-50 mix-blend-difference transition-transform duration-150 ease-out"
        style={{
          left: mousePosition.x - 12,
          top: mousePosition.y - 12,
          transform: `scale(${activeSection === "home" ? 1.5 : 1})`,
        }}
      /> */}

      {/* Navigation */}
      <nav
        className={`fixed top-0 w-full z-40 transition-all duration-500 ${isScrolled ? "bg-black/90 backdrop-blur-lg border-b border-white/10" : ""}`}
      >
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="text-2xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              Vedant Kesharia
            </div>
            <div className="hidden md:flex space-x-8">
              {[
                "Home",
                "About",
                "Skills",
                "Research",
                "Projects",
                "Contact",
              ].map((item) => (
                <button
                  key={item}
                  onClick={() => scrollToSection(item.toLowerCase())}
                  className={`relative px-4 py-2 transition-all duration-300 hover:text-gray-300 ${
                    activeSection === item.toLowerCase()
                      ? "text-white"
                      : "text-gray-500"
                  }`}
                >
                  {item}
                  {activeSection === item.toLowerCase() && (
                    <div className="absolute bottom-0 left-0 w-full h-0.5 bg-white transform origin-left animate-pulse" />
                  )}
                </button>
              ))}
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden absolute top-full left-0 w-full bg-black/95 backdrop-blur-lg border-b border-white/10">
              <div className="flex flex-col space-y-4 p-6">
                {[
                  "Home",
                  "About",
                  "Skills",
                  "Research",
                  "Projects",
                  "Contact",
                ].map((item) => (
                  <button
                    key={item}
                    onClick={() => scrollToSection(item.toLowerCase())}
                    className={`text-left px-4 py-2 transition-all duration-300 hover:text-gray-300 ${
                      activeSection === item.toLowerCase()
                        ? "text-white"
                        : "text-gray-500"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section
        id="home"
        className="min-h-screen flex items-center justify-center relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black opacity-50" />
        <div className="relative z-10 text-center max-w-4xl mx-auto px-6">
          <div className="space-y-6 animate-fade-in">
            <div className="text-lg text-gray-400 mb-4">Hello, I'm</div>
            <h1 className="text-6xl md:text-8xl font-bold leading-tight">
              <span className="block transform hover:scale-105 transition-transform duration-700">
                Vedant
              </span>
              <span className="block bg-gradient-to-r from-white via-gray-300 to-white bg-clip-text text-transparent animate-pulse">
                Kesharia
              </span>
            </h1>
            <h2 className="text-2xl md:text-3xl text-gray-300 font-light mb-6">
              Full-Stack AI Engineer & Researcher
            </h2>
            <p className="text-xl md:text-2xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
              Building intelligent systems with cutting-edge AI/ML, full-stack
              development, and DevOps expertise
            </p>
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
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <ChevronDown className="w-8 h-8 text-gray-400" />
        </div>

        {/* Animated Background Elements */}
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-white rounded-full animate-ping opacity-30" />
        <div className="absolute top-3/4 right-1/4 w-1 h-1 bg-white rounded-full animate-pulse opacity-40" />
        <div
          className="absolute top-1/2 right-1/3 w-3 h-3 bg-white rounded-full animate-ping opacity-20"
          style={{ animationDelay: "1s" }}
        />
      </section>

      {/* About Section */}
      <section id="about" className="py-20 relative">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-5xl font-bold mb-8 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                About Me
              </h2>
              <p className="text-lg text-gray-300 leading-relaxed">
                I'm a passionate Full-Stack AI Engineer pursuing my Master's in
                Computer Science at University of Colorado Boulder. Currently
                working as an AI/ML Research Intern at USC, I specialize in
                building intelligent systems that bridge the gap between
                cutting-edge AI research and practical applications.
              </p>
              <p className="text-lg text-gray-300 leading-relaxed">
                With experience at organizations like Datamatics and CDAC, I've
                developed expertise in full-stack development, machine learning,
                and DevOps. I'm passionate about leveraging technology to solve
                real-world problems, from healthcare analytics to automated
                systems.
              </p>
              <div className="grid grid-cols-2 gap-4 mt-6 text-sm">
                <div>
                  <span className="text-gray-500">Education:</span>
                  <p className="text-white">MS Computer Science, CU Boulder</p>
                  <p className="text-white">BTech IT, DJ Sanghvi (8.52 CGPA)</p>
                </div>
                <div>
                  <span className="text-gray-500">Current Role:</span>
                  <p className="text-white">AI/ML Research Intern @ USC</p>
                  <p className="text-white">VP @ DJ Init.AI Club</p>
                </div>
              </div>
              <div className="flex space-x-4 pt-4">
                <button className="px-8 py-3 bg-white text-black font-medium hover:bg-gray-200 transition-all duration-300 transform hover:scale-105">
                  Download CV
                </button>
                <button
                  onClick={() => scrollToSection("contact")}
                  className="px-8 py-3 border border-white text-white hover:bg-white hover:text-black transition-all duration-300 transform hover:scale-105"
                >
                  Contact Me
                </button>
              </div>
            </div>
            <div className="relative">
              <div className="w-80 h-80 mx-auto bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg transform rotate-3 hover:rotate-0 transition-transform duration-500 flex items-center justify-center">
                <div
                  ref={threeRef}
                  className="w-full h-full flex items-center justify-center"
                />
              </div>
              <div className="absolute -bottom-4 -right-4 bg-white text-black px-4 py-2 rounded-full text-sm font-medium">
                Interactive 3D Model
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Skills Section */}
      <section id="skills" className="py-20 bg-gray-900/30">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-5xl font-bold text-center mb-16 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            Skills & Expertise
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            {skills.map((skill, index) => (
              <div
                key={index}
                className="group bg-black/50 p-8 rounded-lg border border-gray-800 hover:border-white/30 transition-all duration-500 transform hover:scale-105"
              >
                <div className="flex items-center mb-6">
                  <skill.icon className="w-8 h-8 text-white mr-4 group-hover:animate-pulse" />
                  <div>
                    <h3 className="text-xl font-semibold">{skill.name}</h3>
                    <p className="text-sm text-gray-400 mt-1">
                      {skill.description}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {skill.tech.map((tech, techIndex) => (
                    <span
                      key={techIndex}
                      className="px-3 py-1 bg-white/10 text-xs rounded-full border border-gray-700 hover:border-white/30 transition-colors duration-300"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Research Section */}
      <section id="research" className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-5xl font-bold text-center mb-16 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            Research & Publications
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            {researchPapers.map((paper, index) => (
              <div
                key={index}
                className="group bg-black/50 p-6 rounded-lg border border-gray-800 hover:border-white/30 transition-all duration-500"
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
                <p className="text-sm text-gray-400 mb-3 italic">
                  {paper.journal}
                </p>
                <p className="text-sm text-gray-300 mb-4 leading-relaxed">
                  {paper.description}
                </p>
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
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section id="projects" className="py-20 bg-gray-900/30">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-5xl font-bold text-center mb-16 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            Featured Projects
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((project, index) => (
              <div
                key={index}
                className="group bg-black/50 rounded-lg border border-gray-800 hover:border-white/30 transition-all duration-500 transform hover:scale-105 overflow-hidden"
              >
                <div className="relative overflow-hidden">
                  <img
                    src={project.image || "/placeholder.svg"}
                    alt={project.title}
                    className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute top-4 right-4 bg-black/80 px-3 py-1 rounded-full text-xs text-white">
                    {project.achievement}
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-3 group-hover:text-gray-300 transition-colors duration-300">
                    {project.title}
                  </h3>
                  <p className="text-sm text-gray-300 mb-4 leading-relaxed">
                    {project.description}
                  </p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {project.tech.map((tech, techIndex) => (
                      <span
                        key={techIndex}
                        className="px-2 py-1 bg-white/10 text-xs rounded border border-gray-700 hover:border-white/30 transition-colors duration-300"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                  <button className="flex items-center space-x-2 text-sm text-gray-400 hover:text-white transition-colors duration-300">
                    <span>View Details</span>
                    <ExternalLink className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-5xl font-bold text-center mb-16 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            Get In Touch
          </h2>
          <div className="grid md:grid-cols-2 gap-12">
            <div className="space-y-6">
              <h3 className="text-2xl font-semibold mb-6">Let's Connect</h3>
              <p className="text-gray-300 leading-relaxed">
                I'm always interested in discussing new opportunities,
                innovative projects, and collaborations in AI/ML, full-stack
                development, and research.
              </p>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <Mail className="w-6 h-6 text-gray-400" />
                  <span className="text-gray-300">
                    keshariavedant@gmail.com
                  </span>
                </div>
                <div className="flex items-center space-x-4">
                  <Linkedin className="w-6 h-6 text-gray-400" />
                  <span className="text-gray-300">
                    linkedin.com/in/vedant-kesharia
                  </span>
                </div>
                <div className="flex items-center space-x-4">
                  <Github className="w-6 h-6 text-gray-400" />
                  <span className="text-gray-300">
                    github.com/vedantkesharia
                  </span>
                </div>
              </div>
            </div>
            <form onSubmit={sendEmail} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <input
                    type="text"
                    name="user_firstname"
                    placeholder="First Name"
                    value={formData.user_firstname}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg focus:border-white/50 focus:outline-none transition-colors duration-300"
                  />
                  {formErrors.user_firstname && (
                    <p className="text-red-400 text-sm mt-1">
                      {formErrors.user_firstname}
                    </p>
                  )}
                </div>
                <div>
                  <input
                    type="text"
                    name="user_lastname"
                    placeholder="Last Name"
                    value={formData.user_lastname}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg focus:border-white/50 focus:outline-none transition-colors duration-300"
                  />
                  {formErrors.user_lastname && (
                    <p className="text-red-400 text-sm mt-1">
                      {formErrors.user_lastname}
                    </p>
                  )}
                </div>
              </div>
              <div>
                <input
                  type="email"
                  name="user_email"
                  placeholder="Email Address"
                  value={formData.user_email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg focus:border-white/50 focus:outline-none transition-colors duration-300"
                />
                {formErrors.user_email && (
                  <p className="text-red-400 text-sm mt-1">
                    {formErrors.user_email}
                  </p>
                )}
              </div>
              <div>
                <input
                  type="tel"
                  name="user_phone"
                  placeholder="Phone Number"
                  value={formData.user_phone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg focus:border-white/50 focus:outline-none transition-colors duration-300"
                />
                {formErrors.user_phone && (
                  <p className="text-red-400 text-sm mt-1">
                    {formErrors.user_phone}
                  </p>
                )}
              </div>
              <div>
                <textarea
                  name="message"
                  placeholder="Your Message"
                  rows={5}
                  value={formData.message}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg focus:border-white/50 focus:outline-none transition-colors duration-300 resize-none"
                />
                {formErrors.message && (
                  <p className="text-red-400 text-sm mt-1">
                    {formErrors.message}
                  </p>
                )}
              </div>
              <button
                type="submit"
                className="w-full px-8 py-3 bg-white text-black font-medium hover:bg-gray-200 transition-all duration-300 transform hover:scale-105 rounded-lg"
              >
                {buttonText}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-gray-800">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="text-gray-400">
            © 2024 Vedant Kesharia. Built with React, TypeScript, and Three.js.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Portfolio;
