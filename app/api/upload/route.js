import { get, put } from "@vercel/blob";
import { neon } from "@neondatabase/serverless";
import { NextResponse } from "next/server";
import sharp from "sharp";

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
          result.blob.contentType || "image/webp",

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
Compress image and upload to PRIVATE Vercel Blob
=========================================================
*/
export async function POST(request) {
  try {
    const formData = await request.formData();

    const file = formData.get("file");
    const albumId = formData.get("albumId");

    /*
    -----------------------------------------------------
    Validate file
    -----------------------------------------------------
    */
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

    /*
    -----------------------------------------------------
    Check album exists
    -----------------------------------------------------
    */
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
    -----------------------------------------------------
    Read uploaded image
    -----------------------------------------------------
    */
    const originalBuffer = Buffer.from(
      await file.arrayBuffer()
    );

    /*
    -----------------------------------------------------
    COMPRESS IMAGE
    -----------------------------------------------------

    Maximum dimensions:
    2400 x 2400

    Output:
    WebP

    Quality:
    82

    This significantly reduces storage size while
    keeping the image looking good.
    -----------------------------------------------------
    */
    const compressedBuffer = await sharp(originalBuffer)
      .rotate()
      .resize({
        width: 2400,
        height: 2400,
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({
        quality: 82,
        effort: 4,
      })
      .toBuffer();

    /*
    -----------------------------------------------------
    Create safe filename
    -----------------------------------------------------
    */
    const originalName = file.name || "image";
    const baseName = originalName
      .replace(/\.[^/.]+$/, "")
      .replace(/[^a-zA-Z0-9-_]/g, "-");

    const fileName =
      `${baseName}-${Date.now()}.webp`;

    /*
    -----------------------------------------------------
    Upload COMPRESSED image to PRIVATE Blob
    -----------------------------------------------------
    */
    const blob = await put(
      `crm-media/${fileName}`,
      compressedBuffer,
      {
        access: "private",
        addRandomSuffix: true,
        contentType: "image/webp",
      }
    );

    /*
    -----------------------------------------------------
    Save private Blob URL in database
    -----------------------------------------------------
    */
    const photo = await sql`
      INSERT INTO photos (
        album_id,
        name,
        url
      )
      VALUES (
        ${numericAlbumId},
        ${originalName},
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
    -----------------------------------------------------
    Website-accessible API URL
    -----------------------------------------------------
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

      compression: {
        originalSize: originalBuffer.length,
        compressedSize: compressedBuffer.length,

        savedBytes:
          originalBuffer.length -
          compressedBuffer.length,

        savedPercentage:
          originalBuffer.length > 0
            ? Math.round(
                (
                  1 -
                  compressedBuffer.length /
                    originalBuffer.length
                ) * 100
              )
            : 0,
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
