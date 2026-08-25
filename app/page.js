"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  const [albums, setAlbums] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadGallery();
    loadFavorites();
  }, []);

  async function loadGallery() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/albums", {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Could not load albums."
        );
      }

      const albumList = Array.isArray(data) ? data : [];

      setAlbums(albumList);

      const results = await Promise.all(
        albumList.map(async (album) => {
          try {
            const response = await fetch(
              `/api/albums/${album.id}`,
              {
                cache: "no-store",
              }
            );

            if (!response.ok) return [];

            const data = await response.json();

            return (data.photos || []).map((photo) => ({
              ...photo,
              albumId: album.id,
              albumName: album.name,
              category: album.name,
            }));
          } catch {
            return [];
          }
        })
      );

      setPhotos(results.flat());
    } catch (err) {
      setError(
        err.message || "Could not load the gallery."
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

  function toggleFavorite(id) {
    const updated = favorites.includes(id)
      ? favorites.filter((item) => item !== id)
      : [...favorites, id];

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

  const categories = useMemo(() => {
    return [
      "All",
      ...albums.map((album) => album.name),
    ];
  }, [albums]);

  const filteredPhotos = useMemo(() => {
    return photos.filter((photo) => {
      const matchesCategory =
        category === "All" ||
        photo.category === category;

      const searchText =
        search.trim().toLowerCase();

      const matchesSearch =
        !searchText ||
        (photo.name || "")
          .toLowerCase()
          .includes(searchText) ||
        (photo.albumName || "")
          .toLowerCase()
          .includes(searchText);

      return matchesCategory && matchesSearch;
    });
  }, [photos, category, search]);

  return (
    <main className="site">

      {/* NAVIGATION */}

      <header className="navbar">

        <button
          type="button"
          className="brand"
          onClick={() => router.push("/")}
        >
          <img
            src="/logo.png"
            alt="Chapel of Rest Ministry"
          />

          <div>
            <strong>CRM MEDIA</strong>

            <span>
              Chapel of Rest Ministry
            </span>
          </div>
        </button>

        <nav>
          <a href="#home">Home</a>
          <a href="#gallery">Gallery</a>
          <a href="#albums">Albums</a>
          <a href="#favorites">
            Favorites
          </a>
        </nav>

        <button
          type="button"
          className="admin-btn"
          onClick={() => router.push("/admin")}
        >
          Admin Login
        </button>

      </header>

      {/* HERO */}

      <section
        className="hero"
        id="home"
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
              href="#gallery"
              className="primary-btn"
            >
              Browse Gallery →
            </a>

            <a
              href="#favorites"
              className="secondary-btn"
            >
              ♡ My Favorites
            </a>

          </div>

        </div>

        <div className="hero-gradient" />

      </section>

      {/* ALBUMS */}

      <section
        className="gallery-section"
        id="albums"
      >

        <div className="section-heading">

          <div>

            <span className="small-label">
              CRM MEDIA
            </span>

            <h2>Our Albums</h2>

          </div>

          <p>
            Browse photos from our church
            services, programs and events.
          </p>

        </div>

        {albums.length > 0 && (

          <div className="public-album-grid">

            {albums.map((album) => (

              <article
                className="public-album-card"
                key={album.id}
                onClick={() =>
                  router.push(
                    `/albums/${album.id}`
                  )
                }
              >

                <div className="public-album-cover">

                  <div className="album-camera">
                    📸
                  </div>

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

                  <h2>{album.name}</h2>

                  <p>
                    {album.description ||
                      "View photos from this album."}
                  </p>

                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();

                      router.push(
                        `/albums/${album.id}`
                      );
                    }}
                  >
                    View Photos →
                  </button>

                </div>

              </article>

            ))}

          </div>

        )}

        {!loading &&
          albums.length === 0 && (

            <div className="empty-state">

              <h3>
                No albums available yet
              </h3>

              <p>
                New CRM Media albums will appear
                here when they are published.
              </p>

            </div>

          )}

      </section>

      {/* GALLERY */}

      <section
        className="gallery-section"
        id="gallery"
      >

        <div className="section-heading">

          <div>

            <span className="small-label">
              CRM MEDIA
            </span>

            <h2>Latest captures</h2>

          </div>

          <p>
            Discover and download moments from
            our church community.
          </p>

        </div>

        {/* SEARCH */}

        <div className="gallery-controls">

          <div className="search-box">

            <span>⌕</span>

            <input
              type="search"
              placeholder="Search photos..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
            />

          </div>

          {/* FILTERS */}

          <div className="filters">

            {categories.map((item) => (

              <button
                type="button"
                key={item}
                className={
                  category === item
                    ? "filter active"
                    : "filter"
                }
                onClick={() =>
                  setCategory(item)
                }
              >
                {item}
              </button>

            ))}

          </div>

        </div>

        {/* LOADING */}

        {loading && (

          <div className="empty-state">

            <h3>
              Loading CRM Media...
            </h3>

            <p>
              Getting the latest photos.
            </p>

          </div>

        )}

        {/* ERROR */}

        {!loading && error && (

          <div className="empty-state">

            <h3>
              Could not load photos
            </h3>

            <p>{error}</p>

            <button
              type="button"
              onClick={loadGallery}
            >
              Try Again
            </button>

          </div>

        )}

        {/* PHOTOS */}

        {!loading &&
          !error &&
          filteredPhotos.length > 0 && (

            <div className="photo-grid">

              {filteredPhotos.map((photo) => {

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

                    <div className="photo-image">

                      <img
                        src={mediaUrl}
                        alt={
                          photo.name ||
                          "CRM Media photo"
                        }
                        loading="lazy"
                      />

                      <div className="image-overlay">

                        <button
                          type="button"
                          className={
                            isFavorite
                              ? "heart active"
                              : "heart"
                          }
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

                      </div>

                    </div>

                    <div className="photo-details">

                      <div>

                        <span>
                          {photo.albumName}
                        </span>

                        <h3>
                          {photo.name ||
                            "CRM Media Photo"}
                        </h3>

                      </div>

                      <button
                        type="button"
                        className="download-btn"
                        onClick={() =>
                          downloadPhoto(photo)
                        }
                        aria-label="Download photo"
                      >
                        ↓
                      </button>

                    </div>

                  </article>
                );
              })}

            </div>

          )}

        {/* NO PHOTOS */}

        {!loading &&
          !error &&
          filteredPhotos.length === 0 && (

            <div className="empty-state">

              <h3>
                No photos found
              </h3>

              <p>
                Try another search or category.
              </p>

            </div>

          )}

      </section>

      {/* FAVORITES */}

      <section
        className="favorites-section"
        id="favorites"
      >

        <div>

          <span className="small-label">
            YOUR COLLECTION
          </span>

          <h2>Your Favorites</h2>

          <p>
            {favorites.length === 0
              ? "Photos you favorite will appear here."
              : `You have ${
                  favorites.length
                } favorite ${
                  favorites.length === 1
                    ? "photo"
                    : "photos"
                }.`}
          </p>

        </div>

        <div className="favorite-number">

          <strong>
            {favorites.length}
          </strong>

          <span>Saved</span>

        </div>

      </section>

      {/* FOOTER */}

      <footer>

        <div className="footer-brand">

          <img
            src="/logo.png"
            alt="Chapel of Rest Ministry"
          />

          <div>

            <strong>CRM MEDIA</strong>

            <span>
              Chapel of Rest Ministry
            </span>

          </div>

        </div>

        <p>
          © 2026 CRM Media. All rights reserved.
        </p>

      </footer>

    </main>
  );
}
