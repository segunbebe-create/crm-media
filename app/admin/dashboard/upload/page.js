"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

function UploadContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const albumId = searchParams.get("album");

  const [album, setAlbum] = useState(null);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const admin = localStorage.getItem("crmAdmin");

    if (admin !== "true") {
      router.push("/admin");
      return;
    }

    loadAlbum();
  }, [albumId, router]);

  async function loadAlbum() {
    try {
      const response = await fetch("/api/albums");

      if (!response.ok) {
        throw new Error("Could not load albums.");
      }

      const albums = await response.json();

      const selectedAlbum = albums.find(
        (item) => String(item.id) === String(albumId)
      );

      setAlbum(selectedAlbum || null);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  function selectFiles(event) {
    setFiles(Array.from(event.target.files || []));
    setMessage("");
  }

  async function uploadPhotos() {
    if (!files.length) {
      setMessage("Please select at least one photo.");
      return;
    }

    setUploading(true);
    setMessage("");

    try {
      let uploaded = 0;

      for (const file of files) {
        const formData = new FormData();

        formData.append("file", file);
        formData.append("albumId", albumId);
        formData.append("name", file.name);

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(
            result.error || "Upload failed."
          );
        }

        uploaded++;
      }

      setFiles([]);

      setMessage(
        `${uploaded} photo${
          uploaded === 1 ? "" : "s"
        } uploaded successfully!`
      );
    } catch (error) {
      setMessage(
        error.message || "Upload failed."
      );
    } finally {
      setUploading(false);
    }
  }

  if (loading) {
    return (
      <main className="admin-dashboard">
        <div className="dashboard-content">
          <h1>Loading album...</h1>
        </div>
      </main>
    );
  }

  if (!album) {
    return (
      <main className="admin-dashboard">
        <div className="dashboard-content">
          <h1>Album not found</h1>

          <button
            onClick={() =>
              router.push("/admin/dashboard")
            }
          >
            Back to Dashboard
          </button>
        </div>
      </main>
    );
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
            <h1>Upload Photos</h1>
          </div>

        </div>

        <button
          className="logout-btn"
          onClick={() =>
            router.push("/admin/dashboard")
          }
        >
          ← Dashboard
        </button>

      </header>

      <section className="dashboard-content">

        <div className="dashboard-title">

          <div>

            <p className="dashboard-label">
              ALBUM
            </p>

            <h2>{album.name}</h2>

            <p>
              {album.description ||
                "Upload photos to this album."}
            </p>

          </div>

        </div>

        <div className="upload-card">

          <div className="upload-icon">
            📸
          </div>

          <h3>
            Upload your photos
          </h3>

          <p>
            Select one or more images
            from your computer.
          </p>

          <label className="file-picker">

            Choose Photos

            <input
              type="file"
              accept="image/*"
              multiple
              onChange={selectFiles}
            />

          </label>

          {files.length > 0 && (
            <div className="selected-files">

              <h4>
                Selected Photos ({files.length})
              </h4>

              {files.map(
                (file, index) => (
                  <div
                    className="selected-file"
                    key={`${file.name}-${index}`}
                  >
                    <span>🖼️</span>
                    <p>{file.name}</p>
                  </div>
                )
              )}

            </div>
          )}

          {message && (
            <p className="upload-message">
              {message}
            </p>
          )}

          <button
            className="upload-submit"
            onClick={uploadPhotos}
            disabled={
              uploading ||
              files.length === 0
            }
          >
            {uploading
              ? "Uploading..."
              : "Upload Photos"}
          </button>

        </div>

      </section>

    </main>
  );
}

export default function UploadPage() {
  return (
    <Suspense
      fallback={
        <main className="admin-dashboard">
          <div className="dashboard-content">
            <h1>Loading...</h1>
          </div>
        </main>
      }
    >
      <UploadContent />
    </Suspense>
  );
}
