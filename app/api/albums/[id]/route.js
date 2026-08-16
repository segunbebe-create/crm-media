import { neon } from "@neondatabase/serverless";
import { NextResponse } from "next/server";

const sql = neon(process.env.DATABASE_URL);

export async function GET(request, { params }) {
  try {
    const { id } = await params;

    const albumId = Number(id);

    if (!albumId) {
      return NextResponse.json(
        { error: "Invalid album ID." },
        { status: 400 }
      );
    }

    const albums = await sql`
      SELECT
        id,
        name,
        description,
        created_at
      FROM albums
      WHERE id = ${albumId}
    `;

    if (albums.length === 0) {
      return NextResponse.json(
        { error: "Album not found." },
        { status: 404 }
      );
    }

    const photos = await sql`
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
      album: albums[0],
      photos,
    });
  } catch (error) {
    console.error("GET ALBUM ERROR:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Could not load album.",
      },
      { status: 500 }
    );
  }
}
