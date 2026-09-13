"use client";

import { useRef, useState, type ReactNode } from "react";
import { motion, AnimatePresence, type PanInfo } from "framer-motion";
import Image from "next/image";
import { MAD_LOGO_URL } from "@/lib/brand";
import { markGiftCardAsOpened } from "@/app/gift/[token]/actions";

/* ─── Stages ──────────────────────────────────────────────────────────── */
type Stage = "idle" | "unwrapping" | "opening" | "rising" | "revealed";

/* ─── Particles ───────────────────────────────────────────────────────── */
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

/* ─── Woven-textile ribbon gradient ───────────────────────────────────── */
const WOVEN_V = "repeating-linear-gradient(0deg,   #55320a 0px, #b88c28 3px, #e8cc58 6px, #b88c28 9px, #55320a 12px)";
const WOVEN_H = "repeating-linear-gradient(90deg,  #55320a 0px, #b88c28 3px, #e8cc58 6px, #b88c28 9px, #55320a 12px)";

/* ─── Easing presets ──────────────────────────────────────────────────── */
const LIFT: [number, number, number, number] = [0.16, 1, 0.28, 1];   // lid rises: starts slow, settles gently
const CARD: [number, number, number, number] = [0.22, 1, 0.36, 1];   // card emerge

/* ─────────────────────────────────────────────────────────────────────── */

interface Props { secretToken: string; children: ReactNode }

export function UnwrappingExperience({ secretToken, children }: Props) {
  const [stage, setStage]   = useState<Stage>("idle");
  const bowDir              = useRef({ x: 0, y: -1 });

  function handleDragEnd(_: unknown, info: PanInfo) {
    if (stage !== "idle") return;
    const dist = Math.sqrt(info.offset.x ** 2 + info.offset.y ** 2);
    if (dist < 44) return;                       // not far enough → bow snaps back

    // Capture the direction the bow should fly
    const dx = info.velocity.x || info.offset.x;
    const dy = info.velocity.y || info.offset.y;
    const len = Math.sqrt(dx ** 2 + dy ** 2) || 1;
    bowDir.current = { x: dx / len, y: dy / len };

    markGiftCardAsOpened(secretToken).catch(console.error);

    setStage("unwrapping");
    setTimeout(() => setStage("opening"),  1200);
    setTimeout(() => setStage("rising"),   3000);
    setTimeout(() => setStage("revealed"), 4700);
  }

  /* ── Revealed ── */
  if (stage === "revealed") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.94 }}
        animate={{ opacity: 1, y: 0,  scale: 1    }}
        transition={{ duration: 1.1, ease: CARD }}
      >
        {children}
      </motion.div>
    );
  }

  const isUnwrapping = stage !== "idle";
  const isOpen       = stage === "opening" || stage === "rising";

  return (
    <div className="flex flex-col items-center gap-6 py-4 select-none">

      {/* ─── BOX ──────────────────────────────────────────────────────── */}
      <motion.div
        className="relative w-full"
        animate={stage === "idle" ? { y: [0, -8, 0] } : {}}
        transition={{ duration: 4.8, repeat: Infinity, ease: "easeInOut", repeatType: "mirror" }}
      >
        {/* Drop shadow */}
        <motion.div
          className="absolute -bottom-3 left-1/2 -translate-x-1/2 rounded-full pointer-events-none"
          style={{ width: "68%", height: 22, background: "rgba(0,0,0,0.18)", filter: "blur(18px)" }}
          animate={isOpen ? { scaleX: 0.4, opacity: 0.28 } : { scaleX: 1, opacity: 1 }}
          transition={{ duration: 1.4 }}
        />

        {/* ── Box base (interior revealed when lid lifts) ── */}
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
                {/* Velvet insert */}
                <div className="absolute inset-0 rounded-2xl" style={{ background: "linear-gradient(158deg, #fffcf4 0%, #f5e8d2 100%)" }} />
                <div className="absolute inset-4 rounded-xl" style={{
                  background: "linear-gradient(135deg, #ece0cb 0%, #dfd0b5 100%)",
                  boxShadow: "inset 0 3px 16px rgba(0,0,0,0.14)",
                }} />
                {/* Light from inside */}
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

        {/* ── Box lid ── */}
        <motion.div
          className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none"
          animate={isOpen
            ? { y: "-118%", opacity: 0 }
            : { y: "0%",    opacity: 1 }}
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
          {/* Sheen */}
          <div className="absolute inset-0 rounded-2xl" style={{
            background: "linear-gradient(118deg, transparent 24%, rgba(255,255,255,0.62) 43%, transparent 62%)",
          }} />

          {/* ── Logo — LARGE ── */}
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 pointer-events-none" style={{ zIndex: 10 }}>
            <Image
              src={MAD_LOGO_URL}
              alt="MAD"
              width={160}
              height={160}
              className="w-28 h-28 sm:w-32 sm:h-32"
              style={{ opacity: 0.8, filter: "sepia(0.08) saturate(0.92)" }}
            />
            <p className="font-sans font-semibold uppercase tracking-[0.42em]" style={{ color: "#b8903a", fontSize: "0.54rem" }}>
              #madforhair
            </p>
          </div>

          {/* Vertical ribbon */}
          <motion.div
            className="absolute inset-y-0 left-1/2 -translate-x-1/2 pointer-events-none"
            style={{ width: "11.5%", background: WOVEN_V, boxShadow: "2px 0 10px rgba(0,0,0,0.24), -1px 0 5px rgba(0,0,0,0.14)", zIndex: 20 }}
            animate={isUnwrapping ? { scaleY: 0, opacity: 0 } : { scaleY: 1, opacity: 1 }}
            transition={{ duration: 0.9, delay: 0.42, ease: CARD }}
          />
          {/* Horizontal ribbon */}
          <motion.div
            className="absolute inset-x-0 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ height: "16.5%", background: WOVEN_H, boxShadow: "0 2px 10px rgba(0,0,0,0.24), 0 -1px 5px rgba(0,0,0,0.14)", zIndex: 20 }}
            animate={isUnwrapping ? { scaleX: 0, opacity: 0 } : { scaleX: 1, opacity: 1 }}
            transition={{ duration: 0.9, delay: 0.6, ease: CARD }}
          />
        </motion.div>

        {/* ── Bow (outside lid so drag can overflow) ── */}
        <motion.div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{ zIndex: 40, touchAction: "none", cursor: stage === "idle" ? "grab" : "default" }}
          drag={stage === "idle"}
          dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
          dragElastic={0.88}
          dragMomentum={false}
          onDragEnd={handleDragEnd}
          whileTap={stage === "idle" ? { scale: 0.94 } : {}}
          animate={
            isUnwrapping
              ? { x: bowDir.current.x * 300, y: bowDir.current.y * 300, scale: 0, rotate: 200, opacity: 0 }
              : { x: 0, y: 0, scale: 1, rotate: 0, opacity: 1 }
          }
          transition={isUnwrapping ? { duration: 0.75, ease: [0.36, 0, 0.66, -0.28] } : undefined}
        >
          <GoldBow />
        </motion.div>

        {/* Particles */}
        <AnimatePresence>
          {isOpen && PARTICLES.map((p) => (
            <motion.div
              key={p.id}
              className="absolute rounded-full pointer-events-none"
              style={{
                width: p.size, height: p.size, background: p.color,
                left: "50%", top: "44%",
                marginLeft: -(p.size / 2), marginTop: -(p.size / 2),
                zIndex: 50,
              }}
              initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
              animate={{ x: p.x, y: p.y, opacity: 0, scale: 0 }}
              transition={{ duration: 1.5, delay: p.delay, ease: CARD }}
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

      {/* ─── Rising card ────────────────────────────────────────────────── */}
      <AnimatePresence>
        {stage === "rising" && (
          <div style={{ perspective: "900px", width: "100%" }}>
            <motion.div
              className="w-full relative overflow-hidden rounded-2xl"
              style={{
                aspectRatio: "1.586/1",
                background: "linear-gradient(148deg, #ffffff 0%, #fafaf6 42%, #f2ece0 100%)",
                boxShadow: "0 30px 80px rgba(0,0,0,0.22), 0 6px 22px rgba(0,0,0,0.1)",
                border: "1px solid rgba(215,192,158,0.32)",
              }}
              initial={{ y: -16, opacity: 0, rotateX: 10, scale: 0.88 }}
              animate={{ y: 0,   opacity: 1, rotateX: 0,  scale: 1   }}
              transition={{ duration: 1.65, ease: CARD }}
            >
              <div className="absolute inset-0" style={{ background: "linear-gradient(118deg, transparent 26%, rgba(255,255,255,0.74) 45%, transparent 64%)" }} />
              <div className="absolute -right-10 -top-10 w-44 h-44 rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, rgba(246,196,83,0.22) 0%, transparent 70%)" }} />
              <div className="relative h-full flex flex-col items-center justify-center gap-3 py-4">
                <p
                  className="font-display text-xl sm:text-2xl italic tracking-widest"
                  style={{
                    background: "linear-gradient(135deg, #7a5e18 0%, #f2dc6a 44%, #c09838 72%, #7a5e18 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  Gift Card
                </p>
                <Image src={MAD_LOGO_URL} alt="MAD" width={72} height={72}
                  className="w-14 h-14 sm:w-16 sm:h-16 opacity-88"
                  style={{ filter: "sepia(0.1) saturate(0.9)" }} />
                <p className="text-[0.55rem] sm:text-[0.62rem] tracking-[0.34em] uppercase" style={{ color: "#a89060" }}>
                  MAD Vigevano
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ─── Hint (replaces button) ─────────────────────────────────────── */}
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
              animate={{ opacity: [0.45, 1, 0.45] }}
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

/* ─── Gold bow SVG ────────────────────────────────────────────────────── */
function GoldBow() {
  return (
    <svg width="156" height="110" viewBox="0 0 156 110" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="gL" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%"   stopColor="#3e2608" />
          <stop offset="16%"  stopColor="#a88026" />
          <stop offset="44%"  stopColor="#eed060" />
          <stop offset="72%"  stopColor="#b89038" />
          <stop offset="100%" stopColor="#402808" />
        </linearGradient>
        <linearGradient id="gR" x1="1" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#3e2608" />
          <stop offset="16%"  stopColor="#a88026" />
          <stop offset="44%"  stopColor="#eed060" />
          <stop offset="72%"  stopColor="#b89038" />
          <stop offset="100%" stopColor="#402808" />
        </linearGradient>
        <linearGradient id="gK" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%"   stopColor="#eed060" />
          <stop offset="52%"  stopColor="#b89038" />
          <stop offset="100%" stopColor="#3e2608" />
        </linearGradient>
        <filter id="s" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="2" stdDeviation="3.5" floodColor="#180e00" floodOpacity="0.48" />
        </filter>
      </defs>

      {/* Left loop */}
      <path d="M 74 60 C 60 40 30 12 8 24 C -3 30 0 50 18 56 C 36 62 66 63 74 60 Z"
        fill="url(#gL)" filter="url(#s)" />
      <path d="M 74 60 C 62 43 36 18 18 28 C 10 33 14 48 28 53 C 44 59 68 62 74 60 Z"
        fill="rgba(238,210,96,0.28)" />

      {/* Right loop */}
      <path d="M 82 60 C 96 40 126 12 148 24 C 159 30 156 50 138 56 C 120 62 90 63 82 60 Z"
        fill="url(#gR)" filter="url(#s)" />
      <path d="M 82 60 C 94 43 120 18 138 28 C 146 33 142 48 128 53 C 112 59 88 62 82 60 Z"
        fill="rgba(238,210,96,0.28)" />

      {/* Left tail */}
      <path d="M 68 70 C 52 84 36 96 20 106" stroke="url(#gL)" strokeWidth="15" strokeLinecap="round" filter="url(#s)" />
      <path d="M 68 70 C 52 84 36 96 20 106" stroke="rgba(238,210,96,0.24)" strokeWidth="7" strokeLinecap="round" />

      {/* Right tail */}
      <path d="M 88 70 C 104 84 120 96 136 106" stroke="url(#gR)" strokeWidth="15" strokeLinecap="round" filter="url(#s)" />
      <path d="M 88 70 C 104 84 120 96 136 106" stroke="rgba(238,210,96,0.24)" strokeWidth="7" strokeLinecap="round" />

      {/* Center knot */}
      <ellipse cx="78" cy="60" rx="17" ry="14" fill="url(#gK)" filter="url(#s)" />
      <ellipse cx="78" cy="55" rx="11" ry="8"  fill="rgba(255,248,190,0.48)" />
    </svg>
  );
}
