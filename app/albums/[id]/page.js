"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function AlbumPage() {
  const params = useParams();
  const router = useRouter();

  const albumId = params.id;

  const [album, setAlbum] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!albumId) return;

    loadAlbum();
    loadFavorites();
  }, [albumId]);

  async function loadAlbum() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `/api/albums/${albumId}`,
        {
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Could not load album."
        );
      }

      setAlbum(data.album);
      setPhotos(data.photos || []);
    } catch (err) {
      setError(
        err.message || "Could not load album."
      );
    } finally {
      setLoading(false);
    }
  }

  function loadFavorites() {
    try {
      const saved =
        JSON.parse(
          localStorage.getItem("crmFavorites")
        ) || [];

      setFavorites(saved);
    } catch {
      setFavorites([]);
    }
  }

  function getMediaUrl(photo) {
    if (!photo?.url) return "";

    try {
      const url = new URL(photo.url);

      return `/api/media/${url.pathname.replace(
        /^\/+/,
        ""
      )}`;
    } catch {
      return photo.url;
    }
  }

  function toggleFavorite(photoId) {
    const updated = favorites.includes(photoId)
      ? favorites.filter(
          (id) => id !== photoId
        )
      : [...favorites, photoId];

    setFavorites(updated);

    localStorage.setItem(
      "crmFavorites",
      JSON.stringify(updated)
    );
  }

  function downloadPhoto(photo) {
    const mediaUrl = getMediaUrl(photo);

    if (!mediaUrl) return;

    const link = document.createElement("a");

    link.href = mediaUrl;
    link.download =
      photo.name || "CRM-Media-photo";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  if (loading) {
    return (
      <main className="album-page">
        <div className="album-loading">
          <div className="loading-spinner" />

          <h2>
            Loading album...
          </h2>
        </div>
      </main>
    );
  }

  if (error || !album) {
    return (
      <main className="album-page">

        <div className="album-error">

          <div className="error-icon">
            📷
          </div>

          <h1>
            Album not found
          </h1>

          <p>
            {error ||
              "This album could not be found."}
          </p>

          <button
            type="button"
            onClick={() =>
              router.push("/albums")
            }
          >
            ← Back to Albums
          </button>

        </div>

      </main>
    );
  }

  return (
    <main className="album-page">

      {/* HEADER */}

      <header className="public-header">

        <div className="public-brand">

          <img
            src="/logo.png"
            alt="Chapel of Rest Ministry"
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
            router.push("/albums")
          }
        >
          ← Albums
        </button>

      </header>

      {/* HERO */}

      <section className="album-hero">

        <div className="album-hero-content">

          <p className="hero-label">
            CRM MEDIA GALLERY
          </p>

          <h1>
            {album.name}
          </h1>

          <p className="album-description">
            {album.description ||
              "Memorable moments from Chapel of Rest Ministry."}
          </p>

          <div className="album-meta">

            <span>
              📸 {photos.length}{" "}
              {photos.length === 1
                ? "Photo"
                : "Photos"}
            </span>

            {album.created_at && (
              <span>
                📅{" "}
                {new Date(
                  album.created_at
                ).toLocaleDateString(
                  "en-NG",
                  {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  }
                )}
              </span>
            )}

          </div>

        </div>

      </section>

      {/* PHOTOS */}

      <section className="album-photos">

        {photos.length === 0 ? (

          <div className="empty-photos">

            <div className="empty-photo-icon">
              📷
            </div>

            <h2>
              No photos yet
            </h2>

            <p>
              Photos uploaded to this album
              will appear here.
            </p>

          </div>

        ) : (

          <div className="photo-grid">

            {photos.map((photo) => {

              const isFavorite =
                favorites.includes(
                  photo.id
                );

              const mediaUrl =
                getMediaUrl(photo);

              return (
                <article
                  className="photo-card"
                  key={photo.id}
                >

                  {/* IMAGE */}

                  <div className="photo-image-wrapper">

                    <img
                      src={mediaUrl}
                      alt={
                        photo.name ||
                        "CRM Media photo"
                      }
                      className="photo-image"
                      loading="lazy"
                    />

                    <div className="photo-overlay">

                      {/* FAVORITE */}

                      <button
                        type="button"
                        className={`favorite-button ${
                          isFavorite
                            ? "favorited"
                            : ""
                        }`}
                        onClick={() =>
                          toggleFavorite(
                            photo.id
                          )
                        }
                        aria-label={
                          isFavorite
                            ? "Remove from favorites"
                            : "Add to favorites"
                        }
                      >
                        {isFavorite
                          ? "♥"
                          : "♡"}
                      </button>

                      {/* DOWNLOAD */}

                      <button
                        type="button"
                        className="download-button"
                        onClick={() =>
                          downloadPhoto(
                            photo
                          )
                        }
                        aria-label="Download photo"
                      >
                        ↓
                      </button>

                    </div>

                  </div>

                  {/* PHOTO INFORMATION */}

                  <div className="photo-info">

                    <p>
                      {photo.name ||
                        "CRM Media Photo"}
                    </p>

                    <div className="photo-actions">

                      <button
                        type="button"
                        onClick={() =>
                          toggleFavorite(
                            photo.id
                          )
                        }
                      >
                        {isFavorite
                          ? "♥ Saved"
                          : "♡ Favorite"}
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          downloadPhoto(
                            photo
                          )
                        }
                      >
                        ↓ Download
                      </button>

                    </div>

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
