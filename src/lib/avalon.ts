// ─────────────────────────────────────────────────────────────────────────────
// Avalon — pure game logic.
// No React, no browser APIs, no network. Every transition is a pure function
// over plain GameState objects, so a realtime backend can sync state later by
// swapping the store (see lib/store.ts) without touching this module.
// ─────────────────────────────────────────────────────────────────────────────

export type RoleId =
  | "merlin"
  | "percival"
  | "servant"
  | "assassin"
  | "morgana"
  | "minion";

export type Alignment = "good" | "evil";

export type Phase =
  | "lobby"
  | "reveal"
  | "propose"
  | "vote"
  | "vote-result"
  | "quest"
  | "quest-result"
  | "assassin"
  | "over";

export interface Player {
  id: string;
  name: string;
  color: string;
  role: RoleId | null;
}

export interface QuestResult {
  index: number;
  team: string[];
  fails: number;
  success: boolean;
  votes: Record<string, boolean>; // proposal votes, public in Avalon
}

export interface LogEntry {
  id: string;
  text: string;
  at: number;
}

export interface GameOptions {
  percival: boolean;
  morgana: boolean;
}

export interface GameState {
  roomCode: string;
  createdAt: number;
  players: Player[];
  options: GameOptions;
  phase: Phase;
  round: number; // quest index 0..4
  leaderIndex: number;
  voteTrack: number; // consecutive rejected proposals (0..4; 5 = evil wins)
  proposedTeam: string[];
  votes: Record<string, boolean>; // proposal votes by player id
  questVotes: Record<string, boolean>; // quest votes by team-member id (true = success)
  questResults: QuestResult[];
  lastProposal: { team: string[]; votes: Record<string, boolean>; approved: boolean } | null;
  lastQuest: { team: string[]; fails: number; success: boolean } | null;
  revealed: string[]; // player ids who have seen their role
  assassinGuess: string | null;
  winner: Alignment | null;
  winReason: string | null;
  log: LogEntry[];
}

// ── Static tables ────────────────────────────────────────────────────────────

export const MIN_PLAYERS = 5;
export const MAX_PLAYERS = 10;
export const QUESTS_TO_WIN = 3;
export const MAX_REJECTIONS = 5;

/** Team size required for each quest, by player count. */
export const QUEST_SIZES: Record<number, number[]> = {
  5: [2, 3, 2, 3, 3],
  6: [2, 3, 4, 3, 4],
  7: [2, 3, 3, 4, 4],
  8: [3, 4, 4, 5, 5],
  9: [3, 4, 4, 5, 5],
  10: [3, 4, 4, 5, 5],
};

/** Quest 4 (index 3) needs two fail cards when 7+ players are at the table. */
export function failsNeeded(playerCount: number, questIndex: number): number {
  return playerCount >= 7 && questIndex === 3 ? 2 : 1;
}

export function requiredTeamSize(playerCount: number, questIndex: number): number {
  return QUEST_SIZES[playerCount][questIndex];
}

export interface RoleMeta {
  id: RoleId;
  name: string;
  alignment: Alignment;
  short: string;
  description: string;
  sigil: string;
}

export const ROLE_META: Record<RoleId, RoleMeta> = {
  merlin: {
    id: "merlin",
    name: "Merlin",
    alignment: "good",
    short: "The seer of Camelot",
    sigil: "✦",
    description:
      "You know the agents of evil. Guide the good — but guard your identity. If the Assassin names you at the end, all is lost.",
  },
  percival: {
    id: "percival",
    name: "Percival",
    alignment: "good",
    short: "The knight who seeks Merlin",
    sigil: "⚔",
    description:
      "You see two faces, and one of them is Merlin — the other is Morgana, wearing his shape. Choose whom to trust, and protect the true seer.",
  },
  servant: {
    id: "servant",
    name: "Loyal Servant of Arthur",
    alignment: "good",
    short: "A faithful knight",
    sigil: "♞",
    description:
      "You know nothing. Watch the votes, weigh the words, and trust your judgment. The fate of Camelot rests on servants like you.",
  },
  assassin: {
    id: "assassin",
    name: "Assassin",
    alignment: "evil",
    short: "Mordred's blade",
    sigil: "🗡",
    description:
      "You know your fellow minions. Fail quests quietly — and if Good prevails, one final dagger remains: name Merlin, and the realm is yours.",
  },
  morgana: {
    id: "morgana",
    name: "Morgana",
    alignment: "evil",
    short: "The false seer",
    sigil: "☾",
    description:
      "You appear as Merlin to Percival's sight. Deceive, misdirect, and hide in plain sight among the good.",
  },
  minion: {
    id: "minion",
    name: "Minion of Mordred",
    alignment: "evil",
    short: "A shadow of Mordred",
    sigil: "◈",
    description:
      "You serve Mordred. You know your fellow evil — fail quests when the moment is right, and never betray your own.",
  },
};

export const PLAYER_COLORS = [
  "#C9A227", // gold
  "#7FB069", // sage
  "#5B8DEF", // blue
  "#C96F4A", // terracotta
  "#9B7EDE", // violet
  "#4ECDC4", // teal
  "#E56B6F", // coral
  "#F2A541", // amber
  "#8D99AE", // slate
  "#D97B29", // rust
];

// ── Helpers ──────────────────────────────────────────────────────────────────

export function uid(): string {
  return Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-3);
}

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const ROOM_LETTERS = "ABCDEFGHJKMNPQRSTUVWXYZ"; // no I, O — avoids confusion

export function generateRoomCode(): string {
  let code = "";
  for (let i = 0; i < 4; i++) {
    code += ROOM_LETTERS[Math.floor(Math.random() * ROOM_LETTERS.length)];
  }
  return code;
}

/** The role list for a table of `count` players. Percival replaces a
 *  servant and Morgana replaces a minion; each is only offered at 7+
 *  players, and each is independent — Percival without Morgana (and
 *  vice versa) is a standard variant. */
export function rolesForPlayerCount(
  count: number,
  options: GameOptions,
): RoleId[] {
  const usePercival = count >= 7 && options.percival;
  const useMorgana = count >= 7 && options.morgana;
  const withSpecials = (base: RoleId[]): RoleId[] => {
    const roles = [...base];
    if (usePercival) {
      const i = roles.indexOf("servant");
      if (i >= 0) roles[i] = "percival";
    }
    if (useMorgana) {
      const i = roles.indexOf("minion");
      if (i >= 0) roles[i] = "morgana";
    }
    return roles;
  };
  switch (count) {
    case 5:
      return ["merlin", "assassin", "servant", "servant", "minion"];
    case 6:
      return ["merlin", "assassin", "servant", "servant", "servant", "minion"];
    case 7:
      return withSpecials(["merlin", "assassin", "servant", "servant", "servant", "minion", "minion"]);
    case 8:
      return withSpecials(["merlin", "assassin", "servant", "servant", "servant", "servant", "minion", "minion"]);
    case 9:
      return withSpecials(["merlin", "assassin", "servant", "servant", "servant", "servant", "servant", "minion", "minion"]);
    case 10:
      return withSpecials(["merlin", "assassin", "servant", "servant", "servant", "servant", "servant", "minion", "minion", "minion"]);
    default:
      throw new Error(`Avalon needs 5–10 players, got ${count}`);
  }
}

export function alignmentOf(role: RoleId): Alignment {
  return ROLE_META[role].alignment;
}

export function isEvilRole(role: RoleId | null): boolean {
  return role !== null && alignmentOf(role) === "evil";
}

export function playerById(state: GameState, id: string): Player | undefined {
  return state.players.find((p) => p.id === id);
}

export function goodSuccesses(state: GameState): number {
  return state.questResults.filter((q) => q.success).length;
}

export function evilFails(state: GameState): number {
  return state.questResults.filter((q) => !q.success).length;
}

/**
 * What a player is allowed to know. Returns the other players this viewer
 * can identify, with the label they see.
 * - Merlin sees every evil player (as "Evil" — not their exact role).
 * - Percival sees Merlin and Morgana, both labelled "Merlin?" — he cannot tell which.
 * - Evil players see every other evil player with their true role.
 * - Servants see no one.
 */
export function whatPlayerSees(
  state: GameState,
  viewerId: string,
): { player: Player; label: string; alignment: Alignment }[] {
  const viewer = playerById(state, viewerId);
  if (!viewer || !viewer.role) return [];
  const others = state.players.filter((p) => p.id !== viewerId);
  if (viewer.role === "merlin") {
    return others
      .filter((p) => isEvilRole(p.role))
      .map((p) => ({ player: p, label: "Evil", alignment: "evil" as Alignment }));
  }
  if (viewer.role === "percival") {
    // Stable order: sort by player id so the two "Merlin?" entries never
    // flip places between renders (a shuffle here re-rolled every render).
    return others
      .filter((p) => p.role === "merlin" || p.role === "morgana")
      .sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0))
      .map((p) => ({ player: p, label: "Merlin?", alignment: "good" as Alignment }));
  }
  if (isEvilRole(viewer.role)) {
    return others
      .filter((p) => isEvilRole(p.role))
      .map((p) => ({
        player: p,
        label: p.role ? ROLE_META[p.role].name : "Evil",
        alignment: "evil" as Alignment,
      }));
  }
  return [];
}

// ── State construction ───────────────────────────────────────────────────────

export function newLobby(roomCode: string): GameState {
  return {
    roomCode,
    createdAt: Date.now(),
    players: [],
    options: { percival: true, morgana: true },
    phase: "lobby",
    round: 0,
    leaderIndex: 0,
    voteTrack: 0,
    proposedTeam: [],
    votes: {},
    questVotes: {},
    questResults: [],
    lastProposal: null,
    lastQuest: null,
    revealed: [],
    assassinGuess: null,
    winner: null,
    winReason: null,
    log: [],
  };
}

export function addPlayer(state: GameState, name: string): GameState {
  const trimmed = name.trim().slice(0, 18);
  if (!trimmed || state.players.length >= MAX_PLAYERS) return state;
  const player: Player = {
    id: uid(),
    name: trimmed,
    color: PLAYER_COLORS[state.players.length % PLAYER_COLORS.length],
    role: null,
  };
  return { ...state, players: [...state.players, player] };
}

export function removePlayer(state: GameState, playerId: string): GameState {
  if (state.phase !== "lobby") return state;
  return { ...state, players: state.players.filter((p) => p.id !== playerId) };
}

export function setOptions(state: GameState, options: Partial<GameOptions>): GameState {
  return { ...state, options: { ...state.options, ...options } };
}

function pushLog(state: GameState, text: string): LogEntry[] {
  const entry: LogEntry = { id: uid(), text, at: Date.now() };
  return [...state.log, entry].slice(-50);
}

/** Deal roles and move to the reveal phase. */
export function startGame(state: GameState): GameState {
  if (state.players.length < MIN_PLAYERS) return state;
  const roles = shuffle(rolesForPlayerCount(state.players.length, state.options));
  const players = state.players.map((p, i) => ({ ...p, role: roles[i] }));
  return {
    ...state,
    players,
    phase: "reveal",
    leaderIndex: Math.floor(Math.random() * players.length),
    log: pushLog(state, `The table is set — ${players.length} knights gather. Roles are dealt in secret.`),
  };
}

export function markRevealed(state: GameState, playerId: string): GameState {
  if (state.phase !== "reveal" || state.revealed.includes(playerId)) return state;
  const revealed = [...state.revealed, playerId];
  const done = revealed.length >= state.players.length;
  return {
    ...state,
    revealed,
    phase: done ? "propose" : "reveal",
    log: done
      ? pushLog(state, "Every knight knows their secret. The first quest is proposed.")
      : state.log,
  };
}

// ── Propose / vote / quest ───────────────────────────────────────────────────

export function proposeTeam(state: GameState, team: string[]): GameState {
  if (state.phase !== "propose") return state;
  const size = requiredTeamSize(state.players.length, state.round);
  if (team.length !== size) return state;
  if (new Set(team).size !== team.length) return state;
  if (team.some((id) => !playerById(state, id))) return state;
  return { ...state, proposedTeam: team, votes: {}, phase: "vote" };
}

export function castProposalVote(
  state: GameState,
  playerId: string,
  approve: boolean,
): GameState {
  if (state.phase !== "vote") return state;
  if (state.votes[playerId] !== undefined) return state;
  if (!playerById(state, playerId)) return state;
  const votes = { ...state.votes, [playerId]: approve };
  if (Object.keys(votes).length < state.players.length) {
    return { ...state, votes };
  }
  const approvals = Object.values(votes).filter(Boolean).length;
  const approved = approvals > state.players.length / 2;
  const leader = state.players[state.leaderIndex];
  return {
    ...state,
    votes,
    lastProposal: { team: state.proposedTeam, votes, approved },
    phase: "vote-result",
    log: pushLog(
      state,
      approved
        ? `${leader?.name ?? "The leader"}'s team was approved ${approvals}–${state.players.length - approvals}. The quest begins.`
        : `${leader?.name ?? "The leader"}'s team was rejected ${approvals}–${state.players.length - approvals}.`,
    ),
  };
}

export function continueAfterVoteResult(state: GameState): GameState {
  if (state.phase !== "vote-result" || !state.lastProposal) return state;
  if (state.lastProposal.approved) {
    // A team was approved: the rejection streak is broken. The vote track
    // counts CONSECUTIVE rejections only — five in a row, per the rules —
    // so an approval resets it.
    return { ...state, voteTrack: 0, phase: "quest", questVotes: {}, lastProposal: null };
  }
  const voteTrack = state.voteTrack + 1;
  if (voteTrack >= MAX_REJECTIONS) {
    return {
      ...state,
      voteTrack,
      phase: "over",
      winner: "evil",
      winReason:
        "Five proposals in a row were rejected. With the table in chaos, Mordred's shadow falls over Camelot.",
      log: pushLog(state, "Five rejections in a row — Evil wins the realm."),
    };
  }
  return {
    ...state,
    voteTrack,
    leaderIndex: (state.leaderIndex + 1) % state.players.length,
    proposedTeam: [],
    votes: {},
    lastProposal: null,
    phase: "propose",
  };
}

export function castQuestVote(
  state: GameState,
  playerId: string,
  success: boolean,
): GameState {
  if (state.phase !== "quest") return state;
  if (!state.proposedTeam.includes(playerId)) return state;
  if (state.questVotes[playerId] !== undefined) return state;
  const player = playerById(state, playerId);
  // The good cannot fail a quest — their loyalty compels success.
  const finalVote = player && !isEvilRole(player.role) ? true : success;
  const questVotes = { ...state.questVotes, [playerId]: finalVote };
  if (Object.keys(questVotes).length < state.proposedTeam.length) {
    return { ...state, questVotes };
  }
  const fails = Object.values(questVotes).filter((v) => !v).length;
  const needed = failsNeeded(state.players.length, state.round);
  const questSuccess = fails < needed;
  return {
    ...state,
    questVotes,
    lastQuest: { team: state.proposedTeam, fails, success: questSuccess },
    phase: "quest-result",
    log: pushLog(
      state,
      questSuccess
        ? `Quest ${state.round + 1} succeeded${fails > 0 ? ` — but ${fails} fail card${fails > 1 ? "s" : ""} appeared` : " — cleanly, without a single fail."}`
        : `Quest ${state.round + 1} failed (${fails} fail card${fails > 1 ? "s" : ""}). Darkness grows.`,
    ),
  };
}

export function continueAfterQuestResult(state: GameState): GameState {
  if (state.phase !== "quest-result" || !state.lastQuest) return state;
  const result: QuestResult = {
    index: state.round,
    team: state.lastQuest.team,
    fails: state.lastQuest.fails,
    success: state.lastQuest.success,
    votes: state.votes,
  };
  const questResults = [...state.questResults, result];
  const next: GameState = {
    ...state,
    questResults,
    // The quest resolved, so the rejection streak is broken too: the vote
    // track counts consecutive rejections within a quest round, and a
    // resolved quest starts the next round at zero.
    voteTrack: 0,
    lastQuest: null,
    proposedTeam: [],
    votes: {},
    questVotes: {},
  };
  const good = questResults.filter((q) => q.success).length;
  const evil = questResults.filter((q) => !q.success).length;
  if (good >= QUESTS_TO_WIN) {
    return {
      ...next,
      phase: "assassin",
      log: pushLog(next, "Three quests have succeeded! But the Assassin has one final dagger to throw…"),
    };
  }
  if (evil >= QUESTS_TO_WIN) {
    return {
      ...next,
      phase: "over",
      winner: "evil",
      winReason: "Three quests have failed. Mordred's minions have broken Camelot.",
      log: pushLog(next, "Three quests failed — Evil wins the realm."),
    };
  }
  return {
    ...next,
    round: state.round + 1,
    leaderIndex: (state.leaderIndex + 1) % state.players.length,
    phase: "propose",
  };
}

// ── Assassin's gambit ────────────────────────────────────────────────────────

export function assassinPlayer(state: GameState): Player | undefined {
  return state.players.find((p) => p.role === "assassin");
}

export function castAssassinGuess(state: GameState, guessedPlayerId: string): GameState {
  if (state.phase !== "assassin") return state;
  const guessed = playerById(state, guessedPlayerId);
  if (!guessed) return state;
  const correct = guessed.role === "merlin";
  return {
    ...state,
    assassinGuess: guessedPlayerId,
    phase: "over",
    winner: correct ? "evil" : "good",
    winReason: correct
      ? `The Assassin named ${guessed.name} — Merlin himself. With the seer slain, Evil claims Camelot.`
      : `The Assassin named ${guessed.name} — but Merlin lives. Good holds Camelot.`,
    log: pushLog(
      state,
      correct
        ? `The Assassin struck true — ${guessed.name} was Merlin. Evil wins.`
        : `The Assassin guessed wrong — ${guessed.name} is not Merlin. Good wins!`,
    ),
  };
}

/** Start a fresh deal with the same players (new roles, same table). */
export function playAgain(state: GameState): GameState {
  const fresh = newLobby(state.roomCode);
  return {
    ...fresh,
    players: state.players.map((p) => ({ ...p, role: null })),
    options: state.options,
    createdAt: state.createdAt,
  };
}

/** Back to the lobby with the same players (roles cleared, fresh game). */
export function resetToLobby(state: GameState): GameState {
  return playAgain(state);
}
