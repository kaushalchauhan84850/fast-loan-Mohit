import { useId, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { IconChevronDown } from './Icons.jsx';

function AccordionItem({ question, answer, isOpen, onToggle }) {
  const panelId = useId();
  return (
    <div className="overflow-hidden rounded-2xl border border-navy-100 bg-white shadow-soft transition-colors hover:border-navy-200">
      <h3>
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={isOpen}
          aria-controls={panelId}
          className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-sm font-semibold text-navy-900 sm:text-base"
        >
          {question}
          <motion.span
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className={`shrink-0 ${isOpen ? 'text-emerald-600' : 'text-navy-400'}`}
          >
            <IconChevronDown size={18} />
          </motion.span>
        </button>
      </h3>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            id={panelId}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
          >
            <p className="border-t border-navy-100 px-5 py-4 text-sm leading-relaxed text-navy-600">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/** Accessible FAQ accordion (single-open). items: [{ q, a }] */
export default function Accordion({ items, defaultOpen = 0 }) {
  const [openIndex, setOpenIndex] = useState(defaultOpen);
  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <AccordionItem
          key={i}
          question={item.q}
          answer={item.a}
          isOpen={openIndex === i}
          onToggle={() => setOpenIndex(openIndex === i ? -1 : i)}
        />
      ))}
    </div>
  );
}
