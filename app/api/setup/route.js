import { neon } from "@neondatabase/serverless";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const url = new URL(request.url);

    // Prevent accidental setup calls without the secret
    const setupKey = url.searchParams.get("key");

    if (setupKey !== "CRM-SETUP-2026") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const sql = neon(process.env.DATABASE_URL);

    // ==========================================
    // ALBUMS TABLE
    // ==========================================
    await sql`
      CREATE TABLE IF NOT EXISTS albums (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // ==========================================
    // PHOTOS TABLE
    // ==========================================
    await sql`
      CREATE TABLE IF NOT EXISTS photos (
        id SERIAL PRIMARY KEY,
        album_id INTEGER NOT NULL
          REFERENCES albums(id)
          ON DELETE CASCADE,
        name TEXT NOT NULL,
        url TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // ==========================================
    // ANALYTICS TABLE
    // ==========================================
    await sql`
      CREATE TABLE IF NOT EXISTS analytics_events (
        id SERIAL PRIMARY KEY,
        event_type VARCHAR(50) NOT NULL,
        album_id INTEGER,
        photo_id INTEGER,
        page_path TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // ==========================================
    // ANALYTICS INDEXES
    // ==========================================
    await sql`
      CREATE INDEX IF NOT EXISTS analytics_events_type_idx
      ON analytics_events(event_type)
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS analytics_events_created_idx
      ON analytics_events(created_at)
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS analytics_events_photo_idx
      ON analytics_events(photo_id)
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS analytics_events_album_idx
      ON analytics_events(album_id)
    `;

    return NextResponse.json({
      success: true,
      message:
        "CRM Media database tables and analytics system created successfully.",
    });
  } catch (error) {
    console.error("DATABASE SETUP ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error.message ||
          "Database setup failed.",
      },
      { status: 500 }
    );
  }
}
