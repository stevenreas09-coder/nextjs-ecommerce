import { NextRequest, NextResponse } from "next/server";
import { notFound } from "next/navigation";
import fs from "fs";
import path from "path";
import mime from "mime";
import db from "@/db/db";

/**
 * GET /admin/products/[id]/download?name=ProductName
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }  // <-- Updated type to Promise
) {
  try {
    const { id } = await params;  // <-- Await as before

    // --- 1. Fetch product from DB ---
    const product = await db.product.findUnique({
      where: { id },
      select: { filePath: true, name: true },
    });

    if (!product) return notFound();

    // --- 2. Determine requested filename ---
    const requestedName = req.nextUrl.searchParams.get("name");
    const baseName = requestedName ? decodeURIComponent(requestedName) : product.name;
    const safeBaseName = baseName.replace(/[^a-z0-9_ \.-]/gi, "_");

    // --- 3. Determine full file path ---
    const safeFileName = path.basename(product.filePath); // prevents traversal
    const fullPath = path.join(process.cwd(), "products", safeFileName); // adjust folder if needed


    if (!fs.existsSync(fullPath)) {
      console.error("File not found:", fullPath);
      return new NextResponse("File not found", { status: 404 });
    }

    // --- 4. Determine MIME type and extension ---
    const extension = path.extname(fullPath);
    const mimeType = mime.getType(fullPath) || "application/octet-stream";
    const filename = `${safeBaseName}${extension}`;

    // --- 5. Stream file as Web ReadableStream (TypeScript-safe) ---
    const nodeStream = fs.createReadStream(fullPath);
    const webStream = new ReadableStream({
      async start(controller) {
        nodeStream.on("data", (chunk) => controller.enqueue(chunk));
        nodeStream.on("end", () => controller.close());
        nodeStream.on("error", (err) => controller.error(err));
      },
    });

    // --- 6. Set headers ---
    const headers = new Headers();
    headers.set("Content-Type", mimeType);
    headers.set("Content-Disposition", `attachment; filename="${filename}"`);

    // --- 7. Return the streamed response ---
    return new NextResponse(webStream, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error("Download route error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
