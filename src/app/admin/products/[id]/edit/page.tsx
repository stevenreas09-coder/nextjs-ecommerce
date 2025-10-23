import db from "@/db/db";
import { PageHeader } from "../../../_components/pageHeader";
import ProductForm from "../../_components/productForm";

export default async function EditProductPage(props: {
  params: Promise<{ id: string }>;
}) {
  // ✅ Await the params before using them
  const { id } = await props.params;

  const product = await db.product.findUnique({ where: { id } });

  if (!product) {
    return <div className="text-destructive">Product not found.</div>;
  }

  return (
    <>
      <PageHeader>Edit Product</PageHeader>
      <ProductForm product={product} />
    </>
  );
}
