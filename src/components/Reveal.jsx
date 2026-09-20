import { motion, useReducedMotion } from "framer-motion";

/**
 * One orchestrated fade + slide-up reveal per section, triggered once when it
 * enters the viewport. Children animate together (not staggered element-by-
 * element) to keep the effect deliberate rather than scattered.
 */
export default function Reveal({ as = "div", delay = 0, className = "", children, ...rest }) {
  const prefersReducedMotion = useReducedMotion();
  const Component = motion[as] ?? motion.div;

  if (prefersReducedMotion) {
    const Static = as;
    return (
      <Static className={className} {...rest}>
        {children}
      </Static>
    );
  }

  return (
    <Component
      className={className}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
      {...rest}
    >
      {children}
    </Component>
  );
}
