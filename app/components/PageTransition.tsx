// components/pageTransition.tsx
"use client";
import { AnimatePresence, motion } from "framer-motion";
import { ReactNode } from "react";
import { usePathname } from "next/navigation";

const PageTransition = ({ children }: { children: ReactNode }) => {
  const pathname = usePathname(); // Use the path directly for transitions

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname} // Key the motion component to the pathname
        initial={{ opacity: 0 }} // Start invisible when entering the page
        animate={{ opacity: 1 }} // Fade in to opacity 1
        exit={{ opacity: 0 }} // Fade out to opacity 0 when exiting
        transition={{ duration: 0.4 }} // Duration of the fade transition
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

export default PageTransition;
