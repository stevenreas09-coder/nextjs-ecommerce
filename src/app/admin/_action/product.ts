"use server"; 
// This marks the file as a Server Action file in Next.js — 
// all functions here run only on the server (not in the browser).

import db from "@/db/db"; // Prisma database instance
import { z } from "zod"; // Validation library
import fs from "fs/promises"; // Node.js file system API (Promise-based)
import { notFound, redirect } from "next/navigation"; // Next.js navigation helpers

/* -------------------------------------------------------------------------- */
/*                              🔹 SCHEMA VALIDATION                          */
/* -------------------------------------------------------------------------- */

// Define schema for file validation
const fileSchema = z.instanceof(File, { message: "Required" });

// Define schema for image validation
const imageSchema = fileSchema.refine(
  // Accept only if file is empty (optional) or starts with image MIME type
  (file) => file.size === 0 || file.type.startsWith("image/"),
  { message: "Must be an image file" }
);

// Schema for adding a new product
const addSchema = z.object({
  name: z.string().min(1), // Product name is required
  description: z.string().min(1), // Description is required
  priceInCents: z.coerce.number().int().min(1), // Must be a number (e.g. 1000 = $10.00)
  file: fileSchema.refine((file) => file.size > 0, "Required"), // File required
  image: imageSchema.refine((file) => file.size > 0, "Required"), // Image required
});

/* -------------------------------------------------------------------------- */
/*                              🔹 ADD PRODUCT                                */
/* -------------------------------------------------------------------------- */

export async function addProduct(prevState: unknown, formData: FormData) {
  // Validate the incoming form data using Zod schema
  const result = addSchema.safeParse(Object.fromEntries(formData.entries()));

  // If validation fails, return the field errors
  if (!result.success) return result.error.formErrors.fieldErrors;

  // Otherwise, extract validated data
  const data = result.data;

  /* --------------------- 🗂️ Save File to Local Directory -------------------- */
  // Create folder "products" if it doesn’t exist
  await fs.mkdir("products", { recursive: true });

  // Generate a unique filename using UUID (to prevent duplicates)
  const filePath = `products/${crypto.randomUUID()}-${data.file.name}`;

  // Save the uploaded file in /products folder
  await fs.writeFile(filePath, Buffer.from(await data.file.arrayBuffer()));

  /* --------------------- 🖼️ Save Image to Public Directory ------------------ */
  await fs.mkdir("public/products", { recursive: true });

  // Image will be accessible publicly at /products/...
  const imagePath = `/products/${crypto.randomUUID()}-${data.image.name}`;

  // Write the image into /public/products
  await fs.writeFile(
    `public${imagePath}`,
    Buffer.from(await data.image.arrayBuffer())
  );

  /* --------------------- 💾 Save Data to Database -------------------------- */
  await db.product.create({
    data: {
      isAvailableForPurchase: false, // Default new products as unavailable
      name: data.name,
      description: data.description,
      priceInCents: data.priceInCents,
      filePath, // Where file is stored
      imagePath, // Where image is stored
    },
  });

  // Redirect user back to product list after saving
  redirect("/admin/products");
}

/* -------------------------------------------------------------------------- */
/*                              🔹 EDIT PRODUCT                               */
/* -------------------------------------------------------------------------- */

// Schema for editing a product (file/image optional)
const editSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  priceInCents: z.coerce.number().int().min(1),
  file: z.instanceof(File).optional(),
  image: z.instanceof(File).optional(),
});

export async function updateProduct(
  id: string,
  prevState: unknown,
  formData: FormData
) {
  // Validate form data
  const result = editSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!result.success) return result.error.formErrors.fieldErrors;

  const data = result.data;

  // Find the existing product in the database
  const product = await db.product.findUnique({ where: { id } });
  if (!product) return notFound();

  /* --------------------- 🗂️ Handle File Update ----------------------------- */
  let filePath = product.filePath;
  if (data.file && data.file.size > 0) {
    // Delete old file if it exists (ignore error if not found)
    await fs.unlink(product.filePath).catch(() => {});
    // Save new file
    filePath = `products/${crypto.randomUUID()}-${data.file.name}`;
    await fs.writeFile(filePath, Buffer.from(await data.file.arrayBuffer()));
  }

  /* --------------------- 🖼️ Handle Image Update ---------------------------- */
  let imagePath = product.imagePath;
  if (data.image && data.image.size > 0) {
    // Delete old image file (ignore error if not found)
    await fs.unlink(`public${product.imagePath}`).catch(() => {});
    // Save new image
    imagePath = `/products/${crypto.randomUUID()}-${data.image.name}`;
    await fs.writeFile(
      `public${imagePath}`,
      Buffer.from(await data.image.arrayBuffer())
    );
  }

  /* --------------------- 💾 Update Database Record ------------------------- */
  await db.product.update({
    where: { id },
    data: {
      isAvailableForPurchase: false, // Reset availability after editing
      name: data.name,
      description: data.description,
      priceInCents: data.priceInCents,
      filePath,
      imagePath,
    },
  });

  // Redirect to product list page
  redirect("/admin/products");
}

/* -------------------------------------------------------------------------- */
/*                        🔹 TOGGLE PRODUCT AVAILABILITY                      */
/* -------------------------------------------------------------------------- */

export async function ToggleProductAvailability(
  id: string,
  isAvailableForPurchase: boolean
) {
  // Update product's availability status (true/false)
  await db.product.update({ where: { id }, data: { isAvailableForPurchase } });
}

/* -------------------------------------------------------------------------- */
/*                              🔹 DELETE PRODUCT                             */
/* -------------------------------------------------------------------------- */

export async function DeleteProduct(id: string) {
  // Find the product before deleting (to remove files)
  const product = await db.product.findUnique({ where: { id } });
  if (!product) return notFound();

  // Delete files safely, ignore if already missing
  await fs.unlink(product.filePath).catch(() => {});
  await fs.unlink(`public${product.imagePath}`).catch(() => {});

  // Remove product record from database
  await db.product.delete({ where: { id } });
}
  