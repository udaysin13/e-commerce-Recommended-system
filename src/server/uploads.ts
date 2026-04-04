import { promises as fs } from "fs"
import path from "path"

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"])
const uploadsDirectory = path.join(process.cwd(), "public", "uploads", "products")

function sanitizeFileName(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9.-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
}

type SaveProductImageOptions = {
  preferredBaseName?: string
}

export async function saveProductImage(file: File, options?: SaveProductImageOptions) {
  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    throw new Error("Only JPEG, PNG, WebP, and GIF images are allowed.")
  }

  if (file.size <= 0) {
    throw new Error("Please select a valid image file.")
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new Error("Image size must be 5 MB or smaller.")
  }

  await fs.mkdir(uploadsDirectory, { recursive: true })

  const extension = path.extname(file.name || "").toLowerCase() || ".jpg"
  const desiredBaseName = options?.preferredBaseName || path.basename(file.name || "product-image", extension)
  const safeBaseName = sanitizeFileName(desiredBaseName)
  const fileName = options?.preferredBaseName
    ? `${safeBaseName || "product-image"}${extension}`
    : `${Date.now()}-${safeBaseName || "product-image"}${extension}`
  const filePath = path.join(uploadsDirectory, fileName)
  const buffer = Buffer.from(await file.arrayBuffer())

  await fs.writeFile(filePath, buffer)

  return {
    imageUrl: `/uploads/products/${fileName}`,
    size: file.size,
    type: file.type,
  }
}

export async function removeProductImageByUrl(imageUrl: string) {
  if (!imageUrl.startsWith("/uploads/products/")) {
    return
  }

  const relativeFilePath = imageUrl.replace("/uploads/products/", "")
  const filePath = path.join(uploadsDirectory, relativeFilePath)

  try {
    await fs.unlink(filePath)
  } catch {
    // Ignore missing files during cleanup.
  }
}
