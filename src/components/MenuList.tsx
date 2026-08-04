import { NavLink } from 'react-router-dom';
import { motion, type Variants } from 'motion/react';
import { menuItems } from '../config/menuItems';

const listVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05, delayChildren: 0.05 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, x: -8 },
  visible: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 200, damping: 22 } },
};

export default function MenuList({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <motion.nav
      variants={listVariants}
      initial="hidden"
      animate="visible"
      className="flex flex-col gap-1"
    >
      {menuItems.map((item) => (
        <motion.div key={item.path} variants={itemVariants}>
          <NavLink
            to={item.path}
            onClick={onNavigate}
            className={({ isActive }) =>
              [
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                isActive
                  ? 'bg-muted text-foreground font-medium'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground',
              ].join(' ')
            }
          >
            <span className="inline-flex h-5 w-5 items-center justify-center">{item.icon}</span>
            <span className="truncate">{item.label}</span>
          </NavLink>
        </motion.div>
      ))}
    </motion.nav>
  );
}
