"use server"

import db from "@/db/db"
import OrderHistoryEmail from "@/email/OrderHistory"
import { Resend } from "resend"
import { z } from "zod"

const emailSchema = z.string().email()
const resend = new Resend(process.env.RESEND_API_KEY!)

export async function emailOrderHistory(
  prevState: unknown,
  formData: FormData
): Promise<{ message?: string; error?: string }> {
  const result = emailSchema.safeParse(formData.get("email"))

  if (!result.success) {
    return { error: "Invalid email address" }
  }

  const user = await db.user.findUnique({
    where: { email: result.data },
    select: {
      email: true,
      order: {
        select: {
          pricePaidInCents: true,
          id: true,
          createdAt: true,
          product: {
            select: {
              id: true,
              name: true,
              imagePath: true,
              description: true,
            },
          },
        },
      },
    },
  })

  // ✅ Fix: message should appear *only when user exists and email sent successfully*
  if (!user) {
    return { error: "No user found with that email address." }
  }

  // ✅ Wait for all orders to resolve before sending email
  const ordersWithVerification = await Promise.all(
    user.order.map(async order => ({
      ...order,
      downloadVerificationId: (
        await db.downloadVerification.create({
          data: {
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
            productId: order.product.id,
          },
        })
      ).id,
    }))
  )

  const { error } = await resend.emails.send({
    from: `Support <${process.env.SENDER_EMAIL}>`,
    to: user.email,
    subject: "Your Order History",
    react: <OrderHistoryEmail orders={ordersWithVerification} />,
  })

  if (error) {
    return { error: "There was an error sending your email. Please try again." }
  }

  return {
    message:
      "Check your inbox for your order history and download links. It’s on the way!",
  }
}
