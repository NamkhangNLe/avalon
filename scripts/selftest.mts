// Self-test for the Avalon game engine (lib/avalon.ts).
// Run: node scripts/selftest.ts   (Node 24 strips types natively)
// Exits non-zero on the first failed assertion.
import {
  addPlayer,
  assassinPlayer,
  castAssassinGuess,
  castProposalVote,
  castQuestVote,
  continueAfterQuestResult,
  continueAfterVoteResult,
  failsNeeded,
  markRevealed,
  newLobby,
  proposeTeam,
  requiredTeamSize,
  rolesForPlayerCount,
  startGame,
  whatPlayerSees,
  type GameState,
  type Player,
} from "../src/lib/avalon.ts";

let checks = 0;
function assert(cond: boolean, label: string): void {
  checks++;
  if (!cond) {
    console.error(`FAIL (${checks}): ${label}`);
    process.exit(1);
  }
  console.log(`ok ${checks} - ${label}`);
}

function makeGame(n: number, special: boolean): GameState {
  let g = newLobby("TEST");
  for (let i = 0; i < n; i++) g = addPlayer(g, `P${i + 1}`);
  g = { ...g, options: { percival: special, morgana: special } };
  return startGame(g);
}

function revealAll(g: GameState): GameState {
  for (const p of g.players) g = markRevealed(g, p.id);
  return g;
}

function goodPlayers(g: GameState): Player[] {
  return g.players.filter(
    (p) => p.role === "merlin" || p.role === "percival" || p.role === "servant",
  );
}
function evilPlayers(g: GameState): Player[] {
  return g.players.filter(
    (p) => p.role === "assassin" || p.role === "morgana" || p.role === "minion",
  );
}

/** Drive one full quest: propose `team`, everyone approves, quest votes per `failIds`. */
function runQuest(g: GameState, team: string[], failIds: string[]): GameState {
  const size = requiredTeamSize(g.players.length, g.round);
  assert(team.length === size, `team size ${team.length} == required ${size}`);
  g = proposeTeam(g, team);
  assert(g.phase === "vote", "phase vote after propose");
  for (const p of g.players) g = castProposalVote(g, p.id, true);
  assert(g.phase === "vote-result", "phase vote-result after all votes");
  g = continueAfterVoteResult(g);
  assert(g.phase === "quest", "phase quest after approval");
  for (const id of team) g = castQuestVote(g, id, !failIds.includes(id));
  assert(g.phase === "quest-result", "phase quest-result after all quest votes");
  g = continueAfterQuestResult(g);
  return g;
}

// ── 1. Role tables ───────────────────────────────────────────────────────────
for (const n of [5, 6, 7, 8, 9, 10]) {
  for (const special of [false, true]) {
    const roles = rolesForPlayerCount(n, { percival: special, morgana: special });
    assert(roles.length === n, `${n}p special=${special}: ${roles.length} roles`);
    assert(roles.includes("merlin") && roles.includes("assassin"), `${n}p has Merlin + Assassin`);
    const good = roles.filter((r) => ["merlin", "percival", "servant"].includes(r)).length;
    const evil = n - good;
    const expectedEvil = n <= 6 ? 2 : n <= 9 ? 3 : 4;
    assert(evil === expectedEvil, `${n}p: evil=${evil} (expected ${expectedEvil})`);
    if (special && n >= 7) {
      assert(roles.includes("percival") && roles.includes("morgana"), `${n}p special roles present`);
    }
    if (!special || n < 7) {
      assert(!roles.includes("percival") && !roles.includes("morgana"), `${n}p no special roles`);
    }
  }
}

// ── 2. Quest sizes + two-fail rule ───────────────────────────────────────────
assert(JSON.stringify([5, 6, 7, 8, 9, 10].map((n) => requiredTeamSize(n, 0))) === "[2,2,2,3,3,3]", "quest 1 sizes");
assert(requiredTeamSize(5, 4) === 3 && requiredTeamSize(10, 4) === 5, "quest 5 sizes");
assert(failsNeeded(7, 3) === 2, "7p quest 4 needs 2 fails");
assert(failsNeeded(10, 3) === 2, "10p quest 4 needs 2 fails");
assert(failsNeeded(6, 3) === 1, "6p quest 4 needs 1 fail");
assert(failsNeeded(7, 0) === 1, "7p quest 1 needs 1 fail");

// ── 3. What each role sees ──────────────────────────────────────────────────
{
  const g = revealAll(makeGame(7, true));
  const merlin = g.players.find((p) => p.role === "merlin")!;
  const percival = g.players.find((p) => p.role === "percival")!;
  const servant = g.players.find((p) => p.role === "servant")!;
  const minion = g.players.find((p) => p.role === "minion")!;
  assert(whatPlayerSees(g, merlin.id).length === 3, "Merlin sees 3 evil");
  assert(whatPlayerSees(g, merlin.id).every((s) => s.label === "Evil"), "Merlin sees 'Evil' labels only");
  const pSeen = whatPlayerSees(g, percival.id);
  assert(pSeen.length === 2 && pSeen.every((s) => s.label === "Merlin?"), "Percival sees 2 'Merlin?'");
  assert(whatPlayerSees(g, servant.id).length === 0, "Servant sees no one");
  assert(whatPlayerSees(g, minion.id).length === 2, "Minion sees 2 fellow evil");
}

// ── 4. Full game: Good wins 3 quests, Assassin guesses wrong ───────────────
{
  let g = revealAll(makeGame(7, false));
  assert(g.phase === "propose", "phase propose after reveal");
  for (let q = 0; q < 3; q++) {
    const size = requiredTeamSize(7, g.round);
    const team = goodPlayers(g).slice(0, size).map((p) => p.id);
    g = runQuest(g, team, []);
    assert(g.questResults[q]?.success === true, `quest ${q + 1} succeeded`);
  }
  assert(g.phase === "assassin", "phase assassin after 3 good quests");
  const assassin = assassinPlayer(g)!;
  const wrongGuess = g.players.find((p) => p.role === "servant")!;
  assert(assassin.role === "assassin", "assassin found");
  g = castAssassinGuess(g, wrongGuess.id);
  assert(g.phase === "over" && g.winner === "good", "wrong assassin guess -> Good wins");
}

// ── 5. Full game: Assassin guesses Merlin correctly ─────────────────────────
{
  let g = revealAll(makeGame(6, false));
  for (let q = 0; q < 3; q++) {
    const size = requiredTeamSize(6, g.round);
    const team = goodPlayers(g).slice(0, size).map((p) => p.id);
    g = runQuest(g, team, []);
  }
  assert(g.phase === "assassin", "phase assassin (6p)");
  const merlin = g.players.find((p) => p.role === "merlin")!;
  g = castAssassinGuess(g, merlin.id);
  assert(g.phase === "over" && g.winner === "evil", "correct assassin guess -> Evil wins");
}

// ── 6. Evil wins by failing 3 quests ────────────────────────────────────────
{
  let g = revealAll(makeGame(7, false));
  const saboteur = evilPlayers(g)[0];
  for (let q = 0; q < 3; q++) {
    const size = requiredTeamSize(7, g.round);
    const goodTeam = goodPlayers(g).slice(0, size - 1).map((p) => p.id);
    g = runQuest(g, [...goodTeam, saboteur.id], [saboteur.id]);
    assert(g.questResults[q]?.success === false, `quest ${q + 1} failed`);
  }
  assert(g.phase === "over" && g.winner === "evil", "3 failed quests -> Evil wins");
}

// ── 7. Five rejections in a row → Evil wins ─────────────────────────────────
{
  let g = revealAll(makeGame(5, false));
  for (let r = 0; r < 5; r++) {
    const size = requiredTeamSize(5, g.round);
    const team = g.players.slice(0, size).map((p) => p.id);
    g = proposeTeam(g, team);
    for (const p of g.players) g = castProposalVote(g, p.id, false);
    assert(g.phase === "vote-result", `rejection ${r + 1}: vote-result`);
    g = continueAfterVoteResult(g);
  }
  assert(g.phase === "over" && g.winner === "evil", "5 rejections -> Evil wins");
  assert(g.voteTrack === 5, "voteTrack is 5");
}

// ── 8. Good cannot fail a quest (forced success) ────────────────────────────
{
  let g = revealAll(makeGame(5, false));
  const size = requiredTeamSize(5, g.round);
  const team = goodPlayers(g).slice(0, size).map((p) => p.id);
  g = proposeTeam(g, team);
  for (const p of g.players) g = castProposalVote(g, p.id, true);
  g = continueAfterVoteResult(g);
  // A good knight "tries" to fail — loyalty compels success.
  for (const id of team) g = castQuestVote(g, id, false);
  assert(g.lastQuest?.fails === 0 && g.lastQuest?.success === true, "good fail vote forced to success");
}

// ── 9. Proposal validation ──────────────────────────────────────────────────
{
  let g = revealAll(makeGame(5, false));
  const before = g;
  g = proposeTeam(g, [g.players[0].id]); // wrong size
  assert(g === before, "wrong-size proposal rejected");
  g = proposeTeam(g, [g.players[0].id, g.players[0].id]); // duplicate
  assert(g === before, "duplicate proposal rejected");
}

console.log(`\nAll ${checks} checks passed.`);
