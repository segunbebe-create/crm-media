"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function UploadPhotos() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const albumId = searchParams.get("album");

  const [album, setAlbum] = useState(null);
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const admin = localStorage.getItem("crmAdmin");

    if (admin !== "true") {
      router.push("/admin");
      return;
    }

    const savedAlbums = localStorage.getItem("crmAlbums");

    if (savedAlbums && albumId) {
      const albums = JSON.parse(savedAlbums);

      const selectedAlbum = albums.find(
        (item) => String(item.id) === String(albumId)
      );

      setAlbum(selectedAlbum);
    }
  }, [albumId, router]);

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
      const uploadedPhotos = [];

      for (const file of files) {
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || "Upload failed.");
        }

        uploadedPhotos.push({
          id: Date.now() + Math.random(),
          name: file.name,
          url: result.url,
        });
      }

      const savedAlbums =
        JSON.parse(localStorage.getItem("crmAlbums")) || [];

      const updatedAlbums = savedAlbums.map((item) => {
        if (String(item.id) !== String(albumId)) {
          return item;
        }

        return {
          ...item,
          photos: [
            ...(item.photos || []),
            ...uploadedPhotos,
          ],
        };
      });

      localStorage.setItem(
        "crmAlbums",
        JSON.stringify(updatedAlbums)
      );

      setFiles([]);
      setMessage(
        `${uploadedPhotos.length} photo${
          uploadedPhotos.length === 1 ? "" : "s"
        } uploaded successfully!`
      );
    } catch (error) {
      setMessage(error.message || "Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  if (!album) {
    return (
      <main className="admin-dashboard">
        <div className="dashboard-content">
          <h1>Album not found</h1>
          <button onClick={() => router.push("/admin/dashboard")}>
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
          <img src="/logo.svg" alt="CRM Media" />

          <div>
            <span>CRM MEDIA</span>
            <h1>Upload Photos</h1>
          </div>
        </div>

        <button
          className="logout-btn"
          onClick={() => router.push("/admin/dashboard")}
        >
          ← Dashboard
        </button>
      </header>

      <section className="dashboard-content">

        <div className="dashboard-title">
          <div>
            <p className="dashboard-label">ALBUM</p>

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

          <h3>Upload your photos</h3>

          <p>
            Select one or more images from your computer.
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

              {files.map((file, index) => (
                <div
                  className="selected-file"
                  key={`${file.name}-${index}`}
                >
                  <span>🖼️</span>
                  <p>{file.name}</p>
                </div>
              ))}

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
            disabled={uploading || files.length === 0}
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
