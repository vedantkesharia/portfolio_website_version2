"use client"
import type React from "react"
import { useState, useRef } from "react"
import { Mail, Linkedin, Github } from "lucide-react"
import emailjs from '@emailjs/browser'

export function ContactSection() {
  const [buttonText, setButtonText] = useState<string>("Send Message")
  const [formData, setFormData] = useState({
    user_firstname: "",
    user_lastname: "",
    user_email: "",
    user_phone: "",
    message: "",
  })
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  
  const form = useRef<HTMLFormElement>(null)

  const validateForm = (): boolean => {
    let isValid = true
    const newErrors: Record<string, string> = {}

    if (formData.user_firstname.trim() === "") {
      newErrors.user_firstname = "First name is required"
      isValid = false
    }

    if (formData.user_lastname.trim() === "") {
      newErrors.user_lastname = "Last name is required"
      isValid = false
    }

    if (formData.user_email.trim() === "") {
      newErrors.user_email = "Email is required"
      isValid = false
    } else if (!/\S+@\S+\.\S+/.test(formData.user_email)) {
      newErrors.user_email = "Email is invalid"
      isValid = false
    }

    if (formData.user_phone.trim() === "") {
      newErrors.user_phone = "Phone number is required"
      isValid = false
    } else if (!/^\d{10}$/.test(formData.user_phone)) {
      newErrors.user_phone = "Phone number is invalid"
      isValid = false
    }

    if (formData.message.trim() === "") {
      newErrors.message = "Message is required"
      isValid = false
    }

    setFormErrors(newErrors)
    return isValid
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }))
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: "",
      }))
    }
  }

  const sendEmail = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (validateForm()) {
      setButtonText("Sending...")

      // EmailJS integration - replace with your actual service details
      emailjs.sendForm(
        process.env.NEXT_PUBLIC_SERVICE_ID || 'your_service_id',
        process.env.NEXT_PUBLIC_TEMPLATE_ID || 'your_template_id', 
        form.current!,
        process.env.NEXT_PUBLIC_PUBLIC_KEY || 'your_public_key'
      )
      .then((result) => {
        console.log(result.text)
        console.log("message sent")
        setButtonText("Message Sent!")
        
        // Clear form data
        setFormData({
          user_firstname: "",
          user_lastname: "",
          user_email: "",
          user_phone: "",
          message: "",
        })

        // Reset button text after 3 seconds
        setTimeout(() => {
          setButtonText("Send Message")
        }, 3000)
      }, (error) => {
        console.log(error.text)
        setButtonText("Failed to Send!")
        
        // Reset button text after 3 seconds
        setTimeout(() => {
          setButtonText("Send Message")
        }, 3000)
      })
    }
  }

  return (
    <section id="contact" className="py-20">
      <div className="max-w-4xl mx-auto px-6">
        <h2 className="text-5xl font-bold text-center mb-16 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
          Get In Touch
        </h2>
        <div className="grid md:grid-cols-2 gap-12">
          <div className="space-y-6">
            <h3 className="text-2xl font-semibold mb-6">Let's Connect</h3>
            <p className="text-gray-300 leading-relaxed">
              I'm always interested in discussing new opportunities, innovative projects, and collaborations in AI/ML,
              full-stack development, and research.
            </p>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <Mail className="w-6 h-6 text-gray-400" />
                <span className="text-gray-300">keshariavedant@gmail.com</span>
              </div>
              <div className="flex items-center space-x-4">
                <Linkedin className="w-6 h-6 text-gray-400" />
                <span className="text-gray-300">linkedin.com/in/vedant-kesharia</span>
              </div>
              <div className="flex items-center space-x-4">
                <Github className="w-6 h-6 text-gray-400" />
                <span className="text-gray-300">github.com/vedantkesharia</span>
              </div>
            </div>
          </div>
          <form ref={form} onSubmit={sendEmail} className="space-y-6">
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
                {formErrors.user_firstname && <p className="text-red-400 text-sm mt-1">{formErrors.user_firstname}</p>}
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
                {formErrors.user_lastname && <p className="text-red-400 text-sm mt-1">{formErrors.user_lastname}</p>}
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
              {formErrors.user_email && <p className="text-red-400 text-sm mt-1">{formErrors.user_email}</p>}
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
              {formErrors.user_phone && <p className="text-red-400 text-sm mt-1">{formErrors.user_phone}</p>}
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
              {formErrors.message && <p className="text-red-400 text-sm mt-1">{formErrors.message}</p>}
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
  )
}




// "use client"
// import type React from "react"
// import { useState, useRef } from "react"
// import { Mail, Linkedin, Github } from "lucide-react"
// import emailjs from '@emailjs/browser'

// export function ContactSection() {
//   const [buttonText, setButtonText] = useState<string>("Send Message")
//   const [formData, setFormData] = useState({
//     user_firstname: "",
//     user_lastname: "",
//     user_email: "",
//     user_phone: "",
//     message: "",
//   })
//   const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  
//   const form = useRef<HTMLFormElement>(null)

//   const validateForm = (): boolean => {
//     let isValid = true
//     const newErrors: Record<string, string> = {}

//     if (formData.user_firstname.trim() === "") {
//       newErrors.user_firstname = "First name is required"
//       isValid = false
//     }

//     if (formData.user_lastname.trim() === "") {
//       newErrors.user_lastname = "Last name is required"
//       isValid = false
//     }

//     if (formData.user_email.trim() === "") {
//       newErrors.user_email = "Email is required"
//       isValid = false
//     } else if (!/\S+@\S+\.\S+/.test(formData.user_email)) {
//       newErrors.user_email = "Email is invalid"
//       isValid = false
//     }

//     if (formData.user_phone.trim() === "") {
//       newErrors.user_phone = "Phone number is required"
//       isValid = false
//     } else if (!/^\d{10}$/.test(formData.user_phone)) {
//       newErrors.user_phone = "Phone number is invalid"
//       isValid = false
//     }

//     if (formData.message.trim() === "") {
//       newErrors.message = "Message is required"
//       isValid = false
//     }

//     setFormErrors(newErrors)
//     return isValid
//   }

//   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
//     const { name, value } = e.target
//     setFormData((prevData) => ({
//       ...prevData,
//       [name]: value,
//     }))
//     // Clear error when user starts typing
//     if (formErrors[name]) {
//       setFormErrors((prev) => ({
//         ...prev,
//         [name]: "",
//       }))
//     }
//   }

//   const sendEmail = (e: React.FormEvent<HTMLFormElement>) => {
//     e.preventDefault()

//     if (validateForm()) {
//       setButtonText("Sending...")

//       // EmailJS integration - replace with your actual service details
//       emailjs.sendForm(
//         process.env.NEXT_PUBLIC_SERVICE_ID || 'your_service_id',
//         process.env.NEXT_PUBLIC_TEMPLATE_ID || 'your_template_id', 
//         form.current!,
//         process.env.NEXT_PUBLIC_PUBLIC_KEY || 'your_public_key'
//       )
//       .then((result) => {
//         console.log(result.text)
//         console.log("message sent")
//         setButtonText("Message Sent!")
        
//         // Clear form data
//         setFormData({
//           user_firstname: "",
//           user_lastname: "",
//           user_email: "",
//           user_phone: "",
//           message: "",
//         })

//         // Reset button text after 3 seconds
//         setTimeout(() => {
//           setButtonText("Send Message")
//         }, 3000)
//       }, (error) => {
//         console.log(error.text)
//         setButtonText("Failed to Send!")

        
        
//         // Reset button text after 3 seconds
//         setTimeout(() => {
//           setButtonText("Send Message")
//         }, 3000)
//       })
//     }
//   }

//   return (
//     <section id="contact" className="py-20">
//       <div className="max-w-4xl mx-auto px-6">
//         <h2 className="text-5xl font-bold text-center mb-16 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
//           Get In Touch
//         </h2>
//         <div className="grid md:grid-cols-2 gap-12">
//           <div className="space-y-6">
//             <h3 className="text-2xl font-semibold mb-6">Let's Connect</h3>
//             <p className="text-gray-300 leading-relaxed">
//               I'm always interested in discussing new opportunities, innovative projects, and collaborations in AI/ML,
//               full-stack development, and research.
//             </p>
//             <div className="space-y-4">
//               <div className="flex items-center space-x-4">
//                 <Mail className="w-6 h-6 text-gray-400" />
//                 <span className="text-gray-300">keshariavedant@gmail.com</span>
//               </div>
//               <div className="flex items-center space-x-4">
//                 <Linkedin className="w-6 h-6 text-gray-400" />
//                 <span className="text-gray-300">linkedin.com/in/vedant-kesharia</span>
//               </div>
//               <div className="flex items-center space-x-4">
//                 <Github className="w-6 h-6 text-gray-400" />
//                 <span className="text-gray-300">github.com/vedantkesharia</span>
//               </div>
//             </div>
//           </div>
//           <form ref={form} onSubmit={sendEmail} className="space-y-6">
//             <div className="grid grid-cols-2 gap-4">
//               <div>
//                 <input
//                   type="text"
//                   name="user_firstname"
//                   placeholder="First Name"
//                   value={formData.user_firstname}
//                   onChange={handleInputChange}
//                   className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg focus:border-white/50 focus:outline-none transition-colors duration-300"
//                 />
//                 {formErrors.user_firstname && <p className="text-red-400 text-sm mt-1">{formErrors.user_firstname}</p>}
//               </div>
//               <div>
//                 <input
//                   type="text"
//                   name="user_lastname"
//                   placeholder="Last Name"
//                   value={formData.user_lastname}
//                   onChange={handleInputChange}
//                   className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg focus:border-white/50 focus:outline-none transition-colors duration-300"
//                 />
//                 {formErrors.user_lastname && <p className="text-red-400 text-sm mt-1">{formErrors.user_lastname}</p>}
//               </div>
//             </div>
//             <div>
//               <input
//                 type="email"
//                 name="user_email"
//                 placeholder="Email Address"
//                 value={formData.user_email}
//                 onChange={handleInputChange}
//                 className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg focus:border-white/50 focus:outline-none transition-colors duration-300"
//               />
//               {formErrors.user_email && <p className="text-red-400 text-sm mt-1">{formErrors.user_email}</p>}
//             </div>
//             <div>
//               <input
//                 type="tel"
//                 name="user_phone"
//                 placeholder="Phone Number"
//                 value={formData.user_phone}
//                 onChange={handleInputChange}
//                 className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg focus:border-white/50 focus:outline-none transition-colors duration-300"
//               />
//               {formErrors.user_phone && <p className="text-red-400 text-sm mt-1">{formErrors.user_phone}</p>}
//             </div>
//             <div>
//               <textarea
//                 name="message"
//                 placeholder="Your Message"
//                 rows={5}
//                 value={formData.message}
//                 onChange={handleInputChange}
//                 className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg focus:border-white/50 focus:outline-none transition-colors duration-300 resize-none"
//               />
//               {formErrors.message && <p className="text-red-400 text-sm mt-1">{formErrors.message}</p>}
//             </div>
//             <button
//               type="submit"
//               className="w-full px-8 py-3 bg-white text-black font-medium hover:bg-gray-200 transition-all duration-300 transform hover:scale-105 rounded-lg"
//             >
//               {buttonText}
//             </button>
//           </form>
//         </div>
//       </div>
//     </section>
//   )
// }





// "use client"
// import type React from "react"
// import { useState } from "react"
// import { Mail, Linkedin, Github } from "lucide-react"

// export function ContactSection() {
//   const [buttonText, setButtonText] = useState<string>("Send Message")
//   const [formData, setFormData] = useState({
//     user_firstname: "",
//     user_lastname: "",
//     user_email: "",
//     user_phone: "",
//     message: "",
//   })
//   const [formErrors, setFormErrors] = useState<Record<string, string>>({})

//   const validateForm = (): boolean => {
//     let isValid = true
//     const newErrors: Record<string, string> = {}

//     if (formData.user_firstname.trim() === "") {
//       newErrors.user_firstname = "First name is required"
//       isValid = false
//     }

//     if (formData.user_lastname.trim() === "") {
//       newErrors.user_lastname = "Last name is required"
//       isValid = false
//     }

//     if (formData.user_email.trim() === "") {
//       newErrors.user_email = "Email is required"
//       isValid = false
//     } else if (!/\S+@\S+\.\S+/.test(formData.user_email)) {
//       newErrors.user_email = "Email is invalid"
//       isValid = false
//     }

//     if (formData.user_phone.trim() === "") {
//       newErrors.user_phone = "Phone number is required"
//       isValid = false
//     } else if (!/^\d{10}$/.test(formData.user_phone)) {
//       newErrors.user_phone = "Phone number is invalid"
//       isValid = false
//     }

//     if (formData.message.trim() === "") {
//       newErrors.message = "Message is required"
//       isValid = false
//     }

//     setFormErrors(newErrors)
//     return isValid
//   }

//   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
//     const { name, value } = e.target
//     setFormData((prevData) => ({
//       ...prevData,
//       [name]: value,
//     }))
//     // Clear error when user starts typing
//     if (formErrors[name]) {
//       setFormErrors((prev) => ({
//         ...prev,
//         [name]: "",
//       }))
//     }
//   }

//   const sendEmail = (e: React.FormEvent<HTMLFormElement>) => {
//     e.preventDefault()

//     if (validateForm()) {
//       setButtonText("Sending...")

//       // Simulate EmailJS call (replace with actual EmailJS implementation)
//       setTimeout(() => {
//         console.log("Email sent successfully")
//         setButtonText("Message Sent!")
//         setFormData({
//           user_firstname: "",
//           user_lastname: "",
//           user_email: "",
//           user_phone: "",
//           message: "",
//         })

//         setTimeout(() => {
//           setButtonText("Send Message")
//         }, 3000)
//       }, 2000)
//     }
//   }

//   return (
//     <section id="contact" className="py-20">
//       <div className="max-w-4xl mx-auto px-6">
//         <h2 className="text-5xl font-bold text-center mb-16 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
//           Get In Touch
//         </h2>
//         <div className="grid md:grid-cols-2 gap-12">
//           <div className="space-y-6">
//             <h3 className="text-2xl font-semibold mb-6">Let's Connect</h3>
//             <p className="text-gray-300 leading-relaxed">
//               I'm always interested in discussing new opportunities, innovative projects, and collaborations in AI/ML,
//               full-stack development, and research.
//             </p>
//             <div className="space-y-4">
//               <div className="flex items-center space-x-4">
//                 <Mail className="w-6 h-6 text-gray-400" />
//                 <span className="text-gray-300">keshariavedant@gmail.com</span>
//               </div>
//               <div className="flex items-center space-x-4">
//                 <Linkedin className="w-6 h-6 text-gray-400" />
//                 <span className="text-gray-300">linkedin.com/in/vedant-kesharia</span>
//               </div>
//               <div className="flex items-center space-x-4">
//                 <Github className="w-6 h-6 text-gray-400" />
//                 <span className="text-gray-300">github.com/vedantkesharia</span>
//               </div>
//             </div>
//           </div>
//           <form onSubmit={sendEmail} className="space-y-6">
//             <div className="grid grid-cols-2 gap-4">
//               <div>
//                 <input
//                   type="text"
//                   name="user_firstname"
//                   placeholder="First Name"
//                   value={formData.user_firstname}
//                   onChange={handleInputChange}
//                   className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg focus:border-white/50 focus:outline-none transition-colors duration-300"
//                 />
//                 {formErrors.user_firstname && <p className="text-red-400 text-sm mt-1">{formErrors.user_firstname}</p>}
//               </div>
//               <div>
//                 <input
//                   type="text"
//                   name="user_lastname"
//                   placeholder="Last Name"
//                   value={formData.user_lastname}
//                   onChange={handleInputChange}
//                   className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg focus:border-white/50 focus:outline-none transition-colors duration-300"
//                 />
//                 {formErrors.user_lastname && <p className="text-red-400 text-sm mt-1">{formErrors.user_lastname}</p>}
//               </div>
//             </div>
//             <div>
//               <input
//                 type="email"
//                 name="user_email"
//                 placeholder="Email Address"
//                 value={formData.user_email}
//                 onChange={handleInputChange}
//                 className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg focus:border-white/50 focus:outline-none transition-colors duration-300"
//               />
//               {formErrors.user_email && <p className="text-red-400 text-sm mt-1">{formErrors.user_email}</p>}
//             </div>
//             <div>
//               <input
//                 type="tel"
//                 name="user_phone"
//                 placeholder="Phone Number"
//                 value={formData.user_phone}
//                 onChange={handleInputChange}
//                 className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg focus:border-white/50 focus:outline-none transition-colors duration-300"
//               />
//               {formErrors.user_phone && <p className="text-red-400 text-sm mt-1">{formErrors.user_phone}</p>}
//             </div>
//             <div>
//               <textarea
//                 name="message"
//                 placeholder="Your Message"
//                 rows={5}
//                 value={formData.message}
//                 onChange={handleInputChange}
//                 className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg focus:border-white/50 focus:outline-none transition-colors duration-300 resize-none"
//               />
//               {formErrors.message && <p className="text-red-400 text-sm mt-1">{formErrors.message}</p>}
//             </div>
//             <button
//               type="submit"
//               className="w-full px-8 py-3 bg-white text-black font-medium hover:bg-gray-200 transition-all duration-300 transform hover:scale-105 rounded-lg"
//             >
//               {buttonText}
//             </button>
//           </form>
//         </div>
//       </div>
//     </section>
//   )
// }
