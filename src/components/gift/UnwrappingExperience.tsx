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

/* ─── Woven-textile ribbon — oro caldo + bianco ───────────────────────
   #c8961e = oro vero (caldo, non giallo), #f0d060 = highlight oro chiaro */
const WOVEN_V = "repeating-linear-gradient(0deg,   #8a6415 0px, #c8961e 2px, #f0d060 5px, #ffffff 7px, #f0d060 9px, #c8961e 11px, #8a6415 14px)";
const WOVEN_H = "repeating-linear-gradient(90deg,  #8a6415 0px, #c8961e 2px, #f0d060 5px, #ffffff 7px, #f0d060 9px, #c8961e 11px, #8a6415 14px)";

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
    // "revealed" a 2400ms: il coperchio è ancora in movimento (finisce a 3050ms).
    // L'uscita del box (0.4s) avviene mentre il lid sale → nessun rettangolo vuoto.
    setTimeout(() => setStage("revealed"), 2400);
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

            {/* Box base — bianco puro, con luce dorata all'apertura */}
            <div
              className="w-full rounded-2xl relative overflow-hidden"
              style={{
                aspectRatio: "3/2",
                background: "#ffffff",
                border: "1px solid rgba(180,175,170,0.35)",
                boxShadow: "0 2px 0 0 rgba(200,195,190,0.5) inset, 0 -2px 0 0 rgba(200,195,190,0.4) inset",
              }}
            >
              {/* Luce dorata dall'interno — visibile solo mentre il lid sale */}
              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    key="glow"
                    className="absolute inset-0 rounded-2xl pointer-events-none"
                    style={{ background: "radial-gradient(ellipse 70% 60% at 50% 15%, rgba(200,150,30,0.22) 0%, transparent 65%)" }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.7 }}
                  />
                )}
              </AnimatePresence>
            </div>

            {/* Box lid — rises straight up */}
            <motion.div
              className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none"
              animate={isOpen ? { y: "-118%", opacity: 0 } : { y: "0%", opacity: 1 }}
              transition={{ duration: 1.85, ease: LIFT, delay: 0.05 }}
            >
              {/* Lid — bianco puro come la scatola fisica */}
              <div className="absolute inset-0 rounded-2xl" style={{
                background: "#ffffff",
                boxShadow: "0 8px 40px rgba(0,0,0,0.14), 0 2px 8px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,1)",
                border: "1px solid rgba(180,175,170,0.35)",
              }} />
              {/* Satin sheen sottile */}
              <div className="absolute inset-0 rounded-2xl pointer-events-none" style={{
                background: "linear-gradient(118deg, transparent 25%, rgba(255,255,255,0.55) 44%, transparent 63%)",
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

/* ─── Gold bow SVG — bianco + oro acceso, brillantina ────────────────── */
function GoldBow() {
  return (
    <svg
      width="160" height="112"
      viewBox="0 0 160 112"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ opacity: 0.92 }}
    >
      <defs>
        {/* Oro caldo vero: #c8961e è "gold" percepito correttamente, non giallo.
            Highlights in bianco puro + oro chiaro per l'effetto sbrillucicante. */}
        <linearGradient id="gL" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%"   stopColor="#ffffff" />
          <stop offset="18%"  stopColor="#f0d060" />
          <stop offset="42%"  stopColor="#c8961e" />
          <stop offset="60%"  stopColor="#f0d060" />
          <stop offset="100%" stopColor="#ffffff" />
        </linearGradient>
        <linearGradient id="gR" x1="1" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#ffffff" />
          <stop offset="18%"  stopColor="#f0d060" />
          <stop offset="42%"  stopColor="#c8961e" />
          <stop offset="60%"  stopColor="#f0d060" />
          <stop offset="100%" stopColor="#ffffff" />
        </linearGradient>
        <linearGradient id="gK" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%"   stopColor="#f8e888" />
          <stop offset="45%"  stopColor="#c8961e" />
          <stop offset="100%" stopColor="#a07818" />
        </linearGradient>
        <linearGradient id="gT" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#ffffff" />
          <stop offset="30%"  stopColor="#f0d060" />
          <stop offset="100%" stopColor="#c8961e" />
        </linearGradient>
        <filter id="s" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="1" stdDeviation="2.5" floodColor="#7a5c10" floodOpacity="0.35" />
        </filter>
        <filter id="gl">
          <feGaussianBlur stdDeviation="1.8" result="b" />
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>

      {/* ── Loop sinistro ── */}
      <path
        d="M 76 62 C 62 42 32 12 10 24 C -2 31 1 52 20 58 C 38 64 68 65 76 62 Z"
        fill="url(#gL)" filter="url(#s)"
      />
      {/* Speculare bianco sul loop */}
      <path
        d="M 74 58 C 62 43 40 20 22 27"
        stroke="rgba(255,255,255,0.75)" strokeWidth="6" strokeLinecap="round"
      />

      {/* ── Loop destro ── */}
      <path
        d="M 84 62 C 98 42 128 12 150 24 C 162 31 159 52 140 58 C 122 64 92 65 84 62 Z"
        fill="url(#gR)" filter="url(#s)"
      />
      {/* Speculare bianco sul loop */}
      <path
        d="M 86 58 C 98 43 120 20 138 27"
        stroke="rgba(255,255,255,0.75)" strokeWidth="6" strokeLinecap="round"
      />

      {/* ── Coda sinistra ── */}
      <path d="M 70 72 C 54 86 38 98 22 108" stroke="url(#gT)" strokeWidth="15" strokeLinecap="round" filter="url(#s)" />
      <path d="M 70 72 C 54 86 38 98 22 108" stroke="rgba(255,255,255,0.55)" strokeWidth="5" strokeLinecap="round" />

      {/* ── Coda destra ── */}
      <path d="M 90 72 C 106 86 122 98 138 108" stroke="url(#gT)" strokeWidth="15" strokeLinecap="round" filter="url(#s)" />
      <path d="M 90 72 C 106 86 122 98 138 108" stroke="rgba(255,255,255,0.55)" strokeWidth="5" strokeLinecap="round" />

      {/* ── Nodo centrale ── */}
      <ellipse cx="80" cy="62" rx="17" ry="13" fill="url(#gK)" filter="url(#s)" />
      <ellipse cx="80" cy="57" rx="11" ry="7"  fill="rgba(255,255,255,0.65)" />

      {/* ── Sparkle — puntini bianchi brillantina ── */}
      <circle cx="28"  cy="38" r="2.5" fill="#ffffff" opacity="0.95" filter="url(#gl)" />
      <circle cx="132" cy="36" r="2.2" fill="#ffffff" opacity="0.90" filter="url(#gl)" />
      <circle cx="52"  cy="20" r="1.8" fill="#ffffff" opacity="0.85" filter="url(#gl)" />
      <circle cx="108" cy="20" r="1.8" fill="#ffffff" opacity="0.85" filter="url(#gl)" />
      <circle cx="80"  cy="40" r="1.6" fill="#ffffff" opacity="0.80" filter="url(#gl)" />
      <circle cx="40"  cy="56" r="1.5" fill="#ffffff" opacity="0.75" />
      <circle cx="120" cy="55" r="1.5" fill="#ffffff" opacity="0.75" />
      <circle cx="64"  cy="78" r="1.4" fill="#ffffff" opacity="0.70" />
      <circle cx="96"  cy="78" r="1.4" fill="#ffffff" opacity="0.70" />
    </svg>
  );
}
