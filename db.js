// db.js — Database Setup & Helpers
import dotenv from "dotenv"
import pkg from "pg"
import crypto from "crypto"

dotenv.config()
const { Pool } = pkg

// -----------------------------
// Pool Setup
// -----------------------------
const pool = new Pool(
  process.env.DATABASE_URL
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }, // required on Vercel
      }
    : {
        host: process.env.PG_HOST || "localhost",
        user: process.env.PG_USER || "postgres",
        password: process.env.PG_PASS,
        database: process.env.PG_DB || "pjh_web",
        port: process.env.PG_PORT || 5432,
      }
)

export { pool }

// -----------------------------
// Migrations
// -----------------------------
async function runCustomerMigration() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS customers (
      id SERIAL PRIMARY KEY,
      business VARCHAR(255),
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      phone VARCHAR(50),
      address1 VARCHAR(255),
      address2 VARCHAR(255),
      city VARCHAR(100),
      county VARCHAR(100),
      postcode VARCHAR(20),
      notes TEXT
    );
  `)
}

async function runQuoteMigration() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS quotes (
      id SERIAL PRIMARY KEY,
      customer_id INTEGER NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
      quote_number VARCHAR(255) UNIQUE,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      items JSONB NOT NULL DEFAULT '[]',
      deposit NUMERIC(10,2) NOT NULL DEFAULT 0,
      notes TEXT,
      status VARCHAR(20) DEFAULT 'pending' CHECK (
        status IN ('pending','accepted','rejected','amend_requested')
      ),
      feedback TEXT,
      response_token VARCHAR(255) UNIQUE,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );
  `)

  // ensure updated_at exists
  const { rows } = await pool.query(
    `SELECT column_name FROM information_schema.columns WHERE table_name = 'quotes'`
  )
  const cols = rows.map(r => r.column_name)
  if (!cols.includes("updated_at")) {
    await pool.query(`ALTER TABLE quotes ADD COLUMN updated_at TIMESTAMP DEFAULT NOW()`)
  }
}

async function runQuoteHistoryMigration() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS quote_history (
      id SERIAL PRIMARY KEY,
      quote_id INT NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
      action VARCHAR(50) NOT NULL,
      feedback TEXT,
      actor VARCHAR(50) NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `)
}

async function runOrderMigration() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS orders (
      id SERIAL PRIMARY KEY,
      customer_id INTEGER NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
      quote_id INTEGER UNIQUE REFERENCES quotes(id) ON DELETE SET NULL,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      status VARCHAR(20) DEFAULT 'in_progress' CHECK (
        status IN ('in_progress','completed','cancelled')
      ),
      items JSONB NOT NULL DEFAULT '[]',
      tasks JSONB NOT NULL DEFAULT '[]',
      deposit NUMERIC(10,2) DEFAULT 0,
      balance NUMERIC(10,2) DEFAULT 0,
      diary JSONB NOT NULL DEFAULT '[]',
      deposit_invoiced BOOLEAN DEFAULT false,
      balance_invoiced BOOLEAN DEFAULT false,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );
  `)

  // ensure new columns exist
  const { rows } = await pool.query(
    `SELECT column_name FROM information_schema.columns WHERE table_name = 'orders'`
  )
  const cols = rows.map(r => r.column_name)

  if (!cols.includes("items")) {
    await pool.query(`ALTER TABLE orders ADD COLUMN items JSONB NOT NULL DEFAULT '[]'`)
  }
  if (!cols.includes("tasks")) {
    await pool.query(`ALTER TABLE orders ADD COLUMN tasks JSONB NOT NULL DEFAULT '[]'`)
  }
  if (!cols.includes("deposit")) {
    await pool.query(`ALTER TABLE orders ADD COLUMN deposit NUMERIC(10,2) DEFAULT 0`)
  }
  if (!cols.includes("balance")) {
    await pool.query(`ALTER TABLE orders ADD COLUMN balance NUMERIC(10,2) DEFAULT 0`)
  }
  if (!cols.includes("diary")) {
    await pool.query(`ALTER TABLE orders ADD COLUMN diary JSONB NOT NULL DEFAULT '[]'`)
  }
  if (!cols.includes("deposit_invoiced")) {
    await pool.query(`ALTER TABLE orders ADD COLUMN deposit_invoiced BOOLEAN DEFAULT false`)
  }
  if (!cols.includes("balance_invoiced")) {
    await pool.query(`ALTER TABLE orders ADD COLUMN balance_invoiced BOOLEAN DEFAULT false`)
  }
  if (!cols.includes("updated_at")) {
    await pool.query(`ALTER TABLE orders ADD COLUMN updated_at TIMESTAMP DEFAULT NOW()`)
  }
}

async function runOrderDiaryMigration() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS order_diary (
      id SERIAL PRIMARY KEY,
      order_id INT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      note TEXT NOT NULL,
      date TIMESTAMP DEFAULT NOW()
    );
  `)
}

async function runPaymentMigration() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS payments (
      id SERIAL PRIMARY KEY,
      order_id INT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      amount NUMERIC(10,2) NOT NULL,
      type VARCHAR(20) CHECK (type IN ('deposit','balance','full')),
      method VARCHAR(50),
      reference VARCHAR(255),
      created_at TIMESTAMP DEFAULT NOW()
    );
  `)
}

export async function runMigrations() {
  await runCustomerMigration()
  await runQuoteMigration()
  await runQuoteHistoryMigration()
  await runOrderMigration()
  await runOrderDiaryMigration()
  await runPaymentMigration()
  console.log("✅ All migrations complete")
}

// -----------------------------
// Helpers
// -----------------------------
export async function generateQuoteNumber(customerId, businessName = "Customer") {
  const safeBusiness = (businessName || "Customer").replace(/\s+/g, "-").toUpperCase()
  const { rows } = await pool.query(
    `SELECT COUNT(*)::int AS count FROM quotes WHERE customer_id=$1`,
    [customerId]
  )
  const count = rows[0].count + 1
  return `PJH-WS/${safeBusiness}/${String(count).padStart(6, "0")}`
}

export function generateResponseToken() {
  return crypto.randomUUID()
}

export default pool
