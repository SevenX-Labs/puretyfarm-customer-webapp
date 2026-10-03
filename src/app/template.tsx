"use client";

import type { ReactNode } from "react";
import { m, useReducedMotion } from "framer-motion";

export default function Template({ children }: { children: ReactNode }) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return <>{children}</>;
  }

  return (
    <m.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="flex flex-col flex-1 w-full"
    >
      {children}
    </m.div>
  );
}
