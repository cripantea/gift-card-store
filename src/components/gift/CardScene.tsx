"use client";

import { useRef, useEffect, type ReactNode } from "react";
import gsap from "gsap";

// ── Tuneable constants — adjust these without touching logic ──────────────
const C = {
  // Entrance
  enterDuration:  1.4,   // s — card rise + focus
  enterDelay:     0.20,  // s — initial pause before entrance starts
  enterBlur:      8,     // px — starting blur
  enterY:         36,    // px — starting Y offset
  enterRotateX:   6,     // ° — initial 3D tilt on X axis

  // Idle float
  floatAmp:       5,     // px — up/down amplitude (very subtle)
  floatPeriod:    5.2,   // s — one half-cycle (yoyo)

  // Parallax tilt
  tiltMax:        4,     // ° — max tilt on mousemove
  tiltEase:       0.88,  // s — tilt response speed
  tiltReturnEase: 1.3,   // s — return to center on mouseleave

  // Shimmer sweep
  shimmerDelay:   [5, 10] as [number, number], // s — random interval
  shimmerDur:     1.15,  // s — sweep transit time
} as const;

export interface CardSceneProps {
  children: ReactNode;
  /**
   * Skip the entrance animation (pass this when wrapped inside
   * UnwrappingExperience, which handles its own dramatic entrance).
   */
  skipEntrance?: boolean;
}

export function CardScene({ children, skipEntrance = false }: CardSceneProps) {
  const sceneRef   = useRef<HTMLDivElement>(null);
  const floatRef   = useRef<HTMLDivElement>(null);
  const tiltRef    = useRef<HTMLDivElement>(null);
  const shimmerRef = useRef<HTMLDivElement>(null);
  const shadowRef  = useRef<HTMLDivElement>(null);

  // ── Entrance → idle float → periodic shimmer ─────────────────────────
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const float   = floatRef.current;
    const tilt    = tiltRef.current;
    const shadow  = shadowRef.current;
    const shimmer = shimmerRef.current;
    if (!float || !tilt || !shadow || !shimmer) return;

    // Reduced-motion: skip all animation, just ensure visibility
    if (reduced) {
      gsap.set([tilt, shadow], { opacity: 1, clearProps: "transform,filter" });
      return;
    }

    const ctx = gsap.context(() => {

      // ── Entrance ─────────────────────────────────────────────────────
      if (!skipEntrance) {
        gsap.set(tilt,   { opacity: 0, y: C.enterY, scale: 0.95, filter: `blur(${C.enterBlur}px)`, rotateX: C.enterRotateX });
        gsap.set(shadow, { opacity: 0, scaleX: 0.72 });

        const tl = gsap.timeline({ delay: C.enterDelay });

        tl.to(tilt, {
          opacity: 1, y: 0, scale: 1,
          filter: "blur(0px)", rotateX: 0,
          duration: C.enterDuration,
          ease: "power3.out",
        }, 0);

        tl.to(shadow, {
          opacity: 1, scaleX: 1,
          duration: C.enterDuration,
          ease: "power3.out",
        }, 0);
      } else {
        // Skip entrance: appear immediately, clean state
        gsap.set([tilt, shadow], { opacity: 1, clearProps: "filter,scale,y,rotateX" });
      }

      // ── Idle float — starts after entrance completes ──────────────────
      const floatStart = skipEntrance
        ? 0.4
        : C.enterDelay + C.enterDuration + 0.2;

      gsap.to(float, {
        y: -C.floatAmp,
        duration: C.floatPeriod,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
        delay: floatStart,
      });

      // Shadow breathes inversely with float (smaller when card is higher)
      gsap.to(shadow, {
        scaleX: 0.86,
        opacity: 0.6,
        duration: C.floatPeriod,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
        delay: floatStart,
      });

      // ── Periodic shimmer sweep ────────────────────────────────────────
      function scheduleShimmer() {
        const [lo, hi] = C.shimmerDelay;
        gsap.delayedCall(lo + Math.random() * (hi - lo), () => {
          gsap.fromTo(
            shimmer,
            { xPercent: -115 },
            {
              xPercent: 115,
              duration: C.shimmerDur,
              ease: "power2.inOut",
              onComplete: scheduleShimmer,
            }
          );
        });
      }

      const shimmerStart = skipEntrance
        ? 2.5
        : C.enterDelay + C.enterDuration + 1.8;
      gsap.delayedCall(shimmerStart, scheduleShimmer);

    }, sceneRef);

    return () => ctx.revert();
  }, [skipEntrance]);

  // ── Mouse parallax — desktop only ────────────────────────────────────
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (window.matchMedia("(max-width: 768px)").matches) return;

    const scene  = sceneRef.current;
    const tilt   = tiltRef.current;
    const shadow = shadowRef.current;
    if (!scene || !tilt) return;

    function onMouseMove(e: MouseEvent) {
      const r  = scene!.getBoundingClientRect();
      // Normalised -1 → +1 from centre
      const nx = ((e.clientX - r.left)  / r.width  - 0.5) * 2;
      const ny = ((e.clientY - r.top)   / r.height - 0.5) * 2;

      gsap.to(tilt, {
        rotateX: -ny * C.tiltMax,
        rotateY:  nx * C.tiltMax,
        duration: C.tiltEase,
        ease: "power2.out",
        overwrite: "auto",
      });

      if (shadow) {
        gsap.to(shadow, {
          x:  nx * 10,
          y:  ny *  5,
          duration: C.tiltEase,
          ease: "power2.out",
          overwrite: "auto",
        });
      }
    }

    function onMouseLeave() {
      gsap.to(tilt, {
        rotateX: 0, rotateY: 0,
        duration: C.tiltReturnEase,
        ease: "power3.out",
        overwrite: "auto",
      });
      if (shadow) {
        gsap.to(shadow, {
          x: 0, y: 0,
          duration: C.tiltReturnEase,
          ease: "power3.out",
          overwrite: "auto",
        });
      }
    }

    scene.addEventListener("mousemove", onMouseMove);
    scene.addEventListener("mouseleave", onMouseLeave);

    return () => {
      scene.removeEventListener("mousemove", onMouseMove);
      scene.removeEventListener("mouseleave", onMouseLeave);
    };
  }, []);

  return (
    // Perspective container — mouse events live here
    <div ref={sceneRef} className="relative" style={{ perspective: "900px" }}>

      {/* Float layer — handles Y translation for idle */}
      <div ref={floatRef}>

        {/* Tilt layer — handles rotateX/Y for parallax */}
        <div
          ref={tiltRef}
          className="relative"
          style={{ transformStyle: "preserve-3d", willChange: "transform" }}
        >
          {children}

          {/* Shimmer — thin diagonal streak that sweeps across periodically.
              Positioned absolute over the entire card area; the gradient
              creates a narrow bright stripe so only a sliver of light
              is visible as the element translates through.
              White bg outside card bounds makes the offscreen portions invisible. */}
          <div
            ref={shimmerRef}
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "linear-gradient(108deg, transparent 30%, rgba(255,255,255,0.40) 47%, rgba(255,255,255,0.52) 50%, rgba(255,255,255,0.40) 53%, transparent 70%)",
              // Start fully off-left; GSAP drives xPercent -115 → 115
              transform: "translateX(-115%)",
              zIndex: 20,
            }}
          />
        </div>

      </div>

      {/* Dynamic shadow — shifts slightly with parallax, breathes with float */}
      <div
        ref={shadowRef}
        aria-hidden
        className="pointer-events-none absolute inset-x-8 -bottom-2"
        style={{
          height: 20,
          background: "rgba(55, 35, 8, 0.14)",
          filter: "blur(22px)",
          borderRadius: "50%",
          transformOrigin: "center center",
        }}
      />
    </div>
  );
}
