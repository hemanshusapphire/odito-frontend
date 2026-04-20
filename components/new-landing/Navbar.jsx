"use client";

import { Navbar1 } from "@/components/ui/navbar1"

export default function Navbar() {
  const menu = [
    {
      title: "Platform",
      url: "#",
      items: [
        {
          title: "Analytics",
          description: "Real-time SEO performance tracking",
          icon: null,
          url: "#features",
        },
        {
          title: "Rank Prediction",
          description: "AI-powered forecasting",
          icon: null,
          url: "#features",
        },
        {
          title: "Backlink Analysis",
          description: "Authority mapping tools",
          icon: null,
          url: "#features",
        },
      ],
    },
    {
      title: "Solutions",
      url: "#",
      items: [
        {
          title: "Enterprise",
          description: "Scalable solutions for large teams",
          icon: null,
          url: "#solutions",
        },
        {
          title: "Agency",
          description: "Multi-client management",
          icon: null,
          url: "#solutions",
        },
        {
          title: "E-commerce",
          description: "Product-focused SEO",
          icon: null,
          url: "#solutions",
        },
      ],
    },
    {
      title: "Features",
      url: "/features",
    },
    {
      title: "Pricing",
      url: "/pricing",
    },
    {
      title: "Company",
      url: "/about",
    },
    {
      title: "Contact",
      url: "/contact",
    },
  ]

  return (
    <div className="fixed top-0 w-full z-50 bg-black shadow-[0px_0px_15px_rgba(160,120,255,0.15)]">
      <Navbar1
        logo={{
          url: "/",
          src: "",
          alt: "Odito",
          title: "Odito",
        }}
        menu={menu}
        auth={{
          login: { text: "Sign In", url: "/login" },
          signup: { text: "Get Started", url: "/signup" },
        }}
      />
    </div>
  );
}
