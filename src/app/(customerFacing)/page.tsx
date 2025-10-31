import { ProductCard, ProductCardSkeleton } from "@/components/ProductCard"
import { Button } from "@/components/ui/button"
import db from "@/db/db"
import { ArrowRight } from "lucide-react"
import Link from "next/link"
import { Suspense } from "react"

// ✅ Directly fetch most popular products (no cache)
async function getMostPopularProducts() {
  return db.product.findMany({
    where: { isAvailableForPurchase: true },
    orderBy: { order: { _count: "desc" } },
    take: 6,
  })
}

// ✅ Directly fetch newest products
async function getNewestProducts() {
  return db.product.findMany({
    where: { isAvailableForPurchase: true },
    orderBy: { createdAt: "desc" },
    take: 6,
  })
}

// ✅ Main page component
export default function HomePage() {
  return (
    <main className="space-y-12">
      <ProductSection title="Most Popular" fetchProducts={getMostPopularProducts} />
      <ProductSection title="Newest" fetchProducts={getNewestProducts} />
    </main>
  )
}

// ✅ Reusable section (like "Most Popular" or "Newest")
function ProductSection({
  title,
  fetchProducts,
}: {
  title: string
  fetchProducts: () => Promise<any[]>
}) {
  return (
    <section className="space-y-4">   
      <div className="flex items-center gap-4">
        <h2 className="text-3xl font-bold">{title}</h2>
        <Button variant="outline" asChild>
          <Link href="/products" className="space-x-2">
            <span>View All</span>
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Suspense
          fallback={
            <>
              <ProductCardSkeleton />
              <ProductCardSkeleton />
              <ProductCardSkeleton />
            </>
          }
        >
          <ProductsList fetchProducts={fetchProducts} />
        </Suspense>
      </div>
    </section>
  )
}

// ✅ Async server component that fetches and renders cards
async function ProductsList({
  fetchProducts,
}: {
  fetchProducts: () => Promise<any[]>
}) {
  const products = await fetchProducts()
  return products.map((product) => (
    <ProductCard key={product.id} {...product} />
  ))
}
