import { put } from "@vercel/blob";
import { neon } from "@neondatabase/serverless";
import { NextResponse } from "next/server";

const sql = neon(process.env.DATABASE_URL);

export async function POST(request) {
  try {
    const formData = await request.formData();

    const file = formData.get("file");
    const albumId = formData.get("albumId");

    if (!file) {
      return NextResponse.json(
        { error: "No file provided." },
        { status: 400 }
      );
    }

    if (!albumId) {
      return NextResponse.json(
        { error: "Album ID is required." },
        { status: 400 }
      );
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "Only image files are allowed." },
        { status: 400 }
      );
    }

    const album = await sql`
      SELECT id
      FROM albums
      WHERE id = ${Number(albumId)}
    `;

    if (album.length === 0) {
      return NextResponse.json(
        { error: "Album does not exist." },
        { status: 404 }
      );
    }

    const blob = await put(
      `crm-media/${Date.now()}-${file.name}`,
      file,
      {
        access: "private",
        addRandomSuffix: true,
      }
    );

    const photo = await sql`
      INSERT INTO photos (
        album_id,
        name,
        url
      )
      VALUES (
        ${Number(albumId)},
        ${file.name},
        ${blob.url}
      )
      RETURNING id, album_id, name, url, created_at
    `;

    return NextResponse.json({
      success: true,
      photo: photo[0],
    });
  } catch (error) {
    console.error("UPLOAD ERROR:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Upload failed.",
      },
      { status: 500 }
    );
  }
}
