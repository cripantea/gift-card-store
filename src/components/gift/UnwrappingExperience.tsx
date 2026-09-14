"use client";

import { useRef, useState, type ReactNode } from "react";
import { motion, AnimatePresence, type PanInfo } from "framer-motion";
import Image from "next/image";
import { MAD_LOGO_URL } from "@/lib/brand";
import { markGiftCardAsOpened } from "@/app/gift/[token]/actions";

/* ─── Stage machine ───────────────────────────────────────────────────── */
type Stage = "idle" | "unwrapping" | "opening" | "revealed";

/* ─── Particles — 44 pieces, richer burst ────────────────────────────── */
const PARTICLES = Array.from({ length: 44 }, (_, i) => {
  const angle = (i / 44) * 360 + (i % 5) * 9;
  const r = 48 + (i % 9) * 24;
  return {
    id: i,
    x: Math.cos((angle * Math.PI) / 180) * r,
    y: Math.sin((angle * Math.PI) / 180) * r - 30,
    size: 2.5 + (i % 7),
    delay: (i % 14) * 0.026,
    color: ["#f6c453", "#fde9a8", "#c3a06a", "#e8d48a", "#a4794b", "#fdf0c0", "#ffffff", "#f0d060"][i % 8],
  };
});

/* ─── Ribbon — semi-trasparente, oro come il logo ─────────────────────
   rgba so the white box surface shows through (same gold as the MAD logo) */
const WOVEN_V = [
  "repeating-linear-gradient(0deg,",
  "transparent 0px,",
  "rgba(164,121,75,0.48) 1.5px,",
  "rgba(195,160,106,0.74) 4.5px,",
  "rgba(255,248,210,0.86) 7px,",
  "rgba(195,160,106,0.74) 9.5px,",
  "rgba(164,121,75,0.48) 12.5px,",
  "transparent 14px)",
].join(" ");

const WOVEN_H = [
  "repeating-linear-gradient(90deg,",
  "transparent 0px,",
  "rgba(164,121,75,0.48) 1.5px,",
  "rgba(195,160,106,0.74) 4.5px,",
  "rgba(255,248,210,0.86) 7px,",
  "rgba(195,160,106,0.74) 9.5px,",
  "rgba(164,121,75,0.48) 12.5px,",
  "transparent 14px)",
].join(" ");

/* ─── Easing ──────────────────────────────────────────────────────────── */
const LIFT: [number, number, number, number] = [0.16, 1, 0.28, 1];

/* ─── Timings (ms from drag) ──────────────────────────────────────────── */
const T_OPENING  = 2400;  // ribbon dissolves, then lid starts rising
const T_REVEALED = 5600;  // lid fully gone (2400 + 2800 lid + 400 buffer)

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
    setTimeout(() => setStage("opening"),  T_OPENING);
    setTimeout(() => setStage("revealed"), T_REVEALED);
  }

  const isUnwrapping = stage !== "idle";
  const isOpen       = stage === "opening" || stage === "revealed";

  return (
    <div className="flex flex-col items-center gap-8 py-6 select-none">

      {/* ─── Heading — sopra il box, sparisce al reveal ─────────── */}
      <AnimatePresence>
        {stage === "idle" && (
          <motion.div
            className="flex flex-col items-center gap-3 text-center"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.55, delay: 0.25 }}
          >
            <p className="font-display text-4xl font-semibold text-ink sm:text-5xl">Hai ricevuto un regalo</p>
            <p className="max-w-sm text-base leading-relaxed text-ink-soft sm:text-lg">
              Qualcuno ha pensato a te con una Gift Card MAD Vigevano.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">

        {/* ─── BOX ─────────────────────────────────────────────────── */}
        {stage !== "revealed" && (
          <motion.div
            key="box"
            className="relative w-full"
            animate={
              stage === "idle"    ? { y: [0, -9, 0], x: 0 } :
              stage === "opening" ? { y: 0, x: [0, -5, 5, -3, 3, -1.5, 1, 0] } :
                                    { y: 0, x: 0 }
            }
            transition={
              stage === "idle"
                ? { duration: 5.2, repeat: Infinity, ease: "easeInOut", repeatType: "mirror" }
                : stage === "opening"
                ? { duration: 2.4, delay: 0.2, ease: "easeInOut" }
                : { duration: 0.55, ease: "easeOut" }
            }
            exit={{ opacity: 0, y: -10, scale: 0.96, transition: { duration: 0.9, ease: "easeInOut" } }}
          >
            {/* Drop shadow */}
            <motion.div
              className="absolute -bottom-3 left-1/2 -translate-x-1/2 rounded-full pointer-events-none"
              style={{ width: "68%", height: 22, background: "rgba(0,0,0,0.18)", filter: "blur(18px)" }}
              animate={isOpen ? { scaleX: 0.3, opacity: 0.15 } : { scaleX: 1, opacity: 1 }}
              transition={{ duration: 2.2 }}
            />

            {/* Box base */}
            <div
              className="w-full rounded-2xl relative overflow-hidden"
              style={{
                aspectRatio: "3/2",
                background: "#ffffff",
                border: "1px solid rgba(180,175,170,0.35)",
                boxShadow: "0 2px 0 0 rgba(200,195,190,0.5) inset, 0 -2px 0 0 rgba(200,195,190,0.4) inset",
              }}
            >
              <AnimatePresence>
                {isOpen && (
                  <>
                    {/* Glow dal basso — cresce gradualmente con il lid */}
                    <motion.div
                      key="glow"
                      className="absolute inset-0 rounded-2xl pointer-events-none"
                      style={{
                        background: "radial-gradient(ellipse 80% 70% at 50% 10%, rgba(200,150,30,0.30) 0%, transparent 70%)",
                      }}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: [0, 0.35, 0.65, 1] }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 3.2, times: [0, 0.12, 0.5, 1], ease: "easeInOut" }}
                    />
                    {/* Light sweep — raggio di luce che entra mentre il lid sale */}
                    <motion.div
                      key="sweep"
                      className="absolute inset-0 rounded-2xl pointer-events-none"
                      style={{
                        background: "linear-gradient(135deg, transparent 30%, rgba(255,240,160,0.22) 50%, transparent 70%)",
                      }}
                      initial={{ x: "-110%", opacity: 0 }}
                      animate={{ x: "110%", opacity: [0, 0.8, 0] }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 1.8, delay: 0.6, ease: "easeOut" }}
                    />
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* Box lid — rises very slowly */}
            <motion.div
              className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none"
              animate={isOpen ? { y: "-125%", opacity: 0 } : { y: "0%", opacity: 1 }}
              transition={{ duration: 2.8, ease: LIFT, delay: 0.14 }}
            >
              {/* Lid surface — pure white */}
              <div className="absolute inset-0 rounded-2xl" style={{
                background: "#ffffff",
                boxShadow: "0 10px 48px rgba(0,0,0,0.16), 0 2px 8px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,1)",
                border: "1px solid rgba(180,175,170,0.35)",
              }} />
              {/* Satin sheen */}
              <div className="absolute inset-0 rounded-2xl pointer-events-none" style={{
                background: "linear-gradient(118deg, transparent 25%, rgba(255,255,255,0.55) 44%, transparent 63%)",
              }} />

              {/* MAD Logo — large, centered */}
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 pointer-events-none" style={{ zIndex: 10 }}>
                <Image
                  src={MAD_LOGO_URL} alt="MAD" width={160} height={160}
                  className="w-28 h-28 sm:w-36 sm:h-36"
                  style={{ opacity: 0.85, filter: "sepia(0.08) saturate(0.92)" }}
                />
                <p className="font-sans font-semibold uppercase tracking-[0.44em]" style={{ color: "#b8903a", fontSize: "0.53rem" }}>
                  #madforhair
                </p>
              </div>

              {/* Vertical ribbon + shimmer */}
              <motion.div
                className="absolute inset-y-0 left-1/2 -translate-x-1/2 overflow-hidden pointer-events-none"
                style={{ width: "11.5%", zIndex: 20 }}
                animate={isUnwrapping ? { scaleY: 0, opacity: 0 } : { scaleY: 1, opacity: 1 }}
                transition={{ duration: 1.4, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
              >
                <div
                  className="absolute inset-0"
                  style={{
                    background: WOVEN_V,
                    boxShadow: "2px 0 12px rgba(164,121,75,0.3), -1px 0 6px rgba(164,121,75,0.18)",
                  }}
                />
                <RibbonShimmer />
              </motion.div>

              {/* Horizontal ribbon + shimmer */}
              <motion.div
                className="absolute inset-x-0 top-1/2 -translate-y-1/2 overflow-hidden pointer-events-none"
                style={{ height: "16.5%", zIndex: 20 }}
                animate={isUnwrapping ? { scaleX: 0, opacity: 0 } : { scaleX: 1, opacity: 1 }}
                transition={{ duration: 1.4, delay: 0.46, ease: [0.22, 1, 0.36, 1] }}
              >
                <div
                  className="absolute inset-0"
                  style={{
                    background: WOVEN_H,
                    boxShadow: "0 2px 12px rgba(164,121,75,0.3), 0 -1px 6px rgba(164,121,75,0.18)",
                  }}
                />
                <RibbonShimmer horizontal />
              </motion.div>
            </motion.div>

            {/* Pulsing glow behind bow — draws attention while idle */}
            <AnimatePresence>
              {stage === "idle" && (
                <motion.div
                  key="bowglow"
                  className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none"
                  style={{
                    width: 96, height: 96,
                    background: "radial-gradient(ellipse, rgba(200,150,30,0.32) 0%, transparent 70%)",
                    zIndex: 35,
                  }}
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={{ opacity: [0.3, 0.8, 0.3], scale: [1, 1.6, 1] }}
                  exit={{ opacity: 0, scale: 0.6, transition: { duration: 0.4 } }}
                  transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
                />
              )}
            </AnimatePresence>

            {/* Bow — draggable, with idle sway */}
            <motion.div
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
              style={{ zIndex: 40, touchAction: "none", cursor: stage === "idle" ? "grab" : "default" }}
              drag={stage === "idle"}
              dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
              dragElastic={0.88}
              dragMomentum={false}
              onDragEnd={handleDragEnd}
              whileTap={stage === "idle" ? { scale: 0.92 } : {}}
              animate={
                isUnwrapping
                  ? { x: bowDir.current.x * 420, y: bowDir.current.y * 420, scale: 0, rotate: 260, opacity: 0 }
                  : { x: 0, y: 0, scale: 1, rotate: 0, opacity: 1 }
              }
              transition={
                isUnwrapping
                  ? { type: "spring", stiffness: 85, damping: 10 }
                  : undefined
              }
            >
              {/* Inner wrapper handles idle sway independently */}
              <motion.div
                animate={
                  stage === "idle"
                    ? { rotate: [-2, 2, -2], y: [0, -3, 0] }
                    : { rotate: 0, y: 0 }
                }
                transition={
                  stage === "idle"
                    ? { duration: 4.0, repeat: Infinity, ease: "easeInOut" }
                    : { duration: 0.3 }
                }
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
                    width: p.size, height: p.size, background: p.color,
                    left: "50%", top: "44%",
                    marginLeft: -(p.size / 2), marginTop: -(p.size / 2),
                    zIndex: 50,
                  }}
                  initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                  animate={{ x: p.x, y: p.y, opacity: 0, scale: 0 }}
                  transition={{ duration: 2.2, delay: p.delay, ease: [0.22, 1, 0.36, 1] }}
                />
              ))}
            </AnimatePresence>

            {/* Bloom */}
            <AnimatePresence>
              {isOpen && (
                <motion.div
                  key="bloom"
                  className="absolute inset-0 rounded-2xl pointer-events-none"
                  style={{
                    background: "radial-gradient(ellipse 80% 72% at 50% 50%, rgba(246,196,83,0.38) 0%, transparent 72%)",
                    zIndex: 45,
                  }}
                  initial={{ opacity: 0, scale: 0.4 }}
                  animate={{ opacity: [0, 1, 0.38] }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 2.6, ease: "easeOut", times: [0, 0.2, 1] }}
                />
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* ─── REAL GIFT CARD ───────────────────────────────────────── */}
        {/* Monta DOPO che il box ha finito l'exit (mode="wait").
            Framer Motion anima da initial verso animate non appena monta —
            niente useAnimation, niente timing fragility. */}
        {stage === "revealed" && (
          <motion.div
            key="card"
            className="w-full"
            initial={{ opacity: 0, y: 48, scale: 0.91 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 1.7, ease: [0.22, 1, 0.36, 1], delay: 0.08 }}
          >
            {children}
          </motion.div>
        )}

      </AnimatePresence>

      {/* ─── Hint drag — sotto il box ─────────────────────────────── */}
      <AnimatePresence>
        {stage === "idle" && (
          <motion.p
            className="text-sm font-medium tracking-[0.18em] uppercase sm:text-base"
            style={{ color: "#c3a06a" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.4, 1, 0.4] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
          >
            Trascina il fiocco per aprire
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Ribbon shimmer — luce che scivola sul filo ─────────────────────── */
function RibbonShimmer({ horizontal }: { horizontal?: boolean }) {
  return (
    <motion.div
      className="absolute inset-0 pointer-events-none"
      style={{
        background: horizontal
          ? "linear-gradient(90deg, transparent 30%, rgba(255,255,255,0.72) 50%, transparent 70%)"
          : "linear-gradient(180deg, transparent 30%, rgba(255,255,255,0.72) 50%, transparent 70%)",
      }}
      initial={horizontal ? { x: "-120%" } : { y: "-120%" }}
      animate={horizontal ? { x: "120%" } : { y: "120%" }}
      transition={{ duration: 3.0, repeat: Infinity, ease: "linear", repeatDelay: 2.0 }}
    />
  );
}

/* ─── GoldBow — fiocco naturale, asimmetrico, con creases ────────────── */
function GoldBow() {
  return (
    <svg
      width="172" height="120"
      viewBox="0 0 172 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ opacity: 0.90 }}
    >
      <defs>
        {/* Oro caldo — highlights bianchi per effetto sbrillucicante */}
        <linearGradient id="gL" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%"   stopColor="#ffffff" stopOpacity="0.92" />
          <stop offset="18%"  stopColor="#f4e080" />
          <stop offset="44%"  stopColor="#c8961e" />
          <stop offset="68%"  stopColor="#f0d060" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0.88" />
        </linearGradient>
        <linearGradient id="gR" x1="1" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#ffffff" stopOpacity="0.92" />
          <stop offset="18%"  stopColor="#f4e080" />
          <stop offset="44%"  stopColor="#c8961e" />
          <stop offset="66%"  stopColor="#f0d060" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0.88" />
        </linearGradient>
        <linearGradient id="gK" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%"   stopColor="#fde9a8" />
          <stop offset="40%"  stopColor="#c8961e" />
          <stop offset="100%" stopColor="#9a7018" />
        </linearGradient>
        <linearGradient id="gT" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#f4e080" />
          <stop offset="50%"  stopColor="#c8961e" />
          <stop offset="100%" stopColor="#a07818" stopOpacity="0.60" />
        </linearGradient>
        <filter id="s" x="-35%" y="-35%" width="170%" height="170%">
          <feDropShadow dx="0" dy="2" stdDeviation="3.5" floodColor="#7a5c10" floodOpacity="0.26" />
        </filter>
        <filter id="gl">
          <feGaussianBlur stdDeviation="2.2" result="b" />
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>

      {/* Loop sinistro — leggermente più grande, forma organica */}
      <path
        d="M 82 68 C 72 52 50 20 22 23 C 5 26 -3 48 12 58 C 28 68 64 72 82 68 Z"
        fill="url(#gL)" filter="url(#s)"
      />
      {/* Crease principale */}
      <path d="M 80 63 C 67 48 44 26 24 31" stroke="rgba(255,255,255,0.70)" strokeWidth="6" strokeLinecap="round" />
      {/* Crease secondaria — profondità */}
      <path d="M 74 57 C 62 45 46 34 32 37" stroke="rgba(255,255,255,0.28)" strokeWidth="2.5" strokeLinecap="round" />

      {/* Loop destro — leggermente asimmetrico */}
      <path
        d="M 90 68 C 100 52 120 22 146 26 C 163 29 167 50 153 59 C 138 68 106 71 90 68 Z"
        fill="url(#gR)" filter="url(#s)"
      />
      <path d="M 92 63 C 105 48 128 28 148 34" stroke="rgba(255,255,255,0.70)" strokeWidth="6" strokeLinecap="round" />
      <path d="M 98 57 C 110 46 130 36 142 40" stroke="rgba(255,255,255,0.28)" strokeWidth="2.5" strokeLinecap="round" />

      {/* Coda sinistra — curva naturale */}
      <path d="M 78 78 C 68 92 52 103 34 116" stroke="url(#gT)" strokeWidth="15" strokeLinecap="round" filter="url(#s)" />
      <path d="M 78 78 C 68 92 52 103 34 116" stroke="rgba(255,255,255,0.55)" strokeWidth="4.5" strokeLinecap="round" />

      {/* Coda destra — angolo diverso per naturalezza */}
      <path d="M 94 78 C 108 90 124 100 142 112" stroke="url(#gT)" strokeWidth="15" strokeLinecap="round" filter="url(#s)" />
      <path d="M 94 78 C 108 90 124 100 142 112" stroke="rgba(255,255,255,0.55)" strokeWidth="4.5" strokeLinecap="round" />

      {/* Nodo centrale — prominente */}
      <ellipse cx="86" cy="68" rx="17" ry="12.5" fill="url(#gK)" filter="url(#s)" />
      <ellipse cx="86" cy="63" rx="11" ry="7" fill="rgba(255,255,255,0.62)" />
      <ellipse cx="83" cy="61" rx="4.5" ry="2.8" fill="rgba(255,255,255,0.90)" />

      {/* Sparkles — brillantina */}
      <circle cx="22"  cy="44" r="3.0" fill="#ffffff" opacity="0.96" filter="url(#gl)" />
      <circle cx="150" cy="42" r="2.5" fill="#ffffff" opacity="0.92" filter="url(#gl)" />
      <circle cx="44"  cy="18" r="2.2" fill="#ffffff" opacity="0.87" filter="url(#gl)" />
      <circle cx="118" cy="20" r="2.0" fill="#ffffff" opacity="0.87" filter="url(#gl)" />
      <circle cx="86"  cy="40" r="1.9" fill="#ffffff" opacity="0.83" filter="url(#gl)" />
      <circle cx="34"  cy="62" r="1.7" fill="#ffffff" opacity="0.76" />
      <circle cx="134" cy="60" r="1.7" fill="#ffffff" opacity="0.76" />
      <circle cx="60"  cy="84" r="1.5" fill="#ffffff" opacity="0.68" />
      <circle cx="110" cy="82" r="1.5" fill="#ffffff" opacity="0.68" />
      <circle cx="12"  cy="52" r="1.3" fill="#f0d060" opacity="0.82" filter="url(#gl)" />
      <circle cx="158" cy="50" r="1.3" fill="#f0d060" opacity="0.82" filter="url(#gl)" />
      <circle cx="86"  cy="18" r="1.2" fill="#ffffff" opacity="0.72" filter="url(#gl)" />
    </svg>
  );
}
