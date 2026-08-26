import { NextResponse } from "next/server";
import { get } from "@vercel/blob";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get("url");

    if (!url) {
      return new NextResponse("Image URL is required.", {
        status: 400,
      });
    }

    const blob = await get(url, {
      access: "private",
    });

    if (!blob) {
      return new NextResponse("Image not found.", {
        status: 404,
      });
    }

    return new NextResponse(blob.stream, {
      status: 200,
      headers: {
        "Content-Type":
          blob.contentType || "image/jpeg",
        "Cache-Control":
          "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("IMAGE API ERROR:", error);

    return new NextResponse(
      "Could not load image.",
      {
        status: 500,
      }
    );
  }
}
