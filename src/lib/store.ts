// ─────────────────────────────────────────────────────────────────────────────
// Game persistence.
// v1 is pass-and-play on one device: the whole GameState lives in
// localStorage under the room code. The GameStore interface is the seam for
// v2 — a RealtimeGameStore (Supabase / WebSocket / PartyKit) can implement
// the same three methods and the UI + logic never change, because all game
// transitions are pure functions over plain GameState objects (lib/avalon.ts).
// ─────────────────────────────────────────────────────────────────────────────

import type { GameState } from "./avalon";
import { generateRoomCode } from "./avalon";

export interface GameStore {
  load(roomCode: string): GameState | null;
  save(state: GameState): void;
  clear(roomCode: string): void;
  lastRoom(): string | null;
  setLastRoom(roomCode: string): void;
}

const KEY_PREFIX = "avalon:game:";
const LAST_ROOM_KEY = "avalon:last-room";

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export class LocalStorageGameStore implements GameStore {
  load(roomCode: string): GameState | null {
    if (!isBrowser()) return null;
    try {
      const raw = window.localStorage.getItem(KEY_PREFIX + roomCode.toUpperCase());
      if (!raw) return null;
      const parsed = JSON.parse(raw) as GameState;
      if (!parsed || typeof parsed !== "object" || !Array.isArray(parsed.players)) return null;
      return parsed;
    } catch {
      return null;
    }
  }

  save(state: GameState): void {
    if (!isBrowser()) return;
    try {
      window.localStorage.setItem(KEY_PREFIX + state.roomCode.toUpperCase(), JSON.stringify(state));
      this.setLastRoom(state.roomCode);
    } catch {
      // storage full or unavailable — the in-memory game still works
    }
  }

  clear(roomCode: string): void {
    if (!isBrowser()) return;
    window.localStorage.removeItem(KEY_PREFIX + roomCode.toUpperCase());
  }

  lastRoom(): string | null {
    if (!isBrowser()) return null;
    return window.localStorage.getItem(LAST_ROOM_KEY);
  }

  setLastRoom(roomCode: string): void {
    if (!isBrowser()) return;
    window.localStorage.setItem(LAST_ROOM_KEY, roomCode.toUpperCase());
  }
}

/** The store used by the app. Swap this one line for a realtime store. */
export const store: GameStore = new LocalStorageGameStore();

export function newRoomCode(): string {
  return generateRoomCode();
}

/** Shareable link for a room. On this device it resumes the saved game;
 *  on another device it opens the same room code (state sync needs the
 *  realtime store — see README). */
export function roomLink(roomCode: string): string {
  if (!isBrowser()) return `?room=${roomCode}`;
  return `${window.location.origin}${window.location.pathname}?room=${roomCode.toUpperCase()}`;
}
