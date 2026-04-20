"use client"

import Navbar from "@/components/new-landing/Navbar"
import { ContactSection } from "@/components/ui/contact"

export default function ContactPage() {
  const handleFormSubmit = (data) => {
    console.log("Contact form submitted:", data)
    fetch("/api/contact", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
  }

  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      <ContactSection
        title="We can turn your dream project into reality"
        mainMessage="Let's talk! 👋"
        contactEmail="hello@odito.ai"
        onSubmit={handleFormSubmit}
      />
    </div>
  )
}
