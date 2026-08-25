import { neon } from "@neondatabase/serverless";
import { NextResponse } from "next/server";

const sql = neon(process.env.DATABASE_URL);

export async function GET(request, { params }) {
  try {
    const { id } = await params;

    // Make sure the ID is valid
    const albumId = Number.parseInt(id, 10);

    if (!Number.isInteger(albumId) || albumId <= 0) {
      return NextResponse.json(
        {
          error: "Invalid album ID.",
        },
        {
          status: 400,
        }
      );
    }

    // Get the album
    const albumResult = await sql`
      SELECT
        id,
        name,
        description,
        created_at
      FROM albums
      WHERE id = ${albumId}
      LIMIT 1
    `;

    if (albumResult.length === 0) {
      return NextResponse.json(
        {
          error: "Album not found.",
        },
        {
          status: 404,
        }
      );
    }

    // Get all photos belonging to this album
    const photoResult = await sql`
      SELECT
        id,
        album_id,
        name,
        url,
        created_at
      FROM photos
      WHERE album_id = ${albumId}
      ORDER BY created_at DESC
    `;

    return NextResponse.json({
      success: true,
      album: albumResult[0],
      photos: photoResult,
    });
  } catch (error) {
    console.error(
      "GET /api/albums/[id] ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Could not load album.",
      },
      {
        status: 500,
      }
    );
  }
}
