import React, { useRef, ReactNode } from "react";
import { motion, useMotionValue, useSpring, useTransform, useReducedMotion } from "motion/react";

interface TiltCardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
}

export const TiltCard: React.FC<TiltCardProps> = ({ children, className = "", onClick, type }) => {
  const ref = useRef<HTMLDivElement | HTMLButtonElement>(null);
  const prefersReducedMotion = useReducedMotion();

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springConfig = { damping: 25, stiffness: 200, mass: 0.5 };
  const springX = useSpring(x, springConfig);
  const springY = useSpring(y, springConfig);

  const rotateX = useTransform(springY, [-0.5, 0.5], [2.5, -2.5]);
  const rotateY = useTransform(springX, [-0.5, 0.5], [-2.5, 2.5]);

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    if (prefersReducedMotion || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    x.set(mouseX / width - 0.5);
    y.set(mouseY / height - 0.5);
  };

  const handleMouseLeave = () => {
    if (prefersReducedMotion) return;
    x.set(0);
    y.set(0);
  };

  if (prefersReducedMotion) {
    if (onClick || type) {
      return (
        <button type={type || "button"} onClick={onClick} className={className}>
          {children}
        </button>
      );
    }
    return <div className={className}>{children}</div>;
  }

  if (onClick || type) {
    return (
      <motion.button
        ref={ref as any}
        type={type || "button"}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={onClick}
        style={{
          rotateX,
          rotateY,
          transformPerspective: 1000,
          transformStyle: "preserve-3d",
          backfaceVisibility: "hidden",
        }}
        className={className}
      >
        {children}
      </motion.button>
    );
  }

  return (
    <motion.div
      ref={ref as any}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformPerspective: 1000,
        transformStyle: "preserve-3d",
        backfaceVisibility: "hidden",
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};
