"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Navbar from "@/components/new-landing/Navbar"
import PricingHero from "@/components/pricing/PricingHero"
import PricingGrid from "@/components/pricing/PricingGrid"
import PricingCTA from "@/components/pricing/PricingCTA"
import { useAuth } from "@/contexts/AuthContext"
import { savePaymentIntent } from "@/utils/paymentUtils"

export default function PricingPage() {
  const [isYearly, setIsYearly] = useState(false)
  const router = useRouter()
  const { isAuthenticated } = useAuth()

  const handleCtaClick = (ctaType) => {
    switch (ctaType) {
      case 'pay_as_you_go':
        if (isAuthenticated) {
          router.push('/dashboard')
        } else {
          router.push('/signup')
        }
        break
        
      case 'upgrade_premium':
        const planType = isYearly ? 'premium_yearly' : 'premium_monthly'
        const billingCycle = isYearly ? 'yearly' : 'monthly'
        const price = isYearly ? '$290/year' : '$29/month'
        
        savePaymentIntent({
          planType,
          billingCycle,
          planName: 'Premium',
          price
        })
        
        if (!isAuthenticated) {
          router.push('/login')
        } else {
          window.dispatchEvent(new CustomEvent('showPaymentConfirm'))
        }
        break
        
      case 'enterprise':
        if (!isAuthenticated) {
          router.push('/signup')
        } else {
          router.push('/contact-sales')
        }
        break
        
      default:
        console.warn('Unknown CTA type:', ctaType)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] relative overflow-hidden">
      {/* Dark Overlay */}
      <div className="absolute inset-0 dark-overlay -z-10"></div>
      
      {/* Grid Pattern */}
      <div className="absolute inset-0 grid-pattern -z-10 opacity-50"></div>

      {/* Decorative Background Elements - Cyan/Purple Theme */}
      <div className="absolute inset-0 -z-10 opacity-15">
        <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full blur-[120px] bg-cyan-500/10"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full blur-[100px] bg-purple-500/10"></div>
      </div>

      {/* Bottom Decorative Gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0a0a0f] to-transparent -z-10"></div>
      
      <Navbar />
      <PricingHero isYearly={isYearly} setIsYearly={setIsYearly} />
      <PricingGrid isYearly={isYearly} onCtaClick={handleCtaClick} />
      <PricingCTA />
    </div>
  )
}
