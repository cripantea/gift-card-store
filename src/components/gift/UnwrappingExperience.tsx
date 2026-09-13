"use client";

import { useState, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { markGiftCardAsOpened } from "@/app/gift/[token]/actions";

type Stage = "idle" | "shaking" | "opening" | "rising" | "revealed";

interface UnwrappingExperienceProps {
  secretToken: string;
  children: ReactNode;
}

const PARTICLES = Array.from({ length: 20 }, (_, i) => {
  const angle = (i / 20) * 360;
  const r = 72 + (i % 4) * 20;
  return {
    id: i,
    x: Math.cos((angle * Math.PI) / 180) * r,
    y: Math.sin((angle * Math.PI) / 180) * r - 20,
    size: 3 + (i % 3),
    delay: (i % 7) * 0.03,
    color: ["#f6c453", "#fde9a8", "#c3a06a", "#f0d080", "#a4794b"][i % 5],
  };
});

const RAYS = Array.from({ length: 9 }, (_, i) => ({
  id: i,
  rotate: (i - 4) * 16,
  height: 44 + i * 8,
  delay: i * 0.035,
}));

export function UnwrappingExperience({ secretToken, children }: UnwrappingExperienceProps) {
  const [stage, setStage] = useState<Stage>("idle");

  function handleOpen() {
    if (stage !== "idle") return;
    markGiftCardAsOpened(secretToken).catch(console.error);
    setStage("shaking");
    setTimeout(() => setStage("opening"), 950);
    setTimeout(() => setStage("rising"), 1500);
    setTimeout(() => setStage("revealed"), 2750);
  }

  if (stage === "revealed") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 36, scale: 0.92 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 1.0, ease: [0.22, 1, 0.36, 1] }}
      >
        {children}
      </motion.div>
    );
  }

  const isOpen = stage === "opening" || stage === "rising";

  return (
    <div className="flex flex-col items-center gap-10 py-6 text-center select-none">
      {/* ── Scene ─────────────────────────────────────────────────────── */}
      <div className="relative flex justify-center" style={{ width: 280, height: 320 }}>

        {/* Radial bloom */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              key="bloom"
              className="absolute inset-0 pointer-events-none"
              style={{ background: "radial-gradient(ellipse 60% 55% at 50% 68%, rgba(246,196,83,0.5) 0%, transparent 75%)" }}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1.3 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
            />
          )}
        </AnimatePresence>

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
                bottom: 168,
                left: "50%",
                marginLeft: -(p.size / 2),
              }}
              initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
              animate={{ x: p.x, y: p.y, opacity: 0, scale: 0 }}
              transition={{ duration: 1.05, delay: p.delay, ease: [0.22, 1, 0.36, 1] }}
            />
          ))}
        </AnimatePresence>

        {/* Rising card preview */}
        <AnimatePresence>
          {stage === "rising" && (
            <motion.div
              key="rising-card"
              className="absolute pointer-events-none"
              style={{ bottom: 130, left: "50%", marginLeft: -56, zIndex: 10 }}
              initial={{ y: 30, opacity: 0, scale: 0.82, rotateY: -12 }}
              animate={{ y: -100, opacity: 1, scale: 1, rotateY: 0 }}
              transition={{ duration: 1.15, ease: [0.22, 1, 0.36, 1] }}
            >
              <div
                className="rounded-xl shadow-2xl"
                style={{
                  width: 112,
                  height: 70,
                  background: "linear-gradient(135deg, #fde9a8 0%, #f6c453 45%, #b9822f 78%, #8a5a1f 100%)",
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Box (centering wrapper so Framer Motion transforms are offsets only) */}
        <div className="absolute flex justify-center" style={{ bottom: 50, left: 0, right: 0 }}>
          <motion.div
            className="relative"
            style={{ width: 160 }}
            animate={
              stage === "shaking"
                ? { x: [0, -9, 9, -7, 7, -4, 4, -2, 2, 0], rotate: [0, -3.5, 3.5, -2.5, 2.5, -1, 1, 0] }
                : { y: [0, -7, 0] }
            }
            transition={
              stage === "shaking"
                ? { duration: 0.9, ease: "easeInOut" }
                : { duration: 3.2, repeat: Infinity, ease: "easeInOut", repeatType: "mirror" }
            }
          >
            {/* Drop shadow */}
            <motion.div
              className="absolute rounded-full pointer-events-none"
              style={{ width: 120, height: 16, bottom: -6, left: "50%", marginLeft: -60, background: "rgba(0,0,0,0.18)", filter: "blur(10px)" }}
              animate={isOpen ? { scaleX: 0.65, opacity: 0.5 } : { scaleX: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
            />

            {/* Light rays */}
            <AnimatePresence>
              {isOpen && (
                <div className="absolute pointer-events-none" style={{ top: -30, left: "50%", marginLeft: -1 }}>
                  {RAYS.map((ray) => (
                    <motion.div
                      key={ray.id}
                      className="absolute"
                      style={{
                        width: 2.5,
                        height: ray.height,
                        bottom: 0,
                        left: 0,
                        background: "linear-gradient(to top, rgba(246,196,83,0.95), transparent)",
                        rotate: ray.rotate,
                        transformOrigin: "bottom center",
                      }}
                      initial={{ scaleY: 0, opacity: 0 }}
                      animate={{ scaleY: 1, opacity: 0.85 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.45, delay: ray.delay, ease: [0.22, 1, 0.36, 1] }}
                    />
                  ))}
                </div>
              )}
            </AnimatePresence>

            {/* Lid */}
            <div style={{ perspective: 700 }}>
              <motion.div
                className="absolute left-0 right-0 overflow-visible"
                style={{ top: -40, height: 44, transformOrigin: "top center", zIndex: 20 }}
                animate={
                  isOpen
                    ? { y: -170, rotateZ: -20, rotateX: 50, opacity: 0 }
                    : { y: 0, rotateZ: 0, rotateX: 0, opacity: 1 }
                }
                transition={{ duration: 0.65, ease: [0.34, 1.56, 0.64, 1] }}
              >
                {/* Lid surface */}
                <div
                  className="absolute inset-0 rounded-t-2xl shadow-md"
                  style={{ background: "linear-gradient(180deg, #f8f8f8 0%, #e0e0e0 100%)" }}
                />
                <div className="absolute inset-y-0 right-0 w-8 rounded-tr-2xl" style={{ background: "linear-gradient(to left, rgba(0,0,0,0.08), transparent)" }} />

                {/* Horizontal ribbon – lid */}
                <div
                  className="absolute inset-x-0"
                  style={{
                    top: 9,
                    height: 22,
                    background: "linear-gradient(180deg, #fde9a8 0%, #f6c453 28%, #b9822f 70%, #8a5a1f 100%)",
                    boxShadow: "0 2px 5px rgba(0,0,0,0.18)",
                  }}
                />
                {/* Vertical ribbon – lid */}
                <div
                  className="absolute inset-y-0 left-1/2 -translate-x-1/2"
                  style={{
                    width: 22,
                    background: "linear-gradient(90deg, #8a5a1f 0%, #f6c453 38%, #fde9a8 50%, #f6c453 62%, #8a5a1f 100%)",
                  }}
                />

                {/* Bow */}
                <div className="absolute left-1/2 -translate-x-1/2 -top-10" style={{ width: 120, height: 52 }}>
                  {/* Left loop */}
                  <div style={{ position: "absolute", width: 50, height: 34, right: "50%", top: "50%", borderRadius: "50%", transform: "translate(16px, -50%) rotate(-40deg)", background: "linear-gradient(135deg, #fde9a8 0%, #f6c453 50%, #9a6820 100%)", boxShadow: "2px 2px 7px rgba(0,0,0,0.22)" }} />
                  {/* Right loop */}
                  <div style={{ position: "absolute", width: 50, height: 34, left: "50%", top: "50%", borderRadius: "50%", transform: "translate(-16px, -50%) rotate(40deg)", background: "linear-gradient(315deg, #fde9a8 0%, #f6c453 50%, #9a6820 100%)", boxShadow: "2px 2px 7px rgba(0,0,0,0.22)" }} />
                  {/* Left tail */}
                  <div style={{ position: "absolute", left: "50%", top: "100%", width: 12, height: 24, marginLeft: -18, borderRadius: "0 0 4px 4px", background: "linear-gradient(180deg, #f6c453, #8a5a1f)", transform: "rotate(-10deg)", transformOrigin: "top center" }} />
                  {/* Right tail */}
                  <div style={{ position: "absolute", left: "50%", top: "100%", width: 12, height: 24, marginLeft: 6, borderRadius: "0 0 4px 4px", background: "linear-gradient(180deg, #f6c453, #8a5a1f)", transform: "rotate(10deg)", transformOrigin: "top center" }} />
                  {/* Knot */}
                  <div style={{ position: "absolute", left: "50%", top: "50%", width: 18, height: 18, marginLeft: -9, marginTop: -9, transform: "rotate(45deg)", borderRadius: 4, background: "linear-gradient(135deg, #fde9a8 0%, #c3a06a 50%, #8a5a1f 100%)", boxShadow: "0 1px 5px rgba(0,0,0,0.32)" }} />
                </div>
              </motion.div>
            </div>

            {/* Box body */}
            <div className="relative overflow-hidden rounded-b-2xl" style={{ height: 110 }}>
              <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #f2f2f2 0%, #d8d8d8 100%)" }} />
              <div className="absolute inset-y-0 right-0 w-10" style={{ background: "linear-gradient(to left, rgba(0,0,0,0.1), transparent)" }} />
              <div className="absolute inset-y-0 left-0 w-5" style={{ background: "linear-gradient(to right, rgba(255,255,255,0.5), transparent)" }} />
              <div className="absolute bottom-0 left-0 right-0 h-8" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.1), transparent)" }} />

              {/* Horizontal ribbon – body */}
              <div
                className="absolute inset-x-0"
                style={{ top: 33, height: 22, background: "linear-gradient(180deg, #fde9a8 0%, #f6c453 28%, #b9822f 70%, #8a5a1f 100%)", boxShadow: "0 2px 6px rgba(0,0,0,0.2)" }}
              />
              {/* Vertical ribbon – body */}
              <div
                className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2"
                style={{ width: 22, background: "linear-gradient(90deg, #8a5a1f 0%, #f6c453 38%, #fde9a8 50%, #f6c453 62%, #8a5a1f 100%)" }}
              />

              {/* Inner light when open */}
              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    key="inner-light"
                    className="absolute inset-0"
                    style={{ background: "linear-gradient(to top, rgba(246,196,83,0.18), rgba(255,240,180,0.55))" }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.45 }}
                  />
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── Copy ──────────────────────────────────────────────────────── */}
      <motion.div
        className="flex flex-col items-center gap-1"
        animate={stage !== "idle" ? { opacity: 0, y: -10, pointerEvents: "none" } : { opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <p className="font-display text-2xl font-semibold text-ink">Hai ricevuto un regalo</p>
        <p className="max-w-xs text-sm text-ink-soft">
          Qualcuno ha pensato a te con una Gift Card MAD Vigevano.
        </p>
      </motion.div>

      {/* ── CTA ───────────────────────────────────────────────────────── */}
      <motion.button
        type="button"
        onClick={handleOpen}
        disabled={stage !== "idle"}
        className="rounded-full bg-ink px-8 py-4 text-base font-medium text-paper disabled:cursor-not-allowed"
        whileHover={stage === "idle" ? { scale: 1.04 } : {}}
        whileTap={stage === "idle" ? { scale: 0.96 } : {}}
        animate={stage !== "idle" ? { opacity: 0, y: 12, pointerEvents: "none" } : { opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        Apri il tuo Regalo
      </motion.button>
    </div>
  );
}
