// app/login/page.tsx
"use client";

import { signIn } from "next-auth/react";

export default function LoginPage() {
  return (
    <div style={{ padding: "2rem" }}>
      <h1>Login with Spotify</h1>
      <button onClick={() => signIn("spotify")}>Login</button>
    </div>
  );
}
