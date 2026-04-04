import path from "path"
import { NextRequest, NextResponse } from "next/server"
import { getAdminCookieName, verifyAdminSessionToken } from "@/src/server/auth/admin-auth"
import { serverErrorResponse } from "@/src/server/http/json"
import { syncProductImagesBySlug } from "@/src/server/services/data-source"
import { removeProductImageByUrl, saveProductImage } from "@/src/server/uploads"
import { slugify } from "@/src/shared/utils"

function slugFromFilename(filename: string) {
  const extension = path.extname(filename)
  const baseName = path.basename(filename, extension)
  return slugify(baseName)
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get(getAdminCookieName())?.value
    if (!verifyAdminSessionToken(token)) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 })
    }

    const formData = await request.formData()
    const files = formData.getAll("files").filter((entry): entry is File => entry instanceof File)

    if (files.length === 0) {
      return NextResponse.json({ error: "Please attach one or more image files." }, { status: 400 })
    }

    const savedUploads: Array<{ slug: string; imageUrl: string; filename: string }> = []
    const invalidFiles: Array<{ filename: string; error: string }> = []

    for (const file of files) {
      const slug = slugFromFilename(file.name)
      if (!slug) {
        invalidFiles.push({
          filename: file.name,
          error: "Filename must contain a product slug, like nova-point-183.jpg.",
        })
        continue
      }

      try {
        const upload = await saveProductImage(file, { preferredBaseName: slug })
        savedUploads.push({ slug, imageUrl: upload.imageUrl, filename: file.name })
      } catch (error) {
        invalidFiles.push({
          filename: file.name,
          error: error instanceof Error ? error.message : "Upload failed.",
        })
      }
    }

    const syncResult = await syncProductImagesBySlug(
      savedUploads.map((upload) => ({
        slug: upload.slug,
        imageUrl: upload.imageUrl,
      }))
    )

    const matchedSlugs = new Set(syncResult.updated.map((product) => product.slug))
    const unmatchedFiles = savedUploads
      .filter((upload) => !matchedSlugs.has(upload.slug))
      .map((upload) => ({
        filename: upload.filename,
        slug: upload.slug,
        imageUrl: upload.imageUrl,
      }))

    await Promise.all(unmatchedFiles.map((file) => removeProductImageByUrl(file.imageUrl)))

    return NextResponse.json({
      updatedCount: syncResult.updated.length,
      updatedProducts: syncResult.updated.map((product) => ({
        id: product.id,
        slug: product.slug,
        name: product.name,
        imageUrl: product.imageUrl,
      })),
      unmatchedFiles,
      invalidFiles,
    })
  } catch (error) {
    return serverErrorResponse(error)
  }
}
