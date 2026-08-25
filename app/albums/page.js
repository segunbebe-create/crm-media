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

      const response = await fetch("/api/albums", {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(
          "Could not load albums."
        );
      }

      const data = await response.json();

      setAlbums(data);
    } catch (err) {
      setError(
        err.message || "Could not load albums."
      );
    } finally {
      setLoading(false);
    }
  }

  function getMediaUrl(url) {
    if (!url) return null;

    try {
      const blobUrl = new URL(url);

      return `/api/media/${blobUrl.pathname.replace(
        /^\/+/,
        ""
      )}`;
    } catch {
      return null;
    }
  }

  function openAlbum(id) {
    router.push(`/albums/${id}`);
  }

  return (
    <main className="albums-page">

      {/* HEADER */}

      <header className="public-header">

        <div className="public-brand">

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

        <button
          type="button"
          className="home-button"
          onClick={() =>
            router.push("/")
          }
        >
          Home
        </button>

      </header>

      {/* HERO */}

      <section className="albums-hero">

        <p className="hero-label">
          CRM MEDIA GALLERY
        </p>

        <h1>
          Our Albums
        </h1>

        <p>
          Browse memorable moments from
          Chapel of Rest Ministry.
        </p>

      </section>

      {/* ALBUMS */}

      <section className="albums-content">

        {loading && (
          <div className="albums-status">

            <div className="loading-spinner" />

            <p>
              Loading albums...
            </p>

          </div>
        )}

        {error && (
          <div className="albums-status error">

            <h2>
              Something went wrong
            </h2>

            <p>
              {error}
            </p>

            <button
              type="button"
              onClick={loadAlbums}
            >
              Try Again
            </button>

          </div>
        )}

        {!loading &&
          !error &&
          albums.length === 0 && (
            <div className="albums-status">

              <div className="empty-album-icon">
                📷
              </div>

              <h2>
                No albums yet
              </h2>

              <p>
                New church memories will
                appear here soon.
              </p>

            </div>
          )}

        {!loading &&
          !error &&
          albums.length > 0 && (

            <div className="public-album-grid">

              {albums.map((album) => {

                const coverUrl =
                  getMediaUrl(
                    album.cover_url
                  );

                return (
                  <article
                    className="public-album-card"
                    key={album.id}
                    onClick={() =>
                      openAlbum(
                        album.id
                      )
                    }
                  >

                    {/* COVER */}

                    <div className="public-album-cover">

                      {coverUrl ? (

                        <img
                          src={coverUrl}
                          alt={
                            album.name
                          }
                          className="album-cover-image"
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

                    {/* INFO */}

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
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();

                          openAlbum(
                            album.id
                          );
                        }}
                      >
                        View Photos

                        <span>
                          →
                        </span>
                      </button>

                    </div>

                  </article>
                );
              })}

            </div>
          )}

      </section>

      {/* FOOTER */}

      <footer className="public-footer">

        <strong>
          CRM MEDIA
        </strong>

        <p>
          © 2026 Chapel of Rest Ministry
        </p>

      </footer>

    </main>
  );
}
