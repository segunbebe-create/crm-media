"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
  const router = useRouter();

  const [albums, setAlbums] = useState([]);
  const [stats, setStats] = useState(null);

  const [showCreate, setShowCreate] = useState(false);
  const [albumName, setAlbumName] = useState("");
  const [albumDescription, setAlbumDescription] = useState("");

  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [statsError, setStatsError] = useState("");

  useEffect(() => {
    const admin = localStorage.getItem("crmAdmin");

    if (admin !== "true") {
      router.replace("/admin");
      return;
    }

    loadAlbums();
    loadStats();
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
        throw new Error(
          data.error || "Could not load albums."
        );
      }

      setAlbums(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(
        err.message || "Could not load albums."
      );
    } finally {
      setLoading(false);
    }
  }

  async function loadStats() {
    try {
      setStatsLoading(true);
      setStatsError("");

      const response = await fetch(
        "/api/analytics?key=CRM-SETUP-2026",
        {
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Could not load statistics."
        );
      }

      setStats(data);
    } catch (err) {
      console.error("STATS ERROR:", err);

      setStatsError(
        err.message || "Could not load statistics."
      );
    } finally {
      setStatsLoading(false);
    }
  }

  async function createAlbum(event) {
    event.preventDefault();

    if (!albumName.trim()) {
      setError("Please enter an album name.");
      return;
    }

    try {
      setSaving(true);
      setError("");

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

      setAlbumName("");
      setAlbumDescription("");
      setShowCreate(false);

      await loadAlbums();
    } catch (err) {
      setError(
        err.message || "Could not create album."
      );
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

      await loadAlbums();
      await loadStats();
    } catch (err) {
      setError(
        err.message || "Could not delete album."
      );
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

  function formatNumber(number) {
    return Number(number || 0).toLocaleString();
  }

  return (
    <main className="admin-dashboard">

      {/* ================================
          HEADER
      ================================= */}

      <header className="dashboard-header">

        <div className="dashboard-brand">

          <img
            src="/logo.png"
            alt="CRM Media"
          />

          <div>
            <p>CRM MEDIA</p>
            <span>Admin Dashboard</span>
          </div>

        </div>

        <button
          className="logout-btn"
          onClick={logout}
        >
          Logout
        </button>

      </header>


      {/* ================================
          CONTENT
      ================================= */}

      <section className="dashboard-content">

        {/* ================================
            STATUS
        ================================= */}

        <div className="dashboard-title">

          <div>
            <p className="dashboard-label">
              WEBSITE STATUS
            </p>

            <h1>Overview</h1>

            <p>
              Monitor activity across your CRM Media
              website.
            </p>
          </div>

          <button
            className="refresh-stats-btn"
            onClick={loadStats}
            disabled={statsLoading}
          >
            {statsLoading
              ? "Refreshing..."
              : "↻ Refresh Stats"}
          </button>

        </div>


        {/* ================================
            STATS ERROR
        ================================= */}

        {statsError && (
          <div className="dashboard-error">
            {statsError}
          </div>
        )}


        {/* ================================
            MAIN STAT CARDS
        ================================= */}

        <div className="stats-grid">

          <div className="stat-card">

            <div className="stat-icon">
              👁️
            </div>

            <div>
              <p>Total Website Views</p>

              <h2>
                {statsLoading
                  ? "..."
                  : formatNumber(
                      stats?.totals?.websiteViews
                    )}
              </h2>
            </div>

          </div>


          <div className="stat-card">

            <div className="stat-icon">
              📸
            </div>

            <div>
              <p>Total Photo Views</p>

              <h2>
                {statsLoading
                  ? "..."
                  : formatNumber(
                      stats?.totals?.photoViews
                    )}
              </h2>
            </div>

          </div>


          <div className="stat-card">

            <div className="stat-icon">
              📥
            </div>

            <div>
              <p>Total Downloads</p>

              <h2>
                {statsLoading
                  ? "..."
                  : formatNumber(
                      stats?.totals?.downloads
                    )}
              </h2>
            </div>

          </div>


          <div className="stat-card">

            <div className="stat-icon">
              🖼️
            </div>

            <div>
              <p>Total Photos</p>

              <h2>
                {statsLoading
                  ? "..."
                  : formatNumber(
                      stats?.totals?.totalPhotos
                    )}
              </h2>
            </div>

          </div>


          <div className="stat-card">

            <div className="stat-icon">
              📁
            </div>

            <div>
              <p>Total Albums</p>

              <h2>
                {statsLoading
                  ? "..."
                  : formatNumber(
                      stats?.totals?.totalAlbums
                    )}
              </h2>
            </div>

          </div>


          <div className="stat-card">

            <div className="stat-icon">
              📂
            </div>

            <div>
              <p>Album Views</p>

              <h2>
                {statsLoading
                  ? "..."
                  : formatNumber(
                      stats?.totals?.albumViews
                    )}
              </h2>
            </div>

          </div>

        </div>


        {/* ================================
            TODAY
        ================================= */}

        <section className="stats-section">

          <div className="section-heading">

            <div>
              <p className="dashboard-label">
                TODAY
              </p>

              <h2>Today's Activity</h2>
            </div>

          </div>


          <div className="today-grid">

            <div className="today-card">
              <span>Website Views</span>

              <strong>
                {statsLoading
                  ? "..."
                  : formatNumber(
                      stats?.today?.websiteViews
                    )}
              </strong>
            </div>


            <div className="today-card">
              <span>Album Views</span>

              <strong>
                {statsLoading
                  ? "..."
                  : formatNumber(
                      stats?.today?.albumViews
                    )}
              </strong>
            </div>


            <div className="today-card">
              <span>Photo Views</span>

              <strong>
                {statsLoading
                  ? "..."
                  : formatNumber(
                      stats?.today?.photoViews
                    )}
              </strong>
            </div>


            <div className="today-card">
              <span>Downloads</span>

              <strong>
                {statsLoading
                  ? "..."
                  : formatNumber(
                      stats?.today?.downloads
                    )}
              </strong>
            </div>

          </div>

        </section>


        {/* ================================
            LAST 7 DAYS
        ================================= */}

        <section className="stats-section">

          <div className="section-heading">

            <div>
              <p className="dashboard-label">
                ANALYTICS
              </p>

              <h2>Last 7 Days</h2>
            </div>

          </div>


          <div className="weekly-table">

            <div className="weekly-header">
              <span>Date</span>
              <span>Website</span>
              <span>Albums</span>
              <span>Photos</span>
              <span>Downloads</span>
            </div>


            {statsLoading ? (

              <div className="weekly-empty">
                Loading statistics...
              </div>

            ) : stats?.weekly?.length ? (

              stats.weekly.map((day) => (

                <div
                  className="weekly-row"
                  key={String(day.date)}
                >

                  <span>
                    {new Date(
                      day.date
                    ).toLocaleDateString(
                      undefined,
                      {
                        day: "numeric",
                        month: "short",
                      }
                    )}
                  </span>

                  <span>
                    {formatNumber(
                      day.websiteViews
                    )}
                  </span>

                  <span>
                    {formatNumber(
                      day.albumViews
                    )}
                  </span>

                  <span>
                    {formatNumber(
                      day.photoViews
                    )}
                  </span>

                  <span>
                    {formatNumber(
                      day.downloads
                    )}
                  </span>

                </div>

              ))

            ) : (

              <div className="weekly-empty">
                No activity recorded yet.
              </div>

            )}

          </div>

        </section>


        {/* ================================
            TOP PHOTOS
        ================================= */}

        <section className="stats-section">

          <div className="section-heading">

            <div>
              <p className="dashboard-label">
                POPULAR CONTENT
              </p>

              <h2>Most Viewed Photos</h2>
            </div>

          </div>


          <div className="ranking-list">

            {statsLoading ? (

              <div className="ranking-empty">
                Loading...
              </div>

            ) : stats?.topPhotos?.length ? (

              stats.topPhotos.map(
                (photo, index) => (

                  <div
                    className="ranking-item"
                    key={photo.id}
                  >

                    <div className="ranking-number">
                      {index + 1}
                    </div>

                    <div className="ranking-info">

                      <strong>
                        {photo.name ||
                          "Untitled Photo"}
                      </strong>

                      <span>
                        {photo.albumName ||
                          "Unknown Album"}
                      </span>

                    </div>

                    <div className="ranking-value">
                      {formatNumber(photo.views)}
                      <small> views</small>
                    </div>

                  </div>

                )
              )

            ) : (

              <div className="ranking-empty">
                No photo views recorded yet.
              </div>

            )}

          </div>

        </section>


        {/* ================================
            TOP DOWNLOADS
        ================================= */}

        <section className="stats-section">

          <div className="section-heading">

            <div>
              <p className="dashboard-label">
                DOWNLOADS
              </p>

              <h2>Most Downloaded Photos</h2>
            </div>

          </div>


          <div className="ranking-list">

            {statsLoading ? (

              <div className="ranking-empty">
                Loading...
              </div>

            ) : stats?.topDownloads?.length ? (

              stats.topDownloads.map(
                (photo, index) => (

                  <div
                    className="ranking-item"
                    key={photo.id}
                  >

                    <div className="ranking-number">
                      {index + 1}
                    </div>

                    <div className="ranking-info">

                      <strong>
                        {photo.name ||
                          "Untitled Photo"}
                      </strong>

                      <span>
                        {photo.albumName ||
                          "Unknown Album"}
                      </span>

                    </div>

                    <div className="ranking-value">
                      {formatNumber(
                        photo.downloads
                      )}
                      <small>
                        {" "}
                        downloads
                      </small>
                    </div>

                  </div>

                )
              )

            ) : (

              <div className="ranking-empty">
                No downloads recorded yet.
              </div>

            )}

          </div>

        </section>


        {/* ================================
            ALBUM MANAGEMENT
        ================================= */}

        <div className="dashboard-title albums-heading">

          <div>
            <p className="dashboard-label">
              CONTENT MANAGEMENT
            </p>

            <h2>Albums</h2>

            <p>
              Organize your church photos into
              albums and events.
            </p>
          </div>

          <button
            className="create-album-btn"
            onClick={() =>
              setShowCreate(!showCreate)
            }
          >
            {showCreate
              ? "Cancel"
              : "+ Create Album"}
          </button>

        </div>


        {/* ================================
            ERROR
        ================================= */}

        {error && (
          <div className="dashboard-error">
            {error}
          </div>
        )}


        {/* ================================
            CREATE ALBUM
        ================================= */}

        {showCreate && (

          <form
            className="create-album-form"
            onSubmit={createAlbum}
          >

            <label>
              Album Name
            </label>

            <input
              type="text"
              placeholder="e.g. Sunday Service"
              value={albumName}
              onChange={(e) =>
                setAlbumName(e.target.value)
              }
              required
            />


            <label>
              Description
            </label>

            <textarea
              placeholder="Describe this album..."
              value={albumDescription}
              onChange={(e) =>
                setAlbumDescription(
                  e.target.value
                )
              }
              rows={4}
            />


            <button
              type="submit"
              disabled={saving}
            >
              {saving
                ? "Creating..."
                : "Create Album"}
            </button>

          </form>

        )}


        {/* ================================
            ALBUMS
        ================================= */}

        {loading ? (

          <div className="dashboard-loading">
            Loading albums...
          </div>

        ) : albums.length === 0 ? (

          <div className="empty-albums">

            <div className="empty-icon">
              📁
            </div>

            <h3>
              No albums yet
            </h3>

            <p>
              Create your first album to start
              uploading church photos.
            </p>

          </div>

        ) : (

          <div className="album-grid">

            {albums.map((album) => (

              <div
                className="album-card"
                key={album.id}
              >

                <div className="album-cover">

                  {album.cover_url ? (

                    <img
                      src={album.cover_url}
                      alt={album.name}
                    />

                  ) : (

                    <div className="album-cover-empty">
                      📷
                    </div>

                  )}

                </div>


                <div className="album-card-content">

                  <h3>
                    {album.name}
                  </h3>

                  <p>
                    {album.description ||
                      "No description"}
                  </p>


                  <div className="album-actions">

                    <button
                      onClick={() =>
                        openUploadPage(
                          album.id
                        )
                      }
                    >
                      Upload Images
                    </button>


                    <button
                      className="delete-album-btn"
                      onClick={() =>
                        deleteAlbum(album.id)
                      }
                    >
                      Delete
                    </button>

                  </div>

                </div>

              </div>

            ))}

          </div>

        )}

      </section>

    </main>
  );
}
