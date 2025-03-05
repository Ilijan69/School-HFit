"use client";
import { AnimatePresence, motion } from "framer-motion";
import { ReactNode } from "react";
import { usePathname } from "next/navigation";

const PageTransition = ({ children }: { children: ReactNode }) => {
  const pathname = usePathname(); 

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial={{ opacity: 0, scale: 1 }} // Start slightly scaled down
        animate={{ opacity: 1, scale: 1 }} // Fade in and scale to normal
        exit={{ opacity: 0, scale: 0.5 }} // Fade out and slightly scale up
        transition={{ duration: 0.8, ease: "easeInOut" }} // Smooth easing
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

export default PageTransition;
