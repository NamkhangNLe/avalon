# Avalon — The Resistance

A game of hidden loyalty and quiet betrayal, as a web app. Five quests stand
between Camelot and the dark — and not everyone at the table is who they claim
to be.

**v1 is pass-and-play:** one shared device moves around the table. Create a
game, get a room code, add 5–10 players, and the app deals secret roles,
runs proposals, votes, and quests, and ends with the Assassin's final gambit.
Secrets stay secret behind hold-to-reveal cards and per-player pass screens.

## Play

```bash
npm install
npm run dev        # http://localhost:3000
```

Open the link on a phone, tap **Create a new table**, add your knights, and
pass the device around. The room code in the URL (`?room=KQMT`) resumes the
saved game on the same device.

## How a game flows

1. **Lobby** — add 5–10 players, optionally enable Percival & Morgana (7+
   players). Share the room code / invite link.
2. **Reveal** — each player holds to reveal their secret role (Merlin sees
   the evil; Percival sees two possible Merlins; evil knows each other;
   servants know no one).
3. **Propose** — the leader picks a quest team of the required size.
4. **Vote** — everyone approves or rejects in turn. Five rejections in a row
   and Evil wins on the spot.
5. **Quest** — team members secretly play success or fail. Only the fail
   count is revealed, never who played it. On quest 4 with 7+ players, two
   fails are needed to sink it.
6. **Assassin** — if Good wins three quests, the Assassin names who they
   believe is Merlin. Name him, and Evil steals the realm.
7. **First to three quests wins.**

## Roles by table size

| Players | Good | Evil |
| ------- | ---- | ---- |
| 5 | Merlin + 2 Servants | Assassin + 1 Minion |
| 6 | Merlin + 3 Servants | Assassin + 1 Minion |
| 7 | Merlin + 3 Servants | Assassin + 2 Minions |
| 8 | Merlin + 4 Servants | Assassin + 2 Minions |
| 9 | Merlin + 5 Servants | Assassin + 2 Minions |
| 10 | Merlin + 5 Servants | Assassin + 3 Minions |

With Percival & Morgana enabled (7+), Percival replaces a Servant and Morgana
replaces a Minion.

## Architecture

The game logic is deliberately backend-agnostic:

- `src/lib/avalon.ts` — pure game engine. Every transition
  (`proposeTeam`, `castProposalVote`, `castQuestVote`, `castAssassinGuess`,
  …) is a pure function over plain `GameState` objects. No React, no
  browser APIs.
- `src/lib/store.ts` — the `GameStore` interface. v1 ships
  `LocalStorageGameStore` (state lives in localStorage under the room code).
  A realtime store (Supabase / WebSocket / PartyKit) implements the same
  three methods and the UI + logic never change.
- `src/components/` — `Lobby`, `RoleReveal`, `GameBoard` (propose / vote /
  quest / assassin / game-over), plus `QuestTrack`, `PlayerGrid`, and shared
  primitives (`ui.tsx`: hold-to-reveal, pass-and-play lock screens).
- `src/app/page.tsx` — orchestrates phases and persistence.

## Verify

```bash
node scripts/selftest.mts   # game-engine logic: role tables, full-game sims
npm run build              # production build (type-check + lint)
```

## Roadmap

- Realtime multiplayer: one host device, every player on their own phone
  (implement `GameStore` on Supabase Realtime; no logic changes needed).
- Mordred & Oberon as optional roles; custom role sets.
- Game history / stats across tables.
