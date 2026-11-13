"use client";

import { useState } from "react";
import {
  MAX_PLAYERS,
  MIN_PLAYERS,
  addPlayer,
  removePlayer,
  setOptions,
  startGame,
  type GameState,
} from "@/lib/avalon";
import { roomLink } from "@/lib/store";
import { Avatar, Divider, GhostButton, GoldButton, Panel, SectionTitle } from "./ui";

export function Lobby({
  game,
  onUpdate,
  onLeave,
}: {
  game: GameState;
  onUpdate: (next: GameState) => void;
  onLeave: () => void;
}) {
  const [name, setName] = useState("");
  const [copied, setCopied] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const canStart = game.players.length >= MIN_PLAYERS;
  const specialAvailable = game.players.length >= 7;

  const submitName = () => {
    if (!name.trim()) return;
    onUpdate(addPlayer(game, name));
    setName("");
  };

  const copyLink = async () => {
    const link = roomLink(game.roomCode);
    try {
      await navigator.clipboard.writeText(link);
    } catch {
      // clipboard unavailable — select fallback
      const ta = document.createElement("textarea");
      ta.value = link;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 pt-10 pb-16 sm:pt-16">
      {/* Title */}
      <header className="text-center">
        <p className="font-display text-xs font-bold tracking-[0.4em] text-[#9fb4e6] uppercase">
          The Resistance
        </p>
        <h1 className="font-display mt-2 text-6xl font-bold tracking-[0.08em] text-[#f6f8ff] sm:text-7xl">
          AVALON
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-[#8f9cc0]">
          A game of hidden loyalty and quiet betrayal. Five quests stand
          between Camelot and the dark — and not everyone at this table is who
          they claim to be.
        </p>
      </header>

      <Divider />

      {/* Room code */}
      <Panel className="p-5">
        <div className="flex flex-col items-center gap-3 text-center">
          <SectionTitle>Your table</SectionTitle>
          <p className="text-sm text-[#8f9cc0]">
            Room code — share it so friends can open this room on their own
            device.
          </p>
          <p className="font-display text-4xl font-bold tracking-[0.35em] text-[#dbe4ff]">
            {game.roomCode}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <GhostButton onClick={copyLink}>{copied ? "✓ Link copied" : "Copy invite link"}</GhostButton>
            <GhostButton onClick={onLeave}>Leave room</GhostButton>
          </div>
          <p className="max-w-md text-xs leading-relaxed text-[#5f6c91]">
            v1 is pass-and-play: one shared device, passed around the table.
            The link resumes this room on the device that created it.
          </p>
        </div>
      </Panel>

      {/* Add players */}
      <Panel className="p-5">
        <SectionTitle className="mb-1">Knights at the table</SectionTitle>
        <p className="mb-4 text-sm text-[#8f9cc0]">
          {game.players.length < MIN_PLAYERS
            ? `Add ${MIN_PLAYERS - game.players.length} more knight${MIN_PLAYERS - game.players.length > 1 ? "s" : ""} to begin (5–10).`
            : `${game.players.length} knights ready — you can add up to ${MAX_PLAYERS}.`}
        </p>
        <div className="flex gap-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submitName()}
            placeholder="Knight's name…"
            maxLength={18}
            className="min-w-0 flex-1 rounded-md border border-[#34416a] bg-[#090d18] px-4 py-3 text-sm text-[#f6f8ff] placeholder:text-[#5f6c91] focus:border-[#9fb4e6] focus:outline-none"
          />
          <GoldButton onClick={submitName} disabled={!name.trim() || game.players.length >= MAX_PLAYERS}>
            Add
          </GoldButton>
        </div>

        {game.players.length > 0 && (
          <ul className="mt-4 flex flex-col gap-2">
            {game.players.map((p, i) => (
              <li
                key={p.id}
                className="flex items-center gap-3 rounded-xl border border-[#242f4d] bg-[#090d18]/60 px-3 py-2"
              >
                <Avatar name={p.name} color={p.color} size={32} />
                <span className="flex-1 truncate text-sm font-semibold text-[#e6ebf9]">
                  {i + 1}. {p.name}
                </span>
                <button
                  onClick={() => onUpdate(removePlayer(game, p.id))}
                  className="rounded-full px-2 py-1 text-xs font-semibold text-[#5f6c91] hover:text-[#e56b6f]"
                  aria-label={`Remove ${p.name}`}
                >
                  ✕ Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      {/* Options */}
      <Panel className="p-5">
        <SectionTitle className="mb-3">Optional roles</SectionTitle>
        <label
          className={`flex items-start gap-3 rounded-xl border p-3 ${
            specialAvailable ? "cursor-pointer border-[#242f4d]" : "cursor-not-allowed border-[#242f4d] opacity-50"
          }`}
        >
          <input
            type="checkbox"
            checked={game.options.percival && game.options.morgana}
            disabled={!specialAvailable}
            onChange={(e) =>
              onUpdate(
                setOptions(game, { percival: e.target.checked, morgana: e.target.checked }),
              )
            }
            className="mt-1 h-4 w-4 accent-[#9fb4e6]"
          />
          <span>
            <span className="block text-sm font-semibold text-[#e6ebf9]">
              Percival &amp; Morgana
            </span>
            <span className="block text-xs leading-relaxed text-[#8f9cc0]">
              Percival knows Merlin — but Morgana wears the same face, so he
              sees two possible Merlins. Adds delicious doubt. Requires 7+
              players.
            </span>
          </span>
        </label>
        {!specialAvailable && (
          <p className="mt-2 text-xs text-[#5f6c91]">
            Add at least 7 knights to unlock Percival &amp; Morgana.
          </p>
        )}
      </Panel>

      <GoldButton
        onClick={() => onUpdate(startGame(game))}
        disabled={!canStart}
        className="w-full py-4 text-base"
      >
        {canStart ? "Deal the roles — begin" : `Need ${MIN_PLAYERS} knights to begin`}
      </GoldButton>

      {/* How to play */}
      <div>
        <button
          onClick={() => setShowRules((s) => !s)}
          className="w-full text-center text-sm font-semibold text-[#9fb4e6] hover:text-[#dbe4ff]"
        >
          {showRules ? "Hide the rules ↑" : "How to play ↓"}
        </button>
        {showRules && (
          <Panel className="mt-3 animate-fade-up p-5 text-sm leading-relaxed text-[#bcc7e4]">
            <ol className="flex list-decimal flex-col gap-3 pl-5">
              <li>
                <strong className="text-[#e6ebf9]">Roles are dealt in secret.</strong> Most
                of you serve Arthur. A few serve Mordred — and only Merlin
                knows who.
              </li>
              <li>
                <strong className="text-[#e6ebf9]">Each round, the leader proposes a quest
                team.</strong> Everyone votes to approve or reject it. Five
                rejections in a row and Evil wins on the spot.
              </li>
              <li>
                <strong className="text-[#e6ebf9]">The chosen team quests in secret.</strong>{" "}
                Good knights must succeed; evil knights may fail. Only the
                number of fail cards is revealed — never who played them. On
                the 4th quest with 7+ players, two fails are needed to sink it.
              </li>
              <li>
                <strong className="text-[#e6ebf9]">First side to three quests wins</strong> —
                but if Good wins, the Assassin gets one final guess at Merlin.
                Name him, and Evil steals the realm.
              </li>
            </ol>
            <p className="mt-4 text-xs text-[#5f6c91]">
              Pass-and-play: the device moves around the table. When a secret
              is shown, everyone else looks away.
            </p>
          </Panel>
        )}
      </div>
    </div>
  );
}
