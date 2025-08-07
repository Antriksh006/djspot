// app/dashboard/page.tsx
"use client";

import { signOut, useSession } from "next-auth/react";

export default function Dashboard() {
  const { data: session } = useSession();

  if (!session) {
    return <p>Loading or not authenticated...</p>;
  }

  const user = session.user as any;

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Dashboard</h1>
      <p>Welcome, {user.name}</p>
      <p>Email: {user.email}</p>
      <img src={user.image} alt="profile" width={100} />
      <br />
      <button onClick={() => signOut()}>Logout</button>
    </div>
  );
}
