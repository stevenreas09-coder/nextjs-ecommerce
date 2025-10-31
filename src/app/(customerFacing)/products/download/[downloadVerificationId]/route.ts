import db from "@/db/db"
import { NextRequest, NextResponse } from "next/server"
import fs from "fs/promises"

export async function GET(
  req: NextRequest,
  { params: { downloadVerificationId } }: { params: { downloadVerificationId: string } }
) {
  // ✅ Find verification entry in DB (ensure not expired)
  const data = await db.downloadVerification.findUnique({
    where: {
      id: downloadVerificationId,
      expiresAt: { gt: new Date() },
    },
    select: {
      product: {
        select: {
          filePath: true,
          name: true,
        },
      },
    },
  })

  // ❌ Redirect if not found or expired
  if (!data) {
    return NextResponse.redirect(new URL("/products/download/expired", req.url))
  }

  // ✅ Read the file
  const { size } = await fs.stat(data.product.filePath)
  const fileBuffer = await fs.readFile(data.product.filePath)
  const extension = data.product.filePath.split(".").pop()

  // ✅ Convert Node Buffer → ArrayBuffer safely
  const arrayBuffer = fileBuffer.buffer.slice(
    fileBuffer.byteOffset,
    fileBuffer.byteOffset + fileBuffer.byteLength
  ) as ArrayBuffer // <-- ✅ Explicit cast fixes the type

  // ✅ Return file as download response
  return new NextResponse(arrayBuffer, {
    headers: {
      "Content-Disposition": `attachment; filename="${data.product.name}.${extension}"`,
      "Content-Length": size.toString(),
      "Content-Type": "application/octet-stream",
    },
  })
}
