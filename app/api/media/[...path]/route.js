import { NextResponse } from "next/server";
import { get } from "@vercel/blob";

export async function GET(request, { params }) {
  try {
    const { path } = await params;

    if (!path || path.length === 0) {
      return new NextResponse("Media not found", {
        status: 404,
      });
    }

    const pathname = path.join("/");

    const blobUrl = `https://mde4ntxpctngvphv.private.blob.vercel-storage.com/${pathname}`;

    const result = await get(blobUrl, {
      access: "private",
    });

    if (!result || !result.stream) {
      return new NextResponse("Image not found", {
        status: 404,
      });
    }

    return new NextResponse(result.stream, {
      headers: {
        "Content-Type":
          result.blob?.contentType ||
          "image/jpeg",

        "Cache-Control":
          "private, max-age=3600",
      },
    });
  } catch (error) {
    console.error(
      "Media route error:",
      error
    );

    return new NextResponse(
      "Unable to load image",
      {
        status: 500,
      }
    );
  }
}
