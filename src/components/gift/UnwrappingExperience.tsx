"use client";

import { useRef, useState, useEffect, type ReactNode } from "react";
import { motion, AnimatePresence, useAnimation, type PanInfo } from "framer-motion";
import Image from "next/image";
import { MAD_LOGO_URL } from "@/lib/brand";
import { markGiftCardAsOpened } from "@/app/gift/[token]/actions";

/* ─── Stage machine ───────────────────────────────────────────────────── */
// idle → unwrapping → opening → revealed
// "revealed" shows the REAL VirtualGiftCard (children) — no placeholder.
type Stage = "idle" | "unwrapping" | "opening" | "revealed";

/* ─── Gold particles ──────────────────────────────────────────────────── */
const PARTICLES = Array.from({ length: 28 }, (_, i) => {
  const angle = (i / 28) * 360;
  const r = 68 + (i % 6) * 18;
  return {
    id: i,
    x: Math.cos((angle * Math.PI) / 180) * r,
    y: Math.sin((angle * Math.PI) / 180) * r - 22,
    size: 3 + (i % 5),
    delay: (i % 9) * 0.024,
    color: ["#f6c453", "#fde9a8", "#c3a06a", "#e8d48a", "#a4794b", "#fdf0c0"][i % 6],
  };
});

/* ─── Woven-textile ribbon ────────────────────────────────────────────── */
const WOVEN_V = "repeating-linear-gradient(0deg,   #55320a 0px, #b88c28 3px, #e8cc58 6px, #b88c28 9px, #55320a 12px)";
const WOVEN_H = "repeating-linear-gradient(90deg,  #55320a 0px, #b88c28 3px, #e8cc58 6px, #b88c28 9px, #55320a 12px)";

/* ─── Easing ──────────────────────────────────────────────────────────── */
const LIFT: [number, number, number, number] = [0.16, 1, 0.28, 1];

/* ─────────────────────────────────────────────────────────────────────── */

export function UnwrappingExperience({
  secretToken,
  children,
}: {
  secretToken: string;
  children: ReactNode;
}) {
  const [stage, setStage]  = useState<Stage>("idle");
  const bowDir             = useRef({ x: 0, y: -1 });
  const cardControls       = useAnimation();

  function handleDragEnd(_: unknown, info: PanInfo) {
    if (stage !== "idle") return;
    const dist = Math.sqrt(info.offset.x ** 2 + info.offset.y ** 2);
    if (dist < 44) return;

    const dx  = info.velocity.x || info.offset.x;
    const dy  = info.velocity.y || info.offset.y;
    const len = Math.sqrt(dx ** 2 + dy ** 2) || 1;
    bowDir.current = { x: dx / len, y: dy / len };

    markGiftCardAsOpened(secretToken).catch(console.error);
    setStage("unwrapping");
    setTimeout(() => setStage("opening"),  1200);
    // "revealed" starts after the lid has fully risen (1200 + 1850 = 3050ms)
    // +200ms buffer so the open box interior is visible for a moment.
    setTimeout(() => setStage("revealed"), 3250);
  }

  // Card entrance: faint appear → vibrate left/right → rise to final position.
  useEffect(() => {
    if (stage !== "revealed") return;
    let cancelled = false;

    // Small delay: AnimatePresence mode="wait" exits the box first (0.4s)
    // then mounts the card — we wait for mount before starting the sequence.
    const t = setTimeout(async () => {
      if (cancelled) return;
      await cardControls.start({
        x: [0, -6, 6, -3.5, 3.5, -1.5, 1.5, 0],
        opacity: 0.65,
        transition: { duration: 0.58, ease: "easeInOut" },
      });
      if (cancelled) return;
      await cardControls.start({
        x: 0, y: 0, opacity: 1, scale: 1,
        transition: { duration: 1.55, ease: [0.22, 1, 0.36, 1] },
      });
    }, 420);

    return () => { cancelled = true; clearTimeout(t); };
  }, [stage, cardControls]);

  const isUnwrapping = stage !== "idle";
  const isOpen       = stage === "opening" || stage === "revealed";

  return (
    <div className="flex flex-col items-center gap-6 py-4 select-none">

      <AnimatePresence mode="wait">

        {/* ─── BOX (visible until revealed) ─────────────────────────── */}
        {stage !== "revealed" && (
          <motion.div
            key="box"
            className="relative w-full"
            exit={{ opacity: 0, y: -14, transition: { duration: 0.4, ease: "easeIn" } }}
            animate={stage === "idle" ? { y: [0, -8, 0] } : { y: 0 }}
            transition={{ duration: 4.8, repeat: Infinity, ease: "easeInOut", repeatType: "mirror" }}
          >
            {/* Drop shadow */}
            <motion.div
              className="absolute -bottom-3 left-1/2 -translate-x-1/2 rounded-full pointer-events-none"
              style={{ width: "68%", height: 22, background: "rgba(0,0,0,0.18)", filter: "blur(18px)" }}
              animate={isOpen ? { scaleX: 0.4, opacity: 0.28 } : { scaleX: 1, opacity: 1 }}
              transition={{ duration: 1.4 }}
            />

            {/* Box base — interior */}
            <div
              className="w-full rounded-2xl relative overflow-hidden"
              style={{
                aspectRatio: "3/2",
                background: "linear-gradient(158deg, #fdf8f1 0%, #efe3ce 100%)",
                border: "1px solid rgba(165,138,100,0.28)",
              }}
            >
              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    key="interior"
                    className="absolute inset-0 rounded-2xl"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1.0, delay: 0.5 }}
                  >
                    <div className="absolute inset-0 rounded-2xl" style={{ background: "linear-gradient(158deg, #fffcf4 0%, #f5e8d2 100%)" }} />
                    <div className="absolute inset-4 rounded-xl" style={{ background: "linear-gradient(135deg, #ece0cb 0%, #dfd0b5 100%)", boxShadow: "inset 0 3px 16px rgba(0,0,0,0.14)" }} />
                    <motion.div
                      className="absolute inset-0 rounded-2xl pointer-events-none"
                      style={{ background: "radial-gradient(ellipse 65% 55% at 50% 20%, rgba(246,196,83,0.5) 0%, transparent 70%)" }}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: [0, 1, 0.55] }}
                      transition={{ duration: 1.6, times: [0, 0.25, 1] }}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Box lid — rises straight up */}
            <motion.div
              className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none"
              animate={isOpen ? { y: "-118%", opacity: 0 } : { y: "0%", opacity: 1 }}
              transition={{ duration: 1.85, ease: LIFT, delay: 0.05 }}
            >
              {/* Surface */}
              <div className="absolute inset-0 rounded-2xl" style={{
                background: "linear-gradient(155deg, #ffffff 0%, #f8f3ec 52%, #ede7dc 100%)",
                boxShadow: "0 6px 36px rgba(0,0,0,0.13), inset 0 1px 0 rgba(255,255,255,0.96)",
                border: "1px solid rgba(215,196,168,0.55)",
              }} />
              {/* Paper noise */}
              <div className="absolute inset-0 rounded-2xl opacity-[0.04]" style={{
                backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='3' height='3'%3E%3Ccircle cx='1' cy='1' r='0.75' fill='%23000'/%3E%3C/svg%3E\")",
              }} />
              {/* Satin sheen */}
              <div className="absolute inset-0 rounded-2xl" style={{
                background: "linear-gradient(118deg, transparent 24%, rgba(255,255,255,0.62) 43%, transparent 62%)",
              }} />

              {/* MAD Logo — large */}
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 pointer-events-none" style={{ zIndex: 10 }}>
                <Image
                  src={MAD_LOGO_URL} alt="MAD" width={160} height={160}
                  className="w-28 h-28 sm:w-32 sm:h-32"
                  style={{ opacity: 0.82, filter: "sepia(0.08) saturate(0.92)" }}
                />
                <p className="font-sans font-semibold uppercase tracking-[0.44em]" style={{ color: "#b8903a", fontSize: "0.53rem" }}>
                  #madforhair
                </p>
              </div>

              {/* Vertical ribbon */}
              <motion.div
                className="absolute inset-y-0 left-1/2 -translate-x-1/2 pointer-events-none"
                style={{ width: "11.5%", background: WOVEN_V, boxShadow: "2px 0 10px rgba(0,0,0,0.24), -1px 0 5px rgba(0,0,0,0.14)", zIndex: 20 }}
                animate={isUnwrapping ? { scaleY: 0, opacity: 0 } : { scaleY: 1, opacity: 1 }}
                transition={{ duration: 0.95, delay: 0.42, ease: [0.22, 1, 0.36, 1] }}
              />
              {/* Horizontal ribbon */}
              <motion.div
                className="absolute inset-x-0 top-1/2 -translate-y-1/2 pointer-events-none"
                style={{ height: "16.5%", background: WOVEN_H, boxShadow: "0 2px 10px rgba(0,0,0,0.24), 0 -1px 5px rgba(0,0,0,0.14)", zIndex: 20 }}
                animate={isUnwrapping ? { scaleX: 0, opacity: 0 } : { scaleX: 1, opacity: 1 }}
                transition={{ duration: 0.95, delay: 0.62, ease: [0.22, 1, 0.36, 1] }}
              />
            </motion.div>

            {/* Bow — draggable, sits above lid */}
            <motion.div
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
              style={{ zIndex: 40, touchAction: "none", cursor: stage === "idle" ? "grab" : "default" }}
              drag={stage === "idle"}
              dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
              dragElastic={0.88}
              dragMomentum={false}
              onDragEnd={handleDragEnd}
              whileTap={stage === "idle" ? { scale: 0.93 } : {}}
              animate={
                isUnwrapping
                  ? { x: bowDir.current.x * 320, y: bowDir.current.y * 320, scale: 0, rotate: 210, opacity: 0 }
                  : { x: 0, y: 0, scale: 1, rotate: 0, opacity: 1 }
              }
              transition={isUnwrapping ? { duration: 0.72, ease: [0.36, 0, 0.66, -0.28] } : undefined}
            >
              <GoldBow />
            </motion.div>

            {/* Particles */}
            <AnimatePresence>
              {isOpen && PARTICLES.map((p) => (
                <motion.div
                  key={p.id}
                  className="absolute rounded-full pointer-events-none"
                  style={{ width: p.size, height: p.size, background: p.color, left: "50%", top: "44%", marginLeft: -(p.size / 2), marginTop: -(p.size / 2), zIndex: 50 }}
                  initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                  animate={{ x: p.x, y: p.y, opacity: 0, scale: 0 }}
                  transition={{ duration: 1.5, delay: p.delay, ease: [0.22, 1, 0.36, 1] }}
                />
              ))}
            </AnimatePresence>

            {/* Bloom */}
            <AnimatePresence>
              {isOpen && (
                <motion.div
                  key="bloom"
                  className="absolute inset-0 rounded-2xl pointer-events-none"
                  style={{ background: "radial-gradient(ellipse 80% 72% at 50% 50%, rgba(246,196,83,0.34) 0%, transparent 72%)", zIndex: 45 }}
                  initial={{ opacity: 0, scale: 0.4 }}
                  animate={{ opacity: 1, scale: 1.35 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1.1, ease: "easeOut" }}
                />
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* ─── REAL GIFT CARD — appears directly, no placeholder ────── */}
        {stage === "revealed" && (
          <motion.div
            key="card"
            className="w-full"
            // Start faint and slightly below; vibrate then rise (via useEffect → cardControls)
            initial={{ opacity: 0.45, y: 28, scale: 0.93, x: 0 }}
            animate={cardControls}
          >
            {children}
          </motion.div>
        )}

      </AnimatePresence>

      {/* ─── Hint (replaces button) ────────────────────────────────── */}
      <AnimatePresence>
        {stage === "idle" && (
          <motion.div
            className="flex flex-col items-center gap-2 text-center"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.55, delay: 0.25 }}
          >
            <p className="font-display text-2xl font-semibold text-ink">Hai ricevuto un regalo</p>
            <p className="max-w-xs text-sm text-ink-soft">
              Qualcuno ha pensato a te con una Gift Card MAD Vigevano.
            </p>
            <motion.p
              className="mt-2 text-[0.7rem] font-medium tracking-[0.22em] uppercase"
              style={{ color: "#c3a06a" }}
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
            >
              Trascina il fiocco per aprire
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Gold bow SVG — metallico, glitter, semi-trasparente ─────────────── */
function GoldBow() {
  return (
    // opacity: 0.86 → leggermente semi-trasparente come il vero fiocco in tessuto metallico
    <svg
      width="160" height="112"
      viewBox="0 0 160 112"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ opacity: 0.87 }}
    >
      <defs>
        {/* Gradiente principale — contrasto alto per effetto metallico brillante */}
        <linearGradient id="gL" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%"   stopColor="#2c1a04" />
          <stop offset="14%"  stopColor="#a07820" />
          <stop offset="36%"  stopColor="#f8e870" />   {/* highlight quasi bianco-oro */}
          <stop offset="55%"  stopColor="#ffe090" />   {/* top speculare */}
          <stop offset="74%"  stopColor="#c09030" />
          <stop offset="100%" stopColor="#2c1a04" />
        </linearGradient>
        <linearGradient id="gR" x1="1" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#2c1a04" />
          <stop offset="14%"  stopColor="#a07820" />
          <stop offset="36%"  stopColor="#f8e870" />
          <stop offset="55%"  stopColor="#ffe090" />
          <stop offset="74%"  stopColor="#c09030" />
          <stop offset="100%" stopColor="#2c1a04" />
        </linearGradient>
        <linearGradient id="gK" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%"   stopColor="#ffe090" />
          <stop offset="45%"  stopColor="#c09030" />
          <stop offset="100%" stopColor="#2c1a04" />
        </linearGradient>
        {/* Highlight bianco per sparkle */}
        <radialGradient id="spark" cx="50%" cy="30%" r="50%">
          <stop offset="0%"  stopColor="#fffde0" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#fffde0" stopOpacity="0" />
        </radialGradient>
        <filter id="s" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="2" stdDeviation="3.5" floodColor="#120a00" floodOpacity="0.5" />
        </filter>
        <filter id="glow">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>

      {/* ── Loop sinistro ── */}
      <path
        d="M 76 62 C 62 42 32 12 10 24 C -2 31 1 52 20 58 C 38 64 68 65 76 62 Z"
        fill="url(#gL)" filter="url(#s)"
      />
      {/* Highlight interno loop sinistro */}
      <path
        d="M 76 62 C 64 44 38 18 20 28 C 13 33 16 48 30 53 C 46 59 70 63 76 62 Z"
        fill="rgba(255,248,160,0.28)"
      />
      {/* Speculare bianco loop sinistro */}
      <path
        d="M 60 38 C 50 28 35 18 22 24"
        stroke="rgba(255,252,220,0.55)" strokeWidth="5" strokeLinecap="round"
      />

      {/* ── Loop destro ── */}
      <path
        d="M 84 62 C 98 42 128 12 150 24 C 162 31 159 52 140 58 C 122 64 92 65 84 62 Z"
        fill="url(#gR)" filter="url(#s)"
      />
      {/* Highlight interno loop destro */}
      <path
        d="M 84 62 C 96 44 122 18 140 28 C 147 33 144 48 130 53 C 114 59 90 63 84 62 Z"
        fill="rgba(255,248,160,0.28)"
      />
      {/* Speculare bianco loop destro */}
      <path
        d="M 100 38 C 110 28 125 18 138 24"
        stroke="rgba(255,252,220,0.55)" strokeWidth="5" strokeLinecap="round"
      />

      {/* ── Code ── */}
      <path d="M 70 72 C 54 86 38 98 22 108" stroke="url(#gL)" strokeWidth="15" strokeLinecap="round" filter="url(#s)" />
      <path d="M 70 72 C 54 86 38 98 22 108" stroke="rgba(255,248,160,0.22)" strokeWidth="6" strokeLinecap="round" />

      <path d="M 90 72 C 106 86 122 98 138 108" stroke="url(#gR)" strokeWidth="15" strokeLinecap="round" filter="url(#s)" />
      <path d="M 90 72 C 106 86 122 98 138 108" stroke="rgba(255,248,160,0.22)" strokeWidth="6" strokeLinecap="round" />

      {/* ── Nodo centrale ── */}
      <ellipse cx="80" cy="62" rx="17" ry="13" fill="url(#gK)" filter="url(#s)" />
      <ellipse cx="80" cy="57" rx="11" ry="7"  fill="rgba(255,252,200,0.5)" />

      {/* ── Sparkle dots — effetto brillantina ── */}
      <circle cx="32"  cy="40" r="2.2" fill="#fffde0" opacity="0.85" filter="url(#glow)" />
      <circle cx="128" cy="38" r="2.0" fill="#fffde0" opacity="0.80" filter="url(#glow)" />
      <circle cx="56"  cy="74" r="1.8" fill="#fffde0" opacity="0.75" filter="url(#glow)" />
      <circle cx="104" cy="75" r="1.8" fill="#fffde0" opacity="0.75" filter="url(#glow)" />
      <circle cx="80"  cy="42" r="1.5" fill="#fffde0" opacity="0.70" filter="url(#glow)" />
      <circle cx="44"  cy="28" r="1.4" fill="#fffde0" opacity="0.65" />
      <circle cx="116" cy="30" r="1.4" fill="#fffde0" opacity="0.65" />
    </svg>
  );
}
