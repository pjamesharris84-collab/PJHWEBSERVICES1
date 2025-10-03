import express from "express"
import serverless from "serverless-http"

const app = express()

app.get("/api/server", (req, res) => {
  res.json({ message: "Hello from Vercel Backend!" })
})

export default serverless(app)
