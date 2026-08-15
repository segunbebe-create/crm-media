"use client";

import { useState } from "react";

const photos = [
  {
    id: 1,
    title: "Sunday Service",
    category: "Services",
    image:
      "https://images.unsplash.com/photo-1438032005730-c779502df39b?auto=format&fit=crop&w=1400&q=85",
  },
  {
    id: 2,
    title: "Praise & Worship",
    category: "Services",
    image:
      "https://images.unsplash.com/photo-1507692049790-de58290a4334?auto=format&fit=crop&w=1400&q=85",
  },
  {
    id: 3,
    title: "Church Gathering",
    category: "Events",
    image:
      "https://images.unsplash.com/photo-1519491050282-cf00c82424b4?auto=format&fit=crop&w=1400&q=85",
  },
  {
    id: 4,
    title: "Youth Service",
    category: "Youth",
    image:
      "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1400&q=85",
  },
  {
    id: 5,
    title: "Church Community",
    category: "Programs",
    image:
      "https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=1400&q=85",
  },
  {
    id: 6,
    title: "Special Service",
    category: "Events",
    image:
      "https://images.unsplash.com/photo-1499209974431-9dddcece7f88?auto=format&fit=crop&w=1400&q=85",
  },
];

const categories = ["All", "Services", "Youth", "Events", "Programs"];

export default function Home() {
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [favorites, setFavorites] = useState([]);

  function toggleFavorite(id) {
    setFavorites((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
    );
  }

  const filteredPhotos = photos.filter((photo) => {
    const matchesCategory =
      category === "All" || photo.category === category;

    const matchesSearch =
      photo.title.toLowerCase().includes(search.toLowerCase()) ||
      photo.category.toLowerCase().includes(search.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  return (
    <main className="site">

      {/* NAVIGATION */}
      <header className="navbar">
        <a className="brand" href="/">
          <img src="/logo.svg" alt="CRM Media" />

          <div>
            <strong>CRM MEDIA</strong>
            <span>Chapel of Rest Ministry</span>
          </div>
        </a>

        <nav>
          <a href="#home">Home</a>
          <a href="#gallery">Gallery</a>
          <a href="#favorites">Favorites</a>
        </nav>

        <a href="/admin" className="admin-btn">
          Admin Login
        </a>
      </header>

      {/* HERO */}
      <section className="hero" id="home">
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
            Explore memorable moments, services, programs and events
            captured by the CRM Media team.
          </p>

          <div className="hero-actions">
            <a href="#gallery" className="primary-btn">
              Browse Gallery →
            </a>

            <a href="#favorites" className="secondary-btn">
              ♡ My Favorites
            </a>
          </div>
        </div>

        <div className="hero-gradient" />
      </section>

      {/* GALLERY */}
      <section className="gallery-section" id="gallery">

        <div className="section-heading">
          <div>
            <span className="small-label">
              CRM MEDIA
            </span>

            <h2>Latest captures</h2>
          </div>

          <p>
            Discover and download moments from our church community.
          </p>
        </div>

        {/* SEARCH + FILTERS */}
        <div className="gallery-controls">

          <div className="search-box">
            <span>⌕</span>

            <input
              type="search"
              placeholder="Search photos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="filters">
            {categories.map((item) => (
              <button
                key={item}
                className={
                  category === item
                    ? "filter active"
                    : "filter"
                }
                onClick={() => setCategory(item)}
              >
                {item}
              </button>
            ))}
          </div>

        </div>

        {/* PHOTO GRID */}
        <div className="photo-grid">

          {filteredPhotos.map((photo) => (

            <article
              className="photo-card"
              key={photo.id}
            >

              <div className="photo-image">

                <img
                  src={photo.image}
                  alt={photo.title}
                />

                <div className="image-overlay">

                  <button
                    className={
                      favorites.includes(photo.id)
                        ? "heart active"
                        : "heart"
                    }
                    onClick={() =>
                      toggleFavorite(photo.id)
                    }
                    aria-label="Favorite"
                  >
                    {favorites.includes(photo.id)
                      ? "♥"
                      : "♡"}
                  </button>

                </div>

              </div>

              <div className="photo-details">

                <div>
                  <span>{photo.category}</span>

                  <h3>{photo.title}</h3>
                </div>

                <a
                  className="download-btn"
                  href={photo.image}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Download"
                >
                  ↓
                </a>

              </div>

            </article>

          ))}

        </div>

        {filteredPhotos.length === 0 && (
          <div className="empty-state">
            <h3>No photos found</h3>
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
              : `You have ${favorites.length} favorite ${
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
            src="/logo.svg"
            alt="CRM Media"
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
