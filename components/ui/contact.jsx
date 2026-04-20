"use client"

import React from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'

const defaultSocialLinks = [
  { id: '1', name: 'X', iconSrc: 'https://cdn.jsdelivr.net/npm/simple-icons@v5/icons/x.svg', href: '#x' },
  { id: '2', name: 'Instagram', iconSrc: 'https://cdn.jsdelivr.net/npm/simple-icons@v5/icons/instagram.svg', href: '#instagram' },
  { id: '3', name: 'LinkedIn', iconSrc: 'https://cdn.jsdelivr.net/npm/simple-icons@v5/icons/linkedin.svg', href: '#linkedin' },
]

export function ContactSection({
  title = "We can turn your dream project into reality",
  mainMessage = "Let's talk! 👋",
  contactEmail = "hello@odito.ai",
  socialLinks = defaultSocialLinks,
  backgroundImageSrc = "https://images.unsplash.com/photo-1742273330004-ef9c9d228530?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHx0b3BpYy1mZWVkfDY0fENEd3V3WEpBYkV3fHxlbnwwfHx8fHw%3D&auto=format&fit=crop&q=60&w=900",
  onSubmit,
}) {
  const [formData, setFormData] = React.useState({
    name: '',
    email: '',
    message: '',
    projectType: [],
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleCheckboxChange = (type, checked) => {
    setFormData((prev) => {
      const currentTypes = prev.projectType
      if (checked) {
        return { ...prev, projectType: [...currentTypes, type] }
      } else {
        return { ...prev, projectType: currentTypes.filter((t) => t !== type) }
      }
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit?.(formData)
    console.log("Form submitted:", formData)
  }

  const projectTypeOptions = [
    'Website', 'Mobile App', 'Web App', 'E-Commerce',
    'Brand Identity', 'SEO Audit', 'Social Media Marketing',
    'Brand Strategy & Consulting', 'Other'
  ]

  return (
    <section className="relative min-h-screen w-screen overflow-hidden bg-black pt-32 pb-20">
      <div className="relative z-10 flex flex-col items-center justify-center w-full h-full px-4 md:px-8 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full max-w-6xl items-center">
          <div className="p-4 lg:p-8">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white leading-tight max-w-lg">
              {title}
            </h1>
          </div>

          <div className="bg-[#0e0e13] p-6 rounded-lg shadow-xl border border-white/10">
            <h2 className="text-xl font-bold text-white mb-4">{mainMessage}</h2>

            <div className="mb-4">
              <p className="text-gray-400 mb-2 text-sm">Mail us at</p>
              <a href={`mailto:${contactEmail}`} className="text-primary hover:underline font-medium text-sm">
                {contactEmail}
              </a>
              <div className="flex items-center space-x-3 mt-3">
                <span className="text-gray-400 text-sm">OR</span>
                {socialLinks.map((link) => (
                  <Button key={link.id} variant="outline" size="icon" asChild className="h-8 w-8">
                    <a href={link.href} aria-label={link.name}>
                      <img src={link.iconSrc} alt={link.name} className="h-3 w-3 dark:invert" />
                    </a>
                  </Button>
                ))}
              </div>
            </div>

            <hr className="my-4 border-white/10" />

            <form onSubmit={handleSubmit} className="space-y-4">
              <p className="text-gray-400 text-sm">Leave us a brief message</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="name" className="text-xs">Your name</Label>
                  <Input id="name" name="name" placeholder="Your name" value={formData.name} onChange={handleChange} required className="h-9" />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="email" className="text-xs">Email</Label>
                  <Input id="email" name="email" type="email" placeholder="Email" value={formData.email} onChange={handleChange} required className="h-9" />
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="message" className="text-xs">Briefly describe your project idea...</Label>
                <Textarea
                  id="message"
                  name="message"
                  placeholder="Briefly describe your project idea..."
                  className="min-h-[60px] text-sm"
                  value={formData.message}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-3">
                <p className="text-gray-400 text-sm">I'm looking for...</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1">
                  {projectTypeOptions.map((option) => (
                    <div key={option} className="flex items-center space-x-1">
                      <Checkbox
                        id={option.replace(/\s/g, '-').toLowerCase()}
                        checked={formData.projectType.includes(option)}
                        onCheckedChange={(checked) => handleCheckboxChange(option, checked)}
                      />
                      <Label htmlFor={option.replace(/\s/g, '-').toLowerCase()} className="text-xs font-normal text-gray-300">
                        {option}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <Button type="submit" className="w-full">
                Send a message
              </Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  )
}
