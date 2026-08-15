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
      const response = await fetch("/api/albums");

      if (!response.ok) {
        throw new Error("Could not load albums.");
      }

      const data = await response.json();
      setAlbums(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="albums-page">
      <header className="public-header">
        <div className="public-brand">
          <img src="/logo.svg" alt="CRM Media" />

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
        <p className="hero-label">CRM MEDIA GALLERY</p>

        <h1>Our Albums</h1>

        <p>
          Browse memorable moments from Chapel of Rest
          Ministry.
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
          <div className="albums-status error">
            <h2>Something went wrong</h2>
            <p>{error}</p>

            <button onClick={loadAlbums}>
              Try Again
            </button>
          </div>
        )}

        {!loading && !error && albums.length === 0 && (
          <div className="albums-status">
            <div className="empty-album-icon">📷</div>

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
                onClick={() =>
                  router.push(`/albums/${album.id}`)
                }
              >
                <div className="public-album-cover">
                  <div className="album-overlay">
                    <span>View Album →</span>
                  </div>

                  <div className="album-camera">
                    📸
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

                  <h2>{album.name}</h2>

                  <p>
                    {album.description ||
                      "View photos from this album."}
                  </p>

                  <button
                    onClick={(event) => {
                      event.stopPropagation();

                      router.push(
                        `/albums/${album.id}`
                      );
                    }}
                  >
                    View Photos
                    <span>→</span>
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
