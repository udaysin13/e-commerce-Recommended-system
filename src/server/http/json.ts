import { NextResponse } from "next/server"
import { ZodType } from "zod"

export async function parseJsonBody<T>(
  request: Request,
  schema: ZodType<T>,
  invalidMessage = "Invalid payload."
) {
  try {
    const body = await request.json()
    const parsed = schema.safeParse(body)

    if (!parsed.success) {
      return {
        ok: false as const,
        response: NextResponse.json(
          { error: parsed.error.issues[0]?.message ?? invalidMessage },
          { status: 400 }
        ),
      }
    }

    return {
      ok: true as const,
      data: parsed.data,
    }
  } catch {
    return {
      ok: false as const,
      response: NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 }),
    }
  }
}

export function serverErrorResponse(error: unknown) {
  console.error(error)
  if (error instanceof Error) {
    if (/not found/i.test(error.message)) {
      return NextResponse.json({ error: error.message }, { status: 404 })
    }
    if (/already exists/i.test(error.message)) {
      return NextResponse.json({ error: error.message }, { status: 409 })
    }
  }
  return NextResponse.json({ error: "Internal server error." }, { status: 500 })
}
