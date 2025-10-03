// routes/adminQuotes.js
import express from "express"
import pool from "../db.js"

const router = express.Router()

// -----------------------------
// POST /api/admin/quotes/:id/accept
// Admin accepts a quote
// -----------------------------
router.post("/:id/accept", async (req, res) => {
  const { id } = req.params

  try {
    const result = await pool.query(
      `UPDATE quotes 
       SET status='accepted' 
       WHERE id=$1 RETURNING *`,
      [id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Quote not found" })
    }

    const quote = result.rows[0]

    // log to history
    await pool.query(
      `INSERT INTO quote_history (quote_id, action, actor) VALUES ($1, 'accepted', 'admin')`,
      [quote.id]
    )

    res.json({ success: true, message: "Quote accepted by admin", quote })
  } catch (err) {
    console.error("❌ Admin error accepting quote:", err)
    res.status(500).json({ success: false, message: "Failed to accept quote" })
  }
})

// -----------------------------
// POST /api/admin/quotes/:id/reject
// Admin rejects a quote
// -----------------------------
router.post("/:id/reject", async (req, res) => {
  const { id } = req.params
  const { feedback } = req.body

  try {
    const result = await pool.query(
      `UPDATE quotes 
       SET status='rejected', feedback=$2 
       WHERE id=$1 RETURNING *`,
      [id, feedback || null]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Quote not found" })
    }

    const quote = result.rows[0]

    // log to history
    await pool.query(
      `INSERT INTO quote_history (quote_id, action, feedback, actor) VALUES ($1, 'rejected', $2, 'admin')`,
      [quote.id, feedback || null]
    )

    res.json({ success: true, message: "Quote rejected by admin", quote })
  } catch (err) {
    console.error("❌ Admin error rejecting quote:", err)
    res.status(500).json({ success: false, message: "Failed to reject quote" })
  }
})

// -----------------------------
// POST /api/admin/quotes/:id/amend
// Admin requests an amendment
// -----------------------------
router.post("/:id/amend", async (req, res) => {
  const { id } = req.params
  const { feedback } = req.body

  try {
    const result = await pool.query(
      `UPDATE quotes 
       SET status='amend_requested', feedback=$2 
       WHERE id=$1 RETURNING *`,
      [id, feedback || null]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Quote not found" })
    }

    const quote = result.rows[0]

    // log to history
    await pool.query(
      `INSERT INTO quote_history (quote_id, action, feedback, actor) VALUES ($1, 'amend_requested', $2, 'admin')`,
      [quote.id, feedback || null]
    )

    res.json({ success: true, message: "Amendment requested by admin", quote })
  } catch (err) {
    console.error("❌ Admin error requesting amendment:", err)
    res.status(500).json({ success: false, message: "Failed to request amendment" })
  }
})

export default router
