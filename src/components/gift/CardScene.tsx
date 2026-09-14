"use client";

import { useRef, useEffect, type ReactNode } from "react";
import gsap from "gsap";

// Hero resting rotation — after the cinematic sequence settles here
const BASE_RX =  3;   // rotateX final
const BASE_RY = -8;   // rotateY final (3/4 view, logo illuminated)

// 18 micro dust particles — spread across the card face
const DUST = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  left: `${6 + (i * 5.2) % 88}%`,
  top:  `${7 + (i * 7.7) % 72}%`,
  r:    1.1 + (i % 4) * 0.45,   // radius px
}));

export interface CardSceneProps {
  children: ReactNode;
  skipEntrance?: boolean;
}

export function CardScene({ children, skipEntrance = false }: CardSceneProps) {
  const sceneRef   = useRef<HTMLDivElement>(null);
  const floatRef   = useRef<HTMLDivElement>(null);
  const tiltRef    = useRef<HTMLDivElement>(null);
  // Overlays (inside tiltRef — rotate with card in 3D)
  const stageRef   = useRef<HTMLDivElement>(null);  // dark opening veil
  const rimLRef    = useRef<HTMLDivElement>(null);  // cold blue left edge
  const rimRRef    = useRef<HTMLDivElement>(null);  // cold blue right edge
  const beam1Ref   = useRef<HTMLDivElement>(null);  // diagonal beam during rotation
  const beam2Ref   = useRef<HTMLDivElement>(null);  // hero moment beam
  const shimmerRef = useRef<HTMLDivElement>(null);  // idle shimmer
  const glintRef   = useRef<HTMLDivElement>(null);  // logo flash at hero moment
  const dustRef    = useRef<HTMLDivElement>(null);  // dust particle container
  // Shadow below card (outside tiltRef — doesn't rotate)
  const shadowRef  = useRef<HTMLDivElement>(null);
  // Guard: disables parallax during the cinematic sequence
  const parallaxOk = useRef(false);

  // ── Cinematic sequence ─────────────────────────────────────────────────
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const tilt    = tiltRef.current;
    const float_  = floatRef.current;
    const stage   = stageRef.current;
    const rimL    = rimLRef.current;
    const rimR    = rimRRef.current;
    const beam1   = beam1Ref.current;
    const beam2   = beam2Ref.current;
    const shimmer = shimmerRef.current;
    const glint   = glintRef.current;
    const dust    = dustRef.current;
    const shadow  = shadowRef.current;

    if (!tilt || !float_ || !stage || !rimL || !rimR || !beam1 || !beam2 || !shimmer || !glint || !dust || !shadow) return;

    if (reduced) {
      gsap.set(tilt,  { opacity: 1, rotateX: BASE_RX, rotateY: BASE_RY, clearProps: "filter,scale,y,x" });
      gsap.set(stage, { opacity: 0 });
      parallaxOk.current = true;
      return;
    }

    const ctx = gsap.context(() => {

      // Schedules the post-sequence idle float + shimmer and enables parallax
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
              { xPercent: -118 },
              { xPercent: 118, duration: 1.58, ease: "power2.inOut", onComplete: sched }
            );
          });
        }
        gsap.delayedCall(delay + 2.5, sched);
      }

      // ── FULL ENTRANCE ─────────────────────────────────────────────────────
      if (!skipEntrance) {

        // Phase 0 — darkness
        gsap.set(tilt,   { opacity: 0, y: 72, x: -18, scale: 0.82, filter: "blur(18px)", rotateX: 25, rotateY: -38 });
        gsap.set(stage,  { opacity: 0.91 });
        gsap.set([rimL, rimR, beam1, beam2, glint], { opacity: 0 });
        gsap.set(Array.from(dust.children), { opacity: 0 });
        gsap.set(shadow, { opacity: 0, scaleX: 0.52 });

        const tl = gsap.timeline();

        // Phase 1 — card enters from below-left (0.28 – 2.3s)
        // scale overshoots 1.04 → feels like camera pushing IN
        tl.to(tilt, {
          opacity: 1, y: 0, x: 0, scale: 1.04,
          filter: "blur(0px)", rotateX: 2, rotateY: -22,
          duration: 1.95, ease: "power3.out",
        }, 0.28)
        .to(stage,  { opacity: 0.50, duration: 1.2, ease: "power2.out" }, 0.28)
        .to(shadow, { opacity: 0.80, scaleX: 0.82, duration: 1.6, ease: "power3.out" }, 0.5)
        .to(rimL,   { opacity: 1, duration: 0.72, ease: "power2.out" }, 1.1)

        // Phase 2 — wide rotation reveal (2.3 – 5.1s)
        .to(tilt, {
          rotateY: 24, rotateX: -5, scale: 1.06,
          duration: 1.55, ease: "power2.inOut",
        }, 2.3)
        // rim switches sides as card turns right
        .to(rimL,  { opacity: 0, duration: 0.42 }, 3.0)
        .to(rimR,  { opacity: 0.90, duration: 0.42 }, 3.0)
        // shadow shifts with tilt
        .to(shadow, { scaleX: 1.14, x: 15, opacity: 0.68, duration: 1.0, ease: "power2.inOut" }, 2.3)
        // diagonal beam at rotation peak
        .fromTo(beam1,
          { xPercent: -118, opacity: 0 },
          { xPercent: 118, opacity: 0.78, duration: 0.90, ease: "sine.inOut" },
          2.85
        )
        // return to hero angle
        .to(tilt, {
          rotateY: BASE_RY, rotateX: BASE_RX, scale: 1.0,
          duration: 1.45, ease: "power2.out",
        }, 3.85)
        .to(rimR,   { opacity: 0.34, duration: 1.0, ease: "power2.inOut" }, 3.85)
        .to(shadow, { scaleX: 0.88, x: -5, opacity: 0.60, duration: 1.2, ease: "power2.out" }, 3.85)

        // Phase 3 — hero moment (5.1 – 7.0s)
        .to(stage, { opacity: 0, duration: 1.55, ease: "power2.inOut" }, 4.4)
        // hero beam sweeps through
        .fromTo(beam2,
          { xPercent: -118, opacity: 0 },
          { xPercent: 118, opacity: 0.70, duration: 1.20, ease: "power2.inOut" },
          5.15
        )
        // logo glint — flash and expand
        .to(glint, { opacity: 1, scale: 1.8, duration: 0.27, ease: "power2.out" }, 5.22)
        .to(glint, { opacity: 0, scale: 2.5, duration: 0.55, ease: "power2.in" }, 5.49)
        // dust rises and fades
        .to(Array.from(dust.children), {
          opacity: 0.65, y: "-=14", stagger: 0.055, duration: 1.7, ease: "power2.out",
        }, 5.2)
        .to(Array.from(dust.children), {
          opacity: 0, stagger: { each: 0.04, from: "random" }, duration: 2.2, ease: "power1.in",
        }, "+=1.6")
        .to(shadow, { opacity: 0.58, scaleX: 0.86, x: -4, duration: 1.0 }, 5.4)

        // Phase 4 — idle
        tl.call(() => { startIdle(0.25); }, [], 7.1);

      // ── SKIP ENTRANCE (inside UnwrappingExperience) ───────────────────────
      } else {

        gsap.set(tilt,  { opacity: 1, rotateX: 0, rotateY: 0, clearProps: "filter,scale,y,x" });
        gsap.set(stage, { opacity: 0 });
        gsap.set([rimL, rimR, beam1, beam2, glint], { opacity: 0 });
        gsap.set(Array.from(dust.children), { opacity: 0 });
        gsap.set(shadow, { opacity: 0.62, scaleX: 0.88 });

        // wait for Framer Motion entrance (1.7 s rise) then do condensed rotation
        const tl = gsap.timeline({ delay: 2.1 });

        tl.to(tilt, { rotateY: -22, rotateX: 2, duration: 0.68, ease: "power3.out" })
        .to(rimL,   { opacity: 0.90, duration: 0.38 }, 0.5)
        .to(tilt,   { rotateY: 22, rotateX: -4, scale: 1.04, duration: 1.30, ease: "power2.inOut" })
        .fromTo(beam1,
          { xPercent: -118, opacity: 0 },
          { xPercent: 118, opacity: 0.74, duration: 0.88, ease: "sine.inOut" }, 1.28
        )
        .to(rimL,   { opacity: 0, duration: 0.40 }, 1.52)
        .to(rimR,   { opacity: 0.88, duration: 0.40 }, 1.52)
        .to(tilt,   { rotateY: BASE_RY, rotateX: BASE_RX, scale: 1.0, duration: 1.30, ease: "power2.out" })
        .to(rimR,   { opacity: 0.32, duration: 0.90, ease: "power2.inOut" }, "-=0.8")
        .to(shadow, { scaleX: 0.88, x: -4, opacity: 0.60, duration: 1.0 }, "-=0.8")
        .fromTo(beam2,
          { xPercent: -118, opacity: 0 },
          { xPercent: 118, opacity: 0.64, duration: 1.12, ease: "power2.inOut" }, "-=0.1"
        )
        .to(glint, { opacity: 1, scale: 1.65, duration: 0.24, ease: "power2.out" }, "-=0.72")
        .to(glint, { opacity: 0, scale: 2.10, duration: 0.50, ease: "power2.in" }, "-=0.47")
        .to(Array.from(dust.children), {
          opacity: 0.58, y: "-=13", stagger: 0.05, duration: 1.5, ease: "power2.out",
        }, "-=0.95")
        .to(Array.from(dust.children), {
          opacity: 0, stagger: { each: 0.04, from: "random" }, duration: 2.0, ease: "power1.in",
        }, "+=1.4")

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
    <div ref={sceneRef} className="relative" style={{ perspective: "660px" }}>

      {/* Float layer — Y translation only */}
      <div ref={floatRef}>

        {/* Tilt layer — 3D rotations, all overlays rotate with the card */}
        <div
          ref={tiltRef}
          className="relative"
          style={{ transformStyle: "preserve-3d", willChange: "transform" }}
        >
          {children}

          {/* Dark veil — near-black plane over the card during opening.
              z:21 covers card content; rim lights + beams above it reveal
              glowing edges in the dark before the card is unveiled. */}
          <div
            ref={stageRef}
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-2xl"
            style={{ background: "rgba(3,4,15,0.91)", zIndex: 21, opacity: 0 }}
          />

          {/* Rim light — left edge, cold blue (card facing left during entry) */}
          <div
            ref={rimLRef}
            aria-hidden
            className="pointer-events-none absolute inset-y-0 left-0"
            style={{
              width: "26px",
              background: "linear-gradient(to right, rgba(120,165,255,0.82) 0%, rgba(120,165,255,0.28) 55%, transparent 100%)",
              filter: "blur(7px)",
              zIndex: 26,
              opacity: 0,
            }}
          />
          {/* Rim light — right edge, slightly warmer cold (card facing right during sweep) */}
          <div
            ref={rimRRef}
            aria-hidden
            className="pointer-events-none absolute inset-y-0 right-0"
            style={{
              width: "26px",
              background: "linear-gradient(to left, rgba(175,208,255,0.78) 0%, rgba(175,208,255,0.24) 55%, transparent 100%)",
              filter: "blur(7px)",
              zIndex: 26,
              opacity: 0,
            }}
          />

          {/* Beam 1 — diagonal cold stripe, sweeps at rotation peak */}
          <div
            ref={beam1Ref}
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background: "linear-gradient(108deg, transparent 30%, rgba(192,215,255,0.46) 45%, rgba(212,232,255,0.62) 50%, rgba(192,215,255,0.46) 55%, transparent 70%)",
              transform: "translateX(-118%)",
              zIndex: 23,
              opacity: 0,
            }}
          />
          {/* Beam 2 — slightly wider, softer; hero moment */}
          <div
            ref={beam2Ref}
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background: "linear-gradient(103deg, transparent 26%, rgba(202,222,255,0.38) 43%, rgba(228,242,255,0.62) 50%, rgba(202,222,255,0.38) 57%, transparent 74%)",
              transform: "translateX(-118%)",
              zIndex: 23,
              opacity: 0,
            }}
          />
          {/* Shimmer — post-sequence idle, fired every 12-22 s */}
          <div
            ref={shimmerRef}
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background: "linear-gradient(108deg, transparent 33%, rgba(208,222,255,0.24) 47%, rgba(226,238,255,0.36) 50%, rgba(208,222,255,0.24) 53%, transparent 67%)",
              transform: "translateX(-118%)",
              zIndex: 22,
            }}
          />

          {/* Logo glint — radial burst near logo (top-center) at hero moment */}
          <div
            ref={glintRef}
            aria-hidden
            className="pointer-events-none absolute"
            style={{
              top: "19%", left: "50%",
              transform: "translate(-50%, -50%) scale(1)",
              width: "54px", height: "54px",
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(255,255,255,0.96) 0%, rgba(208,230,255,0.62) 35%, transparent 70%)",
              filter: "blur(4px)",
              zIndex: 28,
              opacity: 0,
            }}
          />

          {/* Dust particles — appear at hero moment, drift upward, fade */}
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
                  background: "rgba(195,218,255,0.82)",
                  boxShadow: `0 0 ${p.r * 2.8}px rgba(185,210,255,0.55)`,
                  opacity: 0,
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Dynamic shadow — ellipse below, shifts with rotation/parallax */}
      <div
        ref={shadowRef}
        aria-hidden
        className="pointer-events-none absolute inset-x-10 -bottom-3"
        style={{
          height: 22,
          background: "rgba(4,6,22,0.24)",
          filter: "blur(28px)",
          borderRadius: "50%",
          transformOrigin: "center center",
        }}
      />
    </div>
  );
}
