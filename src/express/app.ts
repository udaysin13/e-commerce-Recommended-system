import bcrypt from "bcryptjs"
import cors from "cors"
import express, { type NextFunction, type Request, type Response } from "express"
import { createSessionToken, verifySessionToken, type SessionPayload } from "@/src/server/auth/user-auth"
import { prisma } from "@/src/server/db/prisma"
import { queryProducts, getProductById } from "@/src/server/services/data-source"
import { getCartItems, addOrUpdateCartItem, removeCartItem } from "@/src/server/services/cart"
import { createOrder, getOrders } from "@/src/server/services/orders"
import {
  getHybridRecommendations,
  getSimilarProducts,
  trackProductView,
} from "@/src/server/services/hybrid-recommendations"
import {
  cartDeleteSchema,
  cartMutationSchema,
  orderCreateSchema,
  productQuerySchema,
  productViewSchema,
  recommendationQuerySchema,
  userLoginSchema,
  userSignupSchema,
} from "@/src/server/validation/api-schemas"

type AuthedRequest = Request & {
  auth?: SessionPayload
}

function getBearerToken(request: Request) {
  const value = request.headers.authorization
  if (!value?.startsWith("Bearer ")) return undefined
  return value.slice("Bearer ".length)
}

function requireAuth(request: AuthedRequest, response: Response, next: NextFunction) {
  const token = getBearerToken(request)
  const payload = token ? verifySessionToken(token) : null

  if (!payload) {
    response.status(401).json({ error: "Unauthorized." })
    return
  }

  request.auth = payload
  next()
}

export function createExpressApp() {
  const app = express()

  app.use(cors())
  app.use(express.json())

  app.get("/health", (_request, response) => {
    response.json({ ok: true, service: "fluxcart-express-api" })
  })

  app.post("/auth/signup", async (request, response) => {
    const parsed = userSignupSchema.safeParse(request.body)
    if (!parsed.success) {
      response.status(400).json({ error: parsed.error.issues[0]?.message ?? "Invalid signup payload." })
      return
    }

    const existing = await prisma.user.findUnique({ where: { email: parsed.data.email } })
    if (existing) {
      response.status(409).json({ error: "Email already in use." })
      return
    }

    const passwordHash = await bcrypt.hash(parsed.data.password, 12)
    const user = await prisma.user.create({
      data: {
        name: parsed.data.name,
        email: parsed.data.email,
        passwordHash,
        role: "USER",
      },
      select: { id: true, name: true, email: true, role: true },
    })

    response.status(201).json({
      user,
      token: createSessionToken({ userId: user.id, role: user.role }),
    })
  })

  app.post("/auth/login", async (request, response) => {
    const parsed = userLoginSchema.safeParse(request.body)
    if (!parsed.success) {
      response.status(400).json({ error: parsed.error.issues[0]?.message ?? "Invalid login payload." })
      return
    }

    const user = await prisma.user.findUnique({
      where: { email: parsed.data.email },
      select: { id: true, name: true, email: true, role: true, passwordHash: true },
    })

    if (!user || !(await bcrypt.compare(parsed.data.password, user.passwordHash))) {
      response.status(401).json({ error: "Invalid credentials." })
      return
    }

    response.json({
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      token: createSessionToken({ userId: user.id, role: user.role }),
    })
  })

  app.get("/products", async (request, response) => {
    const parsed = productQuerySchema.safeParse(request.query)
    if (!parsed.success) {
      response.status(400).json({ error: parsed.error.issues[0]?.message ?? "Invalid product query." })
      return
    }

    const payload = await queryProducts(parsed.data)
    response.json(payload)
  })

  app.get("/product/:id", async (request, response) => {
    const item = await getProductById(request.params.id)
    if (!item) {
      response.status(404).json({ error: "Product not found." })
      return
    }

    response.json({ item })
  })

  app.get("/similar/:productId", async (request, response) => {
    const parsed = recommendationQuerySchema.safeParse(request.query)
    if (!parsed.success) {
      response.status(400).json({ error: parsed.error.issues[0]?.message ?? "Invalid similarity query." })
      return
    }

    const items = await getSimilarProducts(request.params.productId, parsed.data.limit)
    response.json({ items })
  })

  app.get("/recommendations/:userId", async (request, response) => {
    const parsed = recommendationQuerySchema.safeParse(request.query)
    if (!parsed.success) {
      response.status(400).json({ error: parsed.error.issues[0]?.message ?? "Invalid recommendation query." })
      return
    }

    const items = await getHybridRecommendations(request.params.userId, parsed.data.limit)
    response.json({ items })
  })

  app.post("/interactions/view", requireAuth, async (request: AuthedRequest, response) => {
    const parsed = productViewSchema.safeParse(request.body)
    if (!parsed.success || !request.auth) {
      response.status(400).json({ error: parsed.error?.issues[0]?.message ?? "Invalid view payload." })
      return
    }

    await trackProductView(request.auth.userId, parsed.data.productId)
    response.status(201).json({ ok: true })
  })

  app.get("/cart", requireAuth, async (request: AuthedRequest, response) => {
    const items = await getCartItems(request.auth!.userId)
    response.json({ items })
  })

  app.post("/cart", requireAuth, async (request: AuthedRequest, response) => {
    const parsed = cartMutationSchema.safeParse(request.body)
    if (!parsed.success) {
      response.status(400).json({ error: parsed.error.issues[0]?.message ?? "Invalid cart payload." })
      return
    }

    const items = await addOrUpdateCartItem(request.auth!.userId, parsed.data.productId, parsed.data.quantity)
    response.json({ items })
  })

  app.delete("/cart", requireAuth, async (request: AuthedRequest, response) => {
    const parsed = cartDeleteSchema.safeParse(request.body)
    if (!parsed.success) {
      response.status(400).json({ error: parsed.error.issues[0]?.message ?? "Invalid cart delete payload." })
      return
    }

    const items = await removeCartItem(request.auth!.userId, parsed.data.productId)
    response.json({ items })
  })

  app.get("/orders", requireAuth, async (request: AuthedRequest, response) => {
    const orders = await getOrders(request.auth!.userId)
    response.json({ orders })
  })

  app.post("/orders", requireAuth, async (request: AuthedRequest, response) => {
    const parsed = orderCreateSchema.safeParse(request.body)
    if (!parsed.success) {
      response.status(400).json({ error: parsed.error.issues[0]?.message ?? "Invalid order payload." })
      return
    }

    const order = await createOrder(
      request.auth!.userId,
      parsed.data.items,
      parsed.data.shippingAddress,
    )

    response.status(201).json({ order })
  })

  app.use((error: Error, _request: Request, response: Response, _next: NextFunction) => {
    response.status(500).json({ error: error.message || "Internal server error." })
  })

  return app
}
