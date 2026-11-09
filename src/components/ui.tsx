"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

// ── Buttons ──────────────────────────────────────────────────────────────────

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
      className={`inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-b from-[#e8c766] to-[#b8932a] px-6 py-3 font-display text-sm font-bold tracking-[0.18em] text-[#171204] uppercase shadow-[0_6px_24px_rgba(201,162,39,0.35)] transition-all hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none ${className}`}
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
    default: "border-[#3a332a] text-[#e9dfc8] hover:border-[#c9a227] hover:text-[#e8c766]",
    danger: "border-[#5c2320] text-[#e56b6f] hover:border-[#b3261e] hover:text-[#ff8a80]",
    good: "border-[#2f4a35] text-[#8fce9b] hover:border-[#4f7a5a] hover:text-[#a5d6a7]",
  } as const;
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 rounded-full border bg-transparent px-5 py-2.5 text-sm font-semibold transition-all active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 ${tones[tone]} ${className}`}
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
      className={`rounded-2xl border border-[#2c2618] bg-[#171410]/90 shadow-[0_10px_40px_rgba(0,0,0,0.5)] backdrop-blur ${className}`}
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
      className={`font-display text-lg font-bold tracking-[0.22em] text-[#e8c766] uppercase ${className}`}
    >
      {children}
    </h2>
  );
}

export function Divider({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-3 ${className}`} aria-hidden>
      <span className="h-px flex-1 bg-gradient-to-r from-transparent via-[#c9a227]/50 to-transparent" />
      <span className="text-[10px] text-[#c9a227]">✦</span>
      <span className="h-px flex-1 bg-gradient-to-r from-transparent via-[#c9a227]/50 to-transparent" />
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
        background: `radial-gradient(circle at 35% 30%, ${color}cc, ${color}55 70%, #1a1712)`,
        color: "#f5efe0",
        border: `2px solid ${ring ?? color}`,
        boxShadow: `0 0 0 2px #0b0a08, 0 0 14px ${color}44`,
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
          className="flex w-full flex-col items-center gap-4 rounded-2xl border border-[#2c2618] bg-[#171410]/90 px-6 py-10 text-center transition-colors hover:border-[#c9a227]/60"
        >
          <Avatar name={playerName} color={playerColor} size={64} />
          <span className="font-display text-xl font-bold tracking-[0.14em] text-[#e9dfc8] uppercase">
            Pass to {playerName}
          </span>
          <span className="max-w-sm text-sm leading-relaxed text-[#a99e83]">{prompt}</span>
          <span className="rounded-full border border-[#c9a227]/50 px-4 py-1.5 text-xs font-semibold tracking-[0.18em] text-[#e8c766] uppercase">
            I am {playerName} — reveal
          </span>
          <span className="text-xs text-[#6f6650]">
            Everyone else, look away.
          </span>
        </button>
      ) : (
        <div className="relative">
          <button
            onClick={() => setOpen(false)}
            className="absolute top-3 right-3 z-10 rounded-full border border-[#3a332a] px-3 py-1 text-xs font-semibold text-[#a99e83] hover:border-[#c9a227] hover:text-[#e8c766]"
          >
            Hide
          </button>
          <div className="rounded-2xl border border-[#c9a227]/40 bg-[#171410]/90 p-5 shadow-[0_10px_40px_rgba(0,0,0,0.5)] sm:p-6">
            <div className="mb-4 flex items-center gap-3">
              <Avatar name={playerName} color={playerColor} size={40} />
              <div>
                <p className="font-display text-base font-bold tracking-wide text-[#e9dfc8]">
                  {playerName}
                </p>
                <p className="text-xs text-[#a99e83]">Only you should see this.</p>
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

  const start = () => {
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
        className={`relative overflow-hidden rounded-2xl border transition-all duration-200 ${
          holding ? "border-[#c9a227]" : "border-[#2c2618]"
        }`}
      >
        {/* The secret is only ever in the DOM while it is being held.
            Nothing is opacity-hidden: when released the content unmounts,
            so it cannot be read from the DOM, a screen reader, or DevTools. */}
        {holding ? (
          <div>{children}</div>
        ) : (
          <div className="flex flex-col items-center gap-3 px-6 py-12 text-center">
            <span className="font-display text-5xl text-[#c9a227]">✦</span>
            <p className="font-display text-sm font-bold tracking-[0.24em] text-[#a99e83] uppercase">
              Sealed by the realm
            </p>
          </div>
        )}
      </div>
      <button
        onPointerDown={start}
        onPointerUp={stop}
        onPointerLeave={stop}
        onPointerCancel={stop}
        onKeyDown={(e) => {
          // Keyboard users hold Enter or Space the same way pointer users
          // hold the button. Ignore auto-repeat so the timer starts once.
          if ((e.key === "Enter" || e.key === " ") && !e.repeat) {
            e.preventDefault();
            start();
          }
        }}
        onKeyUp={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            stop();
          }
        }}
        onBlur={stop}
        onContextMenu={(e) => e.preventDefault()}
        aria-pressed={holding}
        aria-label={holding ? "Release to hide your role" : label}
        className="mt-4 w-full touch-none rounded-full border border-[#c9a227]/60 bg-[#c9a227]/10 py-3.5 text-sm font-bold tracking-[0.16em] text-[#e8c766] uppercase transition-colors outline-none hover:bg-[#c9a227]/20 focus-visible:ring-2 focus-visible:ring-[#e8c766] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b0a08] active:bg-[#c9a227]/25"
      >
        {holding ? "Keep holding…" : label}
      </button>
      <div className="mx-auto mt-3 h-1 w-40 overflow-hidden rounded-full bg-[#2c2618]">
        <div
          className="h-full bg-[#c9a227] transition-[width] duration-75"
          style={{ width: `${holding ? 100 : progress * 100}%` }}
        />
      </div>
    </div>
  );
}
