"use client";

import type { RefObject } from "react";

import { CollisionMechanism } from "@/components/aceternity/collision-beam";

interface Props {
  parentRef: RefObject<HTMLDivElement | null>;
  containerRef: RefObject<HTMLDivElement | null>;
}

/**
 * G-PERF-2: 3-beam Aceternity collision animation, extracted out of
 * landing-page-client.tsx so it can be dynamic-imported with `ssr: false`.
 *
 * Why: collision-beam.tsx pulls in framer-motion code paths the rest of
 * the landing page doesn't need synchronously. Three instances on the
 * hero meant the chunk weight loaded on every cold landing visit even
 * though the beams are pure decoration. Splitting them into a separate
 * client-only chunk shifts that JS off the main bundle and lets the
 * browser hit interactive sooner. Visually identical — the beams mount
 * shortly after hydration instead of with it, and the existing
 * `LazyAnimation` IntersectionObserver still gates rendering until the
 * hero is visible.
 */
export function HeroCollisionBeams({ parentRef, containerRef }: Props) {
  return (
    <>
      <CollisionMechanism
        beamOptions={{
          initialX: -400,
          translateX: 600,
          duration: 7,
          repeatDelay: 3,
        }}
        containerRef={containerRef}
        parentRef={parentRef}
      />
      <CollisionMechanism
        beamOptions={{
          initialX: -200,
          translateX: 800,
          duration: 4,
          repeatDelay: 3,
        }}
        containerRef={containerRef}
        parentRef={parentRef}
      />
      <CollisionMechanism
        beamOptions={{
          initialX: 200,
          translateX: 1200,
          duration: 5,
          repeatDelay: 3,
        }}
        containerRef={containerRef}
        parentRef={parentRef}
      />
    </>
  );
}
