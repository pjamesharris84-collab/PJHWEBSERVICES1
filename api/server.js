// api/server.js — Express app for Vercel serverless functions
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

import express from "express";
import cors from "cors";
import serverless from "serverless-http";

// Routers
import customers from "../routes/customers.js";
import quotes from "../routes/quotes.js";
import emails from "../routes/email.js";
import responses from "../routes/responses.js";
import quoteResponses from "../routes/quoteResponses.js";
import auth from "../routes/auth.js";
import invoices from "../routes/invoices.js";
import contact from "../routes/contact.js";
import adminQuotes from "../routes/adminQuotes.js";
import orders from "../routes/orders.js";

const app = express();

app.use(cors());
app.use(express.json());

// Mount routes
app.use("/api/customers", customers);
app.use("/api/customers", quotes);
app.use("/api/customers", emails);
app.use("/api/responses", responses);
app.use("/api/quotes", quoteResponses);
app.use("/api", auth);
app.use("/api/invoices", invoices);
app.use("/api/contact", contact);
app.use("/api/admin/quotes", adminQuotes);
app.use("/api/orders", orders);

// Health check
app.get("/api/health", (_req, res) => res.json({ ok: true }));

// Export wrapped app for Vercel
export default serverless(app);
