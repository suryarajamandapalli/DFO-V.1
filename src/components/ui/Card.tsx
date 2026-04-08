import { cn } from '../../lib/utils';
import { motion } from 'framer-motion';
import type { HTMLMotionProps } from 'framer-motion';

interface CardProps extends HTMLMotionProps<"div"> {
  delay?: number;
  glass?: boolean;
}

export function Card({ className, children, delay = 0, glass = false, ...props }: CardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay }}
      className={cn(
        "rounded-lg p-6 transition-all duration-300",
        glass ? "glass-effect" : "bg-white card-shadow border border-slate-100 hover:border-sky-100",
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
}
