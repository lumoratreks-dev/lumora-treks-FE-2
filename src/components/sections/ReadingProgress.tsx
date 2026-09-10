"use client";

import { motion, useScroll, useSpring } from "framer-motion";

/** ReadingProgress — a thin neon bar fixed to the top of the viewport that
 * fills as the reader scrolls the article. Uses the page scroll progress with a
 * spring for a smooth, non-jittery fill. Respects the accent token. */
export default function ReadingProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <motion.div
      style={{ scaleX }}
      className="fixed inset-x-0 top-0 z-[60] h-1 origin-left bg-primary-accent"
      aria-hidden
    />
  );
}
