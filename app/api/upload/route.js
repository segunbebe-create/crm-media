import { get, put } from "@vercel/blob";
import { neon } from "@neondatabase/serverless";
import { NextResponse } from "next/server";

const sql = neon(process.env.DATABASE_URL);

/*
=========================================================
GET
Serve private Blob images through our API
=========================================================
*/

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    const blobUrl = searchParams.get("url");

    if (!blobUrl) {
      return NextResponse.json(
        { error: "Image URL is required." },
        { status: 400 }
      );
    }

    const result = await get(blobUrl, {
      access: "private",
    });

    if (!result) {
      return new NextResponse("Image not found.", {
        status: 404,
      });
    }

    return new NextResponse(result.stream, {
      status: 200,
      headers: {
        "Content-Type":
          result.blob.contentType || "image/jpeg",

        "Cache-Control":
          "public, max-age=31536000, immutable",

        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error("GET IMAGE ERROR:", error);

    return new NextResponse("Could not load image.", {
      status: 500,
    });
  }
}

/*
=========================================================
POST
Upload image to private Vercel Blob
=========================================================
*/

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

    const numericAlbumId = Number(albumId);

    if (
      !Number.isInteger(numericAlbumId) ||
      numericAlbumId <= 0
    ) {
      return NextResponse.json(
        { error: "Invalid album ID." },
        { status: 400 }
      );
    }

    const album = await sql`
      SELECT id
      FROM albums
      WHERE id = ${numericAlbumId}
    `;

    if (album.length === 0) {
      return NextResponse.json(
        { error: "Album does not exist." },
        { status: 404 }
      );
    }

    /*
    Upload to PRIVATE Blob storage.
    */

    const blob = await put(
      `crm-media/${Date.now()}-${file.name}`,
      file,
      {
        access: "private",
        addRandomSuffix: true,
      }
    );

    /*
    Save the original private Blob URL.
    */

    const photo = await sql`
      INSERT INTO photos (
        album_id,
        name,
        url
      )
      VALUES (
        ${numericAlbumId},
        ${file.name},
        ${blob.url}
      )
      RETURNING
        id,
        album_id,
        name,
        url,
        created_at
    `;

    /*
    Return an API URL that the website can actually display.
    */

    const imageUrl =
      `/api/upload?url=${encodeURIComponent(
        blob.url
      )}`;

    return NextResponse.json({
      success: true,

      photo: {
        ...photo[0],
        url: imageUrl,
      },
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
