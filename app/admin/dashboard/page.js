"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
  const router = useRouter();

  const [albums, setAlbums] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [albumName, setAlbumName] = useState("");
  const [albumDescription, setAlbumDescription] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const admin = localStorage.getItem("crmAdmin");

    if (admin !== "true") {
      router.replace("/admin");
      return;
    }

    loadAlbums();
  }, [router]);

  async function loadAlbums() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/albums", {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Could not load albums.");
      }

      setAlbums(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Could not load albums.");
    } finally {
      setLoading(false);
    }
  }

  async function createAlbum(event) {
    event.preventDefault();

    if (!albumName.trim()) {
      setError("Please enter an album name.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const response = await fetch("/api/albums", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: albumName.trim(),
          description: albumDescription.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Could not create album."
        );
      }

      setAlbums((current) => [data, ...current]);
      setAlbumName("");
      setAlbumDescription("");
      setShowCreate(false);
    } catch (err) {
      setError(err.message || "Could not create album.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteAlbum(id) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this album?"
    );

    if (!confirmed) return;

    try {
      setError("");

      const response = await fetch("/api/albums", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Could not delete album."
        );
      }

      setAlbums((current) =>
        current.filter(
          (album) => String(album.id) !== String(id)
        )
      );
    } catch (err) {
      setError(err.message || "Could not delete album.");
    }
  }

  function openUploadPage(id) {
    router.push(
      `/admin/dashboard/upload?album=${encodeURIComponent(id)}`
    );
  }

  function logout() {
    localStorage.removeItem("crmAdmin");
    sessionStorage.clear();

    router.replace("/admin");
  }

  return (
    <main className="admin-dashboard">

      <header className="dashboard-header">

        <div className="dashboard-brand">

          <img
            src="/logo.png"
            alt="CRM Media"
          />

          <div>
            <span>CRM MEDIA</span>
            <h1>Admin Dashboard</h1>
          </div>

        </div>

        <button
          type="button"
          className="logout-btn"
          onClick={logout}
        >
          Logout
        </button>

      </header>

      <section className="dashboard-content">

        <div className="dashboard-title">

          <div>
            <p className="dashboard-label">
              CONTENT MANAGEMENT
            </p>

            <h2>Albums</h2>

            <p>
              Organize your church photos into albums
              and events.
            </p>
          </div>

          <button
            type="button"
            className="create-album-btn"
            onClick={() => {
              setError("");
              setShowCreate(true);
            }}
          >
            + Create Album
          </button>

        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {showCreate && (
          <div className="album-form-card">

            <div className="form-heading">

              <div>
                <p className="dashboard-label">
                  NEW ALBUM
                </p>

                <h3>Create an album</h3>
              </div>

              <button
                type="button"
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
                onChange={(event) =>
                  setAlbumName(event.target.value)
                }
                required
              />

              <label>Description</label>

              <textarea
                placeholder="Tell members what this album contains..."
                value={albumDescription}
                onChange={(event) =>
                  setAlbumDescription(event.target.value)
                }
                rows={4}
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
                  disabled={saving}
                >
                  {saving ? "Creating..." : "Create Album"}
                </button>

              </div>

            </form>

          </div>
        )}

        {loading ? (

          <div className="empty-albums">
            <h3>Loading albums...</h3>
          </div>

        ) : albums.length === 0 ? (

          <div className="empty-albums">

            <div className="empty-icon">
              📁
            </div>

            <h3>No albums yet</h3>

            <p>
              Create your first album to start
              organizing CRM Media photos.
            </p>

            <button
              type="button"
              onClick={() => setShowCreate(true)}
            >
              + Create Your First Album
            </button>

          </div>

        ) : (

          <div className="album-grid">

            {albums.map((album) => (

              <article
                className="album-card"
                key={album.id}
              >

                <div className="album-cover">
                  <span>📁</span>
                </div>

                <div className="album-info">

                  <h3>{album.name}</h3>

                  <p>
                    {album.description ||
                      "No description added."}
                  </p>

                  <div className="album-actions">

                    <button
                      type="button"
                      onClick={() =>
                        openUploadPage(album.id)
                      }
                    >
                      📸 Upload Photos
                    </button>

                    <button
                      type="button"
                      className="delete-album"
                      onClick={() =>
                        deleteAlbum(album.id)
                      }
                    >
                      Delete
                    </button>

                  </div>

                </div>

              </article>

            ))}

          </div>

        )}

      </section>

    </main>
  );
}
