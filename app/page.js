"use client";

import { useState } from "react";

const photos = [
  {
    id: 1,
    title: "Sunday Service",
    category: "Church Service",
    image:
      "https://images.unsplash.com/photo-1438032005730-c779502df39b?auto=format&fit=crop&w=1000&q=80",
  },
  {
    id: 2,
    title: "Praise & Worship",
    category: "Worship",
    image:
      "https://images.unsplash.com/photo-1507692049790-de58290a4334?auto=format&fit=crop&w=1000&q=80",
  },
  {
    id: 3,
    title: "Church Gathering",
    category: "Events",
    image:
      "https://images.unsplash.com/photo-1519491050282-cf00c82424b4?auto=format&fit=crop&w=1000&q=80",
  },
  {
    id: 4,
    title: "Youth Service",
    category: "Youth",
    image:
      "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1000&q=80",
  },
  {
    id: 5,
    title: "Church Community",
    category: "Community",
    image:
      "https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=1000&q=80",
  },
  {
    id: 6,
    title: "Special Service",
    category: "Events",
    image:
      "https://images.unsplash.com/photo-1499209974431-9dddcece7f88?auto=format&fit=crop&w=1000&q=80",
  },
];

export default function Home() {
  const [search, setSearch] = useState("");
  const [favorites, setFavorites] = useState([]);

  const toggleFavorite = (id) => {
    setFavorites((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
    );
  };

  const filteredPhotos = photos.filter(
    (photo) =>
      photo.title.toLowerCase().includes(search.toLowerCase()) ||
      photo.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main className="gallery-page">
      <header className="header">
        <div className="brand">
          <img src="/logo.svg" alt="CRM Media logo" className="logo" />

          <div>
            <h1>CRM Media</h1>
            <p>Chapel of Rest Ministry</p>
          </div>
        </div>

        <div className="header-actions">
          <span className="favorite-count">
            ❤️ {favorites.length}
          </span>

          <button className="admin-button">
            Admin
          </button>
        </div>
      </header>

      <section className="hero">
        <div>
          <p className="eyebrow">CRM MEDIA GALLERY</p>
          <h2>Capture. Remember. Share.</h2>
          <p>
            Browse and download memorable moments from Chapel of Rest
            Ministry.
          </p>
        </div>
      </section>

      <section className="toolbar">
        <input
          type="search"
          placeholder="Search photos..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </section>

      <section className="gallery">
        {filteredPhotos.map((photo) => (
          <article className="photo-card" key={photo.id}>
            <div className="image-container">
              <img src={photo.image} alt={photo.title} />

              <button
                className={`favorite ${
                  favorites.includes(photo.id) ? "active" : ""
                }`}
                onClick={() => toggleFavorite(photo.id)}
                aria-label="Add to favorites"
              >
                {favorites.includes(photo.id) ? "♥" : "♡"}
              </button>
            </div>

            <div className="photo-info">
              <div>
                <h3>{photo.title}</h3>
                <p>{photo.category}</p>
              </div>

              <a
                href={photo.image}
                target="_blank"
                rel="noopener noreferrer"
                className="download"
              >
                ↓
              </a>
            </div>
          </article>
        ))}
      </section>

      {filteredPhotos.length === 0 && (
        <div className="empty">
          <h3>No photos found</h3>
          <p>Try another search.</p>
        </div>
      )}

      <footer>
        <p>© 2026 CRM Media • Chapel of Rest Ministry</p>
      </footer>
    </main>
  );
}
