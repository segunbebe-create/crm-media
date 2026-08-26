"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AlbumsPage() {
  const router = useRouter();

  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadAlbums();
  }, []);

  async function loadAlbums() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/albums");

      if (!response.ok) {
        throw new Error("Could not load albums.");
      }

      const data = await response.json();

      setAlbums(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not load albums."
      );
    } finally {
      setLoading(false);
    }
  }

  function openAlbum(id) {
    router.push(`/albums/${id}`);
  }

  return (
    <main className="albums-page">

      <header className="public-header">

        <div className="public-brand">
          <img
            src="/logo.png"
            alt="CRM Media"
          />

          <div>
            <strong>CRM MEDIA</strong>
            <span>Chapel of Rest Ministry</span>
          </div>
        </div>

        <button
          className="home-button"
          onClick={() => router.push("/")}
        >
          Home
        </button>

      </header>

      <section className="albums-hero">

        <p className="hero-label">
          CRM MEDIA GALLERY
        </p>

        <h1>Our Albums</h1>

        <p>
          Browse memorable moments from Chapel of Rest Ministry.
        </p>

      </section>

      <section className="albums-content">

        {loading && (
          <div className="albums-status">
            <div className="loading-spinner" />
            <p>Loading albums...</p>
          </div>
        )}

        {error && (
          <div className="albums-status">
            <h2>Something went wrong</h2>

            <p>{error}</p>

            <button onClick={loadAlbums}>
              Try Again
            </button>
          </div>
        )}

        {!loading && !error && albums.length === 0 && (
          <div className="albums-status">

            <div className="empty-album-icon">
              📷
            </div>

            <h2>No albums yet</h2>

            <p>
              New church memories will appear here soon.
            </p>

          </div>
        )}

        {!loading && !error && albums.length > 0 && (
          <div className="public-album-grid">

            {albums.map((album) => (
              <article
                className="public-album-card"
                key={album.id}
                onClick={() => openAlbum(album.id)}
              >

                <div className="public-album-cover">

                  {album.cover_url ? (
                    <img
                      src={album.cover_url}
                      alt={album.name}
                      loading="lazy"
                    />
                  ) : (
                    <div className="album-camera">
                      📸
                    </div>
                  )}

                  <div className="album-overlay">
                    <span>
                      View Album →
                    </span>
                  </div>

                </div>

                <div className="public-album-info">

                  <p className="album-date">
                    {album.created_at
                      ? new Date(
                          album.created_at
                        ).toLocaleDateString(
                          "en-NG",
                          {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          }
                        )
                      : "CRM Media"}
                  </p>

                  <h2>
                    {album.name}
                  </h2>

                  <p>
                    {album.description ||
                      "View photos from this album."}
                  </p>

                  <button
                    onClick={(event) => {
                      event.stopPropagation();
                      openAlbum(album.id);
                    }}
                  >
                    View Photos →
                  </button>

                </div>

              </article>
            ))}

          </div>
        )}

      </section>

      <footer className="public-footer">

        <strong>CRM MEDIA</strong>

        <p>
          © 2026 Chapel of Rest Ministry
        </p>

      </footer>

    </main>
  );
}
