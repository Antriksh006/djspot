// lib/auth.ts
import SpotifyProvider from "next-auth/providers/spotify";
import type { NextAuthOptions } from "next-auth";
import type { Session } from "next-auth";

// Extend the Session type to include accessToken
declare module "next-auth" {
  interface Session {
    accessToken?: string;
    user?: any;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    SpotifyProvider({
    clientId: process.env.SPOTIFY_CLIENT_ID!,
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET!,
    authorization: {
        url: "https://accounts.spotify.com/authorize",
        params: {
        scope: [
            "user-read-email",
            "user-read-private",
            "playlist-read-private",
            "user-read-playback-state",
            "user-modify-playback-state",
            "user-read-currently-playing",
            "streaming",
            "app-remote-control"
        ].join(" "),
        response_type: "code",
        redirect_uri: "https:/www.djspot.me/api/auth/callback/spotify",
        },
    },
    })
  ],
  callbacks: {
    async jwt({ token, account, user }) {
      if (account) {
        token.accessToken = account.access_token;
        token.user = user;
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = typeof token.accessToken === "string" ? token.accessToken : undefined;
      session.user = token.user;
      return session;
    },
  },
};
