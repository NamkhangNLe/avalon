"use client";

import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";

// ── Buttons ──────────────────────────────────────────────────────────────────

// Historical export name retained for call sites; this theme renders red wax.
export function GoldButton({
  children,
  onClick,
  disabled,
  className = "",
}: {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 rounded-md border border-[#f0766a]/40 bg-gradient-to-b from-[#d4503f] to-[#8f2420] px-6 py-3 font-display text-base font-bold tracking-[0.16em] text-[#fff1e6] uppercase shadow-[0_6px_24px_rgba(200,66,58,0.35)] transition-all hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none ${className}`}
    >
      {children}
    </button>
  );
}

export function GhostButton({
  children,
  onClick,
  disabled,
  className = "",
  tone = "default",
}: {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  tone?: "default" | "danger" | "good";
}) {
  const tones = {
    default: "border-[#34416a] text-[#e6ebf9] hover:border-[#9fb4e6] hover:text-[#dbe4ff]",
    danger: "border-[#6b2a2c] text-[#e56b6f] hover:border-[#c8423a] hover:text-[#ff9d94]",
    good: "border-[#2f4f8a] text-[#8fbaff] hover:border-[#3f6fc4] hover:text-[#b5d0ff]",
  } as const;
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 rounded-md border bg-transparent px-5 py-2.5 text-sm font-semibold transition-all active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 ${tones[tone]} ${className}`}
    >
      {children}
    </button>
  );
}

// ── Panels & type ────────────────────────────────────────────────────────────

export function Panel({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-lg border border-[#242f4d] bg-[#111829]/90 shadow-[0_10px_40px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(159,180,230,0.08)] backdrop-blur ${className}`}
    >
      {children}
    </div>
  );
}

export function SectionTitle({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <h2
      className={`font-display text-xl font-bold tracking-[0.18em] text-[#dbe4ff] uppercase ${className}`}
    >
      {children}
    </h2>
  );
}

export function Divider({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-3 ${className}`} aria-hidden>
      <span className="h-px flex-1 bg-gradient-to-r from-transparent via-[#9fb4e6]/50 to-transparent" />
      <span className="text-[10px] text-[#9fb4e6]">✦</span>
      <span className="h-px flex-1 bg-gradient-to-r from-transparent via-[#9fb4e6]/50 to-transparent" />
    </div>
  );
}

// ── Avatar ───────────────────────────────────────────────────────────────────

export function Avatar({
  name,
  color,
  size = 44,
  ring,
}: {
  name: string;
  color: string;
  size?: number;
  ring?: string;
}) {
  const initials = name
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-full font-display font-bold select-none"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.38,
        background: `radial-gradient(circle at 35% 30%, ${color}cc, ${color}55 70%, #0d1222)`,
        color: "#f6f8ff",
        border: `2px solid ${ring ?? color}`,
        boxShadow: `0 0 0 2px #090d18, 0 0 14px ${color}44`,
      }}
    >
      {initials}
    </div>
  );
}

// ── Pass-and-play interstitial ───────────────────────────────────────────────
// The device is shared. Before any secret action, the screen locks behind the
// acting player's name — tap to unlock, act, and the screen locks again.
// Keyed by player id from the parent so it resets to locked on every turn.

export function SecretTurn({
  playerName,
  playerColor,
  prompt,
  children,
}: {
  playerName: string;
  playerColor: string;
  prompt: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="animate-fade-up">
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="flex w-full flex-col items-center gap-4 rounded-lg border border-[#242f4d] bg-[#111829]/90 px-6 py-10 text-center transition-colors hover:border-[#9fb4e6]/60"
        >
          <Avatar name={playerName} color={playerColor} size={64} />
          <span className="font-display text-xl font-bold tracking-[0.14em] text-[#e6ebf9] uppercase">
            Pass to {playerName}
          </span>
          <span className="max-w-sm text-sm leading-relaxed text-[#8f9cc0]">{prompt}</span>
          <span className="rounded-full border border-[#9fb4e6]/50 px-4 py-1.5 text-xs font-semibold tracking-[0.18em] text-[#dbe4ff] uppercase">
            I am {playerName} — reveal
          </span>
          <span className="text-xs text-[#5f6c91]">
            Everyone else, look away.
          </span>
        </button>
      ) : (
        <div className="relative">
          <button
            onClick={() => setOpen(false)}
            className="absolute top-3 right-3 z-10 rounded-md border border-[#34416a] px-3 py-1 text-xs font-semibold text-[#8f9cc0] hover:border-[#9fb4e6] hover:text-[#dbe4ff]"
          >
            Hide
          </button>
          <div className="rounded-lg border border-[#9fb4e6]/40 bg-[#111829]/90 p-5 shadow-[0_10px_40px_rgba(0,0,0,0.5)] sm:p-6">
            <div className="mb-4 flex items-center gap-3">
              <Avatar name={playerName} color={playerColor} size={40} />
              <div>
                <p className="font-display text-base font-bold tracking-wide text-[#e6ebf9]">
                  {playerName}
                </p>
                <p className="text-xs text-[#8f9cc0]">Only you should see this.</p>
              </div>
            </div>
            {children}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Hold to reveal ───────────────────────────────────────────────────────────
// Press and hold to see a secret. Release and it hides again — the classic
// anti-shoulder-surf pattern for pass-and-play.

export function HoldToReveal({
  children,
  label = "Press and hold to reveal",
}: {
  children: ReactNode;
  label?: string;
}) {
  const [holding, setHolding] = useState(false);
  const [progress, setProgress] = useState(0);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef(0);

  useEffect(() => {
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const start = (e?: ReactPointerEvent<HTMLButtonElement>) => {
    // Keep receiving pointer events even if the finger or cursor drifts.
    try {
      e?.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      /* not supported */
    }
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    startRef.current = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - startRef.current) / 450);
      setProgress(p);
      if (p >= 1) {
        setHolding(true);
        return;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  };

  const stop = () => {
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    setHolding(false);
    setProgress(0);
  };

  return (
    <div className="select-none">
      <div
        className={`grid overflow-hidden rounded-lg border transition-all duration-200 ${
          holding ? "border-[#9fb4e6]" : "border-[#242f4d]"
        }`}
      >
        {/* hidden state — a sealed card back */}
        <div
          style={{ gridArea: "1 / 1" }}
          className={`flex flex-col items-center justify-center gap-3 px-6 py-12 text-center transition-opacity duration-200 ${
            holding ? "pointer-events-none opacity-0" : "opacity-100"
          }`}
        >
          <span className="font-display text-5xl text-[#9fb4e6]">✦</span>
          <p className="font-display text-sm font-bold tracking-[0.24em] text-[#8f9cc0] uppercase">
            Sealed by the realm
          </p>
        </div>
        {/* revealed content */}
        <div
          style={{ gridArea: "1 / 1" }}
          aria-hidden={!holding}
          className={holding ? "opacity-100" : "pointer-events-none invisible opacity-0"}
        >
          {children}
        </div>
      </div>
      <button
        onPointerDown={start}
        onPointerUp={stop}
        onPointerLeave={stop}
        onPointerCancel={stop}
        // Keyboard equivalent: hold Space or Enter. Releasing the key, or moving
        // focus away, hides the secret again, same as lifting a finger.
        onKeyDown={(e) => {
          if ((e.key === " " || e.key === "Enter") && !e.repeat) {
            e.preventDefault();
            start();
          }
        }}
        onKeyUp={(e) => {
          if (e.key === " " || e.key === "Enter") {
            e.preventDefault();
            stop();
          }
        }}
        onBlur={stop}
        aria-pressed={holding}
        aria-describedby="hold-hint"
        onContextMenu={(e) => e.preventDefault()}
        className="mt-4 w-full touch-none rounded-md border border-[#9fb4e6]/60 bg-[#9fb4e6]/10 py-3.5 text-sm font-bold tracking-[0.16em] text-[#dbe4ff] uppercase transition-colors active:bg-[#9fb4e6]/25"
      >
        {holding ? "Keep holding…" : label}
      </button>
      <p id="hold-hint" className="sr-only">
        Hold Space or Enter to reveal. Releasing the key hides it again. The secret is only available to assistive technology while held.
      </p>
      <div className="mx-auto mt-3 h-1 w-40 overflow-hidden rounded-full bg-[#242f4d]">
        <div
          className="h-full bg-[#9fb4e6] transition-[width] duration-75"
          style={{ width: `${holding ? 100 : progress * 100}%` }}
        />
      </div>
    </div>
  );
}
