"use client";

import { useEffect, useState } from "react";
import {
  assassinPlayer,
  castAssassinGuess,
  castProposalVote,
  castQuestVote,
  continueAfterQuestResult,
  continueAfterVoteResult,
  evilFails,
  failsNeeded,
  goodSuccesses,
  isEvilRole,
  playAgain,
  proposeTeam,
  requiredTeamSize,
  startGame,
  type GameState,
} from "@/lib/avalon";
import { QuestTrack } from "./QuestTrack";
import { PlayerGrid } from "./PlayerGrid";
import { Divider, GhostButton, GoldButton, Panel, SecretTurn, SectionTitle } from "./ui";

export function GameBoard({
  game,
  onUpdate,
  onNewTable,
}: {
  game: GameState;
  onUpdate: (next: GameState) => void;
  onNewTable: () => void;
}) {
  const leader = game.players[game.leaderIndex];
  const teamSize = requiredTeamSize(game.players.length, game.round);

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-5 px-4 pt-6 pb-16 sm:pt-10">
      {/* Header */}
      <header className="text-center">
        <p className="font-display text-[11px] font-bold tracking-[0.35em] text-[#9fb4e6] uppercase">
          Room {game.roomCode} · Quest {Math.min(game.round + 1, 5)} of 5
        </p>
        <h1 className="font-display mt-1 text-3xl font-bold tracking-[0.1em] text-[#f6f8ff]">
          AVALON
        </h1>
      </header>

      <Panel className="p-4 sm:p-5">
        <QuestTrack state={game} />
      </Panel>

      {game.phase !== "over" && leader && (
        <p className="text-center text-sm text-[#8f9cc0]">
          <span className="font-display text-[#dbe4ff]">♛ {leader.name}</span> leads this
          round · {goodSuccesses(game)} good · {evilFails(game)} evil · first to 3
        </p>
      )}

      {game.phase === "propose" && (
        <ProposePhase game={game} teamSize={teamSize} onUpdate={onUpdate} />
      )}
      {game.phase === "vote" && <VotePhase game={game} onUpdate={onUpdate} />}
      {game.phase === "vote-result" && (
        <VoteResultPhase game={game} onUpdate={onUpdate} />
      )}
      {game.phase === "quest" && <QuestPhase game={game} onUpdate={onUpdate} />}
      {game.phase === "quest-result" && (
        <QuestResultPhase game={game} onUpdate={onUpdate} />
      )}
      {game.phase === "assassin" && <AssassinPhase game={game} onUpdate={onUpdate} />}
      {game.phase === "over" && (
        <GameOverPhase game={game} onUpdate={onUpdate} onNewTable={onNewTable} />
      )}

      {/* Chronicle */}
      {game.log.length > 0 && game.phase !== "over" && (
        <Panel className="p-4">
          <SectionTitle className="mb-2 text-sm">Chronicle</SectionTitle>
          <ul className="flex flex-col gap-1.5">
            {game.log.slice(-4).map((entry) => (
              <li key={entry.id} className="text-xs leading-relaxed text-[#8f9cc0]">
                ✦ {entry.text}
              </li>
            ))}
          </ul>
        </Panel>
      )}
    </div>
  );
}

// ── Propose ──────────────────────────────────────────────────────────────────

function ProposePhase({
  game,
  teamSize,
  onUpdate,
}: {
  game: GameState;
  teamSize: number;
  onUpdate: (next: GameState) => void;
}) {
  const leader = game.players[game.leaderIndex];
  const [selected, setSelected] = useState<string[]>([]);

  // Fresh selection every round / phase.
  useEffect(() => {
    setSelected([]);
  }, [game.round, game.phase]);

  const toggle = (id: string) => {
    setSelected((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : prev.length >= teamSize
          ? prev
          : [...prev, id],
    );
  };

  return (
    <div className="flex flex-col gap-4">
      <SecretTurn
        key={leader.id}
        playerName={leader.name}
        playerColor={leader.color}
        prompt={`You are the leader. Choose ${teamSize} knight${teamSize > 1 ? "s" : ""} for Quest ${game.round + 1}. Choose wisely — the realm is watching.`}
      >
        <p className="mb-3 text-sm text-[#8f9cc0]">
          Tap {teamSize} knights to send on the quest.{" "}
          <span className="font-semibold text-[#e6ebf9]">
            {selected.length}/{teamSize} chosen
          </span>
        </p>
        <PlayerGrid
          players={game.players}
          leaderIndex={game.leaderIndex}
          selected={selected}
          onToggle={toggle}
        />
        <GoldButton
          className="mt-5 w-full"
          disabled={selected.length !== teamSize}
          onClick={() => onUpdate(proposeTeam(game, selected))}
        >
          Propose this team
        </GoldButton>
      </SecretTurn>
    </div>
  );
}

// ── Vote ─────────────────────────────────────────────────────────────────────

function VotePhase({
  game,
  onUpdate,
}: {
  game: GameState;
  onUpdate: (next: GameState) => void;
}) {
  const voter = game.players.find((p) => game.votes[p.id] === undefined);
  const teamNames = game.proposedTeam
    .map((id) => game.players.find((p) => p.id === id)?.name)
    .filter(Boolean)
    .join(", ");
  const votedCount = Object.keys(game.votes).length;

  if (!voter) return null;
  return (
    <div className="flex flex-col gap-4">
      <Panel className="p-5 text-center">
        <SectionTitle className="mb-2">The proposed team</SectionTitle>
        <p className="text-lg font-semibold text-[#f6f8ff]">{teamNames}</p>
        <p className="mt-1 text-sm text-[#8f9cc0]">
          Quest {game.round + 1} · {game.proposedTeam.length} knights ·{" "}
          {votedCount} of {game.players.length} votes cast
        </p>
      </Panel>
      <SecretTurn
        key={voter.id}
        playerName={voter.name}
        playerColor={voter.color}
        prompt="Approve this team — or reject it and pass leadership on. Your vote is secret until all have spoken."
      >
        <p className="mb-4 text-center text-sm text-[#8f9cc0]">
          Do you approve the team <strong className="text-[#e6ebf9]">{teamNames}</strong>?
        </p>
        <div className="flex flex-col gap-2.5 sm:flex-row">
          <GoldButton
            className="flex-1"
            onClick={() => onUpdate(castProposalVote(game, voter.id, true))}
          >
            ✓ Approve
          </GoldButton>
          <GhostButton
            tone="danger"
            className="flex-1 py-3"
            onClick={() => onUpdate(castProposalVote(game, voter.id, false))}
          >
            ✕ Reject
          </GhostButton>
        </div>
      </SecretTurn>
    </div>
  );
}

function VoteResultPhase({
  game,
  onUpdate,
}: {
  game: GameState;
  onUpdate: (next: GameState) => void;
}) {
  const tally = game.lastProposal;
  if (!tally) return null;
  const approvals = Object.values(tally.votes).filter(Boolean).length;
  return (
    <div className="flex flex-col gap-4">
      <Panel className="p-5 text-center">
        <p className="font-display text-4xl">{tally.approved ? "✓" : "✕"}</p>
        <h2 className="font-display mt-2 text-2xl font-bold tracking-wide text-[#f6f8ff]">
          {tally.approved ? "Team approved" : "Team rejected"}
        </h2>
        <p className="mt-1 text-sm text-[#8f9cc0]">
          {approvals} approve · {game.players.length - approvals} reject
        </p>
      </Panel>
      <Panel className="p-5">
        <ul className="flex flex-col gap-2">
          {game.players.map((p) => (
            <li key={p.id} className="flex items-center gap-3 text-sm">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ background: p.color }}
              />
              <span className="flex-1 font-semibold text-[#e6ebf9]">{p.name}</span>
              <span
                className={
                  tally.votes[p.id] ? "font-bold text-[#8fbaff]" : "font-bold text-[#ff9d94]"
                }
              >
                {tally.votes[p.id] ? "Approved" : "Rejected"}
              </span>
            </li>
          ))}
        </ul>
      </Panel>
      <GoldButton className="w-full" onClick={() => onUpdate(continueAfterVoteResult(game))}>
        {tally.approved ? "Begin the quest" : "Next leader, propose"}
      </GoldButton>
    </div>
  );
}

// ── Quest ────────────────────────────────────────────────────────────────────

function QuestPhase({
  game,
  onUpdate,
}: {
  game: GameState;
  onUpdate: (next: GameState) => void;
}) {
  const voterId = game.proposedTeam.find((id) => game.questVotes[id] === undefined);
  const voter = voterId ? game.players.find((p) => p.id === voterId) : undefined;
  const votedCount = Object.keys(game.questVotes).length;
  const needsTwo = failsNeeded(game.players.length, game.round) === 2;

  if (!voter) return null;
  const isGood = !isEvilRole(voter.role);

  return (
    <div className="flex flex-col gap-4">
      <Panel className="p-5 text-center">
        <SectionTitle className="mb-2">Quest {game.round + 1} is underway</SectionTitle>
        <p className="text-sm text-[#8f9cc0]">
          {votedCount} of {game.proposedTeam.length} quest cards played
          {needsTwo ? " · two fail cards are needed to sink this quest" : ""}
        </p>
      </Panel>
      <SecretTurn
        key={voter.id}
        playerName={voter.name}
        playerColor={voter.color}
        prompt={
          isGood
            ? "You quest in secret. Your loyalty leaves you one choice — but no one will ever know which card you played."
            : "You quest in secret. Play success to blend in, or fail to sink the quest — but remember, the number of fails will be revealed."
        }
      >
        {isGood ? (
          <div className="flex flex-col items-center gap-3 text-center">
            <p className="text-sm leading-relaxed text-[#8f9cc0]">
              You serve Arthur. Your card is success — but the table will only
              ever see the count, never your hand.
            </p>
            <GoldButton
              className="w-full"
              onClick={() => onUpdate(castQuestVote(game, voter.id, true))}
            >
              ✓ Play success
            </GoldButton>
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            <p className="text-center text-sm leading-relaxed text-[#8f9cc0]">
              Choose your card in secret.
            </p>
            <GoldButton onClick={() => onUpdate(castQuestVote(game, voter.id, true))}>
              ✓ Play success
            </GoldButton>
            <GhostButton
              tone="danger"
              className="py-3"
              onClick={() => onUpdate(castQuestVote(game, voter.id, false))}
            >
              ✕ Play fail
            </GhostButton>
          </div>
        )}
      </SecretTurn>
    </div>
  );
}

function QuestResultPhase({
  game,
  onUpdate,
}: {
  game: GameState;
  onUpdate: (next: GameState) => void;
}) {
  const result = game.lastQuest;
  if (!result) return null;
  return (
    <div className="flex flex-col gap-4">
      <Panel
        className={`p-6 text-center ${
          result.success ? "border-[#9fb4e6]/50" : "border-[#c8423a]/50"
        }`}
      >
        <p className="font-display text-5xl">{result.success ? "✦" : "✕"}</p>
        <h2 className="font-display mt-2 text-3xl font-bold tracking-wide text-[#f6f8ff]">
          Quest {game.round + 1} {result.success ? "succeeded" : "failed"}
        </h2>
        <p className="mt-2 text-sm text-[#8f9cc0]">
          {result.fails === 0
            ? "Not a single fail card. The realm breathes easier."
            : `${result.fails} fail card${result.fails > 1 ? "s" : ""} appeared among the quest cards. Who played them, no one knows.`}
        </p>
        <Divider className="my-4" />
        <p className="text-sm">
          <span className="font-bold text-[#dbe4ff]">{goodSuccesses(game) + (result.success ? 1 : 0)} good</span>
          {" · "}
          <span className="font-bold text-[#ff9d94]">{evilFails(game) + (!result.success ? 1 : 0)} evil</span>
          {" — first to 3"}
        </p>
      </Panel>
      <GoldButton className="w-full" onClick={() => onUpdate(continueAfterQuestResult(game))}>
        Continue
      </GoldButton>
    </div>
  );
}

// ── Assassin ─────────────────────────────────────────────────────────────────

function AssassinPhase({
  game,
  onUpdate,
}: {
  game: GameState;
  onUpdate: (next: GameState) => void;
}) {
  const assassin = assassinPlayer(game);
  const [pick, setPick] = useState<string | null>(null);
  if (!assassin) return null;
  return (
    <div className="flex flex-col gap-4">
      <Panel className="border-[#c8423a]/50 p-6 text-center">
        <p className="font-display text-5xl text-[#ff9d94]">🗡</p>
        <h2 className="font-display mt-2 text-3xl font-bold tracking-wide text-[#f6f8ff]">
          The Assassin&rsquo;s gambit
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-[#8f9cc0]">
          Three quests have succeeded — but the night is not over. The
          Assassin has one final dagger: name Merlin, and Evil steals the
          realm despite its defeats.
        </p>
      </Panel>
      <SecretTurn
        key={assassin.id}
        playerName={assassin.name}
        playerColor={assassin.color}
        prompt="You are the Assassin. Choose the knight you believe is Merlin. Choose wrong, and Good holds Camelot."
      >
        <p className="mb-3 text-sm text-[#8f9cc0]">
          Who is Merlin?
        </p>
        <PlayerGrid
          players={game.players.filter((p) => p.id !== assassin.id)}
          selected={pick ? [pick] : []}
          onToggle={(id) => setPick(id === pick ? null : id)}
        />
        <GoldButton
          className="mt-5 w-full"
          disabled={!pick}
          onClick={() => pick && onUpdate(castAssassinGuess(game, pick))}
        >
          Strike — name Merlin
        </GoldButton>
      </SecretTurn>
    </div>
  );
}

// ── Game over ────────────────────────────────────────────────────────────────

function GameOverPhase({
  game,
  onUpdate,
  onNewTable,
}: {
  game: GameState;
  onUpdate: (next: GameState) => void;
  onNewTable: () => void;
}) {
  const goodWon = game.winner === "good";
  const assassin = assassinPlayer(game);
  return (
    <div className="flex flex-col gap-5">
      <Panel
        className={`p-6 text-center ${
          goodWon ? "border-[#9fb4e6]/60" : "border-[#c8423a]/60"
        }`}
      >
        <p className="font-display text-5xl">{goodWon ? "✦" : "☾"}</p>
        <h2 className="font-display mt-2 text-4xl font-bold tracking-wide text-[#f6f8ff]">
          {goodWon ? "Good prevails" : "Evil triumphs"}
        </h2>
        {game.winReason && (
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-[#8f9cc0]">
            {game.winReason}
          </p>
        )}
        {assassin && game.assassinGuess && (
          <p className="mt-3 text-sm text-[#8f9cc0]">
            The Assassin named{" "}
            <strong className="text-[#e6ebf9]">
              {game.players.find((p) => p.id === game.assassinGuess)?.name}
            </strong>
            .
          </p>
        )}
      </Panel>

      <Panel className="p-5">
        <SectionTitle className="mb-3">The truth, revealed</SectionTitle>
        <PlayerGrid players={game.players} showRoles />
        <ul className="mt-4 flex flex-col gap-2">
          {game.players.map((p) => (
            <li key={p.id} className="flex items-center gap-3 text-sm">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: p.color }} />
              <span className="flex-1 font-semibold text-[#e6ebf9]">{p.name}</span>
              <span
                className={`font-bold ${
                  p.role && isEvilRole(p.role) ? "text-[#ff9d94]" : "text-[#8fbaff]"
                }`}
              >
                {p.role === "merlin"
                  ? "Merlin ✦"
                  : p.role === "percival"
                    ? "Percival ⚔"
                    : p.role === "servant"
                      ? "Loyal Servant ♞"
                      : p.role === "assassin"
                        ? "Assassin 🗡"
                        : p.role === "morgana"
                          ? "Morgana ☾"
                          : "Minion ◈"}
              </span>
            </li>
          ))}
        </ul>
      </Panel>

      <div className="flex flex-col gap-2.5 sm:flex-row">
        <GoldButton
          className="flex-1"
          onClick={() => onUpdate(startGame(playAgain(game)))}
        >
          Play again — same knights
        </GoldButton>
        <GhostButton className="flex-1 py-3" onClick={onNewTable}>
          New table
        </GhostButton>
      </div>
    </div>
  );
}
