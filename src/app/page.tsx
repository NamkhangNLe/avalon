"use client";

import { useEffect, useState } from "react";
import { newLobby, type GameState } from "@/lib/avalon";
import { newRoomCode, roomLink, store } from "@/lib/store";
import { GameBoard } from "@/components/GameBoard";
import { Lobby } from "@/components/Lobby";
import { RoleReveal } from "@/components/RoleReveal";
import { Divider, GhostButton, GoldButton, Panel, SectionTitle } from "@/components/ui";


function Crest() {
  return (
    <svg viewBox="0 0 100 120" className="mx-auto h-28 w-auto" role="img" aria-label="Heraldic shield with a sword">
      <path d="M50 4 L92 18 V58 C92 88 70 108 50 116 C30 108 8 88 8 58 V18 Z" fill="#111829" stroke="#9fb4e6" strokeWidth="2" />
      <path d="M50 4 L92 18 V58 C92 88 70 108 50 116 Z" fill="#8f2420" opacity="0.85" />
      <path d="M50 4 L8 18 V58 C8 88 30 108 50 116 Z" fill="#13213f" />
      <path d="M50 22 V92 M36 40 H64" stroke="#e6ebf9" strokeWidth="4" strokeLinecap="round" />
      <circle cx="50" cy="96" r="3.5" fill="#e6ebf9" />
      <path d="M50 4 L92 18 V58 C92 88 70 108 50 116 C30 108 8 88 8 58 V18 Z" fill="none" stroke="#dbe4ff" strokeWidth="1" opacity="0.5" transform="translate(0 0) scale(1)" />
    </svg>
  );
}

export default function Home() {
  const [game, setGame] = useState<GameState | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [joinCode, setJoinCode] = useState("");
  const [joinError, setJoinError] = useState("");
  const [copied, setCopied] = useState(false);

  // On mount: resume ?room=CODE, or offer the last room.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const room = params.get("room")?.toUpperCase();
    if (room) {
      const saved = store.load(room);
      if (saved) {
        setGame(saved);
      } else {
        setGame(newLobby(room));
      }
    }
    setLoaded(true);
  }, []);

  const update = (next: GameState) => {
    store.save(next);
    setGame(next);
  };

  const createGame = () => {
    const code = newRoomCode();
    const fresh = newLobby(code);
    store.save(fresh);
    window.history.replaceState(null, "", roomLink(code));
    setGame(fresh);
  };

  const joinGame = () => {
    const code = joinCode.trim().toUpperCase();
    if (!code) return;
    const saved = store.load(code);
    if (saved) {
      window.history.replaceState(null, "", roomLink(code));
      setGame(saved);
      return;
    }
    setJoinError(
      `No saved game for room ${code} on this device. Create a new table, or open the invite link on the host's device.`,
    );
  };

  const resumeLast = () => {
    const last = store.lastRoom();
    if (!last) return;
    const saved = store.load(last);
    if (saved) {
      window.history.replaceState(null, "", roomLink(last));
      setGame(saved);
    }
  };

  const leaveToStart = () => {
    window.history.replaceState(null, "", window.location.pathname);
    setGame(null);
  };

  const newTable = () => {
    if (game) store.clear(game.roomCode);
    leaveToStart();
  };

  if (!loaded) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="font-display text-sm tracking-[0.3em] text-[#9fb4e6] uppercase">
          Lighting the torches…
        </p>
      </div>
    );
  }

  if (!game) {
    const last = store.lastRoom();
    const lastGame = last ? store.load(last) : null;
    return (
      <div className="mx-auto flex min-h-screen w-full max-w-xl flex-col items-center justify-center gap-6 px-4 py-16 text-center">
        <header>
          <Crest />
          <p className="font-display mt-5 text-sm font-bold tracking-[0.4em] text-[#9fb4e6] uppercase">
            The Resistance
          </p>
          <h1 className="font-display mt-2 text-7xl font-bold tracking-[0.12em] text-[#f6f8ff] sm:text-8xl">
            AVALON
          </h1>
          <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-[#8f9cc0]">
            A game of hidden loyalty and quiet betrayal, played on one shared
            device. Five quests stand between Camelot and the dark.
          </p>
        </header>

        <Divider className="w-full" />

        <div className="flex w-full flex-col gap-3">
          <GoldButton onClick={createGame} className="w-full py-4 text-base">
            Create a new table
          </GoldButton>

          {lastGame && (
            <GhostButton onClick={resumeLast} className="w-full py-3">
              Resume room {lastGame.roomCode} — {lastGame.players.length} knight
              {lastGame.players.length === 1 ? "" : "s"}
              {lastGame.phase !== "lobby" ? ` · ${lastGame.phase}` : " · in lobby"}
            </GhostButton>
          )}

          <Panel className="p-4">
            <SectionTitle className="mb-2 text-sm">Join a room</SectionTitle>
            <div className="flex gap-2">
              <input
                value={joinCode}
                onChange={(e) => {
                  setJoinCode(e.target.value.toUpperCase().replace(/[^A-Z]/g, ""));
                  setJoinError("");
                }}
                onKeyDown={(e) => e.key === "Enter" && joinGame()}
                placeholder="Room code"
                maxLength={4}
                className="min-w-0 flex-1 rounded-md border border-[#34416a] bg-[#090d18] px-4 py-3 text-center font-display text-lg font-bold tracking-[0.3em] text-[#f6f8ff] placeholder:text-[#5f6c91] focus:border-[#9fb4e6] focus:outline-none"
              />
              <GoldButton onClick={joinGame} disabled={joinCode.length !== 4}>
                Join
              </GoldButton>
            </div>
            {joinError && <p className="mt-2 text-xs leading-relaxed text-[#ff9d94]">{joinError}</p>}
          </Panel>
        </div>

        <div className="grid w-full grid-cols-3 gap-2 text-center">
          {[
            { n: "5–10", label: "players" },
            { n: "5", label: "quests" },
            { n: "3", label: "to win" },
          ].map((s) => (
            <Panel key={s.label} className="px-2 py-3">
              <p className="font-display text-2xl font-bold text-[#dbe4ff]">{s.n}</p>
              <p className="text-[11px] tracking-[0.18em] text-[#8f9cc0] uppercase">{s.label}</p>
            </Panel>
          ))}
        </div>

        <p className="max-w-md text-xs leading-relaxed text-[#5f6c91]">
          Pass-and-play on one device — the phone moves around the table, and
          secrets stay secret behind hold-to-reveal. A realtime multiplayer
          backend can plug into the same game state later.
        </p>
        <button
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(window.location.href);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            } catch {
              /* clipboard unavailable */
            }
          }}
          className="text-xs font-semibold text-[#9fb4e6] hover:text-[#dbe4ff]"
        >
          {copied ? "✓ Link copied" : "Copy a link to this page"}
        </button>
      </div>
    );
  }

  if (game.phase === "lobby") {
    return <Lobby game={game} onUpdate={update} onLeave={leaveToStart} />;
  }
  if (game.phase === "reveal") {
    return <RoleReveal game={game} onUpdate={update} />;
  }
  return <GameBoard game={game} onUpdate={update} onNewTable={newTable} />;
}
