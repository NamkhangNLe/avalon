"use client";

import {
  ROLE_META,
  alignmentOf,
  markRevealed,
  resetToLobby,
  whatPlayerSees,
  type GameState,
} from "@/lib/avalon";
import { Avatar, Divider, GhostButton, GoldButton, HoldToReveal, Panel } from "./ui";

export function RoleReveal({
  game,
  onUpdate,
}: {
  game: GameState;
  onUpdate: (next: GameState) => void;
}) {
  const current = game.players.find((p) => !game.revealed.includes(p.id));
  if (!current || !current.role) return null;
  const meta = ROLE_META[current.role];
  const known = whatPlayerSees(game, current.id);
  const isGood = alignmentOf(current.role) === "good";
  const remaining = game.players.length - game.revealed.length;

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-5 px-4 pt-10 pb-16">
      <header className="text-center">
        <p className="font-display text-xs font-bold tracking-[0.4em] text-[#c9a227] uppercase">
          The dealing is done
        </p>
        <h1 className="font-display mt-2 text-3xl font-black tracking-wide text-[#f5efe0] sm:text-4xl">
          Know thyself
        </h1>
        <p className="mt-2 text-sm text-[#a99e83]">
          {remaining} knight{remaining > 1 ? "s" : ""} still to learn their secret.
          Pass the device to <strong className="text-[#e9dfc8]">{current.name}</strong>.
        </p>
      </header>

      <Panel className="p-5 sm:p-6">
        <div className="mb-4 flex items-center gap-3">
          <Avatar name={current.name} color={current.color} size={48} />
          <div>
            <p className="font-display text-lg font-bold text-[#e9dfc8]">{current.name}</p>
            <p className="text-xs text-[#a99e83]">Your secret is below. Everyone else, look away.</p>
          </div>
        </div>

        <HoldToReveal label={`Press and hold — ${current.name}'s role`}>
          <div
            className={`flex flex-col items-center gap-3 px-6 py-8 text-center ${
              isGood ? "bg-[#1c2a1e]" : "bg-[#2a1613]"
            }`}
          >
            <span
              className={`font-display text-6xl ${
                isGood ? "text-[#8fce9b]" : "text-[#ff8a80]"
              }`}
            >
              {meta.sigil}
            </span>
            <p className="font-display text-[11px] font-bold tracking-[0.3em] uppercase text-[#a99e83]">
              You are
            </p>
            <p className="font-display text-3xl font-black tracking-wide text-[#f5efe0]">
              {meta.name}
            </p>
            <span
              className={`rounded-full px-3 py-1 text-[11px] font-bold tracking-[0.2em] uppercase ${
                isGood
                  ? "bg-[#4f7a5a]/25 text-[#a5d6a7]"
                  : "bg-[#b3261e]/25 text-[#ff8a80]"
              }`}
            >
              {isGood ? "Good — servant of Arthur" : "Evil — servant of Mordred"}
            </span>
            <p className="max-w-sm text-sm leading-relaxed text-[#d8cfb6]">{meta.description}</p>

            <Divider className="w-full max-w-xs" />

            {known.length > 0 ? (
              <div className="w-full max-w-sm">
                <p className="mb-2 font-display text-xs font-bold tracking-[0.24em] text-[#c9a227] uppercase">
                  {current.role === "percival"
                    ? "One of these two is Merlin"
                    : current.role === "merlin"
                      ? "The evil you know"
                      : "Your fellow evil"}
                </p>
                <ul className="flex flex-col gap-2">
                  {known.map(({ player, label }) => (
                    <li
                      key={player.id}
                      className="flex items-center gap-3 rounded-xl border border-[#3a332a] bg-[#0b0a08]/50 px-3 py-2 text-left"
                    >
                      <Avatar name={player.name} color={player.color} size={30} />
                      <span className="flex-1 text-sm font-semibold text-[#e9dfc8]">
                        {player.name}
                      </span>
                      <span className="text-xs font-semibold text-[#a99e83]">{label}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="max-w-sm text-sm text-[#a99e83]">
                You know no one. Trust your judgment — and no one else&rsquo;s.
              </p>
            )}
          </div>
        </HoldToReveal>

        <div className="mt-5 flex flex-col items-center gap-3">
          <GoldButton onClick={() => onUpdate(markRevealed(game, current.id))} className="w-full">
            I have memorized my role — pass it on
          </GoldButton>
          <p className="text-xs text-[#6f6650]">
            {game.revealed.length} of {game.players.length} revealed
          </p>
        </div>
      </Panel>

      <div className="text-center">
        <GhostButton
          onClick={() => {
            if (window.confirm("Restart the deal with new roles? Everyone will need to re-reveal.")) {
              onUpdate(resetToLobby(game));
            }
          }}
        >
          Back to lobby
        </GhostButton>
      </div>
    </div>
  );
}
