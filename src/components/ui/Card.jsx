import { motion } from 'framer-motion';

/** Rounded card with soft shadow — the base surface of the design system. */
export default function Card({ className = '', children, hover = false, ...props }) {
  const classes = [
    'rounded-2xl border border-navy-100 bg-white shadow-soft',
    hover && 'transition-all duration-200 hover:-translate-y-0.5 hover:shadow-soft-lg hover:border-navy-200',
    className,
  ]
    .filter(Boolean)
    .join(' ');
  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
}

/** Section heading with eyebrow + title + optional subtitle, used across pages. */
export function SectionHeading({ eyebrow, title, subtitle, align = 'center', className = '' }) {
  const alignCls = align === 'center' ? 'text-center mx-auto' : 'text-left';
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.45 }}
      className={`max-w-2xl ${alignCls} ${className}`}
    >
      {eyebrow && (
        <p className="mb-2 text-xs font-bold uppercase tracking-widest text-emerald-600">{eyebrow}</p>
      )}
      <h2 className="text-balance text-3xl font-bold tracking-tight text-navy-950 sm:text-4xl">{title}</h2>
      {subtitle && <p className="mt-3 text-base leading-relaxed text-navy-600">{subtitle}</p>}
    </motion.div>
  );
}
