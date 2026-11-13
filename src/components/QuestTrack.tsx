"use client";

import { QUEST_SIZES, failsNeeded, type GameState } from "@/lib/avalon";

/** The five quest stones + the vote track (rejection pips). */
export function QuestTrack({ state }: { state: GameState }) {
  const sizes = QUEST_SIZES[state.players.length];
  return (
    <div>
      <div className="flex items-center justify-between gap-2">
        {sizes.map((size, i) => {
          const result = state.questResults[i];
          const isCurrent = state.phase !== "over" && i === state.round;
          const needsTwo = failsNeeded(state.players.length, i) === 2;
          return (
            <div key={i} className="flex flex-1 flex-col items-center gap-1.5">
              <div
                className={`flex h-11 w-11 items-center justify-center rounded-full border-2 font-display text-base font-bold transition-all sm:h-12 sm:w-12 ${
                  result?.success
                    ? "border-[#9fb4e6] bg-[#9fb4e6]/25 text-[#dbe4ff] shadow-[0_0_18px_rgba(159,180,230,0.35)]"
                    : result && !result.success
                      ? "border-[#c8423a] bg-[#c8423a]/25 text-[#ff9d94] shadow-[0_0_18px_rgba(179,38,30,0.35)]"
                      : isCurrent
                        ? "animate-pulse border-[#dbe4ff] bg-transparent text-[#dbe4ff]"
                        : "border-[#34416a] bg-[#111829] text-[#5f6c91]"
                }`}
              >
                {result?.success ? "✓" : result && !result.success ? "✕" : i + 1}
              </div>
              <span className="text-[10px] font-semibold tracking-wider text-[#8f9cc0]">
                {size} knight{size > 1 ? "s" : ""}
                {needsTwo ? " · 2✕" : ""}
              </span>
            </div>
          );
        })}
      </div>

      {/* vote track */}
      <div className="mt-4 flex items-center justify-center gap-2">
        <span className="text-[10px] font-semibold tracking-[0.18em] text-[#5f6c91] uppercase">
          Rejected proposals
        </span>
        {Array.from({ length: 5 }).map((_, i) => (
          <span
            key={i}
            className={`h-2.5 w-2.5 rounded-full ${
              i < state.voteTrack ? "bg-[#c8423a]" : "bg-[#242f4d]"
            }`}
          />
        ))}
        <span className="text-[10px] text-[#5f6c91]">
          {state.voteTrack === 4
            ? "— one more rejection and Evil wins"
            : state.voteTrack > 0
              ? `— ${5 - state.voteTrack} left`
              : "— 5 rejections and Evil wins"}
        </span>
      </div>
    </div>
  );
}
