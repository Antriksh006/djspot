'use client';

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import SpotifyWebApi from "spotify-web-api-js";

// Extend Window type to include Spotify
declare global {
  interface Window {
    Spotify?: any;
    onSpotifyWebPlaybackSDKReady?: () => void;
  }
}

const spotifyApi = new SpotifyWebApi();

export default function PlayerPage() {
  const { data: session, status } = useSession();
  const [playlists, setPlaylists] = useState<any[]>([]);
  const [currentTrack, setCurrentTrack] = useState<any>(null);
  const [player, setPlayer] = useState<any>(null);

  useEffect(() => {
    if (session?.accessToken) {
      spotifyApi.setAccessToken(session.accessToken);
      spotifyApi.getUserPlaylists().then((data) => {
        setPlaylists(data.items);
      });
    }
  }, [session]);

  useEffect(() => {
    if (!window.Spotify || player) return;

    const script = document.createElement('script');
    script.src = "https://sdk.scdn.co/spotify-player.js";
    script.async = true;

    document.body.appendChild(script);

    window.onSpotifyWebPlaybackSDKReady = () => {
    interface SpotifyPlayerOptions {
      name: string;
      getOAuthToken: (cb: (token: string) => void) => void;
      volume?: number;
    }

    interface SpotifyPlayer {
      addListener: (
        event: string,
        callback: (data: { device_id: string }) => void
      ) => void;
      connect: () => void;
    }

    const _player: SpotifyPlayer = new window.Spotify.Player({
      name: 'DJ Player',
      getOAuthToken: (cb: (token: string) => void) => cb(session?.accessToken!),
      volume: 0.8
    } as SpotifyPlayerOptions);

      _player.addListener('ready', ({ device_id }: { device_id: string }) => {
        console.log('Player ready on device:', device_id);
        spotifyApi.transferMyPlayback([device_id]);
      });

      _player.connect();
      setPlayer(_player);
    };
  }, [session]);

    const playTrackSnippet = async (track: any) => {
    if (!session || !session.accessToken) {
      throw new Error("Session or access token is missing.");
    }
    const analysis = await fetch(
    `https://api.spotify.com/v1/audio-analysis/${track.id}`,
    {
        headers: {
        Authorization: `Bearer ${session.accessToken}`,
        },
    }
    ).then(res => res.json());

    const bestSection = analysis.sections.reduce((prev: any, curr: any) =>
      (curr.loudness > prev.loudness && curr.duration > 25) ? curr : prev
    );

    await spotifyApi.play({
      uris: [track.uri],
      position_ms: bestSection.start * 1000,
    });

    setCurrentTrack(track);
  };

  const startDJSet = async (playlistId: string) => {
    const data = await spotifyApi.getPlaylistTracks(playlistId);
    const tracks = data.items.map(item => item.track);

    for (let i = 0; i < tracks.length - 1; i++) {
      const current = tracks[i];
      const next = tracks[i + 1];

      await playTrackSnippet(current);

      setTimeout(async () => {
        await spotifyApi.queue(next.uri);
      }, 25000);

      await new Promise(res => setTimeout(res, 30000));
    }
  };

  if (status === 'loading') return <p>Loading...</p>;
  if (!session) return <p>Not authenticated. Please log in.</p>;

  return (
    <div className="p-6 text-white bg-black min-h-screen">
      <h1 className="text-3xl mb-4">🎧 DJ Spotify Mixer</h1>
      <p className="mb-4">Logged in as {session.user?.name}</p>

      {currentTrack && (
        <div className="mb-6">
          <p>🎵 Now Playing: {currentTrack.name}</p>
          <p>👤 {currentTrack.artists.map((a: any) => a.name).join(', ')}</p>
        </div>
      )}

      <h2 className="text-xl mb-2">Choose a Playlist:</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {playlists.map(pl => (
          <div key={pl.id} className="p-4 border border-gray-700 rounded">
            <h3>{pl.name}</h3>
            <button
              onClick={() => startDJSet(pl.id)}
              className="mt-2 px-4 py-2 bg-green-500 text-white rounded"
            >
              Start DJ Mix
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
