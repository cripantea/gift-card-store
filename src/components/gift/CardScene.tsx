"use client";

import { useRef, useEffect, type ReactNode } from "react";
import gsap from "gsap";

// Hero resting rotation — after the cinematic sequence settles here
const BASE_RX =  3;   // rotateX final
const BASE_RY = -8;   // rotateY final (3/4 view, logo illuminated)

// 6 physically plausible dust particles — visible in the key-light beam
const DUST = Array.from({ length: 6 }, (_, i) => ({
  id: i,
  left: `${14 + (i * 17) % 72}%`,
  top:  `${20 + (i * 13) % 58}%`,
  r:    1.4 + (i % 3) * 0.55,
}));

export interface CardSceneProps {
  children: ReactNode;
  skipEntrance?: boolean;
}

export function CardScene({ children, skipEntrance = false }: CardSceneProps) {
  // ── Layer hierarchy ───────────────────────────────────────────────────
  // [dark container]      — jewelry-box ground + key-light halo
  //   sceneRef            — perspective container (CSS 3D root)
  //     entryRigRef       — GSAP: scale, x, y, filter, opacity (entry)
  //       floatRef        — GSAP: Y translation only (idle float sine)
  //         tiltRef       — GSAP: rotateX, rotateY ONLY
  //           cardFaceRef   — front face (VirtualGiftCard)
  //           cardEdgeRef   — right lateral edge (CSS 3D)
  //           cardEdgeLRef  — left lateral edge (CSS 3D)
  //           cardBackRef   — back face (CSS 3D, shows past ±90°)
  //           [overlays]    — stage, rimL/R, beam1/2, shimmer, glint, dust
  //     shadowRef         — contact ellipse, outside tiltRef
  const sceneRef     = useRef<HTMLDivElement>(null);
  const entryRigRef  = useRef<HTMLDivElement>(null);
  const floatRef     = useRef<HTMLDivElement>(null);
  const tiltRef      = useRef<HTMLDivElement>(null);
  const cardFaceRef  = useRef<HTMLDivElement>(null);
  const cardEdgeRef  = useRef<HTMLDivElement>(null);   // right edge
  const cardEdgeLRef = useRef<HTMLDivElement>(null);   // left edge
  const cardBackRef  = useRef<HTMLDivElement>(null);   // back face
  // Overlays (inside tiltRef — rotate with card in 3D)
  const stageRef     = useRef<HTMLDivElement>(null);
  const rimLRef      = useRef<HTMLDivElement>(null);
  const rimRRef      = useRef<HTMLDivElement>(null);
  const beam1Ref     = useRef<HTMLDivElement>(null);
  const beam2Ref     = useRef<HTMLDivElement>(null);
  const shimmerRef   = useRef<HTMLDivElement>(null);
  const glintRef     = useRef<HTMLDivElement>(null);
  const dustRef      = useRef<HTMLDivElement>(null);
  // Contact shadow (outside tiltRef)
  const shadowRef    = useRef<HTMLDivElement>(null);
  // Guard: disables parallax during the cinematic sequence
  const parallaxOk   = useRef(false);

  // ── Cinematic sequence ─────────────────────────────────────────────────
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const entryRig = entryRigRef.current;
    const tilt     = tiltRef.current;
    const float_   = floatRef.current;
    const stage    = stageRef.current;
    const rimL     = rimLRef.current;
    const rimR     = rimRRef.current;
    const beam1    = beam1Ref.current;
    const beam2    = beam2Ref.current;
    const shimmer  = shimmerRef.current;
    const glint    = glintRef.current;
    const dust     = dustRef.current;
    const shadow   = shadowRef.current;

    if (!entryRig || !tilt || !float_ || !stage || !rimL || !rimR || !beam1 || !beam2 || !shimmer || !glint || !dust || !shadow) return;

    if (reduced) {
      gsap.set(entryRig, { opacity: 1, clearProps: "filter,scale,y,x" });
      gsap.set(tilt,     { rotateX: BASE_RX, rotateY: BASE_RY });
      gsap.set(stage,    { opacity: 0 });
      parallaxOk.current = true;
      return;
    }

    const ctx = gsap.context(() => {

      function startIdle(delay: number) {
        gsap.to(float_, {
          y: -4, duration: 7.2, ease: "sine.inOut",
          repeat: -1, yoyo: true, delay,
        });
        gsap.to(shadow, {
          scaleX: 0.83, opacity: 0.42, duration: 7.2, ease: "sine.inOut",
          repeat: -1, yoyo: true, delay,
        });
        gsap.delayedCall(delay + 0.4, () => { parallaxOk.current = true; });

        function sched() {
          gsap.delayedCall(12 + Math.random() * 10, () => {
            gsap.fromTo(shimmer,
              { xPercent: -118, opacity: 1 },
              { xPercent: 118, duration: 1.58, ease: "power2.inOut", onComplete: sched }
            );
          });
        }
        gsap.delayedCall(delay + 2.5, sched);
      }

      // ── FULL ENTRANCE ─────────────────────────────────────────────────────
      if (!skipEntrance) {

        // Phase 0 — darkness. entryRig owns entry; tilt owns only rotation.
        gsap.set(entryRig, { opacity: 0, y: 72, x: -18, scale: 0.82, filter: "blur(18px)" });
        gsap.set(tilt,     { rotateX: 25, rotateY: -38 });
        gsap.set(stage,    { opacity: 0 });
        gsap.set([rimL, rimR, beam1, beam2, glint], { opacity: 0 });
        gsap.set(Array.from(dust.children), { opacity: 0 });
        gsap.set(shadow,   { opacity: 0, scaleX: 0.52 });

        const tl = gsap.timeline();

        // Phase 1 — card enters from below-left (0.28 – 2.3s)
        tl.to(entryRig, {
          opacity: 1, y: 0, x: 0, scale: 1.04,
          filter: "blur(0px)",
          duration: 1.95, ease: "power3.out",
        }, 0.28)
        .to(tilt, {
          rotateX: 2, rotateY: -28,
          duration: 1.95, ease: "power3.out",
        }, 0.28)
        .to(shadow, { opacity: 0.80, scaleX: 0.82, duration: 1.6, ease: "power3.out" }, 0.5)
        .to(rimL,   { opacity: 1, duration: 0.72, ease: "power2.out" }, 1.1)

        // Phase 2 — wide rotation reveal (2.3 – 5.1s)
        .to(tilt, {
          rotateY: 32, rotateX: -6,
          duration: 1.55, ease: "power2.inOut",
        }, 2.3)
        .to(entryRig, {
          scale: 1.07,
          duration: 1.55, ease: "power2.inOut",
        }, 2.3)
        .to(rimL,  { opacity: 0, duration: 0.42 }, 3.0)
        .to(rimR,  { opacity: 0.90, duration: 0.42 }, 3.0)
        .to(shadow, { scaleX: 1.14, x: 15, opacity: 0.68, duration: 1.0, ease: "power2.inOut" }, 2.3)
        .fromTo(beam1,
          { xPercent: -118, opacity: 0 },
          { xPercent: 118, opacity: 0.78, duration: 0.90, ease: "sine.inOut" },
          2.85
        )
        .to(tilt, {
          rotateY: BASE_RY, rotateX: BASE_RX,
          duration: 1.45, ease: "power2.out",
        }, 3.85)
        .to(entryRig, {
          scale: 1.0,
          duration: 1.45, ease: "power2.out",
        }, 3.85)
        .to(rimR,   { opacity: 0, duration: 1.0, ease: "power2.inOut" }, 3.85)
        .to(shadow, { scaleX: 0.88, x: -5, opacity: 0.60, duration: 1.2, ease: "power2.out" }, 3.85)

        // Phase 3 — hero moment (5.1 – 7.0s)
        .fromTo(beam2,
          { xPercent: -118, opacity: 0 },
          { xPercent: 118, opacity: 0.70, duration: 1.20, ease: "power2.inOut" },
          5.15
        )
        .to(glint, { opacity: 1, scale: 1.8, duration: 0.27, ease: "power2.out" }, 5.22)
        .to(glint, { opacity: 0, scale: 2.5, duration: 0.55, ease: "power2.in" }, 5.49)
        .to(Array.from(dust.children), {
          opacity: 0.65, y: "-=14", stagger: 0.055, duration: 1.7, ease: "power2.out",
        }, 5.2)
        .to(Array.from(dust.children), {
          opacity: 0, stagger: { each: 0.04, from: "random" }, duration: 2.2, ease: "power1.in",
        }, "+=1.6")
        .to(shadow, { opacity: 0.58, scaleX: 0.86, x: -4, duration: 1.0 }, 5.4)
        .set([rimL, rimR, beam1, beam2], { opacity: 0 }, 7.0)

        tl.call(() => { startIdle(0.25); }, [], 7.1);

      // ── SKIP ENTRANCE (inside UnwrappingExperience) ───────────────────────
      } else {

        // FM wrapper owns: opacity 0→1, y 48→0. GSAP owns everything below.
        gsap.set(entryRig, { opacity: 1, clearProps: "filter,scale,y,x" });
        gsap.set(tilt,     { rotateX: -2, rotateY: -32 });
        gsap.set(stage,    { opacity: 0 });
        gsap.set([rimL, rimR, beam1, beam2, glint], { opacity: 0 });
        gsap.set(Array.from(dust.children), { opacity: 0 });
        gsap.set(shadow,   { opacity: 0, scaleX: 0.62 });

        const tl = gsap.timeline({ delay: 0.08 });

        tl.to(tilt, { rotateY: 30, rotateX: -5, duration: 1.05, ease: "power2.inOut" })
        .to(entryRig, { scale: 1.12, duration: 1.05, ease: "power2.inOut" }, "<")
        .fromTo(beam1,
          { xPercent: -118, opacity: 0 },
          { xPercent: 118, opacity: 0.72, duration: 0.80, ease: "power2.inOut" },
          0.65
        )
        .set(beam1, { opacity: 0 }, 1.5)
        .to(shadow, { opacity: 0.58, scaleX: 0.88, duration: 0.80, ease: "power2.out" }, 0.4)
        .to(tilt, {
          rotateY: BASE_RY, rotateX: BASE_RX,
          duration: 0.82, ease: "back.out(1.5)",
        }, 1.05)
        .to(entryRig, {
          scale: 1.0,
          duration: 0.82, ease: "back.out(1.5)",
        }, 1.05)
        .to(glint, { opacity: 1, scale: 1.6, duration: 0.23, ease: "power2.out" }, 1.7)
        .to(glint, { opacity: 0, scale: 2.2, duration: 0.48, ease: "power2.in" }, 1.93)
        .to(Array.from(dust.children), {
          opacity: 0.52, y: "-=12", stagger: 0.05, duration: 1.3, ease: "power2.out",
        }, 1.75)
        .to(Array.from(dust.children), {
          opacity: 0, stagger: { each: 0.04, from: "random" }, duration: 1.8, ease: "power1.in",
        }, "+=1.0")
        .set([rimL, rimR, beam1, beam2], { opacity: 0 })

        tl.call(() => { startIdle(0.2); });
      }

    }, sceneRef);

    return () => ctx.revert();
  }, [skipEntrance]);

  // ── Mouse parallax — desktop only, active after sequence ──────────────
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (window.matchMedia("(max-width: 768px)").matches) return;

    const scene  = sceneRef.current;
    const tilt   = tiltRef.current;
    const shadow = shadowRef.current;
    if (!scene || !tilt) return;

    function onMove(e: MouseEvent) {
      if (!parallaxOk.current) return;
      const r  = scene!.getBoundingClientRect();
      const nx = ((e.clientX - r.left) / r.width  - 0.5) * 2;
      const ny = ((e.clientY - r.top)  / r.height - 0.5) * 2;
      gsap.to(tilt, {
        rotateX: BASE_RX - ny * 2.5,
        rotateY: BASE_RY + nx * 2.5,
        duration: 1.12, ease: "power3.out", overwrite: "auto",
      });
      if (shadow) {
        gsap.to(shadow, {
          x: nx * 9, y: ny * 4,
          duration: 1.12, ease: "power3.out", overwrite: "auto",
        });
      }
    }

    function onLeave() {
      if (!parallaxOk.current) return;
      gsap.to(tilt, {
        rotateX: BASE_RX, rotateY: BASE_RY,
        duration: 2.2, ease: "power3.out", overwrite: "auto",
      });
      if (shadow) {
        gsap.to(shadow, {
          x: 0, y: 0,
          duration: 2.2, ease: "power3.out", overwrite: "auto",
        });
      }
    }

    scene.addEventListener("mousemove", onMove);
    scene.addEventListener("mouseleave", onLeave);
    return () => {
      scene.removeEventListener("mousemove", onMove);
      scene.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return (
    <div
      className="relative rounded-3xl"
      style={{
        padding: "20px 16px 44px",
        overflow: "hidden",
      }}
    >

      <div ref={sceneRef} className="relative" style={{ perspective: "600px" }}>

        {/* Entry rig — GSAP: scale, x, y, filter, opacity.
            FM (parent in UnwrappingExperience) owns opacity + y of its own wrapper;
            those never overlap with anything in entryRig. */}
        <div ref={entryRigRef}>

          {/* Float — GSAP: Y-only idle sine */}
          <div ref={floatRef}>

            {/* Tilt — GSAP: rotateX, rotateY ONLY. transformStyle:preserve-3d
                makes the CSS 3D card faces participate in the perspective. */}
            <div
              ref={tiltRef}
              className="relative"
              style={{ transformStyle: "preserve-3d", willChange: "transform" }}
            >

              {/* ── CSS 3D card body ──────────────────────────────────────── */}

              {/* Front face. backfaceVisibility:hidden prepares for a future
                  CSS 3D flip — at current rotation angles (max ±32°) the front
                  is always toward the viewer so this has no visual effect yet. */}
              <div ref={cardFaceRef} style={{ backfaceVisibility: "hidden" }}>
                {children}
              </div>

              {/* Right lateral edge — visible when rotateY < 0 (right side
                  toward viewer, e.g. BASE_RY = -8°). Gradient fades to
                  transparent at ~80% height so the message card below the
                  credit card doesn't appear to have unnatural bulk. */}
              <div
                ref={cardEdgeRef}
                aria-hidden
                style={{
                  position: "absolute",
                  top: 0,
                  right: 0,
                  bottom: 0,
                  width: "6px",
                  transformOrigin: "right center",
                  transform: "rotateY(90deg)",
                  backfaceVisibility: "hidden",
                  background: "linear-gradient(to bottom, rgba(218,210,196,0.92) 0%, rgba(200,190,176,0.80) 58%, transparent 82%)",
                }}
              />

              {/* Left lateral edge — visible when rotateY > 0 (left side
                  toward viewer, during the right-sweep peak). */}
              <div
                ref={cardEdgeLRef}
                aria-hidden
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  bottom: 0,
                  width: "6px",
                  transformOrigin: "left center",
                  transform: "rotateY(-90deg)",
                  backfaceVisibility: "hidden",
                  background: "linear-gradient(to bottom, rgba(218,210,196,0.92) 0%, rgba(200,190,176,0.80) 58%, transparent 82%)",
                }}
              />

              {/* Back face — dark charcoal, matches the jewelry-box ground.
                  Only visible past ±90° (reserved for future flip sequence). */}
              <div
                ref={cardBackRef}
                aria-hidden
                style={{
                  position: "absolute",
                  inset: 0,
                  transform: "rotateY(180deg)",
                  backfaceVisibility: "hidden",
                  borderRadius: "16px",
                  background: "linear-gradient(148deg, #1c1f2d 0%, #121520 100%)",
                  border: "1px solid rgba(255,248,232,0.05)",
                }}
              />

              {/* ── Lighting overlays (co-rotate with card in 3D) ─────────── */}

              {/* Dark veil — near-black plane, z:21 covers card content during
                  opening; rim lights + beams above reveal glowing edges before
                  the card is unveiled. */}
              <div
                ref={stageRef}
                aria-hidden
                className="pointer-events-none absolute inset-0 rounded-2xl"
                style={{ background: "rgba(3,4,15,0.91)", zIndex: 21, opacity: 0 }}
              />

              {/* Rim light — left edge. Fill side opposite the key light.
                  Width reduced to 22px for tighter, more physical falloff. */}
              <div
                ref={rimLRef}
                aria-hidden
                className="pointer-events-none absolute inset-y-0 left-0"
                style={{
                  width: "22px",
                  background: "linear-gradient(to right, rgba(255,250,238,0.72) 0%, rgba(255,248,230,0.22) 50%, transparent 100%)",
                  filter: "blur(5px)",
                  zIndex: 26,
                  opacity: 0,
                }}
              />
              {/* Rim light — right edge. Key-light side, slightly warmer. */}
              <div
                ref={rimRRef}
                aria-hidden
                className="pointer-events-none absolute inset-y-0 right-0"
                style={{
                  width: "22px",
                  background: "linear-gradient(to left, rgba(255,250,238,0.68) 0%, rgba(255,248,230,0.18) 50%, transparent 100%)",
                  filter: "blur(5px)",
                  zIndex: 26,
                  opacity: 0,
                }}
              />

              {/* Beam 1 — key-light specular at rotation peak. Warm white
                  matches the halo source above. */}
              <div
                ref={beam1Ref}
                aria-hidden
                className="pointer-events-none absolute inset-0"
                style={{
                  background: "linear-gradient(108deg, transparent 30%, rgba(255,248,230,0.38) 44%, rgba(255,252,240,0.54) 50%, rgba(255,248,230,0.38) 56%, transparent 70%)",
                  transform: "translateX(-118%)",
                  zIndex: 23,
                  opacity: 0,
                }}
              />
              {/* Beam 2 — hero moment specular. Slightly warmer to echo the halo. */}
              <div
                ref={beam2Ref}
                aria-hidden
                className="pointer-events-none absolute inset-0"
                style={{
                  background: "linear-gradient(103deg, transparent 26%, rgba(255,244,210,0.32) 42%, rgba(255,250,230,0.50) 50%, rgba(255,244,210,0.32) 58%, transparent 74%)",
                  transform: "translateX(-118%)",
                  zIndex: 23,
                  opacity: 0,
                }}
              />
              {/* Shimmer — post-sequence idle specular glide.
                  GSAP sets opacity:1 during sweep only; never visible at rest. */}
              <div
                ref={shimmerRef}
                aria-hidden
                className="pointer-events-none absolute inset-0"
                style={{
                  background: "linear-gradient(108deg, transparent 33%, rgba(255,248,225,0.18) 47%, rgba(255,252,235,0.28) 50%, rgba(255,248,225,0.18) 53%, transparent 67%)",
                  zIndex: 22,
                  opacity: 0,
                }}
              />

              {/* Logo glint — focused specular on the MAD mark at hero moment */}
              <div
                ref={glintRef}
                aria-hidden
                className="pointer-events-none absolute"
                style={{
                  top: "19%", left: "50%",
                  transform: "translate(-50%, -50%) scale(1)",
                  width: "54px", height: "54px",
                  borderRadius: "50%",
                  background: "radial-gradient(circle, rgba(255,255,255,0.94) 0%, rgba(255,248,220,0.50) 38%, transparent 70%)",
                  filter: "blur(4px)",
                  zIndex: 28,
                  opacity: 0,
                }}
              />

              {/* Dust — 6 particles, physically plausible in key-light beam.
                  GSAP floats them upward at the hero moment then fades out. */}
              <div
                ref={dustRef}
                aria-hidden
                className="pointer-events-none absolute inset-0"
                style={{ zIndex: 24 }}
              >
                {DUST.map((p) => (
                  <div
                    key={p.id}
                    style={{
                      position: "absolute",
                      left: p.left,
                      top: p.top,
                      width: `${p.r}px`,
                      height: `${p.r}px`,
                      borderRadius: "50%",
                      background: "rgba(255,248,220,0.85)",
                      boxShadow: `0 0 ${p.r * 2.4}px rgba(255,240,200,0.45)`,
                      opacity: 0,
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Contact shadow — ellipse on the jewelry-box floor.
            Warmer and more opaque than on a white surface. */}
        <div
          ref={shadowRef}
          aria-hidden
          className="pointer-events-none absolute inset-x-10 -bottom-3"
          style={{
            height: 18,
            background: "rgba(2, 3, 16, 0.78)",
            filter: "blur(22px)",
            borderRadius: "50%",
            transformOrigin: "center center",
          }}
        />
      </div>
    </div>
  );
}
