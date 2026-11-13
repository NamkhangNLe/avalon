"use client";

import type { Player } from "@/lib/avalon";
import { Avatar } from "./ui";

export interface PlayerCardProps {
  player: Player;
  isLeader?: boolean;
  isSelected?: boolean;
  isOnTeam?: boolean;
  showRole?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  badge?: string;
}

export function PlayerCard({
  player,
  isLeader,
  isSelected,
  isOnTeam,
  showRole,
  disabled,
  onClick,
  badge,
}: PlayerCardProps) {
  const inner = (
    <>
      <div className="relative">
        <Avatar name={player.name} color={player.color} size={52} ring={isSelected ? "#dbe4ff" : undefined} />
        {isLeader && (
          <span
            className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-[#9fb4e6] text-xs font-bold text-[#171204] shadow"
            title="Leader"
          >
            ♛
          </span>
        )}
      </div>
      <span className="w-full truncate text-center text-sm font-semibold text-[#e6ebf9]">
        {player.name}
      </span>
      {badge ? (
        <span className="rounded-full bg-[#9fb4e6]/15 px-2 py-0.5 text-[10px] font-bold tracking-wider text-[#dbe4ff] uppercase">
          {badge}
        </span>
      ) : showRole && player.role ? (
        <span className="rounded-full bg-[#242f4d] px-2 py-0.5 text-[10px] font-bold tracking-wider text-[#8f9cc0] uppercase">
          {roleLabel(player.role)}
        </span>
      ) : isOnTeam ? (
        <span className="rounded-full bg-[#9fb4e6]/15 px-2 py-0.5 text-[10px] font-bold tracking-wider text-[#dbe4ff] uppercase">
          On quest
        </span>
      ) : (
        <span className="text-[10px] text-[#5f6c91]"> </span>
      )}
    </>
  );

  const cls = `flex flex-col items-center gap-1.5 rounded-2xl border p-3 transition-all ${
    isSelected
      ? "border-[#dbe4ff] bg-[#9fb4e6]/10 shadow-[0_0_20px_rgba(201,162,39,0.25)]"
      : "border-[#242f4d] bg-[#111829]/80"
  } ${onClick ? "cursor-pointer hover:border-[#9fb4e6]/60 active:scale-[0.98]" : ""} ${
    disabled ? "opacity-50" : ""
  }`;

  return onClick ? (
    <button onClick={onClick} disabled={disabled} className={cls}>
      {inner}
    </button>
  ) : (
    <div className={cls}>{inner}</div>
  );
}

export function roleLabel(role: Player["role"]): string {
  switch (role) {
    case "merlin":
      return "Merlin";
    case "percival":
      return "Percival";
    case "servant":
      return "Servant";
    case "assassin":
      return "Assassin";
    case "morgana":
      return "Morgana";
    case "minion":
      return "Minion";
    default:
      return "—";
  }
}

export function PlayerGrid({
  players,
  leaderIndex,
  team,
  selected,
  showRoles,
  onToggle,
  badges,
}: {
  players: Player[];
  leaderIndex?: number;
  team?: string[];
  selected?: string[];
  showRoles?: boolean;
  onToggle?: (id: string) => void;
  badges?: Record<string, string>;
}) {
  return (
    <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4 md:grid-cols-5">
      {players.map((p, i) => (
        <PlayerCard
          key={p.id}
          player={p}
          isLeader={leaderIndex === i}
          isOnTeam={team?.includes(p.id)}
          isSelected={selected?.includes(p.id)}
          showRole={showRoles}
          badge={badges?.[p.id]}
          onClick={onToggle ? () => onToggle(p.id) : undefined}
        />
      ))}
    </div>
  );
          }
