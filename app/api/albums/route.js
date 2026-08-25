import { neon } from "@neondatabase/serverless";
import { NextResponse } from "next/server";

const sql = neon(process.env.DATABASE_URL);

export async function GET() {
  try {
    const albums = await sql`
      SELECT
        a.id,
        a.name,
        a.description,
        a.created_at,
        (
          SELECT p.url
          FROM photos p
          WHERE p.album_id = a.id
          ORDER BY p.created_at DESC
          LIMIT 1
        ) AS cover_url
      FROM albums a
      ORDER BY a.created_at DESC
    `;

    return NextResponse.json(albums);
  } catch (error) {
    console.error("GET ALBUMS ERROR:", error);

    return NextResponse.json(
      {
        error: "Could not load albums.",
      },
      {
        status: 500,
      }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();

    const name = body.name?.trim();
    const description =
      body.description?.trim() || "";

    if (!name) {
      return NextResponse.json(
        {
          error: "Album name is required.",
        },
        {
          status: 400,
        }
      );
    }

    const result = await sql`
      INSERT INTO albums (
        name,
        description
      )
      VALUES (
        ${name},
        ${description}
      )
      RETURNING
        id,
        name,
        description,
        created_at
    `;

    return NextResponse.json(
      result[0],
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "CREATE ALBUM ERROR:",
      error
    );

    return NextResponse.json(
      {
        error: "Could not create album.",
      },
      {
        status: 500,
      }
    );
  }
}

export async function DELETE(request) {
  try {
    const body = await request.json();

    const id = Number(body.id);

    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json(
        {
          error: "Album ID is required.",
        },
        {
          status: 400,
        }
      );
    }

    await sql`
      DELETE FROM albums
      WHERE id = ${id}
    `;

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(
      "DELETE ALBUM ERROR:",
      error
    );

    return NextResponse.json(
      {
        error: "Could not delete album.",
      },
      {
        status: 500,
      }
    );
  }
}
