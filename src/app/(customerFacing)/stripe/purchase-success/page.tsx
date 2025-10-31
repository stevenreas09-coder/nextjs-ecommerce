import { Button } from "@/components/ui/button"
import db from "@/db/db"
import { formatCurrency } from "@/lib/formatters"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string)

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ payment_intent?: string }>
}) {
  // ✅ Await the async searchParams
  const params = await searchParams

  // ✅ Validate existence
  if (!params?.payment_intent) return notFound()

  // ✅ Safely fetch from Stripe (handle invalid/expired payment)
  let paymentIntent
  try {
    paymentIntent = await stripe.paymentIntents.retrieve(params.payment_intent)
  } catch (err) {
    console.error("Stripe retrieval error:", err)
    return notFound()
  }

  if (!paymentIntent.metadata?.productId) return notFound()

  const product = await db.product.findUnique({
    where: { id: paymentIntent.metadata.productId },
  })
  if (!product) return notFound()

  const isSuccess = paymentIntent.status === "succeeded"
  const downloadId = await createDownloadVerification(product.id)

  return (
    <div className="max-w-5xl mx-auto w-full space-y-8">
      <h1 className="text-4xl font-bold">
        {isSuccess ? "Success!" : "Error!"}
      </h1>

      <div className="flex gap-4 items-center">
        <div className="aspect-video flex-shrink-0 w-1/3 relative">
          <Image
            src={product.imagePath}
            fill
            alt={product.name}
            className="object-cover rounded-lg"
          />
        </div>

        <div>
          <div className="text-lg">
            {formatCurrency(product.priceInCents / 100)}
          </div>
          <h2 className="text-2xl font-bold">{product.name}</h2>
          <p className="line-clamp-3 text-muted-foreground">
            {product.description}
          </p>

          <Button className="mt-4" size="lg" asChild>
            {isSuccess ? (
              <a href={`/products/download/${downloadId}`}>Download</a>
            ) : (
              <Link href={`/products/${product.id}/purchase`}>Try Again</Link>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

async function createDownloadVerification(productId: string) {
  const verification = await db.downloadVerification.create({
    data: {
      productId,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24), // expires in 24h
    },
  })
  return verification.id
}
