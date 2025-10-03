// api/migrate.js
import { runMigrations } from "../db.js"

export default async function handler(req, res) {
  try {
    await runMigrations()
    res.status(200).json({ success: true, message: "✅ All migrations completed" })
  } catch (err) {
    console.error("❌ Migration error:", err)
    res.status(500).json({ success: false, message: "Migration failed", error: err.message })
  }
}
