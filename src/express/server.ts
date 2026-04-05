import { createExpressApp } from "@/src/express/app"

const port = Number(process.env.EXPRESS_PORT ?? 4000)
const app = createExpressApp()

app.listen(port, () => {
  console.log(`FluxCart Express API running on http://localhost:${port}`)
})
