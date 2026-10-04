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
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{
        duration: 0.25,
        ease: "easeOut",
      }}
      className="flex flex-col flex-1 w-full"
    >
      {children}
    </m.div>
  );
}
