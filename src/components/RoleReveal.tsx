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
import { roleLabel } from "./PlayerGrid";

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
        <p className="font-display text-xs font-bold tracking-[0.4em] text-[#9fb4e6] uppercase">
          The dealing is done
        </p>
        <h1 className="font-display mt-2 text-3xl font-bold tracking-wide text-[#f6f8ff] sm:text-4xl">
          Know thyself
        </h1>
        <p className="mt-2 text-sm text-[#8f9cc0]">
          {remaining} knight{remaining > 1 ? "s" : ""} still to learn their secret.
          Pass the device to <strong className="text-[#e6ebf9]">{current.name}</strong>.
        </p>
      </header>

      <Panel className="p-5 sm:p-6">
        <div className="mb-4 flex items-center gap-3">
          <Avatar name={current.name} color={current.color} size={48} />
          <div>
            <p className="font-display text-lg font-bold text-[#e6ebf9]">{current.name}</p>
            <p className="text-xs text-[#8f9cc0]">Your secret is below. Everyone else, look away.</p>
          </div>
        </div>

        <HoldToReveal label={`Press and hold — ${current.name}'s role`}>
          <div
            className={`flex flex-col items-center gap-3 px-6 py-8 text-center ${
              isGood ? "bg-[#13213f]" : "bg-[#2a1613]"
            }`}
          >
            <span
              className={`font-display text-6xl ${
                isGood ? "text-[#8fbaff]" : "text-[#ff9d94]"
              }`}
            >
              {meta.sigil}
            </span>
            <p className="font-display text-[11px] font-bold tracking-[0.3em] uppercase text-[#8f9cc0]">
              You are
            </p>
            <p className="font-display text-3xl font-bold tracking-wide text-[#f6f8ff]">
              {meta.name}
            </p>
            <span
              className={`rounded-full px-3 py-1 text-[11px] font-bold tracking-[0.2em] uppercase ${
                isGood
                  ? "bg-[#3f6fc4]/25 text-[#b5d0ff]"
                  : "bg-[#c8423a]/25 text-[#ff9d94]"
              }`}
            >
              {isGood ? "Good — servant of Arthur" : "Evil — servant of Mordred"}
            </span>
            <p className="max-w-sm text-sm leading-relaxed text-[#cdd6ee]">{meta.description}</p>

            <Divider className="w-full max-w-xs" />

            {known.length > 0 ? (
              <div className="w-full max-w-sm">
                <p className="mb-2 font-display text-xs font-bold tracking-[0.24em] text-[#9fb4e6] uppercase">
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
                      className="flex items-center gap-3 rounded-xl border border-[#34416a] bg-[#090d18]/50 px-3 py-2 text-left"
                    >
                      <Avatar name={player.name} color={player.color} size={30} />
                      <span className="flex-1 text-sm font-semibold text-[#e6ebf9]">
                        {player.name}
                      </span>
                      <span className="text-xs font-semibold text-[#8f9cc0]">{label}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="max-w-sm text-sm text-[#8f9cc0]">
                You know no one. Trust your judgment — and no one else&rsquo;s.
              </p>
            )}
          </div>
        </HoldToReveal>

        <div className="mt-5 flex flex-col items-center gap-3">
          <GoldButton onClick={() => onUpdate(markRevealed(game, current.id))} className="w-full">
            I have memorized my role — pass it on
          </GoldButton>
          <p className="text-xs text-[#5f6c91]">
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
      <p className="sr-only">{roleLabel(current.role)}</p>
    </div>
  );
}
