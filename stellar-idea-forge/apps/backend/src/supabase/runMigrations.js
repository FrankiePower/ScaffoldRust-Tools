import fs from "fs";
import path from "path";
import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Client } = pg;

async function runMigrations() {
  const client = new Client({
    connectionString: process.env.SUPABASE_URL,
  });

  await client.connect();

  const migrationsDir = path.join(process.cwd(), "src", "supabase", "migrations");
  const files = fs.readdirSync(migrationsDir).sort();

  for (const file of files) {
    const filePath = path.join(migrationsDir, file);
    const sql = fs.readFileSync(filePath, "utf8");

    console.log(`Running migration: ${file}`);
    await client.query(sql);
  }

  await client.end();
  console.log("✅ All migrations applied");
}

runMigrations().catch((err) => {
  console.error("❌ Migration failed:", err);
  process.exit(1);
});
