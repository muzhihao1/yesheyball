/**
 * Migration: Add longest_streak column to users table
 *
 * This migration adds the longest_streak field to track historical best training streaks.
 * Run this once before starting the server with the updated code.
 */

import "dotenv/config";
import { db } from "../db.js";
import { sql } from "drizzle-orm";

async function migrate() {
  try {
    console.log("📦 Starting migration: Add longest_streak column...");

    if (!db) {
      console.error("❌ Database connection not available");
      console.error("Please ensure DATABASE_URL is set in your environment variables");
      process.exit(1);
    }

    // Add longest_streak column
    await db.execute(sql`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS longest_streak INTEGER NOT NULL DEFAULT 0;
    `);

    console.log("✅ Migration successful: longest_streak column added");
    console.log("📝 Note: Run the backfill script to populate this field with correct values");

    process.exit(0);
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
}

migrate();
