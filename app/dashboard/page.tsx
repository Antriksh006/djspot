"use client";

import { useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [playlists, setPlaylists] = useState<any[]>([]);

  // Redirect if not logged in
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  // Fetch user playlists from Spotify
  useEffect(() => {
    const fetchPlaylists = async () => {
      if (!session?.accessToken) return;

      try {
        const res = await fetch("https://api.spotify.com/v1/me/playlists", {
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
          },
        });

        const data = await res.json();
        setPlaylists(data.items || []);
      } catch (err) {
        console.error("Failed to fetch playlists:", err);
      }
    };

    fetchPlaylists();
  }, [session]);

  if (status === "loading") return <p>Loading...</p>;

  const user = session?.user;

  return (
    <div style={{ padding: "2rem", fontFamily: "Arial", background: "#121212", color: "#fff", minHeight: "100vh" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        <img src={user?.image ?? ""} alt="profile" width={80} style={{ borderRadius: "50%" }} />
        <div>
          <h1 style={{ margin: 0 }}>Welcome, {user?.name}</h1>
          <p style={{ margin: 0 }}>{user?.email}</p>
        </div>
        <button
          onClick={() => signOut()}
          style={{
            marginLeft: "auto",
            padding: "0.5rem 1rem",
            backgroundColor: "#1DB954",
            color: "#000",
            border: "none",
            borderRadius: "20px",
            cursor: "pointer",
          }}
        >
          Logout
        </button>
      </div>

      <hr style={{ margin: "2rem 0", borderColor: "#333" }} />

      <h2>Your Playlists</h2>
      {playlists.length === 0 ? (
        <p>No playlists found.</p>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
          {playlists.map((playlist) => (
            <div
              key={playlist.id}
              style={{
                background: "#1e1e1e",
                padding: "1rem",
                borderRadius: "10px",
                textAlign: "center",
              }}
            >
              <img
                src={playlist.images?.[0]?.url ?? ""}
                alt={playlist.name}
                style={{ width: "100%", borderRadius: "8px" }}
              />
              <p style={{ marginTop: "0.5rem" }}>{playlist.name}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
