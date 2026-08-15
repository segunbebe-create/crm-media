"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
  const router = useRouter();

  useEffect(() => {
    const admin = localStorage.getItem("crmAdmin");

    if (admin !== "true") {
      router.push("/admin");
    }
  }, [router]);

  function logout() {
    localStorage.removeItem("crmAdmin");
    router.push("/admin");
  }

  return (
    <main className="admin-dashboard">
      <div className="dashboard-header">
        <div>
          <p>CRM MEDIA</p>
          <h1>Admin Dashboard</h1>
          <span>Manage your church media gallery.</span>
        </div>

        <button onClick={logout}>Logout</button>
      </div>

      <section className="dashboard-grid">
        <div className="dashboard-card">
          <span>📸</span>
          <h2>Upload Photos</h2>
          <p>
            Upload new church photos to the CRM Media gallery.
          </p>
          <button>Upload Photos</button>
        </div>

        <div className="dashboard-card">
          <span>🖼️</span>
          <h2>Manage Gallery</h2>
          <p>
            View and manage photos already uploaded.
          </p>
          <button>Manage Photos</button>
        </div>

        <div className="dashboard-card">
          <span>❤️</span>
          <h2>Favorites</h2>
          <p>
            See how members interact with the gallery.
          </p>
        </div>
      </section>
    </main>
  );
}
