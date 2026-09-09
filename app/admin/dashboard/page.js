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
      await loadStats();
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

  function getChartMax() {
    if (!stats?.weekly?.length) return 1;

    let highest = 1;

    stats.weekly.forEach((day) => {
      highest = Math.max(
        highest,
        Number(day.websiteViews || 0),
        Number(day.photoViews || 0),
        Number(day.downloads || 0)
      );
    });

    return highest;
  }

  function getBarHeight(value) {
    const max = getChartMax();

    if (!value) return 3;

    const percentage = (Number(value) / max) * 100;

    return Math.max(percentage, 3);
  }

  return (
    <main className="admin-dashboard">

      {/* HEADER */}

      <header className="dashboard-header">

        <div className="dashboard-brand">

          <img
            src="/logo.png"
            alt="CRM Media"
          />

          <div>
            <p>CRM MEDIA</p>
            <span>ADMIN DASHBOARD</span>
          </div>

        </div>

        <button
          className="logout-btn"
          onClick={logout}
        >
          Logout
        </button>

      </header>


      {/* MAIN */}

      <section className="dashboard-content">

        {/* OVERVIEW HEADER */}

        <div className="dashboard-title">

          <div>
            <p className="dashboard-label">
              WEBSITE STATUS
            </p>

            <h1>
              Overview
            </h1>

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


        {/* STATUS ERROR */}

        {statsError && (
          <div className="dashboard-error">
            {statsError}
          </div>
        )}


        {/* STAT CARDS */}

        <div className="stats-grid">

          <div className="stat-card">
            <div className="stat-icon">
              👁️
            </div>

            <div>
              <p>
                Total Website Views
              </p>

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
              <p>
                Total Photo Views
              </p>

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
              <p>
                Total Downloads
              </p>

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
              <p>
                Total Photos
              </p>

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
              <p>
                Total Albums
              </p>

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
              <p>
                Album Views
              </p>

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


        {/* TODAY */}

        <section className="stats-section">

          <div className="section-heading">

            <p className="dashboard-label">
              TODAY
            </p>

            <h2>
              Today's Activity
            </h2>

          </div>


          <div className="today-grid">

            <div className="today-card">
              <span>
                Website Views
              </span>

              <strong>
                {statsLoading
                  ? "..."
                  : formatNumber(
                      stats?.today?.websiteViews
                    )}
              </strong>
            </div>


            <div className="today-card">
              <span>
                Album Views
              </span>

              <strong>
                {statsLoading
                  ? "..."
                  : formatNumber(
                      stats?.today?.albumViews
                    )}
              </strong>
            </div>


            <div className="today-card">
              <span>
                Photo Views
              </span>

              <strong>
                {statsLoading
                  ? "..."
                  : formatNumber(
                      stats?.today?.photoViews
                    )}
              </strong>
            </div>


            <div className="today-card">
              <span>
                Downloads
              </span>

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


        {/* 7 DAY CHART */}

        <section className="stats-section">

          <div className="section-heading">

            <p className="dashboard-label">
              PERFORMANCE
            </p>

            <h2>
              Activity — Last 7 Days
            </h2>

            <p>
              See how visitors are interacting
              with your media.
            </p>

          </div>


          {statsLoading ? (

            <div className="dashboard-loading">
              Loading activity...
            </div>

          ) : stats?.weekly?.length ? (

            <>
              <div className="analytics-chart">

                {stats.weekly.map((day) => (

                  <div
                    className="chart-column"
                    key={String(day.date)}
                  >

                    <div className="chart-bars">

                      <div
                        className="chart-bar"
                        title={`Website views: ${day.websiteViews}`}
                        style={{
                          height: `${getBarHeight(
                            day.websiteViews
                          )}%`,
                        }}
                      />

                      <div
                        className="chart-bar photo"
                        title={`Photo views: ${day.photoViews}`}
                        style={{
                          height: `${getBarHeight(
                            day.photoViews
                          )}%`,
                        }}
                      />

                      <div
                        className="chart-bar download"
                        title={`Downloads: ${day.downloads}`}
                        style={{
                          height: `${getBarHeight(
                            day.downloads
                          )}%`,
                        }}
                      />

                    </div>

                    <div className="chart-date">
                      {new Date(
                        day.date
                      ).toLocaleDateString(
                        undefined,
                        {
                          weekday: "short",
                          day: "numeric",
                        }
                      )}
                    </div>

                  </div>

                ))}

              </div>


              <div className="chart-legend">

                <span>
                  <i className="legend-dot" />
                  Website Views
                </span>

                <span>
                  <i className="legend-dot photo" />
                  Photo Views
                </span>

                <span>
                  <i className="legend-dot download" />
                  Downloads
                </span>

              </div>
            </>

          ) : (

            <div className="ranking-empty">
              No activity recorded yet.
            </div>

          )}

        </section>


        {/* MOST VIEWED */}

        <section className="stats-section">

          <div className="section-heading">

            <p className="dashboard-label">
              POPULAR CONTENT
            </p>

            <h2>
              Most Viewed Photos
            </h2>

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
                      {formatNumber(
                        photo.views
                      )}

                      <small>
                        {" "}
                        views
                      </small>
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


        {/* MOST DOWNLOADED */}

        <section className="stats-section">

          <div className="section-heading">

            <p className="dashboard-label">
              DOWNLOADS
            </p>

            <h2>
              Most Downloaded Photos
            </h2>

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


        {/* ALBUM MANAGEMENT */}

        <div className="dashboard-title albums-heading">

          <div>

            <p className="dashboard-label">
              CONTENT MANAGEMENT
            </p>

            <h2>
              Albums
            </h2>

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


        {/* ALBUM ERROR */}

        {error && (
          <div className="dashboard-error">
            {error}
          </div>
        )}


        {/* CREATE ALBUM */}

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


        {/* ALBUM LIST */}

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
