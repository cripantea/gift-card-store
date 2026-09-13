"use client";

import { useState, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { MAD_LOGO_URL } from "@/lib/brand";
import { markGiftCardAsOpened } from "@/app/gift/[token]/actions";

type Stage = "idle" | "shaking" | "untying" | "opening" | "rising" | "revealed";

interface Props {
  secretToken: string;
  children: ReactNode;
}

const PARTICLES = Array.from({ length: 24 }, (_, i) => {
  const angle = (i / 24) * 360;
  const r = 60 + (i % 5) * 18;
  return {
    id: i,
    x: Math.cos((angle * Math.PI) / 180) * r,
    y: Math.sin((angle * Math.PI) / 180) * r - 20,
    size: 2.5 + (i % 4),
    delay: (i % 7) * 0.028,
    color: ["#f6c453", "#fde9a8", "#c3a06a", "#e8d48a", "#a4794b"][i % 5],
  };
});

// Woven metallic ribbon — simulates the textile weave visible in the photos
const WOVEN_V = "repeating-linear-gradient(0deg,   #6a4810 0px, #c8a03c 3px, #eed868 6px, #c8a03c 9px, #6a4810 12px)";
const WOVEN_H = "repeating-linear-gradient(90deg,  #6a4810 0px, #c8a03c 3px, #eed868 6px, #c8a03c 9px, #6a4810 12px)";

export function UnwrappingExperience({ secretToken, children }: Props) {
  const [stage, setStage] = useState<Stage>("idle");

  function handleOpen() {
    if (stage !== "idle") return;
    markGiftCardAsOpened(secretToken).catch(console.error);
    setStage("shaking");
    setTimeout(() => setStage("untying"), 920);
    setTimeout(() => setStage("opening"), 1560);
    setTimeout(() => setStage("rising"), 2150);
    setTimeout(() => setStage("revealed"), 3600);
  }

  if (stage === "revealed") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 28, scale: 0.93 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.95, ease: [0.22, 1, 0.36, 1] }}
      >
        {children}
      </motion.div>
    );
  }

  const ribbonGone = stage === "untying" || stage === "opening" || stage === "rising";
  const isOpen    = stage === "opening" || stage === "rising";

  return (
    <div className="flex flex-col items-center gap-8 py-4 select-none">

      {/* ── Box ─────────────────────────────────────────────────────── */}
      <motion.div
        className="relative w-full"
        animate={
          stage === "shaking"
            ? { x: [0, -13, 13, -9, 9, -5, 5, -2, 2, 0], rotate: [0, -2.5, 2.5, -1.5, 1.5, -0.5, 0.5, 0] }
            : { y: [0, -6, 0] }
        }
        transition={
          stage === "shaking"
            ? { duration: 0.9, ease: "easeInOut" }
            : { duration: 3.8, repeat: Infinity, ease: "easeInOut", repeatType: "mirror" }
        }
      >
        {/* Drop shadow */}
        <motion.div
          className="absolute -bottom-2 left-1/2 -translate-x-1/2 rounded-full"
          style={{ width: "72%", height: 18, background: "rgba(0,0,0,0.18)", filter: "blur(14px)" }}
          animate={isOpen ? { scaleX: 0.5, opacity: 0.4 } : { scaleX: 1, opacity: 1 }}
          transition={{ duration: 0.6 }}
        />

        {/* Box base — interior, visible once lid opens */}
        <div
          className="w-full rounded-xl"
          style={{
            aspectRatio: "3/2",
            background: "linear-gradient(155deg, #fdf9f2 0%, #f2e8d5 100%)",
            border: "1px solid rgba(180,155,120,0.3)",
          }}
        >
          <AnimatePresence>
            {isOpen && (
              <motion.div
                className="absolute inset-0 rounded-xl"
                style={{ background: "linear-gradient(155deg, #fffbf4 0%, #f8edd8 100%)" }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                {/* Velvet insert */}
                <div
                  className="absolute inset-3 rounded-lg"
                  style={{
                    background: "linear-gradient(135deg, #ede4d4 0%, #e4d8c4 100%)",
                    boxShadow: "inset 0 2px 12px rgba(0,0,0,0.1)",
                  }}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Box lid — lifts open with 3-D perspective */}
        <motion.div
          className="absolute inset-0 rounded-xl overflow-hidden"
          style={{ transformOrigin: "top center", transformPerspective: 700 }}
          animate={
            isOpen
              ? { rotateX: -108, y: "-6%", opacity: 0 }
              : { rotateX: 0,    y:    "0%", opacity: 1 }
          }
          transition={{ duration: 0.72, ease: [0.34, 1.1, 0.64, 1] }}
        >
          {/* Lid surface */}
          <div
            className="absolute inset-0 rounded-xl"
            style={{
              background: "linear-gradient(155deg, #ffffff 0%, #f8f4ed 50%, #ede8de 100%)",
              boxShadow: "0 4px 24px rgba(0,0,0,0.13), inset 0 1px 0 rgba(255,255,255,0.95)",
              border: "1px solid rgba(210,195,172,0.5)",
            }}
          />
          {/* Paper noise */}
          <div
            className="absolute inset-0 rounded-xl opacity-[0.055]"
            style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='3' height='3'%3E%3Ccircle cx='1' cy='1' r='0.8' fill='%23000'/%3E%3C/svg%3E\")" }}
          />
          {/* Satin sheen */}
          <div
            className="absolute inset-0 rounded-xl pointer-events-none"
            style={{ background: "linear-gradient(118deg, transparent 28%, rgba(255,255,255,0.58) 45%, transparent 62%)" }}
          />

          {/* MAD logo — visible between/behind the ribbon */}
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 pointer-events-none" style={{ zIndex: 10 }}>
            <Image
              src={MAD_LOGO_URL}
              alt="MAD"
              width={80}
              height={80}
              className="w-14 h-14 sm:w-16 sm:h-16"
              style={{ opacity: 0.78, filter: "sepia(0.15) saturate(0.85)" }}
            />
            <p
              className="font-sans text-[0.48rem] sm:text-[0.52rem] font-medium uppercase"
              style={{ color: "#b8903a", letterSpacing: "0.38em" }}
            >
              #madforhair
            </p>
          </div>

          {/* Vertical ribbon */}
          <motion.div
            className="absolute inset-y-0 left-1/2 -translate-x-1/2"
            style={{
              width: "10.5%",
              background: WOVEN_V,
              boxShadow: "2px 0 8px rgba(0,0,0,0.22), -1px 0 4px rgba(0,0,0,0.12)",
              zIndex: 20,
            }}
            animate={ribbonGone ? { scaleY: 0, opacity: 0 } : { scaleY: 1, opacity: 1 }}
            transition={{ duration: 0.32, delay: 0.18, ease: "easeIn" }}
          />

          {/* Horizontal ribbon */}
          <motion.div
            className="absolute inset-x-0 top-1/2 -translate-y-1/2"
            style={{
              height: "15%",
              background: WOVEN_H,
              boxShadow: "0 2px 8px rgba(0,0,0,0.22), 0 -1px 4px rgba(0,0,0,0.12)",
              zIndex: 20,
            }}
            animate={ribbonGone ? { scaleX: 0, opacity: 0 } : { scaleX: 1, opacity: 1 }}
            transition={{ duration: 0.32, delay: 0.26, ease: "easeIn" }}
          />

          {/* Bow — centered on intersection */}
          <motion.div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
            style={{ zIndex: 30 }}
            animate={
              ribbonGone
                ? { scale: 0, rotate: 150, opacity: 0 }
                : { scale: 1,  rotate: 0,   opacity: 1 }
            }
            transition={{ duration: 0.36, ease: [0.36, 0, 0.66, -0.56] }}
          >
            <GoldBow />
          </motion.div>
        </motion.div>

        {/* Particles */}
        <AnimatePresence>
          {isOpen && PARTICLES.map((p) => (
            <motion.div
              key={p.id}
              className="absolute rounded-full pointer-events-none"
              style={{
                width: p.size,
                height: p.size,
                background: p.color,
                left: "50%",
                top: "45%",
                zIndex: 50,
              }}
              initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
              animate={{ x: p.x, y: p.y, opacity: 0, scale: 0 }}
              transition={{ duration: 1.15, delay: p.delay, ease: [0.22, 1, 0.36, 1] }}
            />
          ))}
        </AnimatePresence>

        {/* Golden bloom */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              key="bloom"
              className="absolute inset-0 rounded-xl pointer-events-none"
              style={{
                background: "radial-gradient(ellipse 80% 70% at 50% 50%, rgba(246,196,83,0.38) 0%, transparent 70%)",
                zIndex: 40,
              }}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1.25 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.65, ease: "easeOut" }}
            />
          )}
        </AnimatePresence>
      </motion.div>

      {/* ── Rising card (same width as box, credit-card ratio) ─────── */}
      <AnimatePresence>
        {stage === "rising" && (
          <div style={{ perspective: "700px", width: "100%" }}>
            <motion.div
              className="w-full relative overflow-hidden rounded-2xl"
              style={{
                aspectRatio: "1.586/1",
                background: "linear-gradient(145deg, #ffffff 0%, #fafaf7 45%, #f2ece0 100%)",
                boxShadow: "0 24px 64px rgba(0,0,0,0.22), 0 4px 16px rgba(0,0,0,0.1)",
                border: "1px solid rgba(215,195,162,0.35)",
              }}
              initial={{ y: -30, opacity: 0, rotateX: 12, scale: 0.9 }}
              animate={{ y: 0,   opacity: 1, rotateX: 0,  scale: 1   }}
              transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* Satin sheen */}
              <div className="absolute inset-0" style={{ background: "linear-gradient(118deg, transparent 28%, rgba(255,255,255,0.75) 46%, transparent 64%)" }} />
              {/* Gold corner accent */}
              <div className="absolute -right-8 -top-8 w-36 h-36 rounded-full" style={{ background: "radial-gradient(circle, rgba(246,196,83,0.22) 0%, transparent 70%)" }} />

              <div className="relative h-full flex flex-col items-center justify-center gap-2">
                <p
                  className="font-display text-base sm:text-lg italic tracking-widest"
                  style={{
                    background: "linear-gradient(135deg, #8a6820 0%, #f6e27a 45%, #c9a840 72%, #8a6820 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  Gift Card
                </p>
                <Image
                  src={MAD_LOGO_URL}
                  alt="MAD"
                  width={56}
                  height={56}
                  className="w-10 h-10 sm:w-12 sm:h-12 opacity-90"
                  style={{ filter: "sepia(0.2) saturate(0.9)" }}
                />
                <p
                  className="text-[0.55rem] sm:text-[0.6rem] tracking-[0.3em] uppercase"
                  style={{ color: "#b09060" }}
                >
                  MAD Vigevano
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Text ────────────────────────────────────────────────────── */}
      <motion.div
        className="flex flex-col items-center gap-1 text-center"
        animate={stage !== "idle" ? { opacity: 0, y: -10 } : { opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        style={{ pointerEvents: stage !== "idle" ? "none" : "auto" }}
      >
        <p className="font-display text-2xl font-semibold text-ink">Hai ricevuto un regalo</p>
        <p className="max-w-xs text-sm text-ink-soft">
          Qualcuno ha pensato a te con una Gift Card MAD Vigevano.
        </p>
      </motion.div>

      {/* ── CTA ─────────────────────────────────────────────────────── */}
      <motion.button
        type="button"
        onClick={handleOpen}
        disabled={stage !== "idle"}
        className="rounded-full bg-ink px-8 py-4 text-base font-medium text-paper disabled:cursor-not-allowed"
        whileHover={stage === "idle" ? { scale: 1.04 } : {}}
        whileTap={stage === "idle" ? { scale: 0.96 } : {}}
        animate={stage !== "idle" ? { opacity: 0, y: 14 } : { opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        style={{ pointerEvents: stage !== "idle" ? "none" : "auto" }}
      >
        Apri il tuo Regalo
      </motion.button>
    </div>
  );
}

/* ── SVG bow that matches the woven metallic bow in the photos ─────────── */
function GoldBow() {
  return (
    <svg width="124" height="86" viewBox="0 0 124 86" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="gL" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%"   stopColor="#4e3208" />
          <stop offset="18%"  stopColor="#b88c2a" />
          <stop offset="42%"  stopColor="#f0d868" />
          <stop offset="68%"  stopColor="#c9a840" />
          <stop offset="100%" stopColor="#5a3c0e" />
        </linearGradient>
        <linearGradient id="gR" x1="1" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#4e3208" />
          <stop offset="18%"  stopColor="#b88c2a" />
          <stop offset="42%"  stopColor="#f0d868" />
          <stop offset="68%"  stopColor="#c9a840" />
          <stop offset="100%" stopColor="#5a3c0e" />
        </linearGradient>
        <linearGradient id="gK" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%"   stopColor="#f0d868" />
          <stop offset="50%"  stopColor="#c9a840" />
          <stop offset="100%" stopColor="#5a3c0e" />
        </linearGradient>
        <filter id="bs">
          <feDropShadow dx="0" dy="2" stdDeviation="2.5" floodColor="#2a1800" floodOpacity="0.42" />
        </filter>
      </defs>

      {/* Left loop */}
      <path
        d="M 59 46 C 50 32 26 10 9 18 C 1 22 3 37 15 42 C 29 47 52 48 59 46 Z"
        fill="url(#gL)" filter="url(#bs)"
      />
      <path
        d="M 59 46 C 52 34 32 16 17 23 C 10 26 13 36 22 40 C 34 44 54 47 59 46 Z"
        fill="rgba(240,218,110,0.32)"
      />

      {/* Right loop */}
      <path
        d="M 65 46 C 74 32 98 10 115 18 C 123 22 121 37 109 42 C 95 47 72 48 65 46 Z"
        fill="url(#gR)" filter="url(#bs)"
      />
      <path
        d="M 65 46 C 72 34 92 16 107 23 C 114 26 111 36 102 40 C 90 44 70 47 65 46 Z"
        fill="rgba(240,218,110,0.32)"
      />

      {/* Left tail */}
      <path d="M 55 54 C 44 64 33 73 22 82" stroke="url(#gL)" strokeWidth="12" strokeLinecap="round" filter="url(#bs)" />
      <path d="M 55 54 C 44 64 33 73 22 82" stroke="rgba(240,218,110,0.28)" strokeWidth="6" strokeLinecap="round" />

      {/* Right tail */}
      <path d="M 69 54 C 80 64 91 73 102 82" stroke="url(#gR)" strokeWidth="12" strokeLinecap="round" filter="url(#bs)" />
      <path d="M 69 54 C 80 64 91 73 102 82" stroke="rgba(240,218,110,0.28)" strokeWidth="6" strokeLinecap="round" />

      {/* Center knot */}
      <ellipse cx="62" cy="47" rx="14" ry="11" fill="url(#gK)" filter="url(#bs)" />
      <ellipse cx="62" cy="44"  rx="9"  ry="6"  fill="rgba(255,248,195,0.48)" />
    </svg>
  );
}
