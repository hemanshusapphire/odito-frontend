import { NextResponse } from "next/server"
import { Resend } from "resend"

// Sender must be an address on a domain verified in Resend — mail.oditoai.com
// is the verified sending domain for this project (see Resend dashboard).
const FROM_ADDRESS = process.env.CONTACT_FROM_ADDRESS || "Odito Contact Form <contact@mail.oditoai.com>"

// Where contact form submissions land. No hardcoded fallback here on
// purpose — a previous guessed default (hello@odito.ai) silently swallowed
// every submission because that address never accepted inbound mail (Resend
// showed every send stuck at last_event "sent", never "delivered"). Getting
// this wrong fails loudly instead of silently, since it's unverifiable from
// code alone.
const TO_ADDRESS = process.env.CONTACT_NOTIFICATION_EMAIL

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

export async function POST(request) {
  try {
    const body = await request.json()
    const { name, email, subject, message, projectType } = body
    const projectTypes = Array.isArray(projectType) ? projectType.filter(Boolean) : []

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    if (!email.includes("@")) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      )
    }

    if (!process.env.RESEND_API_KEY) {
      console.error("Contact form error: RESEND_API_KEY is not configured")
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      )
    }

    if (!TO_ADDRESS) {
      console.error("Contact form error: CONTACT_NOTIFICATION_EMAIL is not configured")
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      )
    }

    const resend = new Resend(process.env.RESEND_API_KEY)

    const html = `
      <div style="font-family: sans-serif; font-size: 14px; line-height: 1.6; color: #111;">
        <h2 style="margin: 0 0 16px;">New contact form submission</h2>
        <p><strong>Name:</strong> ${escapeHtml(name)}</p>
        <p><strong>Email:</strong> ${escapeHtml(email)}</p>
        ${subject ? `<p><strong>Subject:</strong> ${escapeHtml(subject)}</p>` : ""}
        ${projectTypes.length ? `<p><strong>Looking for:</strong> ${escapeHtml(projectTypes.join(", "))}</p>` : ""}
        <p><strong>Message:</strong></p>
        <p style="white-space: pre-wrap;">${escapeHtml(message)}</p>
      </div>
    `

    const { error } = await resend.emails.send({
      from: FROM_ADDRESS,
      to: TO_ADDRESS,
      replyTo: email,
      subject: subject ? `[Contact] ${subject}` : `New contact form submission from ${name}`,
      html,
    })

    if (error) {
      console.error("Contact form error: Resend failed to send", error)
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { message: "Contact form submitted successfully" },
      { status: 200 }
    )
  } catch (error) {
    console.error("Contact form error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
