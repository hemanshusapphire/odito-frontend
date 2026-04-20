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
    <div className="min-h-screen bg-black">
      <Navbar />
      <PricingHero isYearly={isYearly} setIsYearly={setIsYearly} />
      <PricingGrid isYearly={isYearly} onCtaClick={handleCtaClick} />
      <PricingCTA />
    </div>
  )
}
