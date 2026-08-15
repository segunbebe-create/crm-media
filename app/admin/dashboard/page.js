"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
  const router = useRouter();

  const [albums, setAlbums] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [albumName, setAlbumName] = useState("");
  const [albumDescription, setAlbumDescription] = useState("");

  useEffect(() => {
    const admin = localStorage.getItem("crmAdmin");

    if (admin !== "true") {
      router.push("/admin");
      return;
    }

    const savedAlbums = localStorage.getItem("crmAlbums");

    if (savedAlbums) {
      setAlbums(JSON.parse(savedAlbums));
    }
  }, [router]);

  function createAlbum(e) {
    e.preventDefault();

    if (!albumName.trim()) return;

    const newAlbum = {
      id: Date.now(),
      name: albumName.trim(),
      description: albumDescription.trim(),
      photos: [],
    };

    const updatedAlbums = [...albums, newAlbum];

    setAlbums(updatedAlbums);
    localStorage.setItem("crmAlbums", JSON.stringify(updatedAlbums));

    setAlbumName("");
    setAlbumDescription("");
    setShowCreate(false);
  }

  function deleteAlbum(id) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this album?"
    );

    if (!confirmed) return;

    const updatedAlbums = albums.filter((album) => album.id !== id);

    setAlbums(updatedAlbums);
    localStorage.setItem("crmAlbums", JSON.stringify(updatedAlbums));
  }

  function logout() {
    localStorage.removeItem("crmAdmin");
    router.push("/admin");
  }

  return (
    <main className="admin-dashboard">
      <header className="dashboard-header">
        <div className="dashboard-brand">
          <img src="/logo.svg" alt="CRM Media" />

          <div>
            <span>CRM MEDIA</span>
            <h1>Admin Dashboard</h1>
          </div>
        </div>

        <button className="logout-btn" onClick={logout}>
          Logout
        </button>
      </header>

      <section className="dashboard-content">

        <div className="dashboard-title">
          <div>
            <p className="dashboard-label">CONTENT MANAGEMENT</p>
            <h2>Albums</h2>
            <p>
              Organize your church photos into albums and events.
            </p>
          </div>

          <button
            className="create-album-btn"
            onClick={() => setShowCreate(true)}
          >
            + Create Album
          </button>
        </div>

        {showCreate && (
          <div className="album-form-card">
            <div className="form-heading">
              <div>
                <p className="dashboard-label">NEW ALBUM</p>
                <h3>Create an album</h3>
              </div>

              <button
                className="close-btn"
                onClick={() => setShowCreate(false)}
              >
                ×
              </button>
            </div>

            <form onSubmit={createAlbum}>
              <label>Album name</label>

              <input
                type="text"
                placeholder="e.g. Youth Convention 2026"
                value={albumName}
                onChange={(e) => setAlbumName(e.target.value)}
                required
              />

              <label>Description</label>

              <textarea
                placeholder="Tell members what this album contains..."
                value={albumDescription}
                onChange={(e) =>
                  setAlbumDescription(e.target.value)
                }
                rows="4"
              />

              <div className="form-actions">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setShowCreate(false)}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="save-album-btn"
                >
                  Create Album
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="album-grid">

          {albums.length === 0 ? (
            <div className="empty-albums">
              <div className="empty-icon">📁</div>

              <h3>No albums yet</h3>

              <p>
                Create your first album to start organizing
                CRM Media photos.
              </p>

              <button
                onClick={() => setShowCreate(true)}
              >
                + Create Your First Album
              </button>
            </div>
          ) : (
            albums.map((album) => (
              <article className="album-card" key={album.id}>

                <div className="album-cover">
                  <span>📁</span>
                </div>

                <div className="album-info">
                  <h3>{album.name}</h3>

                  <p>
                    {album.description ||
                      "No description added."}
                  </p>

                  <span className="photo-count">
                    {album.photos.length} photos
                  </span>

                  <div className="album-actions">
  <button
    onClick={() =>
      router.push(`/admin/dashboard/upload?album=${album.id}`)
    }
  >
    Upload Photos
  </button>

  <button
    className="delete-album"
    onClick={() =>
      deleteAlbum(album.id)
    }
  >
    Delete
  </button>
</div>
                  </div>
                </div>

              </article>
            ))
          )}

        </div>

      </section>
    </main>
  );
}
