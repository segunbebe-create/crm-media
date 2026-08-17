"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function handleLogin(e) {
    e.preventDefault();

    if (
      username.trim() === "admin" &&
      password === "CRMadmin2026"
    ) {
      localStorage.setItem("crmAdmin", "true");
      router.push("/admin/dashboard");
    } else {
      setError("Incorrect username or password.");
    }
  }

  return (
    <main className="admin-page">
      <div className="admin-card">

        <img src="/logo.svg" alt="CRM Media" />

        <p className="admin-label">
          CRM MEDIA
        </p>

        <h1>Admin Login</h1>

        <p className="admin-description">
          Sign in to manage the CRM Media gallery.
        </p>

        <form onSubmit={handleLogin}>

          <label>Username</label>

          <input
            type="text"
            placeholder="Enter username"
            value={username}
            onChange={(e) =>
              setUsername(e.target.value)
            }
            required
          />

          <label>Password</label>

          <input
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
            required
          />

          {error && (
            <p className="login-error">
              {error}
            </p>
          )}

          <button type="submit">
            Sign in
          </button>

        </form>

        <a href="/">
          ← Back to CRM Media
        </a>

      </div>
    </main>
  );
}
