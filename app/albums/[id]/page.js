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

  // NEW: fullscreen viewer
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    if (!albumId) return;

    loadAlbum();
    loadFavorites();
  }, [albumId]);

  // ==============================
  // ANALYTICS
  // ==============================

  async function trackEvent(eventType, extra = {}) {
    try {
      await fetch("/api/analytics", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          eventType,
          pagePath: `/albums/${albumId}`,
          ...extra,
        }),
      });
    } catch (error) {
      console.error("ANALYTICS ERROR:", error);
    }
  }

  // ==============================
  // LOAD ALBUM
  // ==============================

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

      // Record album view
      trackEvent("album_view", {
        albumId: Number(albumId),
      });

      // Keep your existing analytics
      if (data.photos?.length) {
        data.photos.forEach((photo) => {
          trackEvent("photo_view", {
            albumId: Number(albumId),
            photoId: Number(photo.id),
          });
        });
      }
    } catch (err) {
      setError(
        err.message || "Could not load album."
      );
    } finally {
      setLoading(false);
    }
  }

  // ==============================
  // FAVORITES
  // ==============================

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

  // ==============================
  // PRIVATE MEDIA URL
  // ==============================

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

  // ==============================
  // DOWNLOAD
  // ==============================

  function downloadPhoto(photo) {
    const mediaUrl = getMediaUrl(photo);

    if (!mediaUrl) return;

    trackEvent("download", {
      albumId: Number(albumId),
      photoId: Number(photo.id),
    });

    const link = document.createElement("a");

    link.href = mediaUrl;

    link.download =
      photo.name || "CRM-Media-photo";

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);
  }

  // ==============================
  // OPEN FULLSCREEN VIEWER
  // ==============================

  function openViewer(photo, index) {
    setSelectedPhoto(photo);
    setSelectedIndex(index);

    // Track when the user actually opens a photo
    trackEvent("photo_view", {
      albumId: Number(albumId),
      photoId: Number(photo.id),
    });

    document.body.style.overflow = "hidden";
  }

  // ==============================
  // CLOSE VIEWER
  // ==============================

  function closeViewer() {
    setSelectedPhoto(null);
    document.body.style.overflow = "";
  }

  // ==============================
  // NEXT PHOTO
  // ==============================

  function nextPhoto() {
    if (!photos.length) return;

    const nextIndex =
      (selectedIndex + 1) % photos.length;

    setSelectedIndex(nextIndex);
    setSelectedPhoto(photos[nextIndex]);

    trackEvent("photo_view", {
      albumId: Number(albumId),
      photoId: Number(
        photos[nextIndex].id
      ),
    });
  }

  // ==============================
  // PREVIOUS PHOTO
  // ==============================

  function previousPhoto() {
    if (!photos.length) return;

    const previousIndex =
      (selectedIndex - 1 + photos.length) %
      photos.length;

    setSelectedIndex(previousIndex);
    setSelectedPhoto(
      photos[previousIndex]
    );

    trackEvent("photo_view", {
      albumId: Number(albumId),
      photoId: Number(
        photos[previousIndex].id
      ),
    });
  }

  // ==============================
  // KEYBOARD CONTROLS
  // ==============================

  useEffect(() => {
    function handleKeyDown(e) {
      if (!selectedPhoto) return;

      if (e.key === "Escape") {
        closeViewer();
      }

      if (e.key === "ArrowRight") {
        nextPhoto();
      }

      if (e.key === "ArrowLeft") {
        previousPhoto();
      }
    }

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [
    selectedPhoto,
    selectedIndex,
    photos,
  ]);

  // ==============================
  // LOADING
  // ==============================

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

  // ==============================
  // ERROR
  // ==============================

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

  // ==============================
  // PAGE
  // ==============================

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

            {photos.map((photo, index) => {

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

                  <div
                    className="photo-image-wrapper"
                    onClick={() =>
                      openViewer(
                        photo,
                        index
                      )
                    }
                  >

                    <img
                      src={mediaUrl}
                      alt={
                        photo.name ||
                        "CRM Media photo"
                      }
                      className="photo-image"
                      loading="lazy"
                    />

                    {/* VIEW ICON */}

                    <div className="view-photo-icon">
                      ⛶
                    </div>

                    <div className="photo-overlay">

                      {/* FAVORITE */}

                      <button
                        type="button"
                        className={`favorite-button ${
                          isFavorite
                            ? "favorited"
                            : ""
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();

                          toggleFavorite(
                            photo.id
                          );
                        }}
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
                        onClick={(e) => {
                          e.stopPropagation();

                          downloadPhoto(
                            photo
                          );
                        }}
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

      {/* =================================
          FULLSCREEN PHOTO VIEWER
          ================================= */}

      {selectedPhoto && (

        <div
          className="photo-viewer"
          onClick={closeViewer}
        >

          {/* CLOSE */}

          <button
            type="button"
            className="viewer-close"
            onClick={closeViewer}
            aria-label="Close photo viewer"
          >
            ×
          </button>

          {/* PREVIOUS */}

          {photos.length > 1 && (
            <button
              type="button"
              className="viewer-nav viewer-prev"
              onClick={(e) => {
                e.stopPropagation();
                previousPhoto();
              }}
              aria-label="Previous photo"
            >
              ‹
            </button>
          )}

          {/* IMAGE */}

          <div
            className="viewer-content"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <img
              src={getMediaUrl(
                selectedPhoto
              )}
              alt={
                selectedPhoto.name ||
                "CRM Media photo"
              }
              className="viewer-image"
            />

            <div className="viewer-bottom">

              <div className="viewer-info">

                <strong>
                  {selectedPhoto.name ||
                    "CRM Media Photo"}
                </strong>

                <span>
                  {selectedIndex + 1} /{" "}
                  {photos.length}
                </span>

              </div>

              <div className="viewer-actions">

                <button
                  type="button"
                  onClick={() =>
                    toggleFavorite(
                      selectedPhoto.id
                    )
                  }
                >
                  {favorites.includes(
                    selectedPhoto.id
                  )
                    ? "♥ Saved"
                    : "♡ Favorite"}
                </button>

                <button
                  type="button"
                  onClick={() =>
                    downloadPhoto(
                      selectedPhoto
                    )
                  }
                >
                  ↓ Download
                </button>

              </div>

            </div>

          </div>

          {/* NEXT */}

          {photos.length > 1 && (
            <button
              type="button"
              className="viewer-nav viewer-next"
              onClick={(e) => {
                e.stopPropagation();
                nextPhoto();
              }}
              aria-label="Next photo"
            >
              ›
            </button>
          )}

        </div>

      )}

    </main>
  );
}
