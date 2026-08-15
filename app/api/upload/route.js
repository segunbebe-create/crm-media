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

    await sql`
      CREATE TABLE IF NOT EXISTS albums (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

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

    return NextResponse.json({
      success: true,
      message: "CRM Media database tables created successfully.",
    });
  } catch (error) {
    console.error("DATABASE SETUP ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Database setup failed.",
      },
      { status: 500 }
    );
  }
}
