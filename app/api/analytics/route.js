import { neon } from "@neondatabase/serverless";
import { NextResponse } from "next/server";

const sql = neon(process.env.DATABASE_URL);

/*
=========================================================
POST
Record an analytics event
=========================================================
Supported events:

website_view
album_view
photo_view
download
=========================================================
*/

export async function POST(request) {
  try {
    const body = await request.json();

    const eventType = body.eventType;
    const albumId = body.albumId
      ? Number(body.albumId)
      : null;
    const photoId = body.photoId
      ? Number(body.photoId)
      : null;
    const pagePath = body.pagePath || null;

    const allowedEvents = [
      "website_view",
      "album_view",
      "photo_view",
      "download",
    ];

    if (!allowedEvents.includes(eventType)) {
      return NextResponse.json(
        {
          error: "Invalid analytics event.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      albumId !== null &&
      (!Number.isInteger(albumId) || albumId <= 0)
    ) {
      return NextResponse.json(
        {
          error: "Invalid album ID.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      photoId !== null &&
      (!Number.isInteger(photoId) || photoId <= 0)
    ) {
      return NextResponse.json(
        {
          error: "Invalid photo ID.",
        },
        {
          status: 400,
        }
      );
    }

    await sql`
      INSERT INTO analytics_events (
        event_type,
        album_id,
        photo_id,
        page_path
      )
      VALUES (
        ${eventType},
        ${albumId},
        ${photoId},
        ${pagePath}
      )
    `;

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(
      "ANALYTICS TRACKING ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error: "Could not record analytics event.",
      },
      {
        status: 500,
      }
    );
  }
}

/*
=========================================================
GET
Return statistics for the Admin Dashboard
=========================================================
*/

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    const key = searchParams.get("key");

    /*
    Admin analytics protection.

    Use the same setup key for now.
    We will later connect this to the proper
    admin authentication system.
    */

    if (key !== "CRM-SETUP-2026") {
      return NextResponse.json(
        {
          error: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    /*
    -----------------------------------------------------
    TOTAL COUNTS
    -----------------------------------------------------
    */

    const totals = await sql`
      SELECT
        COUNT(*) FILTER (
          WHERE event_type = 'website_view'
        ) AS website_views,

        COUNT(*) FILTER (
          WHERE event_type = 'album_view'
        ) AS album_views,

        COUNT(*) FILTER (
          WHERE event_type = 'photo_view'
        ) AS photo_views,

        COUNT(*) FILTER (
          WHERE event_type = 'download'
        ) AS downloads
      FROM analytics_events
    `;

    /*
    -----------------------------------------------------
    TOTAL ALBUMS
    -----------------------------------------------------
    */

    const albums = await sql`
      SELECT COUNT(*) AS total_albums
      FROM albums
    `;

    /*
    -----------------------------------------------------
    TOTAL PHOTOS
    -----------------------------------------------------
    */

    const photos = await sql`
      SELECT COUNT(*) AS total_photos
      FROM photos
    `;

    /*
    -----------------------------------------------------
    TODAY'S STATISTICS
    -----------------------------------------------------
    */

    const today = await sql`
      SELECT
        COUNT(*) FILTER (
          WHERE event_type = 'website_view'
        ) AS website_views,

        COUNT(*) FILTER (
          WHERE event_type = 'album_view'
        ) AS album_views,

        COUNT(*) FILTER (
          WHERE event_type = 'photo_view'
        ) AS photo_views,

        COUNT(*) FILTER (
          WHERE event_type = 'download'
        ) AS downloads

      FROM analytics_events

      WHERE created_at >= CURRENT_DATE
    `;

    /*
    -----------------------------------------------------
    LAST 7 DAYS
    -----------------------------------------------------
    */

    const weekly = await sql`
      SELECT
        DATE(created_at) AS date,

        COUNT(*) FILTER (
          WHERE event_type = 'website_view'
        ) AS website_views,

        COUNT(*) FILTER (
          WHERE event_type = 'album_view'
        ) AS album_views,

        COUNT(*) FILTER (
          WHERE event_type = 'photo_view'
        ) AS photo_views,

        COUNT(*) FILTER (
          WHERE event_type = 'download'
        ) AS downloads

      FROM analytics_events

      WHERE created_at >= CURRENT_DATE - INTERVAL '6 days'

      GROUP BY DATE(created_at)

      ORDER BY DATE(created_at) ASC
    `;

    /*
    -----------------------------------------------------
    MOST VIEWED PHOTOS
    -----------------------------------------------------
    */

    const topPhotos = await sql`
      SELECT
        p.id,
        p.name,
        p.album_id,
        a.name AS album_name,
        COUNT(*) AS views

      FROM analytics_events ae

      INNER JOIN photos p
        ON ae.photo_id = p.id

      LEFT JOIN albums a
        ON p.album_id = a.id

      WHERE ae.event_type = 'photo_view'

      GROUP BY
        p.id,
        p.name,
        p.album_id,
        a.name

      ORDER BY views DESC

      LIMIT 10
    `;

    /*
    -----------------------------------------------------
    MOST DOWNLOADED PHOTOS
    -----------------------------------------------------
    */

    const topDownloads = await sql`
      SELECT
        p.id,
        p.name,
        p.album_id,
        a.name AS album_name,
        COUNT(*) AS downloads

      FROM analytics_events ae

      INNER JOIN photos p
        ON ae.photo_id = p.id

      LEFT JOIN albums a
        ON p.album_id = a.id

      WHERE ae.event_type = 'download'

      GROUP BY
        p.id,
        p.name,
        p.album_id,
        a.name

      ORDER BY downloads DESC

      LIMIT 10
    `;

    /*
    -----------------------------------------------------
    RETURN EVERYTHING
    -----------------------------------------------------
    */

    return NextResponse.json({
      success: true,

      totals: {
        websiteViews:
          Number(totals[0]?.website_views || 0),

        albumViews:
          Number(totals[0]?.album_views || 0),

        photoViews:
          Number(totals[0]?.photo_views || 0),

        downloads:
          Number(totals[0]?.downloads || 0),

        totalAlbums:
          Number(albums[0]?.total_albums || 0),

        totalPhotos:
          Number(photos[0]?.total_photos || 0),
      },

      today: {
        websiteViews:
          Number(today[0]?.website_views || 0),

        albumViews:
          Number(today[0]?.album_views || 0),

        photoViews:
          Number(today[0]?.photo_views || 0),

        downloads:
          Number(today[0]?.downloads || 0),
      },

      weekly: weekly.map((day) => ({
        date: day.date,

        websiteViews:
          Number(day.website_views || 0),

        albumViews:
          Number(day.album_views || 0),

        photoViews:
          Number(day.photo_views || 0),

        downloads:
          Number(day.downloads || 0),
      })),

      topPhotos: topPhotos.map((photo) => ({
        id: photo.id,
        name: photo.name,
        albumId: photo.album_id,
        albumName: photo.album_name,
        views: Number(photo.views || 0),
      })),

      topDownloads: topDownloads.map((photo) => ({
        id: photo.id,
        name: photo.name,
        albumId: photo.album_id,
        albumName: photo.album_name,
        downloads: Number(photo.downloads || 0),
      })),
    });
  } catch (error) {
    console.error(
      "ANALYTICS GET ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Could not load analytics.",
      },
      {
        status: 500,
      }
    );
  }
}
