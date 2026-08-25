"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  const [albums, setAlbums] = useState([]);
  const [heroImage, setHeroImage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAlbums();
  }, []);

  async function loadAlbums() {
    try {
      const response = await fetch("/api/albums", {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Could not load albums.");
      }

      const data = await response.json();

      setAlbums(data);

      // Collect albums that actually have a photo
      const albumsWithPhotos = data.filter(
        (album) => album.cover_url
      );

      // Pick a random uploaded photo for the hero
      if (albumsWithPhotos.length > 0) {
        const randomAlbum =
          albumsWithPhotos[
            Math.floor(
              Math.random() * albumsWithPhotos.length
            )
          ];

        setHeroImage(randomAlbum.cover_url);
      }
    } catch (error) {
      console.error("HOME ERROR:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="site">

      {/* =====================================================
          NAVIGATION
      ===================================================== */}

      <header className="navbar">

        <a className="brand" href="/">
          <img
            src="/logo.png"
            alt="CRM Media"
          />

          <div>
            <strong>CRM MEDIA</strong>
            <span>
              Chapel of Rest Ministry
            </span>
          </div>
        </a>

        <nav>
          <a href="#home">Home</a>

          <a href="#gallery">
            Gallery
          </a>

          <a href="/albums">
            Albums
          </a>
        </nav>

        <a
          href="/admin"
          className="admin-btn"
        >
          Admin Login
        </a>

      </header>

      {/* =====================================================
          HERO
      ===================================================== */}

      <section
        className="hero"
        id="home"
        style={
          heroImage
            ? {
                backgroundImage: `
                  linear-gradient(
                    90deg,
                    rgba(0,0,0,0.88) 0%,
                    rgba(0,0,0,0.68) 45%,
                    rgba(0,0,0,0.25) 100%
                  ),
                  url("${heroImage}")
                `,
              }
            : undefined
        }
      >

        <div className="hero-content">

          <span className="hero-label">
            CHAPEL OF REST MINISTRY
          </span>

          <h1>
            Moments worth
            <br />
            <span>remembering.</span>
          </h1>

          <p>
            Explore memorable moments, services,
            programs and events captured by the
            CRM Media team.
          </p>

          <div className="hero-actions">

            <a
              href="/albums"
              className="primary-btn"
            >
              Browse Gallery →
            </a>

            <a
              href="#gallery"
              className="secondary-btn"
            >
              View Latest Photos
            </a>

          </div>

        </div>

        <div className="hero-gradient" />

      </section>

      {/* =====================================================
          LATEST ALBUMS
      ===================================================== */}

      <section
        className="gallery-section"
        id="gallery"
      >

        <div className="section-heading">

          <div>
            <span className="small-label">
              CRM MEDIA
            </span>

            <h2>
              Latest captures
            </h2>
          </div>

          <p>
            Discover memorable moments from
            Chapel of Rest Ministry.
          </p>

        </div>

        {loading ? (

          <div className="empty-state">
            <div className="loading-spinner" />

            <h3>
              Loading latest photos...
            </h3>
          </div>

        ) : albums.length === 0 ? (

          <div className="empty-state">

            <h3>
              No albums yet
            </h3>

            <p>
              New church memories will appear here soon.
            </p>

          </div>

        ) : (

          <div className="home-album-grid">

            {albums.slice(0, 6).map((album) => (

              <article
                className="home-album-card"
                key={album.id}
                onClick={() =>
                  router.push(
                    `/albums/${album.id}`
                  )
                }
              >

                <div className="home-album-image">

                  {album.cover_url ? (

                    <img
                      src={album.cover_url}
                      alt={album.name}
                      loading="lazy"
                    />

                  ) : (

                    <div className="no-cover">
                      📷
                    </div>

                  )}

                  <div className="home-album-overlay">

                    <span>
                      View Album →
                    </span>

                  </div>

                </div>

                <div className="home-album-info">

                  <span className="album-tag">
                    CRM MEDIA
                  </span>

                  <h3>
                    {album.name}
                  </h3>

                  <p>
                    {album.description ||
                      "View photos from this album."}
                  </p>

                </div>

              </article>

            ))}

          </div>

        )}

        {!loading && albums.length > 0 && (

          <div className="view-all-wrapper">

            <button
              className="view-all-btn"
              onClick={() =>
                router.push("/albums")
              }
            >
              View All Albums →
            </button>

          </div>

        )}

      </section>

      {/* =====================================================
          ABOUT / BRAND SECTION
      ===================================================== */}

      <section className="favorites-section">

        <div>

          <span className="small-label">
            CHAPEL OF REST MINISTRY
          </span>

          <h2>
            Every moment tells a story.
          </h2>

          <p>
            CRM Media preserves the moments,
            celebrations and memories that make
            our church family special.
          </p>

        </div>

        <div className="favorite-number">

          <strong>
            {albums.length}
          </strong>

          <span>
            Albums
          </span>

        </div>

      </section>

      {/* =====================================================
          FOOTER
      ===================================================== */}

      <footer>

        <div className="footer-brand">

          <img
            src="/logo.png"
            alt="CRM Media"
          />

          <div>

            <strong>
              CRM MEDIA
            </strong>

            <span>
              Chapel of Rest Ministry
            </span>

          </div>

        </div>

        <p>
          © 2026 Chapel of Rest Ministry.
          All rights reserved.
        </p>

      </footer>

    </main>
  );
}
